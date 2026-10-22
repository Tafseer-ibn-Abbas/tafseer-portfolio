/** Optional clipboard convenience. The mailto link is the no-JS fallback. */
const copyButton = document.querySelector<HTMLButtonElement>('[data-copy-email]');
if (copyButton) {
  let resetTimer: number | undefined;
  const label = copyButton.querySelector<HTMLElement>('[data-copy-label]');
  copyButton.addEventListener('click', async () => {
    const email = copyButton.dataset.email;
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      if (label) label.textContent = 'COPIED ✓';
      copyButton.setAttribute('aria-label', 'Email address copied');
    } catch {
      // If clipboard access is denied (e.g. insecure origin), keep working mailto link.
      if (label) label.textContent = 'USE EMAIL LINK';
      copyButton.setAttribute('aria-label', 'Unable to copy automatically; use the email link');
    }
    window.clearTimeout(resetTimer);
    resetTimer = window.setTimeout(() => {
      if (label) label.textContent = 'COPY EMAIL';
      copyButton.setAttribute('aria-label', 'Copy email address to clipboard');
    }, 2200);
  });
}

// Module boundary: avoid TypeScript globals shared across scripts.
export {};
