/*
  The projects under each role on the Professional Path panel wear the same
  live covers as their cards in the grid. The cover is copied from the card
  when the panel opens, so the two never drift apart, and drawn at the card's
  own size, then scaled down to the tile (see .career-cover). Tags and the
  expand button stay behind; the tile gets a swap button instead, since it
  trades this panel for the case study.
*/

import { watchMotion } from './motion.js';

const SWAP_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h15l-4-4M20 16H5l4 4"/></svg>';

function coverOf(card) {
  const cover = document.createElement('span');
  cover.className = `${card.className} career-cover`;
  cover.classList.remove('bento-card--dim', 'bento-card--ghost', 'motion-off');
  cover.setAttribute('aria-hidden', 'true');
  cover.append(...card.cloneNode(true).childNodes);
  // The tile names the project for screen readers only; the cover shows its mark
  cover.querySelectorAll('.card-tags, .action-icon, .card-label').forEach((el) => el.remove());
  cover.querySelectorAll('[data-tooltip]').forEach((el) => el.removeAttribute('data-tooltip'));
  return cover;
}

export function bindCareerCovers(root, signal) {
  root.querySelectorAll('.career-project[data-open-card]').forEach((tile) => {
    const card = document.querySelector(`.bento-card[data-card="${tile.dataset.openCard}"]`);
    if (!card) return;
    const swap = document.createElement('span');
    swap.className = 'action-icon';
    swap.setAttribute('aria-hidden', 'true');
    swap.innerHTML = SWAP_ICON;
    const cover = coverOf(card);
    tile.prepend(cover);
    // Paused while scrolled out of the panel, like the card it copies.
    const unwatch = watchMotion(cover);
    signal?.addEventListener('abort', unwatch, { once: true });
    tile.append(swap);
  });
}
