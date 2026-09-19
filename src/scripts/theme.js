import { t } from './i18n.js';

const STORAGE_KEY = 'portfolio-theme';

export function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const label = document.getElementById('themeLabel');
  if (!toggle) return;

  const stored = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = stored || (prefersDark ? 'dark' : 'light');
  applyTheme(initial);

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
