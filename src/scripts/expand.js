import { t } from './i18n.js';
import { watchImages } from './skeleton.js';
import { bindCaseSwitch } from './edu.js';
import { paintLogos } from './logos.js';

// Single source for the grow/shrink durations; the CSS reads them via
// --expand-dur. Closing is the quicker of the two.
const ANIM_MS = 720;
const CLOSE_MS = 640;

// Same curves as --expand-ease / --close-ease, as literals: these are handed to
// a clone parented to <body>, which cannot read a custom property declared on
// the panel, and an unresolved var() voids the whole transition shorthand.
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const CLOSE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
// The panel can snap away, but a single small element doing the same reads as
// a jump rather than a journey, so the photo travels on an even curve.
const MORPH_EASE = 'cubic-bezier(0.4, 0, 0.2, 1)';
const DEFAULT_MAX_W = 640;
const DEFAULT_MAX_H = 680;

export function initExpand() {
  const backdrop = document.createElement('div');
  backdrop.className = 'expand-backdrop';

  let state = null;

  // mode: 'full' fills the viewport (case studies), 'tall' keeps a constrained
  // width at a case study's full height, otherwise it's a centred panel.
  // inset: extra horizontal space (px per side) for a full-mode panel, desktop only.
  function targetRect(maxW, maxH, mode, inset = 0) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;

    if (mode === 'full') {
      // A full-height panel keeps the thin gap top and bottom but stands twice
      // as far from the left and right edges.
      const side = margin * 2 + (vw > 860 ? inset : 0);
      return { left: side, top: margin, width: vw - side * 2, height: vh - margin * 2 };
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
  // The labels live under `ui`: any case study can carry the toggle.
  function bindTldr(root) {
    const toggle = root.querySelector('.tldr-toggle');
    const article = root.querySelector('.cs');
    if (!toggle || !article) return;
    const label = toggle.querySelector('.tldr-toggle__label');
    toggle.addEventListener('click', () => {
      const on = article.classList.toggle('cs--tldr');
      toggle.setAttribute('aria-pressed', String(on));
      if (label) label.textContent = t(on ? 'ui.tldrShort' : 'ui.tldrFullStory');
    });
  }

  // Links inside one panel that hand off to another card's panel (career → case study).
  function bindHandoffs(root) {
    root.querySelectorAll('[data-open-card]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const target = document.querySelector(`.bento-card[data-card="${trigger.dataset.openCard}"]`);
        if (!target) return;
        close();
        setTimeout(() => open(target), CLOSE_MS + 60);
      });
    });
  }


  /* A photo that exists on both the card and the panel it opens travels between
     the two instead of one fading out while the other fades in. The pair is
     matched by `data-morph`; a clone flies between the two boxes while both
     originals stay hidden.

     The start box is painted with the transition switched off, and only after
     two frames is the end box applied. A single forced reflow is not enough
     here: the clone has just been created, and the browser is free to resolve
     its first style with the end values already in place, which collapses the
     flight into a jump. */
  function morph(img, from, to, endRadius, dur, ease, onDone) {
    if (!from.width || !to.width) return onDone();

    // Deep clone and keep the original classes: what travels can be a line of
    // text as well as a photo, and text needs both its children and the rules
    // that style it.
    const fly = img.cloneNode(true);
    fly.classList.add('expand-morph');
    // The original is hidden before it is handed over on the way back, and a
    // clone carries its style attribute along: without this it would fly the
    // whole way invisible. The margin goes too, since the clone is placed by
    // its own box.
    fly.style.visibility = 'visible';
    fly.style.opacity = '1';
    fly.style.margin = '0';
    fly.style.transition = 'none';
    fly.style.borderRadius = getComputedStyle(img).borderRadius;
    fly.style.left = `${from.left}px`;
    fly.style.top = `${from.top}px`;
    fly.style.width = `${from.width}px`;
    fly.style.height = `${from.height}px`;
    document.body.appendChild(fly);
    // Resolve the start style straight away. Two frames are the clean way to
    // separate the two states, but frames stop arriving in a hidden tab and the
    // fallback timeout below would then set both states without the browser
    // ever having computed the first one, which cancels the transition.
    fly.getBoundingClientRect();

    let launched = false;
    const launch = () => {
      if (launched || !fly.isConnected) return;
      launched = true;
      fly.style.transition = ['left', 'top', 'width', 'height', 'border-radius']
        .map((prop) => `${prop} ${dur}ms ${ease}`).join(', ');
      fly.style.left = `${to.left}px`;
      fly.style.top = `${to.top}px`;
      fly.style.width = `${to.width}px`;
      fly.style.height = `${to.height}px`;
      fly.style.borderRadius = endRadius;

      // The hand-off waits out the flight with a margin, so the clone is never
      // taken away before it has landed.
      setTimeout(() => {
        fly.remove();
        onDone();
      }, dur + 120);
    };

    // rAF is throttled to nothing in a hidden tab, so a timeout backs it up:
    // without it the clone would sit on the card and never be cleared.
    requestAnimationFrame(() => requestAnimationFrame(launch));
    setTimeout(launch, 60);
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
    // A card can hand its own surface to the panel it opens (the quotes do).
    const theme = card.dataset.expandTheme;
    overlay.className = 'expand-card'
      + (isFull ? ' expand-card--full' : '')
      + (theme ? ` expand-card--${theme}` : '');
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
    paintLogos(content);
    inner.appendChild(content);
    bindTldr(content);
    bindCaseSwitch(content, inner);
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
      const rect = targetRect(maxW, maxH, mode, Number(card.dataset.expandInset) || 0);

      const place = () => {
        overlay.style.left = `${rect.left}px`;
        overlay.style.top = `${rect.top}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
      };

      // Where the panel's copy of the shared photo will end up can only be read
      // off the panel at its final size, so it is laid out there for one frame —
      // before the transition is armed — and put back.
      const source = card.querySelector('[data-morph]');
      const target = source && content.querySelector(`[data-morph="${source.dataset.morph}"]`);
      if (target) {
        place();
        const to = target.getBoundingClientRect();
        overlay.style.left = `${startRect.left}px`;
        overlay.style.top = `${startRect.top}px`;
        overlay.style.width = `${startRect.width}px`;
        overlay.style.height = `${startRect.height}px`;
        overlay.getBoundingClientRect();
        target.style.visibility = 'hidden';
        morph(source, source.getBoundingClientRect(), to,
              getComputedStyle(target).borderRadius, ANIM_MS, EASE,
              () => { target.style.visibility = ''; });
      }

      overlay.classList.add('expand-card--settled');
      place();
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
    overlay.style.setProperty('--expand-dur', `${CLOSE_MS}ms`);
    overlay.style.setProperty('--expand-ease', 'var(--close-ease)');
    backdrop.classList.remove('expand-backdrop--visible');

    // The card comes back first and the panel shrinks over it, so what lands in
    // the grid is a card that has been live the whole way down rather than one
    // that appears at the end.
    card.style.transition = 'none';
    card.classList.remove('bento-card--ghost');
    card.getBoundingClientRect();
    card.style.transition = '';

    // The shared photo travels back to the card it came from — unless the reader
    // scrolled it out of the panel, in which case it would fly in from off
    // screen and read as a stray image rather than as the same photo returning.
    const source = overlay.querySelector('[data-morph]');
    const target = source && card.querySelector(`[data-morph="${source.dataset.morph}"]`);
    if (target) {
      const from = source.getBoundingClientRect();
      const onScreen = from.bottom > 0 && from.top < window.innerHeight
        && from.right > 0 && from.left < window.innerWidth;
      if (onScreen) {
        source.style.visibility = 'hidden';
        // The card's own copy waits under the panel until the flying one lands,
        // so the two are never on screen together.
        target.style.visibility = 'hidden';
        morph(source, from, target.getBoundingClientRect(),
              getComputedStyle(target).borderRadius, CLOSE_MS, MORPH_EASE,
              () => { target.style.visibility = ''; });
      }
    }

    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.borderRadius = cs.borderRadius;

    document.removeEventListener('keydown', onKeydown);

    setTimeout(() => {
      overlay.remove();
      backdrop.remove();
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      state = null;
    }, CLOSE_MS + 30);
  }

  document.querySelectorAll('.bento-card[data-card]').forEach((card) => {
    if (!document.getElementById(`tpl-${card.dataset.card}`)) return;
    card.addEventListener('click', () => open(card));
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
}
