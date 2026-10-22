/**
 * Homepage-only enhancements. The cinematic scroll hero is intentionally separate.
 * Toolkit: a contained elliptical constellation with visible, elastic pointer/touch response.
 * Plain HTML list remains readable if JavaScript or motion is unavailable.
 */
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const compactPointer = window.matchMedia('(pointer: coarse)');
const field = document.querySelector<HTMLElement>('[data-skill-field]');
const list = field?.querySelector<HTMLElement>('.skill-orb-list');
const elements = Array.from(list?.querySelectorAll<HTMLElement>('[data-skill-orb]') ?? []);

if (field && list && elements.length === 32 && !reducedMotion.matches) {
  type Orb = {
    el: HTMLElement;
    x: number; y: number;
    homeX: number; homeY: number;
    baseX: number; baseY: number;
    radius: number; phase: number; speed: number;
  };
  const orbs: Orb[] = elements.map((el, index) => ({
    el,
    x: 0, y: 0, homeX: 0, homeY: 0, baseX: 0, baseY: 0,
    radius: 25,
    phase: index * 2.399963229728653,
    speed: 0.32 + (index % 7) * 0.055,
  }));
  let width = 0;
  let height = 0;
  let boundaryX = 1;
  let boundaryY = 1;
  let point: { x: number; y: number } | null = null;
  let frame = 0;
  let inView = false;
  let firstLayout = true;
  let lastTime = 0;

  // Equal-distance ellipse sampling avoids bunching near top/bottom on narrow phones.
  function ringPoints(count: number, rx: number, ry: number, rotation: number) {
    const steps = 720;
    const lengths = [0];
    let lastX = rx;
    let lastY = 0;
    for (let s = 1; s <= steps; s++) {
      const a = (s / steps) * Math.PI * 2;
      const x = rx * Math.cos(a);
      const y = ry * Math.sin(a);
      lengths.push(lengths[s - 1] + Math.hypot(x - lastX, y - lastY));
      lastX = x;
      lastY = y;
    }
    const total = lengths[steps];
    const results: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < count; i++) {
      const distance = (((i / count) + rotation) % 1 + 1) % 1 * total;
      let low = 0;
      let high = steps;
      while (low < high) {
        const mid = (low + high) >> 1;
        if (lengths[mid] < distance) low = mid + 1; else high = mid;
      }
      const hi = Math.max(1, low);
      const a = ((hi - 1) + (distance - lengths[hi - 1]) /
        Math.max(0.00001, lengths[hi] - lengths[hi - 1])) / steps * Math.PI * 2;
      results.push({ x: rx * Math.cos(a), y: ry * Math.sin(a) });
    }
    return results;
  }

  function contain(x: number, y: number, rx: number, ry: number) {
    const norm = Math.hypot(x / rx, y / ry);
    if (norm > 1) return { x: x / norm, y: y / norm };
    return { x, y };
  }

  function measure() {
    const bounds = list!.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const maxRadius = Math.max(...orbs.map((orb) => orb.el.offsetWidth / 2));
    boundaryX = Math.max(1, width / 2 - maxRadius - 10);
    boundaryY = Math.max(1, height / 2 - maxRadius - 10);
    const points = [
      ...ringPoints(18, boundaryX * 0.91, boundaryY * 0.91, 0.028),
      ...ringPoints(10, boundaryX * 0.60, boundaryY * 0.60, 0.052),
      ...ringPoints(4, boundaryX * 0.25, boundaryY * 0.24, 0.063),
    ];
    for (const [index, orb] of orbs.entries()) {
      orb.radius = orb.el.offsetWidth / 2;
      orb.homeX = points[index].x;
      orb.homeY = points[index].y;
    }

    // Settle ring neighbors while keeping them inside the orbital boundary.
    // Positions are deterministic across reloads and don't overlap while idle.
    for (let iteration = 0; iteration < 95; iteration++) {
      for (let i = 0; i < orbs.length; i++) {
        for (let j = i + 1; j < orbs.length; j++) {
          const a = orbs[i];
          const b = orbs[j];
          const dx = a.homeX - b.homeX;
          const dy = a.homeY - b.homeY;
          const distance = Math.hypot(dx, dy) || 0.001;
          const desired = a.radius + b.radius + 4;
          if (distance >= desired) continue;
          const correction = (desired - distance) / 2;
          const ux = dx / distance;
          const uy = dy / distance;
          a.homeX += ux * correction;
          a.homeY += uy * correction;
          b.homeX -= ux * correction;
          b.homeY -= uy * correction;
        }
      }
      for (const orb of orbs) {
        // Gentle attraction back to the intended orbital rings.
        const target = points[orbs.indexOf(orb)];
        orb.homeX += (target.x - orb.homeX) * 0.018;
        orb.homeY += (target.y - orb.homeY) * 0.018;
        const bounded = contain(orb.homeX, orb.homeY, boundaryX, boundaryY);
        orb.homeX = bounded.x;
        orb.homeY = bounded.y;
      }
    }
    for (const orb of orbs) {
      orb.baseX = width / 2 + orb.homeX;
      orb.baseY = height / 2 + orb.homeY;
      orb.el.style.left = `${orb.baseX.toFixed(2)}px`;
      orb.el.style.top = `${orb.baseY.toFixed(2)}px`;
      if (firstLayout) {
        orb.x = orb.homeX;
        orb.y = orb.homeY;
      }
    }
    firstLayout = false;
  }

  function updatePointer(clientX: number, clientY: number) {
    const rect = list!.getBoundingClientRect();
    point = { x: clientX - rect.left - width / 2, y: clientY - rect.top - height / 2 };
  }

  function render(now: number) {
    frame = 0;
    if (!inView || document.hidden || reducedMotion.matches) return;
    const delta = Math.min(2.2, (now - (lastTime || now)) / 16.667);
    lastTime = now;
    const t = now / 1000;
    const mobile = width < 480;
    const drift = mobile ? 5.4 : 9.2;
    const targets = orbs.map((orb, i) => {
      const angle = orb.phase + t * orb.speed;
      const offX = Math.sin(angle) * drift + Math.cos(t * 0.24 + i) * drift * .42;
      const offY = Math.cos(angle * .83) * drift * 1.18 + Math.sin(t * 0.32 + i * .7) * drift * .25;
      let x = orb.homeX + offX;
      let y = orb.homeY + offY;
      if (point) {
        const dx = x - point.x;
        const dy = y - point.y;
        const dist = Math.hypot(dx, dy) || 0.001;
        const range = mobile ? 142 : 204;
        const factor = Math.max(0, 1 - dist / range);
        // The cursor/finger visibly parts nearby orbs, then the cluster springs back.
        // Keep the force inside the original elliptical boundary.
        const push = Math.pow(factor, 1.38) * (mobile ? 45 : 80);
        x += dx / dist * push;
        y += dy / dist * push;
      }
      return contain(x, y, boundaryX, boundaryY);
    });
    // Brief collision-resolution pass prevents labels from merging while floating.
    for (let k = 0; k < 9; k++) {
      for (let i = 0; i < targets.length; i++) {
        for (let j = i + 1; j < targets.length; j++) {
          const a = targets[i];
          const b = targets[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.hypot(dx, dy) || 0.001;
          const minGap = orbs[i].radius + orbs[j].radius + 2;
          if (d >= minGap) continue;
          const amount = (minGap - d) / 2;
          a.x += dx / d * amount;
          a.y += dy / d * amount;
          b.x -= dx / d * amount;
          b.y -= dy / d * amount;
        }
      }
      for (const target of targets) {
        const p = contain(target.x, target.y, boundaryX, boundaryY);
        target.x = p.x;
        target.y = p.y;
      }
    }
    for (const [i, orb] of orbs.entries()) {
      const target = targets[i];
      const factor = Math.min(1, (point ? 0.25 : 0.16) * delta);
      orb.x += (target.x - orb.x) * factor;
      orb.y += (target.y - orb.y) * factor;
      const xx = orb.x - orb.homeX;
      const yy = orb.y - orb.homeY;
      const depth = Math.sin(t * .62 + orb.phase) * (mobile ? 3 : 7);
      const rotX = Math.max(-5, Math.min(5, yy * -.13));
      const rotY = Math.max(-5, Math.min(5, xx * .12));
      const scale = 1 + Math.sin(t * .53 + orb.phase) * .016;
      orb.el.style.transform = `translate(-50%, -50%) translate3d(${xx.toFixed(2)}px,${yy.toFixed(2)}px,${depth.toFixed(2)}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    }
    frame = window.requestAnimationFrame(render);
  }
  function start() {
    if (!frame && inView && !document.hidden && !reducedMotion.matches) {
      lastTime = 0;
      frame = window.requestAnimationFrame(render);
    }
  }
  function stop() {
    if (frame) window.cancelAnimationFrame(frame);
    frame = 0;
  }
  field.classList.add('is-orbital');
  measure();
  const observer = new IntersectionObserver((entries) => {
    inView = entries.some((entry) => entry.isIntersecting);
    if (inView) start(); else stop();
  }, { rootMargin: '80px 0px', threshold: 0 });
  observer.observe(field);
  field.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'touch') updatePointer(event.clientX, event.clientY);
  }, { passive: true });
  field.addEventListener('pointerleave', () => { point = null; });
  field.addEventListener('pointercancel', () => { point = null; });
  field.addEventListener('touchstart', (event) => {
    if (event.touches[0]) updatePointer(event.touches[0].clientX, event.touches[0].clientY);
  }, { passive: true });
  field.addEventListener('touchmove', (event) => {
    if (event.touches[0]) updatePointer(event.touches[0].clientX, event.touches[0].clientY);
  }, { passive: true });
  field.addEventListener('touchend', () => { point = null; }, { passive: true });
  field.addEventListener('touchcancel', () => { point = null; }, { passive: true });
  window.addEventListener('resize', () => { measure(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      stop();
      field.classList.remove('is-orbital');
      for (const orb of orbs) orb.el.removeAttribute('style');
    } else {
      field.classList.add('is-orbital');
      firstLayout = true;
      measure();
      start();
    }
  });
}

// Subtle pointer-following project spotlight, without intercepting taps/clicks.
if (!reducedMotion.matches) {
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.home-project-grid .project-card'));
  for (const card of cards) {
    const art = card.querySelector<HTMLElement>('.project-art');
    if (!art) continue;
    const update = (x: number, y: number) => {
      const rect = art.getBoundingClientRect();
      const px = Math.max(0, Math.min(100, (x - rect.left) / rect.width * 100));
      const py = Math.max(0, Math.min(100, (y - rect.top) / rect.height * 100));
      art.style.setProperty('--spot-x', `${px}%`);
      art.style.setProperty('--spot-y', `${py}%`);
      art.style.setProperty('--pull-x', `${((px - 50) * .12).toFixed(1)}px`);
      art.style.setProperty('--pull-y', `${((py - 50) * .12).toFixed(1)}px`);
    };
    card.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'touch') update(event.clientX, event.clientY);
    }, { passive: true });
    card.addEventListener('pointerleave', () => {
      card.classList.remove('is-interacting');
      art.style.removeProperty('--pull-x');
      art.style.removeProperty('--pull-y');
    });
    card.addEventListener('touchstart', (event) => {
      card.classList.add('is-interacting');
      if (event.touches[0]) update(event.touches[0].clientX, event.touches[0].clientY);
    }, { passive: true });
    card.addEventListener('touchmove', (event) => {
      if (event.touches[0]) update(event.touches[0].clientX, event.touches[0].clientY);
    }, { passive: true });
    card.addEventListener('touchend', () => card.classList.remove('is-interacting'), { passive: true });
    card.addEventListener('touchcancel', () => card.classList.remove('is-interacting'), { passive: true });
  }
}

// Module boundary: avoid TypeScript globals shared across scripts.
export {};
