import { TEXTS } from '../content/texts.js';

// Portuguese isn't published yet; flip this (and persist it) when the switch ships.
let lang = 'en';

// Looks up "cards.about.bio" in TEXTS, falling back to English for untranslated entries.
export function t(key) {
  const entry = key.split('.').reduce((node, part) => node?.[part], TEXTS);
  const value = entry?.[lang] ?? entry?.en;
  if (value == null) {
    console.warn(`Missing text: ${key}`);
    return '';
  }
  return value;
}

// data-i18n        → textContent
// data-i18n-html   → innerHTML (values with inline tags)
// data-i18n-attr   → "attr:key;attr:key"
function applyTexts(root) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      el.setAttribute(attr, t(key));
    });
  });
  // Modal content is cloned from templates, so fill those before anything opens.
  root.querySelectorAll('template').forEach((tpl) => applyTexts(tpl.content));
}

export function initI18n() {
  document.documentElement.lang = lang;
  applyTexts(document);
}
