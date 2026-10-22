import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktopQuery = window.matchMedia('(min-width: 769px)');

/*
 * Portrait source frames are 1280x720 JPEGs, NOT native 4K photographs.
 * Keep their native scale, draw at the canvas's real DPR, and reuse nearby decoded
 * frames. We cannot reconstruct details discarded by the source JPEG encoder.
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
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!stage || !visual || !ctx) return;

  wrap.classList.add('is-sequence-active');
  let mobile = !desktopQuery.matches;
  let frameCount = mobile ? 120 : 300;
  let target = 0;
  let lastDrawn = -1;
  let progress = 0;
  let generation = 0;
  let scheduled = 0;
  let lastWidth = 0;
  let lastHeight = 0;
  const loaded = new Map<number, HTMLImageElement>();
  const pending = new Map<number, HTMLImageElement>();
  const failed = new Set<number>();
  const maxCache = () => mobile ? 20 : 38;
  const maxInflight = () => mobile ? 4 : 6;
  const framePath = (index: number) => `/frames/hero/${mobile ? 'mobile' : 'desktop'}/${String(index + 1).padStart(4, '0')}.jpg`;

  const scheduleDraw = () => {
    if (!scheduled) scheduled = requestAnimationFrame(() => { scheduled = 0; draw(); });
  };

  function trimCache() {
    while (loaded.size > maxCache()) {
      const farthest = Array.from(loaded.keys()).reduce((a, b) =>
        Math.abs(a - target) > Math.abs(b - target) ? a : b
      );
      loaded.delete(farthest);
    }
  }

  function cancelDistantRequests() {
    // A fast swipe should not block the newest image behind stale downloads.
    for (const [index, image] of pending) {
      if (Math.abs(index - target) > (mobile ? 18 : 26)) {
        pending.delete(index);
        image.onload = null;
        image.onerror = null;
        image.removeAttribute('src');
      }
    }
  }

  function load(index: number) {
    if (index < 0 || index >= frameCount || loaded.has(index) || pending.has(index) || failed.has(index) || pending.size >= maxInflight()) return;
    const sourceGeneration = generation;
    const image = new Image();
    image.decoding = 'async';
    pending.set(index, image);
    image.onload = () => {
      if (sourceGeneration !== generation || pending.get(index) !== image) return;
      pending.delete(index);
      loaded.set(index, image);
      trimCache();
      scheduleDraw();
      prime();
    };
    image.onerror = () => {
      if (sourceGeneration !== generation || pending.get(index) !== image) return;
      pending.delete(index);
      failed.add(index);
      prime();
    };
    image.src = framePath(index);
  }

  function prime() {
    // Target and close neighbors first. Prefetch slightly ahead without fetching
    // every frame: decoded images can use several MB each in browser memory.
    const offsets = [0, 1, -1, 2, -2, 3, -3, 5, -5, 8, -8, 12, -12, 16, -16];
    for (const offset of offsets) {
      if (pending.size >= maxInflight()) break;
      load(target + offset);
    }
  }

  function fitCanvas() {
    const bounds = visual!.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    // Browser DPR makes text/portrait compositing crisp without enlarging the
    // underlying photo beyond its available image detail.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const actualWidth = Math.round(width * dpr);
    const actualHeight = Math.round(height * dpr);
    if (canvas!.width !== actualWidth || canvas!.height !== actualHeight) {
      canvas!.width = actualWidth;
      canvas!.height = actualHeight;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = 'high';
    }
    lastWidth = width;
    lastHeight = height;
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
      // Never replace a perfectly rendered frame with a wildly out-of-date one.
      if (bestDistance > (mobile ? 5 : 8)) return;
    }
    const image = exact || loaded.get(index);
    if (!image) return;
    if (index === lastDrawn && lastWidth > 0 && lastHeight > 0) return;
    fitCanvas();

    const width = lastWidth;
    const height = lastHeight;
    const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight);
    const scale = Math.min(cover, mobile ? 1.08 : 1.0);
    const imageWidth = image.naturalWidth * scale;
    const imageHeight = image.naturalHeight * scale;
    let x = (width - imageWidth) / 2;
    if (mobile) {
      const focus = 0.35 + progress * 0.13;
      x = Math.min(0, Math.max(width - imageWidth, width / 2 - imageWidth * focus));
    }
    const y = (height - imageHeight) / 2;
    ctx!.fillStyle = '#13090d';
    ctx!.fillRect(0, 0, width, height);
    if (cover > scale + 0.002) {
      const backWidth = image.naturalWidth * cover;
      const backHeight = image.naturalHeight * cover;
      ctx!.save();
      ctx!.globalAlpha = 0.38;
      ctx!.filter = 'blur(26px)';
      ctx!.drawImage(image, (width - backWidth) / 2, (height - backHeight) / 2, backWidth, backHeight);
      ctx!.restore();
    }
    ctx!.imageSmoothingEnabled = true;
    ctx!.imageSmoothingQuality = 'high';
    ctx!.drawImage(image, x, y, imageWidth, imageHeight);
    lastDrawn = index;
    canvas!.classList.add('is-ready');
    poster?.classList.add('is-hidden');
  }

  function chapterAlpha(index: number, position: number) {
    // The chapter fade zones do NOT overlap, so huge titles never sit on
    // top of one another in the middle of a wheel/touch transition.
    if (index === 0) return position <= 0.30 ? 1 : Math.max(0, 1 - (position - 0.30) / 0.045);
    if (index === 1) return position <= 0.35 ? 0 : position < 0.395 ? (position - 0.35) / 0.045 : position <= 0.655 ? 1 : Math.max(0, 1 - (position - 0.655) / 0.045);
    return position <= 0.71 ? 0 : Math.min(1, (position - 0.71) / 0.045);
  }

  function setProgress(value: number) {
    progress = Math.max(0, Math.min(1, value));
    const nextTarget = Math.round(progress * (frameCount - 1));
    if (nextTarget !== target) {
      target = nextTarget;
      cancelDistantRequests();
      scheduleDraw();
      prime();
    }
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
    chapters.forEach((node, index) => {
      const alpha = Math.max(0, Math.min(1, chapterAlpha(index, progress)));
      node.style.opacity = String(alpha);
      node.style.visibility = alpha > 0.01 ? 'visible' : 'hidden';
      node.style.pointerEvents = index === 0 && alpha > 0.95 ? 'auto' : 'none';
      node.setAttribute('aria-hidden', alpha < 0.01 ? 'true' : 'false');
    });
  }

  function selectSource(force = false) {
    const nextMobile = !desktopQuery.matches;
    if (!force && nextMobile === mobile) return;
    mobile = nextMobile;
    frameCount = mobile ? 120 : 300;
    generation++;
    for (const image of pending.values()) { image.onload = null; image.onerror = null; image.removeAttribute('src'); }
    pending.clear();
    loaded.clear();
    failed.clear();
    lastDrawn = -1;
    canvas!.classList.remove('is-ready');
    poster?.classList.remove('is-hidden');
    target = Math.round(progress * (frameCount - 1));
    prime();
    scheduleDraw();
  }

  // Prime first images immediately so a tiny scroll doesn't reveal a cold frame.
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
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      selectSource();
      lastDrawn = -1;
      scheduleDraw();
      ScrollTrigger.refresh();
    }, 160);
  }, { passive: true });
  setProgress(trigger.progress);
}

if (!reducedMotion.matches) {
  if (desktopQuery.matches && document.querySelector('[data-hero]')) {
    // Keep mobile scrolling native; desktop smooth-wheel is only enhancement.
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
