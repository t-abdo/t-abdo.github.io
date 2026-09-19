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

// Hover-only loop that eases back to rest instead of snapping when the pointer leaves.
function initHoverLoop(cardSelector, targetSelector) {
  const card = document.querySelector(cardSelector);
  const target = card?.querySelector(targetSelector);
  if (!target) return;

  card.addEventListener('mouseenter', () => {
    target.style.transition = '';
    target.style.transform = '';
    target.classList.add('is-breathing');
  });

  card.addEventListener('mouseleave', () => {
    const current = getComputedStyle(target).transform;
    target.classList.remove('is-breathing');
    target.style.transform = current;
    target.getBoundingClientRect();
    target.style.transition = 'transform 0.8s cubic-bezier(0.45, 0, 0.55, 1)';
    target.style.transform = '';
  });
}

export function initCards() {
  initHoverLoop('.path-card', '.path-card-inner');
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
