import { t } from './i18n.js';
import { setCursorTooltip } from './cursor.js';

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

// Hovering a contact card draws its mark again from the start
function replayIcon(card) {
  let svg = card.querySelector('svg.gm-svg, svg.li-svg, svg.c1-svg');
  if (!svg) return;
  card.addEventListener('mouseenter', () => {
    const fresh = svg.cloneNode(true);
    svg.replaceWith(fresh);
    svg = fresh;
  });
}

function bindCopy(card) {
  const actionIcon = card.querySelector('.action-icon');
  let revertTimer = null;
  card.addEventListener('click', async () => {
    const ok = await copyText(card.dataset.copy);
    if (!ok) return;
    actionIcon.classList.add('gmail-copied');
    setCursorTooltip(t('cards.gmail.copied'));
    clearTimeout(revertTimer);
    revertTimer = setTimeout(() => {
      actionIcon.classList.remove('gmail-copied');
      setCursorTooltip(card.dataset.tooltip);
    }, 2000);
  });
}

/* What a card does when clicked, other than opening a panel: copy the email,
   open a link, download a file. Bound per card, so a copy of a card shown
   inside a panel (mirror.js) can be given the same behaviour. */
export function bindCardActions(root) {
  // The root counts too, so a single card can be passed in
  const all = (selector) => [
    ...(root.matches?.(selector) ? [root] : []),
    ...root.querySelectorAll(selector),
  ];
  all('.gmail-card, .linkedin-card, .english-card').forEach(replayIcon);
  all('[data-copy]').forEach(bindCopy);

  // Anchors inside a card would otherwise also trigger the card's own handler
  all('.bento-card a.action-icon').forEach((link) => {
    link.addEventListener('click', (e) => e.stopPropagation());
  });

  all('[data-link]').forEach((card) => {
    card.addEventListener('click', () => {
      window.open(card.dataset.link, '_blank', 'noopener');
    });
  });

  all('[data-download]').forEach((card) => {
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

export function initCards() {
  bindCardActions(document);

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
    setCursorTooltip(btn.dataset.copiedLabel || t('cards.gmail.copied'));
    clearTimeout(keyRevert);
    keyRevert = setTimeout(() => {
      btn.classList.remove('key-copy--done');
      setCursorTooltip(btn.dataset.tooltip);
    }, 2000);
  });
}
