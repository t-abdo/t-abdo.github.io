import { t } from './i18n.js';

/*
  The full-page prototypes in a case study scroll inside their own window. Two
  arrows float beside it on the right, level with its middle: each moves the
  page on by most of a window, and is disabled while there is nowhere left to
  go its way.
*/

const ARROW = {
  down: '<path d="M6 9l6 6 6-6"/>',
  up: '<path d="M6 15l6-6 6 6"/>',
};

function arrow(dir) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `cs-proto-btn cs-proto-btn--${dir}`;
  btn.setAttribute('aria-label', t(dir === 'down' ? 'ui.scrollDown' : 'ui.scrollUp'));
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ARROW[dir]}</svg>`;
  return btn;
}

export function bindProtoScroll(root) {
  root.querySelectorAll('.cs-proto-frame').forEach((frame) => {
    const scroller = frame.querySelector('.cs-proto-scroll');
    if (!scroller) return;
    const down = arrow('down');
    const up = arrow('up');
    const arrows = document.createElement('div');
    arrows.className = 'cs-proto-arrows';
    arrows.append(up, down);
    frame.append(arrows);

    const update = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      down.disabled = max <= 1 || scroller.scrollTop >= max - 1;
      up.disabled = scroller.scrollTop <= 1;
    };
    const step = (dir) => {
      scroller.scrollBy({ top: dir * scroller.clientHeight * 0.8, behavior: 'smooth' });
    };
    down.addEventListener('click', () => step(1));
    up.addEventListener('click', () => step(-1));
    scroller.addEventListener('scroll', update, { passive: true });
    // The picture arrives after the panel opens, and only then is there anything to scroll.
    const img = scroller.querySelector('img');
    if (img && !img.complete) img.addEventListener('load', update, { once: true });
    if (typeof ResizeObserver === 'function') new ResizeObserver(update).observe(scroller);
    update();
  });
}
