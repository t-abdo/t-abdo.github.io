import { t } from './i18n.js';

const STORAGE_KEY = 'portfolio-theme';

/* A first visit follows the hour on the visitor's own clock rather than the
   system setting: dark from 18:00 to 06:00, light the rest of the day. Their
   own choice, once made, outlives it. The same two lines run in the pre-paint
   script in index.html, which can't wait for a module. */
export function themeByClock(now = new Date()) {
  const hour = now.getHours();
  return hour >= 18 || hour < 6 ? 'dark' : 'light';
}

export function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const label = document.getElementById('themeLabel');
  if (!toggle) return;

  const stored = localStorage.getItem(STORAGE_KEY);
  applyTheme(stored || themeByClock());

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  function applyTheme(theme) {
    // The icons themselves are swapped by CSS off [data-theme].
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      label.textContent = t('nav.themeLabelLight');
      toggle.dataset.tooltip = t('nav.themeTooltipToLight');
    } else {
      document.documentElement.removeAttribute('data-theme');
      label.textContent = t('nav.themeLabelDark');
      toggle.dataset.tooltip = t('nav.themeTooltipToDark');
    }
  }
}
