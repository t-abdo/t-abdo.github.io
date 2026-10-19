import { t } from './i18n.js';
import { setCursorTooltip } from './cursor.js';

/*
  The rail beside a case study: the TL;DR switch on top, where the case has
  long-form copy to fold away, and below it a vertical list of the sections.
  Picking one scrolls to it; reading moves the highlight along on its own.
  Built from the article's own section titles, so a case gets it by having
  them and nothing has to be kept in step by hand.
*/

const SCROLL_GAP = 32; // room left above a title the list scrolls to

/* The switch leaves the reader where they were. Whatever sits at the top of
   the view stays at the same height through the change. When that is copy
   about to be folded away, there is nothing left to hold on to, so the
   section it belongs to is brought up instead. */
function keepPlace(scroller, article, change) {
  const top = scroller.getBoundingClientRect().top;
  const atTop = [...article.querySelectorAll('.cs-section > *, .cs > :not(.cs-section)')]
    .filter((el) => el.getClientRects().length)
    .find((el) => el.getBoundingClientRect().bottom > top + 1);
  if (!atTop) return change();

  const folded = atTop.closest('.cs-full');
  const anchor = folded
    ? atTop.closest('.cs-section')?.querySelector('.cs-section-title') || atTop
    : atTop;
  const before = folded ? SCROLL_GAP : anchor.getBoundingClientRect().top - top;
  change();
  scroller.scrollTop += anchor.getBoundingClientRect().top - top - before;
}

function buildToggle(article, scroller) {
  const toggle = document.createElement('button');
  toggle.className = 'tldr-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-pressed', 'false');
  const label = document.createElement('span');
  label.className = 'tldr-toggle__label';
  label.textContent = t('ui.tldrFull');
  toggle.dataset.tooltip = t('ui.tldrToQuick');
  toggle.append(label);

  toggle.addEventListener('click', () => {
    keepPlace(scroller, article, () => {
      const on = article.classList.toggle('cs--tldr');
      toggle.setAttribute('aria-pressed', String(on));
      label.textContent = t(on ? 'ui.tldrQuick' : 'ui.tldrFull');
      // The tooltip names what the next click does, and the one under the
      // pointer changes with it.
      toggle.dataset.tooltip = t(on ? 'ui.tldrToFull' : 'ui.tldrToQuick');
      setCursorTooltip(toggle.dataset.tooltip);
    });
  });
  return toggle;
}

/* Scrolling to a section is animated here rather than left to the browser, so
   its length is known and the pill can make the same trip in the same time. */
const EASE = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const EASE_CSS = 'cubic-bezier(0.65, 0, 0.35, 1)'; // the same curve, for the pill
function travelTime(distance) {
  return Math.round(Math.min(1400, Math.max(450, 250 + Math.abs(distance) * 0.25)));
}

function buildList(titles, scroller) {
  const list = document.createElement('div');
  list.className = 'cs-nav-list';
  const indicator = document.createElement('span');
  indicator.className = 'cs-nav-indicator';
  indicator.setAttribute('aria-hidden', 'true');
  list.append(indicator);

  const items = titles.map((title) => {
    const item = document.createElement('button');
    item.className = 'cs-nav-item';
    item.type = 'button';
    item.textContent = title.dataset.navLabel || title.textContent;
    list.append(item);
    return item;
  });

  /* Where the page has to be for each section to be the one being read: its
     title SCROLL_GAP below the top. The last few can sit too low to ever get
     there, so they share out whatever scroll is left. */
  function stops() {
    const box = scroller.getBoundingClientRect();
    const max = scroller.scrollHeight - scroller.clientHeight;
    // The opening has no title of its own: its stop is the very top.
    const ys = titles.map((title) => (title.dataset.navLabel ? 0
      : scroller.scrollTop + title.getBoundingClientRect().top - box.top - SCROLL_GAP));
    const late = ys.findIndex((y) => y > max);
    if (late !== -1) {
      const from = late > 0 ? ys[late - 1] : 0;
      const n = ys.length - late;
      for (let i = late; i < ys.length; i++) ys[i] = from + (max - from) * ((i - late + 1) / n);
    }
    return ys.map((y) => Math.max(0, y));
  }

  let current = -1;
  function setCurrent(index) {
    if (index === current) return;
    current = index;
    items.forEach((item, i) => {
      if (i === index) item.setAttribute('aria-current', 'true');
      else item.removeAttribute('aria-current');
    });
  }

  function place(top, height) {
    indicator.style.top = `${top}px`;
    indicator.style.height = `${height}px`;
  }

  /* The hairlines either side of an item give way only once the pill is
     actually on it, not when the item is picked. */
  function settle(index) {
    items.forEach((item, i) => item.classList.toggle('cs-nav-item--under-pill', i === index));
  }

  /* A picked label turns bold, and bold is wider: left alone, a title that
     just fits on a line would break when picked and the list would jump. So
     every label is broken where its bold version breaks, once, and keeps
     those breaks either way. */
  let lockedWidth = 0;
  function lockBreaks() {
    const width = list.clientWidth;
    if (!width || width === lockedWidth) return;
    lockedWidth = width;
    const bold = getComputedStyle(list).getPropertyValue('--weight-bold').trim() || '700';
    items.forEach((item) => {
      const words = (item.dataset.label ||= item.textContent).split(' ');
      item.textContent = '';
      const spans = words.map((word, i) => {
        const span = document.createElement('span');
        span.textContent = word;
        item.append(span, i < words.length - 1 ? ' ' : '');
        return span;
      });
      item.style.fontWeight = bold;
      const lines = [];
      spans.forEach((span, i) => {
        if (i === 0 || span.offsetTop > spans[i - 1].offsetTop) lines.push([]);
        lines[lines.length - 1].push(words[i]);
      });
      item.style.fontWeight = '';
      item.textContent = lines.map((line) => line.join(' ')).join('\n');
    });
  }

  /* While reading, the pill stays on its section and only changes when the
     next one is reached: its title arrives at the top. It doesn't slide
     there: the pill and the label's new colour appear in place together, on
     one fade, so neither can trail the other. */
  const STEP_MS = 220;
  const APPEAR = { duration: STEP_MS, easing: 'ease-out' };
  let traveling = false;
  function follow(force = false) {
    if (traveling) return;
    const ys = stops();
    const y = scroller.scrollTop;
    let i = 0;
    while (i < ys.length - 1 && y >= ys[i + 1] - 2) i++;
    if (i === current && !force) return;
    const changed = current !== -1 && i !== current;
    indicator.style.transition = 'none';
    place(items[i].offsetTop, items[i].offsetHeight);
    setCurrent(i);
    settle(i);
    if (changed && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      indicator.animate([{ opacity: 0, transform: 'scale(0.96)' }, { opacity: 1, transform: 'none' }], APPEAR);
      items[i].animate([{ opacity: 0.3 }, { opacity: 1 }], APPEAR);
    }
  }

  /* A click makes one trip: the page eases to the section and the pill goes
     straight to its item over the same time, along the same curve. Reaching
     for the page mid-trip hands control back. */
  let frame = 0;
  function travel(index) {
    const target = stops()[index];
    const start = scroller.scrollTop;
    const distance = target - start;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cancelAnimationFrame(frame);
    if (reduced || Math.abs(distance) < 2) {
      scroller.scrollTop = target;
      return;
    }
    const duration = travelTime(distance);
    traveling = true;
    setCurrent(index);
    settle(-1);
    indicator.style.transition = `top ${duration}ms ${EASE_CSS}, height ${duration}ms ${EASE_CSS}`;
    place(items[index].offsetTop, items[index].offsetHeight);

    const stop = () => {
      cancelAnimationFrame(frame);
      traveling = false;
      settle(current);
      follow();
    };
    scroller.addEventListener('wheel', stop, { passive: true, once: true });
    scroller.addEventListener('touchstart', stop, { passive: true, once: true });

    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      scroller.scrollTop = start + distance * EASE(t);
      if (t < 1) frame = requestAnimationFrame(step);
      else stop();
    };
    frame = requestAnimationFrame(step);
  }

  items.forEach((item, i) => item.addEventListener('click', () => travel(i)));

  let queued = false;
  scroller.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      follow();
    });
  }, { passive: true });

  // Item heights settle once fonts land and the panel reaches full size.
  const relayout = () => {
    lockBreaks();
    follow(true);
  };
  if (typeof ResizeObserver === 'function') new ResizeObserver(relayout).observe(list);
  document.fonts?.ready.then(() => { lockedWidth = 0; relayout(); });
  requestAnimationFrame(() => { lockBreaks(); follow(); });
  return list;
}

export function bindCaseNav(content, scroller) {
  const article = content.querySelector('.cs');
  if (!article) return;
  const titles = [...article.querySelectorAll('.cs-section-title')];
  const foldable = article.querySelector('.cs-full');
  if (titles.length < 2 && !foldable) return;

  const rail = document.createElement('nav');
  rail.className = 'cs-nav';
  rail.setAttribute('aria-label', t('ui.caseNavLabel'));
  if (foldable) rail.append(buildToggle(article, scroller));
  // The case's opening (title, lede, cover) is the first stop, though it has
  // no section title.
  const head = article.querySelector('.cs-head');
  if (head && titles.length) {
    head.dataset.navLabel = t('ui.caseNavIntro');
    titles.unshift(head);
  }
  if (titles.length >= 2) rail.append(buildList(titles, scroller));

  content.classList.add('expand-content--with-nav');
  content.prepend(rail);
}
