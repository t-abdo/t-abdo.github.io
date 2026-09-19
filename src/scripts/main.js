import { initI18n } from './i18n.js';
import { initLoader } from './loader.js';
import { initSkeleton } from './skeleton.js';
import { initCursor } from './cursor.js';
import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initExpand } from './expand.js';
import { initCards } from './cards.js';
import { initPictures } from './pictures.js';

function initNavAutoHide() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let lastY = window.scrollY;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > lastY && y > 120) {
      nav.style.transform = 'translateY(-110%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    lastY = y;
  }, { passive: true });
}

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('back-to-top--visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  });
}

// Isolated so one failing feature can't abort the rest — without this, a single
// throw (e.g. a cached script meeting newer markup after a deploy) leaves the
// grid unpositioned and every card dead.
function start(name, fn) {
  try {
    fn();
  } catch (err) {
    console.error(`${name} failed to start`, err);
  }
}

// Texts first: the nav measures pill widths and modals clone filled templates.
start('i18n', initI18n);
start('loader', initLoader);
start('skeleton', initSkeleton);
start('cursor', initCursor);
start('theme', initTheme);
start('nav', initNav);
start('expand', initExpand);
start('cards', initCards);
start('pictures', initPictures);
start('navAutoHide', initNavAutoHide);
start('backToTop', initBackToTop);
