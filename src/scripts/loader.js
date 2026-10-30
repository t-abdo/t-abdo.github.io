const SEEN_KEY = 'portfolio-loader-seen';
// The loader is worth seeing: hold it on screen even when the page is ready
// sooner, so it reads as an intro instead of a flash.
const MIN_MS = 1000;
// And never longer than this, however slow the connection: what is still
// downloading carries on behind the page, with its own placeholders.
const MAX_MS = 2500;

/* Ready means the fonts and the images on the first screen, not every image on
   the page: waiting for `load` held the loader until the whole grid had
   downloaded. Run once the grid is laid out, so the first screen is the real one. */
function firstScreenReady() {
  const onScreen = [...document.images].filter((img) => {
    if (img.complete) return false;
    const r = img.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight;
  });
  const settle = (img) => new Promise((done) => {
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });
  return Promise.all([document.fonts?.ready, ...onScreen.map(settle)]);
}

// First-visit loading screen. The inline script in <head> hides it up front on
// later visits (before paint), so this only runs the one time it's shown.
export function initLoader() {
  const loader = document.getElementById('pageLoader');
  if (!loader || document.documentElement.classList.contains('loader-seen')) {
    loader?.remove();
    return;
  }

  const fill = loader.querySelector('.loader-bar-fill');
  const percent = loader.querySelector('.loader-percent');
  const start = performance.now();
  let pct = 0;
  let ready = false;
  // The other modules start right after this one; the next frame sees the grid in place.
  requestAnimationFrame(() => firstScreenReady().then(() => { ready = true; }));

  const step = () => {
    // Creep towards 90% until the first screen is ready and the minimum time
    // is up; the increments are paced to take about that long to get there.
    const elapsed = performance.now() - start;
    const cap = (ready && elapsed >= MIN_MS) || elapsed >= MAX_MS ? 100 : 90;
    pct = Math.min(cap, pct + Math.random() * 6 + 6);
    fill.style.width = `${pct}%`;
    percent.textContent = `${Math.round(pct)}%`;
    if (pct < 100) {
      setTimeout(step, 90);
      return;
    }
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode: show again next time */ }
    setTimeout(() => {
      loader.classList.add('is-hidden');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }, 200);
  };
  step();
}
