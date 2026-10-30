/*
  A panel that opts in with data-reveal builds itself up as it is read:
  copy rises into place, pairs slide in from their own sides, and the parts of
  a diagram arrive one after another. Each piece plays once, the first time it
  scrolls into view; whatever enters together is staggered in reading order.
  The pieces are picked here by their classes, so the markup carries nothing
  but the opt-in.
*/

const STAGGER_MS = 90;
const MAX_STAGGER = 6;

// Matched in order; the first rule an element meets decides how it arrives.
const RULES = [
  // Professional Path: each role closes in from both sides onto the rail
  ['.career-meta', 'left'],
  ['.career-dot', 'zoom'],
  ['.career-card', 'right'],
  // About: the blocks rise in turn, pairs of cards close in from both sides
  ['.about-intro, .about-section > .about-section-title, .about-ai-text, .about-contact', 'up'],
  ['.about-step', 'up'],
  ['.about-cards > .about-card:first-child', 'left'],
  ['.about-cards > .about-card:last-child', 'right'],
  ['.cs-head > *', 'up'],
  ['.cs-figure--hero', 'zoom'],
  ['.cs-sides > .cs-side:first-child', 'left'],
  ['.cs-sides > .cs-side:last-child', 'right'],
  ['.cs-principles > .cs-principle:nth-child(odd)', 'left'],
  ['.cs-principles > .cs-principle:nth-child(even)', 'right'],
  ['.cs-grid > .cs-tile', 'up'],
  ['.cs-numbers > li', 'left'],
  ['.cs-flow', 'zoom'],
  ['.cs-shared-row > .cs-actor:first-child', 'left'],
  ['.cs-shared-row > .cs-actor:last-child', 'right'],
  ['.cs-shared-core', 'zoom'],
  ['.cs-shared-row > .cs-shared-link:nth-child(2)', 'grow-right'],
  ['.cs-shared-row > .cs-shared-link:nth-child(4)', 'grow-left'],
  ['.cs-shared-link--v', 'grow-down'],
  ['.cs-shared > .cs-actor', 'up'],
  // CPQ Hub: the rebuilt slides rise whole, their lists arrive item by item
  ['.cs-impact > li', 'left'],
  ['.deck-roles > li', 'up'],
  ['.deck-failures > li:first-child', 'left'],
  ['.deck-failures > li:last-child', 'right'],
  ['.deck:not(:has(.deck-roles, .deck-failures))', 'up'],
  ['.cs-eyebrow, .cs-section-title, .cs-meta, .cs-text, .cs-banner, .case-switch, .cs-rule', 'up'],
  ['.case-panel > .cs-figure, .case-panel > .cs-live', 'up'],
];

export function bindReveal(content, scroller) {
  const root = content.querySelector('[data-reveal]');
  if (!root) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const pieces = [];
  for (const [selector, kind] of RULES) {
    root.querySelectorAll(selector).forEach((el) => {
      if (el.dataset.revealAs) return;
      el.dataset.revealAs = kind;
      pieces.push(el);
    });
  }
  root.classList.add('reveal-root');

  const observer = new IntersectionObserver((entries) => {
    const arriving = entries
      .filter((entry) => entry.isIntersecting)
      .map((entry) => entry.target)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    arriving.forEach((el, i) => {
      el.style.setProperty('--reveal-delay', `${Math.min(i, MAX_STAGGER) * STAGGER_MS}ms`);
      el.classList.add('is-revealed');
      observer.unobserve(el);
    });
  }, { root: scroller, rootMargin: '0px 0px -10% 0px' });

  pieces.forEach((el) => observer.observe(el));
}
