/*
  A soft mark where the pointer lands on nothing. Clicking a card or a button
  already answers itself, so the ripple only fires on the dead space around
  them: it confirms the click without competing with the real feedback.
*/

const LIFE_MS = 520;

const INTERACTIVE = [
  'a[href]', 'button', '[role="button"]', '[role="tab"]',
  'label', 'summary', 'input', 'textarea', 'select',
  '.bento-card', '[data-link]', '[data-open-card]', '[data-copy-key]',
  // The area around an open panel closes it, so it is a target like any other.
  '.expand-backdrop',
].join(', ');

export function initRipple() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    if (!(e.target instanceof Element) || e.target.closest(INTERACTIVE)) return;

    const dot = document.createElement('span');
    dot.className = 'click-ripple';
    dot.style.left = `${e.clientX}px`;
    dot.style.top = `${e.clientY}px`;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), LIFE_MS);
  });
}
