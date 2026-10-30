/*
  The covers keep moving only where someone can see them. A card scrolled out
  of view has its animations paused, and the whole grid holds still while a
  panel covers it; both pick up where they left off. Only CSS animations are
  paused (animation-play-state, in base.css), so transitions, the panel's own
  opening and the photos flying between card and panel are never touched.
*/

let offscreen = null;

function track(el) {
  offscreen?.observe(el);
}

/* A card's live cover shown inside a panel (Professional Path) is paused the
   same way while it is scrolled out of the panel. Returns the undo. */
export function watchMotion(el) {
  track(el);
  return () => offscreen?.unobserve(el);
}

// Called by the panel: the grid behind it stops while it is open.
export function holdGrid(on) {
  document.getElementById('grid')?.classList.toggle('grid--still', on);
}

export function initMotion() {
  if (typeof IntersectionObserver !== 'function') return;
  offscreen = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      target.classList.toggle('motion-off', !isIntersecting);
    });
  }, { rootMargin: '120px 0px' });
  document.querySelectorAll('#grid .bento-card').forEach(track);
}
