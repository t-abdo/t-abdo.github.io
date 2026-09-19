import { t } from './i18n.js';
import { watchImages } from './skeleton.js';

// Single source for the grow/shrink duration; the CSS reads it via --expand-dur.
const ANIM_MS = 500;
const DEFAULT_MAX_W = 640;
const DEFAULT_MAX_H = 680;

export function initExpand() {
  const backdrop = document.createElement('div');
  backdrop.className = 'expand-backdrop';

  let state = null;

  // mode: 'full' fills the viewport (case studies), 'tall' keeps a constrained
  // width at a case study's full height, otherwise it's a centred panel.
  function targetRect(maxW, maxH, mode) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = vw <= 720 ? 12 : 24;

    if (mode === 'full') {
      return { left: margin, top: margin, width: vw - margin * 2, height: vh - margin * 2 };
    }

    const width = Math.min(maxW, vw - 48);
    const left = Math.max(24, (vw - width) / 2);

    if (mode === 'tall') {
      return { left, top: margin, width, height: vh - margin * 2 };
    }

    const height = Math.min(maxH, vh * 0.85);
    return { left, top: Math.max(24, (vh - height) / 2), width, height };
  }

  // TL;DR switch inside a case study collapses the long-form paragraphs.
  function bindTldr(root) {
    const toggle = root.querySelector('.tldr-toggle');
    const article = root.querySelector('.cs');
    if (!toggle || !article) return;
    const label = toggle.querySelector('.tldr-toggle__label');
    toggle.addEventListener('click', () => {
      const on = article.classList.toggle('cs--tldr');
      toggle.setAttribute('aria-pressed', String(on));
      if (label) label.textContent = t(on ? 'modals.cpq.head.tldrShort' : 'modals.cpq.head.tldrFullStory');
    });
  }

  // Links inside one panel that hand off to another card's panel (career → case study).
  function bindHandoffs(root) {
    root.querySelectorAll('[data-open-card]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const target = document.querySelector(`.bento-card[data-card="${trigger.dataset.openCard}"]`);
        if (!target) return;
        close();
        setTimeout(() => open(target), ANIM_MS + 60);
      });
    });
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }

  function open(card) {
    if (state) return;
    const key = card.dataset.card;
    const template = document.getElementById(`tpl-${key}`);
    if (!template) return;

    const startRect = card.getBoundingClientRect();
    const cs = getComputedStyle(card);
    const mode = card.dataset.expand;
    const isFull = mode === 'full';

    // The overlay stands in for the card, so the card itself hides: it reads as
    // the card turning into the modal (and back).
    card.classList.add('bento-card--ghost');

    document.body.appendChild(backdrop);
    backdrop.classList.remove('expand-backdrop--visible');
    backdrop.getBoundingClientRect();

    const overlay = document.createElement('div');
    overlay.className = 'expand-card' + (isFull ? ' expand-card--full' : '');
    overlay.style.left = `${startRect.left}px`;
    overlay.style.top = `${startRect.top}px`;
    overlay.style.width = `${startRect.width}px`;
    overlay.style.height = `${startRect.height}px`;
    overlay.style.borderRadius = cs.borderRadius;
    overlay.style.setProperty('--expand-dur', `${ANIM_MS}ms`);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'expand-close';
    closeBtn.setAttribute('aria-label', t('ui.close'));
    closeBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    closeBtn.addEventListener('click', close);

    const inner = document.createElement('div');
    inner.className = 'expand-inner';
    const content = document.createElement('div');
    content.className = 'expand-content';
    content.appendChild(template.content.cloneNode(true));
    watchImages(content);
    inner.appendChild(content);
    bindTldr(content);
    bindHandoffs(content);

    overlay.append(closeBtn, inner);
    document.body.appendChild(overlay);
    overlay.getBoundingClientRect();

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown);

    state = { card, overlay, closing: false };

    // Two frames let the start rect paint before the transition begins. rAF is
    // throttled to nothing while the tab is hidden, so a timeout backs it up —
    // otherwise the overlay would stay stuck at card size.
    let settled = false;
    const settle = () => {
      if (settled || !state) return;
      settled = true;
      backdrop.classList.add('expand-backdrop--visible');
      const maxW = Number(card.dataset.expandMaxw) || DEFAULT_MAX_W;
      const maxH = Number(card.dataset.expandMaxh) || DEFAULT_MAX_H;
      const rect = targetRect(maxW, maxH, mode);
      overlay.classList.add('expand-card--settled');
      overlay.style.left = `${rect.left}px`;
      overlay.style.top = `${rect.top}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
      overlay.style.borderRadius = '32px';
    };

    requestAnimationFrame(() => requestAnimationFrame(settle));
    setTimeout(settle, 60);
  }

  function close() {
    if (!state || state.closing) return;
    state.closing = true;
    const { card, overlay } = state;

    const rect = card.getBoundingClientRect();
    const cs = getComputedStyle(card);

    overlay.classList.add('expand-card--closing');
    backdrop.classList.remove('expand-backdrop--visible');

    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.borderRadius = cs.borderRadius;

    document.removeEventListener('keydown', onKeydown);

    setTimeout(() => {
      overlay.remove();
      backdrop.remove();
      // Swap back in the same frame, skipping the card's opacity transition, so
      // there's no gap between the overlay leaving and the card showing.
      card.style.transition = 'none';
      card.classList.remove('bento-card--ghost');
      card.getBoundingClientRect();
      card.style.transition = '';
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      state = null;
    }, ANIM_MS + 30);
  }

  document.querySelectorAll('.bento-card[data-card]').forEach((card) => {
    if (!document.getElementById(`tpl-${card.dataset.card}`)) return;
    card.addEventListener('click', () => open(card));
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
}
