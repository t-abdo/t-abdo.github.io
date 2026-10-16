import { t } from './i18n.js';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    document.body.removeChild(el);
    return ok;
  }
}

function initIconReplay(selector) {
  const card = document.querySelector(selector);
  if (!card) return;
  let svg = card.querySelector('svg.gm-svg, svg.li-svg, svg.c1-svg');
  if (!svg) return;
  card.addEventListener('mouseenter', () => {
    const fresh = svg.cloneNode(true);
    svg.replaceWith(fresh);
    svg = fresh;
  });
}

export function initCards() {
  initIconReplay('.gmail-card');
  initIconReplay('.linkedin-card');
  initIconReplay('.english-card');

  const gmailCard = document.querySelector('.gmail-card');
  if (gmailCard) {
    const actionIcon = gmailCard.querySelector('.action-icon');
    let revertTimer = null;

    gmailCard.addEventListener('click', async () => {
      const ok = await copyText(gmailCard.dataset.copy);
      if (!ok) return;
      actionIcon.classList.add('gmail-copied');
      window.setCursorTooltip?.(t('cards.gmail.copied'));
      clearTimeout(revertTimer);
      revertTimer = setTimeout(() => {
        actionIcon.classList.remove('gmail-copied');
        window.setCursorTooltip?.(gmailCard.dataset.tooltip);
      }, 2000);
    });
  }

  // Copy buttons live inside cloned modal templates, so this listens on the
  // document instead of binding at startup.
  let keyRevert = null;
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy-key]');
    if (!btn) return;
    e.stopPropagation();
    const ok = await copyText(btn.dataset.copyKey);
    if (!ok) return;
    btn.classList.add('key-copy--done');
    window.setCursorTooltip?.(btn.dataset.copiedLabel || t('cards.gmail.copied'));
    clearTimeout(keyRevert);
    keyRevert = setTimeout(() => {
      btn.classList.remove('key-copy--done');
      window.setCursorTooltip?.(btn.dataset.tooltip);
    }, 2000);
  });

  // Anchors inside a card would otherwise also trigger the card's own handler
  document.querySelectorAll('.bento-card a.action-icon').forEach((link) => {
    link.addEventListener('click', (e) => e.stopPropagation());
  });

  document.querySelectorAll('[data-link]').forEach((card) => {
    card.addEventListener('click', () => {
      window.open(card.dataset.link, '_blank', 'noopener');
    });
  });

  document.querySelectorAll('[data-download]').forEach((card) => {
    card.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = card.dataset.download;
      a.download = '';
      document.body.appendChild(a);
      a.click();
      a.remove();
    });
  });
}
