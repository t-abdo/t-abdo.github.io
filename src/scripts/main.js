import { initI18n } from './i18n.js';
import { initLoader } from './loader.js';
import { initSkeleton } from './skeleton.js';
import { initCursor } from './cursor.js';
import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initExpand } from './expand.js';
import { initCards } from './cards.js';
import { initPictures } from './pictures.js';
import { initEduCover } from './edu.js';
import { initLogos } from './logos.js';
import { initRipple } from './ripple.js';
import { initMotion } from './motion.js';

function initNavAutoHide() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  let lastY = window.scrollY;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('nav--hidden', y > lastY && y > 120);
    lastY = y;
  }, { passive: true });
}

/* The ride back up is its own animation rather than `behavior: 'smooth'`: that
   one picks its own duration (a few hundred ms here), which reads as a jump
   from the foot of a long page. */
const TO_TOP_MS = 1000;

function scrollToTop() {
  const start = window.scrollY;
  if (start <= 0) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.scrollTo(0, 0);
    return;
  }

  const t0 = performance.now();
  let cancelled = false;
  // Any attempt to scroll by hand hands control straight back.
  const stop = () => { cancelled = true; };
  window.addEventListener('wheel', stop, { passive: true, once: true });
  window.addEventListener('touchstart', stop, { passive: true, once: true });

  const step = (now) => {
    if (cancelled) return;
    const t = Math.min(1, (now - t0) / TO_TOP_MS);
    // Ease in and out, so it leaves and arrives gently.
    const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    window.scrollTo(0, start * (1 - eased));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('back-to-top--visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', scrollToTop);

  // The logo goes back to the top of this page. Its href points at the home of
  // the page's own language, for when scripts don't run: a bare "#" would
  // resolve against the Portuguese page's <base> and land on the English one.
  document.querySelector('.nav-logo')?.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToTop();
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
start('eduCover', initEduCover);
start('logos', initLogos);
start('ripple', initRipple);
start('motion', initMotion);
start('navAutoHide', initNavAutoHide);
start('backToTop', initBackToTop);
