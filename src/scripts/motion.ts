import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktopQuery = window.matchMedia('(min-width: 769px)');

/*
 * The original 1280x720 source video supplies higher-fidelity WebP frames.
 * This is a native-resolution, no-AI quality upgrade, NOT 4K restoration.
 * Decode outside paint; leave ambient background static and cheap.
 */
function initHero() {
  const wrap = document.querySelector<HTMLElement>('[data-hero]');
  const canvas = wrap?.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
  if (!wrap || !canvas || reducedMotion.matches) return;

  const stage = wrap.querySelector<HTMLElement>('.hero-stage');
  const visual = wrap.querySelector<HTMLElement>('.hero-visual');
  const poster = wrap.querySelector<HTMLImageElement>('.hero-poster');
  const progressBar = wrap.querySelector<HTMLElement>('[data-hero-progress]');
  const chapters = Array.from(wrap.querySelectorAll<HTMLElement>('[data-chapter]'));
  // Transparent letterbox areas expose ONE cached ambient background, rather
  // than running a costly canvas blur filter on all 420 moving frames.
  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  if (!stage || !visual || !ctx) return;

  visual.style.background = "#13090d url('/hero-ambient.webp') center / cover no-repeat";
  wrap.classList.add('is-sequence-active');
  type Frame = ImageBitmap | HTMLImageElement;
  type Inflight = { controller: AbortController | null; image: HTMLImageElement | null };
  // HQ frames are extracted directly from the supplied ORIGINAL 24fps movie.
  // 240 real desktop frames, with every second frame for 12fps mobile.
  // Keep the original 420 JPEG assets untouched as a rollback baseline.
  let mobile = !desktopQuery.matches;
  let frameCount = mobile ? 120 : 240;
  let target = 0;
  let previousTarget = 0;
  let lastDrawn = -1;
  let progress = 0;
  let generation = 0;
  let scheduled = 0;
  let primedTarget = -1;
  let chaptersRenderedAt = -1;
  let primedAt = performance.now();
  let lookAhead = 0;
  const chapterState = chapters.map(() => ({ opacity: -1, visible: false, interactive: false, hidden: true }));
  let canvasWidth = 1;
  let canvasHeight = 1;
  let destroyed = false;
  let warmTimer = 0;
  let movedAt = performance.now();
  let warmQueue: number[] = [];
  let pinnedFrames = new Set<number>();
  const loaded = new Map<number, Frame>();
  const pending = new Map<number, Inflight>();
  const retryAfter = new Map<number, number>();
  const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;
  // Each decoded 1280x720 RGBA frame takes ~3.5 MiB, regardless of JPEG size.
  // Preserve sparse HQ anchors across the 10-second timeline. Fast wheel
  // scrubbing can use a sharp, correctly positioned fallback while exact
  // frames decode. This does NOT reduce image fidelity or swap source assets.
  const maxCache = () => mobile ? (deviceMemory <= 2 ? 18 : 24) : (deviceMemory <= 2 ? 22 : 36);
  // Bound concurrent *decodes*, not just fetch starts. More parallel WebP
  // decodes can contend with scrolling, particularly on mobile CPUs.
  const maxInflight = () => deviceMemory <= 2 ? 2 : (mobile ? 3 : 4);
  const framePath = (index: number) => `/frames/hero-hq/${mobile ? 'mobile' : 'desktop'}/${String(index + 1).padStart(4, '0')}.webp`;
  const frameWidth = (frame: Frame) => frame instanceof HTMLImageElement ? frame.naturalWidth : frame.width;
  const frameHeight = (frame: Frame) => frame instanceof HTMLImageElement ? frame.naturalHeight : frame.height;
  const dispose = (frame: Frame) => { if ('close' in frame) frame.close(); };

  function scheduleDraw() {
    // ScrollTrigger may update several times before a browser paint. Commit
    // DOM writes, fetch decisions and Canvas work together at most once/rAF.
    if (!scheduled && !destroyed) scheduled = requestAnimationFrame(() => {
      scheduled = 0;
      renderChapterProgress();
      if (primedTarget !== target) {
        const now = performance.now();
        const moved = target - primedTarget;
        // Estimate only a short runway for sustained scrolling, not large
        // jumps; stale predicted frames must not monopolize decoding.
        lookAhead = Math.abs(moved) > 40 ? 0 : Math.min(mobile ? 12 : 20,
          Math.round(Math.abs(moved) * 85 / Math.max(16, now - primedAt)));
        primedAt = now;
        primedTarget = target;
        cancelDistantRequests();
        prime();
      }
      draw();
    });
  }

  function resizeCanvas() {
    const bounds = visual!.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    // Allocating a 2x/3x display bitmap cannot manufacture photo detail beyond 720p.
    // Capping DPR avoids large backing buffers and expensive uploads on retina screens.
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.25);
    const actualWidth = Math.round(width * dpr);
    const actualHeight = Math.round(height * dpr);
    canvasWidth = width;
    canvasHeight = height;
    if (canvas!.width !== actualWidth || canvas!.height !== actualHeight) {
      canvas!.width = actualWidth;
      canvas!.height = actualHeight;
      ctx!.setTransform(actualWidth / width, 0, 0, actualHeight / height, 0, 0);
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = 'high';
      lastDrawn = -1;
      scheduleDraw();
    }
  }

  function trimCache() {
    while (loaded.size > maxCache()) {
      let farthest = -1;
      let distance = -1;
      for (const index of loaded.keys()) {
        if (pinnedFrames.has(index)) continue;
        const current = Math.abs(index - target);
        if (current > distance) { distance = current; farthest = index; }
      }
      if (farthest < 0) break;
      const frame = loaded.get(farthest);
      if (frame) dispose(frame);
      loaded.delete(farthest);
    }
  }

  function buildWarmQueue() {
    // Spread initial anchors over the WHOLE clip rather than loading only
    // early frames. Load order is progressively even (ends, middle, quarters).
    const step = mobile ? (deviceMemory <= 2 ? 12 : 10) : (deviceMemory <= 2 ? 20 : 12);
    const candidates = Array.from({ length: Math.ceil((frameCount - 1) / step) + 1 },
      (_, i) => Math.min(frameCount - 1, i * step));
    pinnedFrames = new Set(candidates);
    const order: number[] = [];
    while (candidates.length) {
      let chosen = 0;
      let best = -1;
      for (let i = 0; i < candidates.length; i++) {
        const distance = order.length ? Math.min(...order.map(index => Math.abs(index - candidates[i]))) :
          frameCount - candidates[i];
        if (distance > best) { best = distance; chosen = i; }
      }
      order.push(candidates.splice(chosen, 1)[0]);
    }
    warmQueue = order;
  }

  function warmAnchors() {
    if (destroyed || !warmQueue.length || document.hidden) return;
    const network = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (network?.saveData || network?.effectiveType === 'slow-2g' || network?.effectiveType === '2g') return;
    window.clearTimeout(warmTimer);
    warmTimer = window.setTimeout(() => {
      if (destroyed || document.hidden) return;
      // Idle-only warming: keep spare decoding capacity for real scrolling.
      if (performance.now() - movedAt < 240 || pending.size >= 2) {
        warmAnchors();
        return;
      }
      while (warmQueue.length && (loaded.has(warmQueue[0]) || pending.has(warmQueue[0]))) warmQueue.shift();
      const index = warmQueue.shift();
      if (index !== undefined) void load(index);
      if (warmQueue.length) warmAnchors();
    }, 130);
  }

  function cancelDistantRequests() {
    // Do not delete inflight work here. A fetch can already be decoding after
    // its response arrives: dropping its slot would allow unbounded parallel
    // createImageBitmap() jobs under rapid wheel/touch scrolling.
    const threshold = Math.max(mobile ? 13 : 22, lookAhead + 6);
    for (const [index, request] of pending) {
      if (!pinnedFrames.has(index) && Math.abs(index - target) > threshold) {
        request.controller?.abort();
        if (request.image) request.image.src = '';
      }
    }
  }

  async function load(index: number) {
    if (destroyed || index < 0 || index >= frameCount || loaded.has(index) || pending.has(index) || pending.size >= maxInflight()) return;
    if (Date.now() < (retryAfter.get(index) || 0)) return;
    const sourceGeneration = generation;
    const request: Inflight = { controller: null, image: null };
    pending.set(index, request);
    let frame: Frame | null = null;
    try {
      // ImageBitmap is decoded before the rAF paint callback, often off the main
      // thread. AbortController prevents far-away fetches starving target frames.
      if ('createImageBitmap' in window) {
        request.controller = new AbortController();
        const response = await fetch(framePath(index), { signal: request.controller.signal });
        if (!response.ok) throw new Error(`Frame HTTP ${response.status}`);
        frame = await createImageBitmap(await response.blob());
      } else {
        // Safari/older browser fallback: decode() still avoids draw-time decoding.
        const image = new Image();
        request.image = image;
        image.decoding = 'async';
        image.src = framePath(index);
        await image.decode();
        frame = image;
      }
      if (destroyed || generation !== sourceGeneration || pending.get(index) !== request ||
        request.controller?.signal.aborted || (!pinnedFrames.has(index) &&
          Math.abs(index - target) > (mobile ? 20 : 30))) {
        if (frame) dispose(frame);
        return;
      }
      loaded.set(index, frame);
      frame = null;
      retryAfter.delete(index);
      trimCache();
      scheduleDraw();
    } catch {
      // Transient download/decode errors are retryable on later scrolls.
      if (pending.get(index) === request && generation === sourceGeneration && !request.controller?.signal.aborted) {
        retryAfter.set(index, Date.now() + 3000);
      }
      if (frame) dispose(frame);
    } finally {
      if (pending.get(index) === request) {
        pending.delete(index);
        if (!destroyed && generation === sourceGeneration) prime();
      }
    }
  }

  function prime() {
    if (destroyed || document.visibilityState === 'hidden') return;
    const direction = target >= previousTarget ? 1 : -1;
    // Give an exact frame priority, then a short directional runway. Limit
    // background work so high-quality decode never floods the main scroll.
    if (pending.size >= maxInflight() && !loaded.has(target) && !pending.has(target)) {
      let farthest = -1;
      let distance = 0;
      for (const [index, request] of pending) {
        const away = Math.abs(index - target);
        if (!pinnedFrames.has(index) && !request.controller?.signal.aborted && away > distance) {
          farthest = index;
          distance = away;
        }
      }
      if (distance > 5 && farthest >= 0) pending.get(farthest)?.controller?.abort();
    }
    const lead = performance.now() - primedAt < 160 ? lookAhead : 0;
    const offsets = lead >= 5
      ? [0, direction * lead, direction * Math.max(1, lead - 2),
        direction, -direction, 2 * direction, 3 * direction,
        direction * (lead + 2), 5 * direction, -3 * direction]
      : [0, direction, -direction, 2 * direction, 3 * direction,
        -2 * direction, 4 * direction, 6 * direction, -4 * direction,
        8 * direction, 12 * direction];
    for (const offset of offsets) {
      if (pending.size >= maxInflight()) break;
      void load(target + offset);
    }
  }

  function draw() {
    const exact = loaded.get(target);
    let index = target;
    if (!exact) {
      let bestDistance = Infinity;
      for (const candidate of loaded.keys()) {
        const distance = Math.abs(candidate - target);
        if (distance < bestDistance) { bestDistance = distance; index = candidate; }
      }
      // A distant, predecoded high-quality anchor is better than freezing on
      // an unrelated prior frame during a rapid scroll jump.
      if (bestDistance > (mobile ? 4 : 6)) {
        let anchorDistance = Infinity;
        for (const candidate of loaded.keys()) {
          if (pinnedFrames.has(candidate) && Math.abs(candidate - target) < anchorDistance) {
            anchorDistance = Math.abs(candidate - target);
            index = candidate;
          }
        }
        if (anchorDistance === Infinity) return;
      }
    }
    const frame = exact || loaded.get(index);
    if (!frame || index === lastDrawn) return;
    const width = canvasWidth;
    const height = canvasHeight;
    if (width <= 1 || height <= 1) return;
    const sourceWidth = frameWidth(frame);
    const sourceHeight = frameHeight(frame);
    if (!sourceWidth || !sourceHeight) return;
    const cover = Math.max(width / sourceWidth, height / sourceHeight);
    const scale = Math.min(cover, mobile ? 1.08 : 1.0);
    const imageWidth = sourceWidth * scale;
    const imageHeight = sourceHeight * scale;
    let x = (width - imageWidth) / 2;
    if (mobile) {
      const focus = 0.35 + progress * 0.13;
      x = Math.min(0, Math.max(width - imageWidth, width / 2 - imageWidth * focus));
    }
    const y = (height - imageHeight) / 2;
    ctx!.clearRect(0, 0, width, height);
    ctx!.drawImage(frame, x, y, imageWidth, imageHeight);
    lastDrawn = index;
    canvas!.classList.add('is-ready');
    poster?.classList.add('is-hidden');
  }

  function chapterAlpha(index: number, position: number) {
    // Preserve all three chapters and their original non-overlapping fade zones.
    if (index === 0) return position <= 0.30 ? 1 : Math.max(0, 1 - (position - 0.30) / 0.045);
    if (index === 1) return position <= 0.35 ? 0 : position < 0.395 ? (position - 0.35) / 0.045 : position <= 0.655 ? 1 : Math.max(0, 1 - (position - 0.655) / 0.045);
    return position <= 0.71 ? 0 : Math.min(1, (position - 0.71) / 0.045);
  }

  function renderChapterProgress() {
    if (progress === chaptersRenderedAt) return;
    chaptersRenderedAt = progress;
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    chapters.forEach((node, index) => {
      const alpha = Math.max(0, Math.min(1, chapterAlpha(index, progress)));
      const state = chapterState[index];
      const visible = alpha > 0.01;
      const interactive = index === 0 && alpha > 0.95;
      const hidden = alpha < 0.01;
      if (Math.abs(alpha - state.opacity) > 0.0005) {
        node.style.opacity = String(alpha);
        state.opacity = alpha;
      }
      if (visible !== state.visible) {
        node.style.visibility = visible ? 'visible' : 'hidden';
        state.visible = visible;
      }
      if (interactive !== state.interactive) {
        node.style.pointerEvents = interactive ? 'auto' : 'none';
        state.interactive = interactive;
      }
      if (hidden !== state.hidden) {
        node.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        state.hidden = hidden;
      }
    });
  }

  function setProgress(value: number) {
    const next = Math.max(0, Math.min(1, value));
    if (progress === next && chaptersRenderedAt === next) return;
    progress = next;
    const nextTarget = Math.round(next * (frameCount - 1));
    if (nextTarget !== target) {
      previousTarget = target;
      target = nextTarget;
      movedAt = performance.now();
    }
    scheduleDraw();
  }

  function selectSource(force = false) {
    const nextMobile = !desktopQuery.matches;
    if (!force && nextMobile === mobile) return;
    mobile = nextMobile;
    frameCount = mobile ? 120 : 240;
    generation++;
    window.clearTimeout(warmTimer);
    warmQueue = [];
    pinnedFrames.clear();
    for (const request of pending.values()) {
      request.controller?.abort();
      if (request.image) request.image.src = '';
    }
    pending.clear();
    for (const frame of loaded.values()) dispose(frame);
    loaded.clear();
    retryAfter.clear();
    lastDrawn = -1;
    canvas!.classList.remove('is-ready');
    poster?.classList.remove('is-hidden');
    target = previousTarget = Math.round(progress * (frameCount - 1));
    primedTarget = target;
    primedAt = performance.now();
    movedAt = primedAt;
    lookAhead = 0;
    buildWarmQueue();
    resizeCanvas();
    prime();
    warmAnchors();
    scheduleDraw();
  }

  selectSource(true);
  const trigger = ScrollTrigger.create({
    trigger: wrap,
    start: 'top top',
    end: () => desktopQuery.matches ? '+=155%' : '+=110%',
    pin: stage,
    pinSpacing: true,
    scrub: 0.30,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate(self) { setProgress(self.progress); },
    onRefresh(self) { setProgress(self.progress); lastDrawn = -1; scheduleDraw(); }
  });
  let resizeTimer: number | undefined;
  const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { resizeCanvas(); }) : null;
  resizeObserver?.observe(visual);
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      selectSource();
      resizeCanvas();
      ScrollTrigger.refresh();
    }, 160);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) { prime(); warmAnchors(); scheduleDraw(); }
  });
  window.addEventListener('pagehide', () => {
    destroyed = true;
    window.clearTimeout(warmTimer);
    resizeObserver?.disconnect();
    if (scheduled) cancelAnimationFrame(scheduled);
    for (const request of pending.values()) {
      request.controller?.abort();
      if (request.image) request.image.src = '';
    }
    pending.clear();
    for (const frame of loaded.values()) dispose(frame);
    loaded.clear();
    trigger.kill();
  }, { once: true });
  setProgress(trigger.progress);
}

if (!reducedMotion.matches) {
  if (desktopQuery.matches && document.querySelector('[data-hero]')) {
    // Keep mobile touch scrolling native. Lenis is a desktop-wheel enhancement.
    const lenis = new Lenis({ lerp: 0.11, smoothWheel: true, syncTouch: false, anchors: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((seconds) => lenis.raf(seconds * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { y: 28, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.70, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 93%', once: true }
      });
    });
    gsap.utils.toArray<HTMLElement>('.project-art').forEach((el) => {
      const placeholder = el.querySelector<HTMLElement>('.project-placeholder-word');
      if (!placeholder) return;
      gsap.fromTo(placeholder, { y: 10 }, {
        y: -10, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  });
}
initHero();
