import { t } from './i18n.js';
import { watchImages } from './skeleton.js';
import { bindCaseSwitch } from './edu.js';
import { bindCaseNav } from './case-nav.js';
import { bindProtoScroll } from './proto-scroll.js';
import { bindReveal } from './reveal.js';
import { bindCareerCovers } from './career.js';
import { bindCardMirrors } from './mirror.js';
import { bindFigmaEmbeds } from './figma-embed.js';
import { paintLogos } from './logos.js';
import { holdGrid } from './motion.js';
import { isMobileLayout } from './breakpoints.js';

// Single source for the grow/shrink durations; the CSS reads them via
// --expand-dur. Closing is the quicker of the two.
const ANIM_MS = 720;
const CLOSE_MS = 640;

// Same curves as --expand-ease / --close-ease, as literals: these are handed to
// a clone parented to <body>, which cannot read a custom property declared on
// the panel, and an unresolved var() voids the whole transition shorthand.
const EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const CLOSE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
// How long the panel holds still for a quote's text to fly in: a little short
// of the flight, which is all but landed by then.
const TEXT_HOLD_MS = ANIM_MS - 80;
const DEFAULT_MAX_W = 640;
const FOCUS_GAP = 32; // room left above a part a panel opens at
const DEFAULT_MAX_H = 680;
// A certificate panel never narrows past this, so its title and buttons keep
// their room on a short screen where the certificate itself is small
const CERT_MIN_W = 640;

/* Where a shared element actually is. A photo is its box; a paragraph's box
   spans whatever width its parent gives it, so for text the width comes from
   the lines themselves. The height stays the element's: a range only covers
   the glyphs, which sit inside each line's leading, and a clone placed by it
   would land that much low and hop up when swapped for the real text. */
function boxOf(el) {
  const box = el.getBoundingClientRect();
  if (el.tagName === 'IMG') return box;
  const range = document.createRange();
  range.selectNodeContents(el);
  const lines = range.getBoundingClientRect();
  const rect = new DOMRect(lines.left, box.top, lines.width, box.height);
  // Where the glyphs of the first line start, to land them exactly: the gap
  // above them is snapped to whole pixels, so it doesn't scale in proportion.
  rect.inkTop = lines.top;
  return rect;
}

/* The elements shared by a card and its panel, matched by `data-morph`: a
   photo, or a quote and the label under it. */
function morphPairs(from, to) {
  return [...from.querySelectorAll('[data-morph]')]
    .map((source) => ({ source, target: to.querySelector(`[data-morph="${source.dataset.morph}"]`) }))
    .filter(({ target }) => target);
}

/* Runs `fn` once the start state of a transition has been painted. Two frames
   are the clean way to separate the two states; rAF stops arriving in a hidden
   tab, so a timeout stands in for it, and whichever comes first wins. */
function afterPaint(fn) {
  let done = false;
  const run = () => {
    if (done) return;
    done = true;
    fn();
  };
  requestAnimationFrame(() => requestAnimationFrame(run));
  setTimeout(run, 60);
}

/* While a panel is open everything behind it is inert: out of the tab order,
   out of the accessibility tree and deaf to clicks, so focus stays inside. */
function setPageInert(on) {
  document.querySelectorAll('body > nav, body > main, #backToTop').forEach((el) => {
    el.inert = on;
  });
}

export function initExpand() {
  const backdrop = document.createElement('div');
  backdrop.className = 'expand-backdrop';

  let state = null;

  // mode: 'full' fills the viewport (case studies), 'tall' keeps a constrained
  // width at a case study's full height, otherwise it's a centred panel.
  // inset: extra horizontal space (px per side) for a full-mode panel, desktop only.
  // edge: for a full-mode panel on a desktop, its own distance from the top and
  // bottom of the screen, in place of the frame's (the case studies sit closer).
  function targetRect(maxW, maxH, mode, inset = 0, edge = 0) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;

    if (mode === 'full') {
      // A full-height panel stands twice as far from the left and right edges
      // as from the top and bottom. On a desktop the whole frame doubles, so a
      // case study reads as a page laid on the grid rather than over it.
      const gap = isMobileLayout(vw) ? margin : margin * 2;
      const side = gap * 2 + (isMobileLayout(vw) ? 0 : inset);
      const top = !isMobileLayout(vw) && edge ? edge : gap;
      return { left: side, top, width: vw - side * 2, height: vh - top * 2 };
    }

    const width = Math.min(maxW, vw - 48);
    const left = Math.max(24, (vw - width) / 2);

    if (mode === 'tall') {
      return { left, top: margin, width, height: vh - margin * 2 };
    }

    // Centred panels keep at least 40px of page above and below them
    const height = Math.min(maxH, vh - 80);
    return { left, top: Math.max(24, (vh - height) / 2), width, height };
  }

  /* On a phone or tablet a panel is as tall as what it holds, up to the full
     frame, and sits in the middle of the screen. Its natural height is read at
     the width it will open to, with the fill-the-panel rules lifted for that
     one measurement. */
  function fitToContent(overlay, rect, always = false) {
    if (!always && !isMobileLayout()) return rect;
    const vh = window.innerHeight;
    const frame = vh - 24;
    const width = overlay.style.width;
    overlay.style.width = `${rect.width}px`;
    overlay.classList.add('expand-card--measuring');
    const border = overlay.offsetHeight - overlay.clientHeight;
    const natural = Math.ceil(overlay.querySelector('.expand-inner').getBoundingClientRect().height) + border;
    overlay.classList.remove('expand-card--measuring');
    overlay.style.width = width;
    // Restyle at the width put back, or the opening transition starts from
    // the measuring width and the panel jumps to full width at the card's spot
    overlay.getBoundingClientRect();
    const height = Math.min(natural, frame);
    return { ...rect, top: (vh - height) / 2, height };
  }

  /* A certificate panel opens as large as the screen allows: the certificate
     grows until the panel meets the frame's height or width (or the picture's
     own resolution), and the panel takes the size that leaves it, centred.

     The certificate is given its width in pixels (--cert-w). Sized relative to
     the panel instead, its height depended on the panel's height, which
     depended on it, and the browser settled that loop differently depending
     on when the picture arrived: sometimes very small. */
  function fitCertificate(overlay) {
    const img = overlay.querySelector('.cert-figure img');
    const naturalW = Number(img.getAttribute('width'));
    const ratio = naturalW / Number(img.getAttribute('height'));
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const frameW = vw - 48;
    const frameH = vh - 24;
    const inner = overlay.querySelector('.expand-inner');
    const content = overlay.querySelector('.expand-content');
    const startW = overlay.style.width;

    overlay.classList.add('expand-card--measuring');
    const border = overlay.offsetHeight - overlay.clientHeight;
    // The panel's height at a given width with the certificate at a given width
    const heightAt = (width, certW) => {
      overlay.style.width = `${width}px`;
      overlay.style.setProperty('--cert-w', `${certW}px`);
      return Math.ceil(inner.getBoundingClientRect().height) + border;
    };
    // Everything across the panel that isn't certificate: the side padding
    overlay.style.width = `${frameW}px`;
    const sides = frameW - content.getBoundingClientRect().width;

    // Text wraps differently at each width, so the rest of the panel is
    // measured again at the width the last pass settled on.
    let width = Math.min(frameW, naturalW + sides);
    let certW = 0;
    for (let i = 0; i < 3; i++) {
      const rest = heightAt(width, 0);
      certW = Math.floor(Math.min(naturalW, width - sides, (frameH - rest) * ratio));
      width = Math.min(frameW, Math.max(CERT_MIN_W, certW + sides));
    }
    const height = Math.min(frameH, heightAt(width, certW));

    overlay.classList.remove('expand-card--measuring');
    overlay.style.width = startW;
    overlay.getBoundingClientRect();
    return { left: (vw - width) / 2, top: (vh - height) / 2, width, height };
  }

  // Links inside one panel that hand off to another card's panel (career → case
  // study). One can also name a part of that panel to open at (data-open-focus).
  function bindHandoffs(root) {
    root.querySelectorAll('[data-open-card]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const target = document.querySelector(`.bento-card[data-card="${trigger.dataset.openCard}"]`);
        if (!target) return;
        close();
        setTimeout(() => open(target, trigger.dataset.openFocus), CLOSE_MS + 60);
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
     flight into a jump.

     Returns a function that lands the flight at once, for when the end box
     stops being where the element is (the reader scrolled the panel). */
  function morph(img, from, to, endRadius, dur, ease, onDone) {
    if (!from.width || !to.width) return land(null, onDone);
    if (img.tagName !== 'IMG') return morphText(img, from, to, dur, ease, onDone);

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
    // Resolve the start style straight away: in a hidden tab the fallback in
    // afterPaint() would otherwise set both states without the browser ever
    // having computed the first one, which cancels the transition.
    fly.getBoundingClientRect();

    afterPaint(() => {
      if (!fly.isConnected) return;
      fly.style.transition = ['left', 'top', 'width', 'height', 'border-radius']
        .map((prop) => `${prop} ${dur}ms ${ease}`).join(', ');
      fly.style.left = `${to.left}px`;
      fly.style.top = `${to.top}px`;
      fly.style.width = `${to.width}px`;
      fly.style.height = `${to.height}px`;
      fly.style.borderRadius = endRadius;

      // The hand-off waits out the flight with a margin, so the clone is never
      // taken away before it has landed.
      setTimeout(done, dur + 120);
    });
    const done = land(fly, onDone);
    return done;
  }

  /* Text can't travel by resizing its box: the lines would rewrap all the way.
     It flies at its own size instead and is scaled into place, which only
     lands cleanly when both copies break their lines alike (the quotes share a
     30ch measure for this). When they don't, as on a phone where the panel is
     narrower than the measure, the text simply arrives with the panel. */
  function morphText(el, from, to, dur, ease, onDone) {
    const sx = to.width / from.width;
    const sy = to.height / from.height;
    if (Math.abs(sx - sy) / sx > 0.06) return land(null, onDone);

    const fly = el.cloneNode(true);
    fly.classList.add('expand-morph');
    // Out of its card, the clone would lose what it inherits there.
    const cs = getComputedStyle(el);
    ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing',
      'text-align', 'text-transform', 'color'].forEach((prop) => {
      fly.style.setProperty(prop, cs.getPropertyValue(prop));
    });
    Object.assign(fly.style, {
      visibility: 'visible',
      opacity: '1',
      margin: '0',
      maxWidth: 'none',
      // A pixel of slack, so rounding can't push a word onto a new line; the
      // text is centred, so the box starts half of it early.
      left: `${from.left - 0.5}px`,
      top: `${from.top}px`,
      width: `${from.width + 1}px`,
      height: `${from.height}px`,
      transformOrigin: '0 0',
      transition: 'none',
      willChange: 'transform',
    });
    document.body.appendChild(fly);
    fly.getBoundingClientRect();

    afterPaint(() => {
      if (!fly.isConnected) return;
      fly.style.transition = `transform ${dur}ms ${ease}`;
      // Scaled from the box's corner, so the glyphs' own offset in it grows too
      const dx = to.left - (from.left - 0.5) - 0.5 * sx;
      const dy = to.inkTop - from.top - (from.inkTop - from.top) * sx;
      fly.style.transform = `translate(${dx}px, ${dy}px) scale(${sx})`;
      setTimeout(done, dur + 120);
    });
    const done = land(fly, onDone);
    return done;
  }

  // Hands a flight over to the real element, once, whichever asks first.
  function land(fly, onDone) {
    let landed = false;
    const done = () => {
      if (landed) return;
      landed = true;
      fly?.remove();
      onDone();
    };
    if (!fly) done();
    return done;
  }

  function onKeydown(e) {
    if (e.key === 'Escape') close();
  }

  function open(card, focusId) {
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
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.tabIndex = -1;
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
    // A panel sized to its content shows its pictures as soon as it opens, so
    // they load now rather than lazily once it has.
    if (card.hasAttribute('data-expand-fit')) {
      content.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; });
    }
    const isCert = !!content.querySelector('.cert-panel');
    // While the panel grows, sections out of view are left unlaid, so a long
    // case doesn't relayout all of itself on every frame of the opening.
    content.classList.add('expand-content--opening');
    setTimeout(() => content.classList.remove('expand-content--opening'), ANIM_MS + 100);
    watchImages(content);
    // Whatever the panel hooks up outside itself (window listeners, observers)
    // is let go through this when it closes, along with the panel.
    const life = new AbortController();
    bindCareerCovers(content, life.signal);
    bindCardMirrors(content);
    paintLogos(content);
    inner.appendChild(content);
    bindCaseNav(content, inner);
    bindCaseSwitch(content, inner, life.signal);
    bindProtoScroll(content);
    bindFigmaEmbeds(content, inner);
    bindReveal(content, inner);
    bindHandoffs(content);

    // The panel is named by its own heading, or for a quote by the line that
    // names it; a panel with neither borrows the card's tooltip.
    const heading = content.querySelector('.expand-title, .cs-title, .about-name, .quote-label');
    if (heading) {
      heading.id = 'expandTitle';
      overlay.setAttribute('aria-labelledby', heading.id);
    } else {
      overlay.setAttribute('aria-label', card.dataset.tooltip || '');
    }

    overlay.append(closeBtn, inner);
    document.body.appendChild(overlay);
    overlay.getBoundingClientRect();

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeydown);

    // Focus moves into the panel and, on close, back to whatever opened it. It
    // lands on the panel itself rather than on the close button, so nothing is
    // highlighted on arrival; the next Tab reaches the button.
    const opener = document.activeElement;
    setPageInert(true);
    overlay.focus({ preventScroll: true });

    state = { card, overlay, opener, life, closing: false };
    holdGrid(true);

    // The start rect paints before the transition begins; without that the
    // overlay would jump straight to its final size.
    afterPaint(() => {
      if (!state) return;
      backdrop.classList.add('expand-backdrop--visible');
      const maxW = Number(card.dataset.expandMaxw) || DEFAULT_MAX_W;
      const maxH = Number(card.dataset.expandMaxh) || DEFAULT_MAX_H;
      // data-expand-fit: the panel takes its content's height on a desktop too
      const rect = isCert ? fitCertificate(overlay) : fitToContent(overlay,
        targetRect(maxW, maxH, mode, Number(card.dataset.expandInset) || 0,
          Number(card.dataset.expandEdge) || 0),
        card.hasAttribute('data-expand-fit'));

      const place = () => {
        overlay.style.left = `${rect.left}px`;
        overlay.style.top = `${rect.top}px`;
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        // The panel's final height, for what has to fit inside it (the case rail)
        overlay.style.setProperty('--panel-height', `${rect.height}px`);
      };

      // A panel opened at one of its parts is scrolled there, measured at its
      // final size, and the part is marked as the one asked for.
      const focus = focusId && content.querySelector(`[data-focus-id="${focusId}"]`);
      if (focus) {
        place();
        inner.scrollTop += focus.getBoundingClientRect().top - inner.getBoundingClientRect().top - FOCUS_GAP;
        focus.classList.add('is-focused');
        overlay.style.left = `${startRect.left}px`;
        overlay.style.top = `${startRect.top}px`;
        overlay.style.width = `${startRect.width}px`;
        overlay.style.height = `${startRect.height}px`;
        overlay.getBoundingClientRect();
      }

      // Where the panel's copy of the shared photo will end up can only be read
      // off the panel at its final size, so it is laid out there for one frame —
      // before the transition is armed — and put back.
      const pairs = morphPairs(card, content);
      if (pairs.length) {
        place();
        const ends = pairs.map(({ target }) => boxOf(target));
        overlay.style.left = `${startRect.left}px`;
        overlay.style.top = `${startRect.top}px`;
        overlay.style.width = `${startRect.width}px`;
        overlay.style.height = `${startRect.height}px`;
        overlay.getBoundingClientRect();
        // The flights aim at where the elements sit now, so the panel holds
        // still until they land; a scroll that gets through anyway (keys, a
        // scrollbar drag) lands them on the spot instead of off target.
        const hold = (e) => e.preventDefault();
        const landers = [];
        const onScroll = () => landers.forEach((landNow) => landNow());
        const release = () => {
          overlay.removeEventListener('wheel', hold);
          overlay.removeEventListener('touchmove', hold);
        };
        overlay.addEventListener('wheel', hold, { passive: false });
        overlay.addEventListener('touchmove', hold, { passive: false });
        inner.addEventListener('scroll', onScroll);
        if (pairs.every(({ source }) => source.tagName !== 'IMG')) setTimeout(release, TEXT_HOLD_MS);
        let flying = pairs.length;
        pairs.forEach(({ source, target }, i) => {
          target.style.visibility = 'hidden';
          landers.push(morph(source, boxOf(source), ends[i],
            getComputedStyle(target).borderRadius, ANIM_MS, EASE,
            () => {
              target.style.visibility = '';
              if (--flying) return;
              release();
              inner.removeEventListener('scroll', onScroll);
            }));
        });
      }

      overlay.classList.add('expand-card--settled');
      place();
      overlay.style.borderRadius = '32px';

      // A photo that arrives after opening makes the panel taller, until it
      // reaches the frame, wherever the panel takes its content's height. A
      // certificate already has its size from its width and height attributes.
      const fits = card.hasAttribute('data-expand-fit');
      if (!isCert && (fits || isMobileLayout())) {
        const refit = () => {
          if (!state || state.closing || state.overlay !== overlay) return;
          if (parseFloat(overlay.style.height) >= window.innerHeight - 25) return;
          const next = fitToContent(overlay, rect, fits);
          if (Math.abs(next.height - parseFloat(overlay.style.height)) < 1) return;
          overlay.style.top = `${next.top}px`;
          overlay.style.height = `${next.height}px`;
        };
        content.querySelectorAll('img').forEach((img) => {
          if (!img.complete) img.addEventListener('load', refit, { once: true });
        });
      }
    });
  }

  function close() {
    if (!state || state.closing) return;
    state.closing = true;
    const { card, overlay, opener, life } = state;
    // The grid moves again before the panel shrinks, so the card it lands on is live.
    holdGrid(false);

    const rect = card.getBoundingClientRect();
    const cs = getComputedStyle(card);

    // The content fades out as the panel shrinks. Held at its open width, it
    // isn't laid out again on every frame of the way down, which a case built
    // from container-sized slides (CPQ) can't afford.
    const content = overlay.querySelector('.expand-content');
    if (content) content.style.width = `${content.offsetWidth}px`;
    overlay.classList.add('expand-card--closing');
    overlay.style.setProperty('--expand-dur', `${CLOSE_MS}ms`);
    overlay.style.setProperty('--expand-ease', 'var(--close-ease)');
    backdrop.classList.remove('expand-backdrop--visible');

    // The card comes back first and the panel shrinks over it, so what lands in
    // the grid is a card that has been live the whole way down rather than one
    // that appears at the end.
    card.style.transition = 'none';
    card.classList.remove('bento-card--ghost');
    // Held at rest, not lifted by a pointer that happens to be over it, so the
    // text flying back lands where the card's own copy will stay.
    card.classList.add('bento-card--landing');
    card.getBoundingClientRect();
    card.style.transition = '';
    const settle = () => card.classList.remove('bento-card--landing');
    let landing = false;

    // The shared photo travels back to the card it came from — unless the reader
    // scrolled it out of the panel, in which case it would fly in from off
    // screen and read as a stray image rather than as the same photo returning.
    const flights = morphPairs(overlay, card).filter(({ source }) => {
      const from = boxOf(source);
      return from.bottom > 0 && from.top < window.innerHeight
        && from.right > 0 && from.left < window.innerWidth;
    });
    let flying = flights.length;
    landing = flying > 0;
    flights.forEach(({ source, target }) => {
      source.style.visibility = 'hidden';
      // The card's own copy waits under the panel until the flying one lands,
      // so the two are never on screen together.
      target.style.visibility = 'hidden';
      // A photo flies back exactly as it flew in, same time and curve. A
      // quote's text is the panel's own content, so it shrinks on the panel's
      // curve rather than trailing behind it.
      const isImg = source.tagName === 'IMG';
      morph(source, boxOf(source), boxOf(target),
            getComputedStyle(target).borderRadius,
            isImg ? ANIM_MS : CLOSE_MS, isImg ? EASE : CLOSE_EASE,
            () => {
              target.style.visibility = '';
              if (!--flying) settle();
            });
    });

    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.borderRadius = cs.borderRadius;

    document.removeEventListener('keydown', onKeydown);

    setTimeout(() => {
      overlay.remove();
      backdrop.remove();
      life.abort();
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      setPageInert(false);
      if (!landing) settle();
      // Only an element the reader actually focused gets it back; a click on
      // the card itself leaves focus on the page.
      if (opener && opener !== document.body && opener.isConnected) {
        opener.focus({ preventScroll: true });
      }
      state = null;
    }, CLOSE_MS + 30);
  }

  document.querySelectorAll('.bento-card[data-card]').forEach((card) => {
    const template = document.getElementById(`tpl-${card.dataset.card}`);
    if (!template) return;
    card.addEventListener('click', () => open(card));

    // The pictures of a panel sized to its content start downloading as the
    // pointer (or focus) reaches the card, so the first open usually finds
    // them ready.
    if (!card.hasAttribute('data-expand-fit')) return;
    const preload = () => {
      template.content.querySelectorAll('img[src]').forEach((img) => {
        new Image().src = img.getAttribute('src');
      });
    };
    card.addEventListener('pointerenter', preload, { once: true });
    card.addEventListener('focusin', preload, { once: true });
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
}
