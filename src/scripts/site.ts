const button = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const header = document.querySelector<HTMLElement>('.site-header');
const nav = document.querySelector<HTMLElement>('#primary-nav');

if (button && nav) {
  button.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
    button.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open navigation');
  }));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      button.setAttribute('aria-expanded','false');
      button.setAttribute('aria-label', 'Open navigation');
      button.focus();
    }
  });
}

const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 40);
window.addEventListener('scroll', updateHeader, {passive:true});
updateHeader();

// Module boundary: avoid TypeScript globals shared across scripts.
export {};
