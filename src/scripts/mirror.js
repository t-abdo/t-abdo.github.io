import { bindCardActions } from './cards.js';

/*
  A panel can show one of the grid's own cards, live: a slot marked
  data-mirror-card="gmail" is filled with a copy of that card when the panel
  opens, with the same artwork, hover and click. The copy is taken from the
  card itself, so the two never drift apart.
*/

export function bindCardMirrors(root) {
  root.querySelectorAll('[data-mirror-card]').forEach((slot) => {
    const card = document.querySelector(`.bento-card[data-card="${slot.dataset.mirrorCard}"]`);
    if (!card) return;
    const copy = card.cloneNode(true);
    // The grid places the card inline and names it; the copy is placed by the
    // panel and must not be mistaken for the card it came from.
    copy.removeAttribute('style');
    copy.removeAttribute('data-card');
    copy.classList.remove('bento-card--dim', 'bento-card--ghost');
    copy.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    slot.replaceWith(copy);
    bindCardActions(copy);
  });
}
