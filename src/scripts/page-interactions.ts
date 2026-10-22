/** Distinct About/Contact motion without changing the homepage hero. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reduced.matches) {
  const page = document.body.dataset.route;
  const smallScreen = window.matchMedia('(max-width: 768px)');
  const approach = Array.from(document.querySelectorAll<HTMLElement>('[data-approach-card]'));
  if (page === 'about') {
    if (approach.length) {
      gsap.fromTo(approach,
        { y: 55, opacity: 0, rotate: 1 },
        { y: 0, opacity: 1, rotate: 0, ease: 'power3.out', duration: 0.86, stagger: 0.13, clearProps: 'transform,opacity', scrollTrigger: { trigger: '.bio-principles', start: 'top 85%', once: true } }
      );
    }
    const rows = gsap.utils.toArray<HTMLElement>('[data-timeline-item]');
    rows.forEach((row, index) => {
      gsap.fromTo(row, { opacity: 0, x: smallScreen.matches ? 16 : 56 },
        { opacity: 1, x: 0, ease: 'power3.out', duration: 0.78, delay: index === 0 ? 0 : 0.05, clearProps: 'transform,opacity', scrollTrigger: { trigger: row, start: 'top 90%', once: true } });
    });
    const outline = document.querySelector<HTMLElement>('.bio-hero-outline');
    if (outline && !smallScreen.matches) {
      gsap.to(outline, { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.bio-hero', start: 'top top', end: 'bottom top', scrub: true } });
    }
  }
  if (page === 'contact') {
    const socials = gsap.utils.toArray<HTMLElement>('[data-social-card]');
    if (socials.length) {
      gsap.fromTo(socials, { y: 47, opacity: 0, scale: 0.97 },
        { y: 0, opacity: 1, scale: 1, duration: 0.82, ease: 'power3.out', stagger: 0.12, clearProps: 'transform,opacity', scrollTrigger: { trigger: '.reach-social-grid', start: 'top 87%', once: true } });
    }
    const emailCard = document.querySelector<HTMLElement>('.reach-email-card');
    if (emailCard && !smallScreen.matches) {
      emailCard.addEventListener('pointermove', (event) => {
        const rect = emailCard.getBoundingClientRect();
        emailCard.style.setProperty('--email-x', `${event.clientX - rect.left}px`);
        emailCard.style.setProperty('--email-y', `${event.clientY - rect.top}px`);
      }, { passive: true });
    }
  }
}
