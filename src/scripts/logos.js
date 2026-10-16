/*
  Inlined logos: the company marks on the Professional Path card and the client
  marks on the project covers.

  They are injected rather than used as <img> so the individual shapes can be
  animated — hovering a card replays a left-to-right reveal across every mark it
  holds. Each company ships in two files because the marks keep their brand
  colours (the AgileEngine gradient, IBM blue, Rivian yellow) and only the
  lettering flips between themes; a slot can pin one variant with
  `data-logo-variant` when it sits on a cover whose brightness never changes.
*/

const FILES = {
  ae: { light: 'assets/path/ae.svg', dark: 'assets/path/ae-dark.svg' },
  rivian: { light: 'assets/path/rivian.svg', dark: 'assets/path/rivian-dark.svg' },
  ibm: { light: 'assets/path/ibm.svg', dark: 'assets/path/ibm-dark.svg' },
  mmi: { light: 'assets/projects/mmi/logo.svg', dark: 'assets/projects/mmi/logo.svg' },
  mesh: { light: 'assets/projects/mesh/logo.svg', dark: 'assets/projects/mesh/logo.svg' },
  nng: { light: 'assets/nng/logo.svg', dark: 'assets/nng/logo.svg' },
  unicamp: { light: 'assets/bachelor/logo.svg', dark: 'assets/bachelor/logo.svg' },
};

const cache = new Map();

function themeNow() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

async function load(url) {
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then((r) => (r.ok ? r.text() : Promise.reject(new Error(r.status)))));
  }
  return cache.get(url);
}

/* Each shape is drawn like the LinkedIn mark: its own outline is traced at a
   constant speed, then the fill arrives behind it. The shapes start from the
   left so the whole mark reads as one hand drawing it. */
/* The two certificate marks carry far more shapes than a wordmark does, so
   they are traced a little quicker to keep the whole badge from dragging. */
const QUICK = new Set(['nng', 'unicamp']);

function stagger(svg, quicker = 0) {
  let maxDelay = 0;
  let maxDraw = 0;
  const shapes = [...svg.querySelectorAll('path, rect, circle, ellipse, polygon')]
    .filter((el) => el.getAttribute('fill') !== 'none')
    // Shapes inside a clipPath, mask or defs are geometry, not artwork: the
    // reveal's transform would move the clip itself and cut the mark away.
    .filter((el) => !el.closest('defs, clipPath, mask, pattern, marker'));
  if (!shapes.length) return { delay: 0, draw: 0 };

  const withX = shapes.map((el) => {
    let x = 0;
    try { x = el.getBBox().x; } catch (e) { x = 0; }
    return { el, x };
  });
  const xs = withX.map((s) => s.x);
  const min = Math.min(...xs);
  const span = Math.max(...xs) - min || 1;

  // The stroke traces the shape, so it has to match whatever the shape is
  // painted with, gradients included.
  const vb = (svg.getAttribute('viewBox') || '0 0 100 100').split(/\s+/);
  const width = parseFloat(vb[2]) || 100;

  withX.forEach(({ el, x }) => {
    el.classList.add('logo-shape');
    const delay = (x - min) / span * 0.34;
    maxDelay = Math.max(maxDelay, delay);
    el.style.setProperty('--d', `${delay.toFixed(3)}s`);

    let len = 0;
    try { len = el.getTotalLength(); } catch (e) { len = 0; }
    if (!len) return;
    el.style.setProperty('--len', `${Math.ceil(len)}`);
    // Longer outlines would otherwise finish last; keeping the speed constant
    // is what makes it read as drawing rather than fading.
    const draw = Math.min(0.9 - quicker, Math.max(0.2 - quicker * 0.4, len / 900 - 0.2 - quicker));
    maxDraw = Math.max(maxDraw, draw);
    el.style.setProperty('--draw', `${draw.toFixed(2)}s`);
    el.setAttribute('stroke', el.getAttribute('fill') || 'currentColor');
    el.style.strokeWidth = `${Math.max(0.8, width / 420).toFixed(2)}`;
  });

  return { delay: maxDelay, draw: maxDraw };
}

async function fill(slot, theme) {
  const files = FILES[slot.dataset.logo];
  if (!files) return;
  const variant = slot.dataset.logoVariant || theme;
  try {
    slot.innerHTML = await load(files[variant] || files.light);
    const svg = slot.querySelector('svg');
    if (!svg) return;
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    svg.setAttribute('aria-hidden', 'true');
    const span = stagger(svg, QUICK.has(slot.dataset.logo) ? 0.2 : 0);

    // On the Professional Path card the years under the mark come in with it.
    const years = slot.parentElement && slot.parentElement.querySelector('.path-stop__years');
    if (years && span) {
      years.style.setProperty('--d', `${span.delay.toFixed(3)}s`);
      years.style.setProperty('--draw', `${(span.draw || 0.6).toFixed(2)}s`);
      years.classList.add('path-years-fade');
    }
  } catch (e) {
    // A logo that can't be fetched leaves its slot empty; the name next to it
    // is already in the markup for screen readers.
    console.error('logo failed to load', slot.dataset.logo, e);
  }
}

/* Case study heads are cloned out of a <template> when a modal opens, so their
   slots don't exist at start-up: the modal fills its own. */
export function paintLogos(root) {
  const theme = themeNow();
  root.querySelectorAll('[data-logo]').forEach((slot) => fill(slot, theme));
}


/* Outline artwork that is already in the markup (the resume page, the two
   reference bubbles): the same reveal, except these are strokes to begin with,
   so only the dash has to run. The arrow and the typing dots are left alone and
   simply wait for the trace to finish. */
const TRACE = 0.45;
const TRACE_STAGGER = 0.25;

function traceOutlines(root) {
  root.querySelectorAll('[data-draw]').forEach((svg) => {
    const lines = [...svg.querySelectorAll('.draw-line')];
    if (!lines.length) return;

    const xs = lines.map((el) => {
      try { return el.getBBox().x; } catch (e) { return 0; }
    });
    const min = Math.min(...xs);
    const span = Math.max(...xs) - min || 1;

    lines.forEach((el, i) => {
      let len = 0;
      try { len = el.getTotalLength(); } catch (e) { len = 0; }
      if (!len) return;
      el.style.setProperty('--len', `${Math.ceil(len)}`);
      el.style.setProperty('--d', `${((xs[i] - min) / span * TRACE_STAGGER).toFixed(3)}s`);
      el.style.setProperty('--draw', `${TRACE}s`);
      el.classList.add('draw-line--on');
    });
  });
}

export function initLogos() {
  traceOutlines(document);

  const slots = [...document.querySelectorAll('[data-logo]')];
  if (!slots.length) return;

  // Re-queried on every pass so a mark inside an open modal follows the theme too.
  const draw = () => paintLogos(document);
  draw();

  // Marks that follow the theme are redrawn when the attribute changes.
  new MutationObserver(draw).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  // Every card holding a mark draws it again when the pointer arrives. Restarting
  // through the Web Animations API rather than by swapping classes: the shapes
  // carry two animations each, and cancel + play replays both from zero,
  // delays included.
  const cards = new Set([
    ...slots.map((s) => s.closest('.bento-card')),
    ...[...document.querySelectorAll('[data-draw]')].map((s) => s.closest('.bento-card')),
  ].filter(Boolean));
  cards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      card.querySelectorAll('.logo-shape, .path-years-fade, .draw-line--on').forEach((shape) => {
        shape.getAnimations().forEach((anim) => {
          anim.cancel();
          anim.play();
        });
      });
    });
  });
}
