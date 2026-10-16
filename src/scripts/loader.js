const SEEN_KEY = 'portfolio-loader-seen';
// The loader is worth seeing: hold it on screen even when the page is ready
// sooner, so it reads as an intro instead of a flash.
const MIN_MS = 1000;

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
  let loaded = document.readyState === 'complete';
  window.addEventListener('load', () => { loaded = true; }, { once: true });

  const step = () => {
    // Creep towards 90% until the page has finished loading and the minimum
    // time is up; the increments are paced to take about that long to get there.
    const cap = loaded && performance.now() - start >= MIN_MS ? 100 : 90;
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
