import { gridLayout, isMobileLayout } from './breakpoints.js';

/* Desktop — 4 columns x 252px rows. Matched cards come first (top rows),
   everything else is pushed down and dimmed. */
const LAYOUTS = {
  all: {
    about:       { col: '1 / 3',  row: '1' },
    stack:       { col: '3',      row: '1' },
    nng:         { col: '4',      row: '1' },
    path:        { col: '1',      row: '2 / 4' },
    mmi:         { col: '2 / 4',  row: '2 / 4' },
    bachelor:    { col: '4',      row: '2' },
    docs:        { col: '4',      row: '3' },
    cpq:         { col: '1 / 3',  row: '4 / 6' },
    careerquote: { col: '3 / 5',  row: '4' },
    mesh:        { col: '3 / 5',  row: '5 / 7' },
    aiquote:     { col: '1 / 3',  row: '6' },
    edu:         { col: '1 / 3',  row: '7 / 9' },
    hobbies:     { col: '3 / 5',  row: '7' },
    leadquote:   { col: '3 / 5',  row: '8' },
    econfig:     { col: '1 / 3',  row: '9 / 11' },
    hub:         { col: '3 / 5',  row: '9 / 11' },
    pictures:    { col: '1 / 5',  row: '11' },
  },
  about: {
    /* The cards keep the places they hold under All; the quotes move up into
       the space the projects leave. */
    about:       { col: '1 / 3',  row: '1' },
    stack:       { col: '3',      row: '1' },
    nng:         { col: '4',      row: '1' },
    path:        { col: '1',      row: '2 / 4' },
    aiquote:     { col: '2 / 4',  row: '2' },
    careerquote: { col: '2 / 4',  row: '3' },
    bachelor:    { col: '4',      row: '2' },
    docs:        { col: '4',      row: '3' },
    leadquote:   { col: '1 / 3',  row: '4' },
    hobbies:     { col: '3 / 5',  row: '4', dim: true },
    mmi:         { col: '1 / 3',  row: '5 / 7', dim: true },
    cpq:         { col: '3 / 5',  row: '5 / 7', dim: true },
    mesh:        { col: '1 / 3',  row: '7 / 9', dim: true },
    edu:         { col: '3 / 5',  row: '7 / 9', dim: true },
    hub:         { col: '1 / 3',  row: '9 / 11', dim: true },
    econfig:     { col: '3 / 5',  row: '9 / 11', dim: true },
    pictures:    { col: '1 / 5',  row: '11', dim: true },
  },
  work: {
    mmi:         { col: '1 / 3',  row: '1 / 3' },
    cpq:         { col: '3 / 5',  row: '1 / 3' },
    mesh:        { col: '1 / 3',  row: '3 / 5' },
    edu:         { col: '3 / 5',  row: '3 / 5' },
    hub:         { col: '1 / 3',  row: '5 / 7' },
    econfig:     { col: '3 / 5',  row: '5 / 7' },
    // Below the projects, the rest in the order the About filter uses.
    about:       { col: '1 / 3',  row: '7', dim: true },
    stack:       { col: '3',      row: '7', dim: true },
    nng:         { col: '4',      row: '7', dim: true },
    path:        { col: '1',      row: '8 / 10', dim: true },
    aiquote:     { col: '2 / 4',  row: '8', dim: true },
    careerquote: { col: '2 / 4',  row: '9', dim: true },
    bachelor:    { col: '4',      row: '8', dim: true },
    docs:        { col: '4',      row: '9', dim: true },
    leadquote:   { col: '1 / 3',  row: '10', dim: true },
    hobbies:     { col: '3 / 5',  row: '10', dim: true },
    pictures:    { col: '1 / 5',  row: '11', dim: true },
  },
  personal: {
    /* Some of My Days runs the full width on top, Favorite Things keeps its
       two cells under it, and the rest packs in without gaps. */
    pictures:    { col: '1 / 5',  row: '1' },
    hobbies:     { col: '1 / 3',  row: '2' },
    about:       { col: '3 / 5',  row: '2', dim: true },
    stack:       { col: '1',      row: '3', dim: true },
    nng:         { col: '2',      row: '3', dim: true },
    leadquote:   { col: '3 / 5',  row: '3', dim: true },
    path:        { col: '1',      row: '4 / 6', dim: true },
    aiquote:     { col: '2 / 4',  row: '4', dim: true },
    bachelor:    { col: '4',      row: '4', dim: true },
    careerquote: { col: '2 / 4',  row: '5', dim: true },
    docs:        { col: '4',      row: '5', dim: true },
    mmi:         { col: '1 / 3',  row: '6 / 8', dim: true },
    cpq:         { col: '3 / 5',  row: '6 / 8', dim: true },
    mesh:        { col: '1 / 3',  row: '8 / 10', dim: true },
    edu:         { col: '3 / 5',  row: '8 / 10', dim: true },
    hub:         { col: '1 / 3',  row: '10 / 12', dim: true },
    econfig:     { col: '3 / 5',  row: '10 / 12', dim: true },
  },
};

/* Tablet — 4 square columns (a row is as tall as a column is wide). Case
   studies are 4 by 4, the intro and the contact block 4 by 2, the certificates
   2 by 2 beside the tall Professional Path card. */
const TABLET_LAYOUTS = {
  all: {
    about:       { col: '1 / 5',  row: '1 / 3' },
    stack:       { col: '1 / 5',  row: '3 / 5' },
    path:        { col: '1 / 3',  row: '5 / 9' },
    nng:         { col: '3 / 5',  row: '5 / 7' },
    bachelor:    { col: '3 / 5',  row: '7 / 9' },
    docs:        { col: '1 / 5',  row: '9' },
    mmi:         { col: '1 / 5',  row: '10 / 14' },
    cpq:         { col: '1 / 5',  row: '14 / 18' },
    careerquote: { col: '1 / 5',  row: '18 / 20' },
    mesh:        { col: '1 / 5',  row: '20 / 24' },
    aiquote:     { col: '1 / 5',  row: '24 / 26' },
    edu:         { col: '1 / 5',  row: '26 / 30' },
    hobbies:     { col: '1 / 5',  row: '30 / 32' },
    leadquote:   { col: '1 / 5',  row: '32 / 34' },
    econfig:     { col: '1 / 5',  row: '34 / 38' },
    hub:         { col: '1 / 5',  row: '38 / 42' },
    pictures:    { col: '1 / 5',  row: '42 / 44' },
  },
  about: {
    about:       { col: '1 / 5',  row: '1 / 3' },
    stack:       { col: '1 / 5',  row: '3 / 5' },
    path:        { col: '1 / 3',  row: '5 / 9' },
    nng:         { col: '3 / 5',  row: '5 / 7' },
    bachelor:    { col: '3 / 5',  row: '7 / 9' },
    docs:        { col: '1 / 5',  row: '9' },
    aiquote:     { col: '1 / 5',  row: '10 / 12' },
    careerquote: { col: '1 / 5',  row: '12 / 14' },
    leadquote:   { col: '1 / 5',  row: '14 / 16' },
    hobbies:     { col: '1 / 5',  row: '16 / 18', dim: true },
    mmi:         { col: '1 / 5',  row: '18 / 22', dim: true },
    cpq:         { col: '1 / 5',  row: '22 / 26', dim: true },
    mesh:        { col: '1 / 5',  row: '26 / 30', dim: true },
    edu:         { col: '1 / 5',  row: '30 / 34', dim: true },
    hub:         { col: '1 / 5',  row: '34 / 38', dim: true },
    econfig:     { col: '1 / 5',  row: '38 / 42', dim: true },
    pictures:    { col: '1 / 5',  row: '42 / 44', dim: true },
  },
  work: {
    mmi:         { col: '1 / 5',  row: '1 / 5' },
    cpq:         { col: '1 / 5',  row: '5 / 9' },
    mesh:        { col: '1 / 5',  row: '9 / 13' },
    edu:         { col: '1 / 5',  row: '13 / 17' },
    hub:         { col: '1 / 5',  row: '17 / 21' },
    econfig:     { col: '1 / 5',  row: '21 / 25' },
    about:       { col: '1 / 5',  row: '25 / 27', dim: true },
    stack:       { col: '1 / 5',  row: '27 / 29', dim: true },
    path:        { col: '1 / 3',  row: '29 / 33', dim: true },
    nng:         { col: '3 / 5',  row: '29 / 31', dim: true },
    bachelor:    { col: '3 / 5',  row: '31 / 33', dim: true },
    docs:        { col: '1 / 5',  row: '33', dim: true },
    aiquote:     { col: '1 / 5',  row: '34 / 36', dim: true },
    careerquote: { col: '1 / 5',  row: '36 / 38', dim: true },
    leadquote:   { col: '1 / 5',  row: '38 / 40', dim: true },
    hobbies:     { col: '1 / 5',  row: '40 / 42', dim: true },
    pictures:    { col: '1 / 5',  row: '42 / 44', dim: true },
  },
  personal: {
    hobbies:     { col: '1 / 5',  row: '1 / 3' },
    pictures:    { col: '1 / 5',  row: '3 / 5' },
    path:        { col: '1 / 3',  row: '5 / 9', dim: true },
    bachelor:    { col: '3 / 5',  row: '5 / 7', dim: true },
    nng:         { col: '3 / 5',  row: '7 / 9', dim: true },
    docs:        { col: '1 / 5',  row: '9', dim: true },
    about:       { col: '1 / 5',  row: '10 / 12', dim: true },
    stack:       { col: '1 / 5',  row: '12 / 14', dim: true },
    mmi:         { col: '1 / 5',  row: '14 / 18', dim: true },
    cpq:         { col: '1 / 5',  row: '18 / 22', dim: true },
    mesh:        { col: '1 / 5',  row: '22 / 26', dim: true },
    edu:         { col: '1 / 5',  row: '26 / 30', dim: true },
    hub:         { col: '1 / 5',  row: '30 / 34', dim: true },
    econfig:     { col: '1 / 5',  row: '34 / 38', dim: true },
    aiquote:     { col: '1 / 5',  row: '38 / 40', dim: true },
    careerquote: { col: '1 / 5',  row: '40 / 42', dim: true },
    leadquote:   { col: '1 / 5',  row: '42 / 44', dim: true },
  },
};

/* Phone — 2 columns, auto row height; the path card spans two rows beside the square cards. */
const PHONE_LAYOUTS = {
  all: {
    about:       { col: '1 / 3',  row: '1' },
    stack:       { col: '1 / 3',  row: '2' },
    path:        { col: '1',      row: '3 / 5' },
    nng:         { col: '2',      row: '3' },
    bachelor:    { col: '2',      row: '4' },
    docs:        { col: '1 / 3',  row: '5' },
    mmi:         { col: '1 / 3',  row: '6' },
    careerquote: { col: '1 / 3',  row: '7' },
    aiquote:     { col: '1 / 3',  row: '8' },
    cpq:         { col: '1 / 3',  row: '9' },
    mesh:        { col: '1 / 3',  row: '10' },
    edu:         { col: '1 / 3',  row: '11' },
    hub:         { col: '1 / 3',  row: '12' },
    econfig:     { col: '1 / 3',  row: '13' },
    hobbies:     { col: '1 / 3',  row: '14' },
    leadquote:   { col: '1 / 3',  row: '15' },
    pictures:    { col: '1 / 3',  row: '16' },
  },
  about: {
    about:       { col: '1 / 3',  row: '1' },
    stack:       { col: '1 / 3',  row: '2' },
    path:        { col: '1',      row: '3 / 5' },
    nng:         { col: '2',      row: '3' },
    bachelor:    { col: '2',      row: '4' },
    docs:        { col: '1 / 3',  row: '5' },
    aiquote:     { col: '1 / 3',  row: '6' },
    careerquote: { col: '1 / 3',  row: '7' },
    leadquote:   { col: '1 / 3',  row: '8' },
    mmi:         { col: '1 / 3',  row: '9', dim: true },
    cpq:         { col: '1 / 3',  row: '10', dim: true },
    mesh:        { col: '1 / 3',  row: '11', dim: true },
    edu:         { col: '1 / 3',  row: '12', dim: true },
    hub:         { col: '1 / 3',  row: '13', dim: true },
    econfig:     { col: '1 / 3',  row: '14', dim: true },
    hobbies:     { col: '1 / 3',  row: '15', dim: true },
    pictures:    { col: '1 / 3',  row: '16', dim: true },
  },
  work: {
    mmi:         { col: '1 / 3',  row: '1' },
    cpq:         { col: '1 / 3',  row: '2' },
    mesh:        { col: '1 / 3',  row: '3' },
    edu:         { col: '1 / 3',  row: '4' },
    hub:         { col: '1 / 3',  row: '5' },
    econfig:     { col: '1 / 3',  row: '6' },
    about:       { col: '1 / 3',  row: '7', dim: true },
    stack:       { col: '1 / 3',  row: '8', dim: true },
    path:        { col: '1',      row: '9 / 11', dim: true },
    nng:         { col: '2',      row: '9', dim: true },
    bachelor:    { col: '2',      row: '10', dim: true },
    docs:        { col: '1 / 3',  row: '11', dim: true },
    hobbies:     { col: '1 / 3',  row: '12', dim: true },
    aiquote:     { col: '1 / 3',  row: '13', dim: true },
    careerquote: { col: '1 / 3',  row: '14', dim: true },
    leadquote:   { col: '1 / 3',  row: '15', dim: true },
    pictures:    { col: '1 / 3',  row: '16', dim: true },
  },
  personal: {
    hobbies:     { col: '1 / 3',  row: '1' },
    pictures:    { col: '1 / 3',  row: '2' },
    path:        { col: '1',      row: '3 / 5', dim: true },
    bachelor:    { col: '2',      row: '3', dim: true },
    nng:         { col: '2',      row: '4', dim: true },
    docs:        { col: '1 / 3',  row: '5', dim: true },
    about:       { col: '1 / 3',  row: '6', dim: true },
    stack:       { col: '1 / 3',  row: '7', dim: true },
    mmi:         { col: '1 / 3',  row: '8', dim: true },
    cpq:         { col: '1 / 3',  row: '9', dim: true },
    mesh:        { col: '1 / 3',  row: '10', dim: true },
    edu:         { col: '1 / 3',  row: '11', dim: true },
    hub:         { col: '1 / 3',  row: '12', dim: true },
    econfig:     { col: '1 / 3',  row: '13', dim: true },
    aiquote:     { col: '1 / 3',  row: '14', dim: true },
    careerquote: { col: '1 / 3',  row: '15', dim: true },
    leadquote:   { col: '1 / 3',  row: '16', dim: true },
  },
};

const FLIP_MS = 650;

export function initNav() {
  const pills = document.getElementById('navPills');
  const indicator = document.getElementById('navIndicator');
  // The grid places cards and, for the trio sharing one square, the block that
  // holds them; the cards inside it are laid out by their own grid.
  const cards = [...document.querySelectorAll('.grid > [data-card], .grid > [data-slot]')];
  if (!pills || !indicator) return;

  let currentFilter = 'all';

  function placeIndicator(pill) {
    const pillsRect = pills.getBoundingClientRect();
    const rect = pill.getBoundingClientRect();
    indicator.style.left = `${rect.left - pillsRect.left}px`;
    indicator.style.width = `${rect.width}px`;
  }

  function applyLayout(filter, { animate }) {
    const map = { phone: PHONE_LAYOUTS, tablet: TABLET_LAYOUTS, desktop: LAYOUTS }[gridLayout()];
    const layout = map[filter] || map.all;

    const prevRects = animate ? new Map(cards.map((c) => [c, c.getBoundingClientRect()])) : null;

    cards.forEach((card) => {
      const pos = layout[card.dataset.card || card.dataset.slot];
      if (!pos) return;
      card.style.gridColumn = pos.col;
      card.style.gridRow = pos.row;
      card.classList.toggle('bento-card--dim', !!pos.dim);
    });

    if (!animate) return;

    const movers = [];
    cards.forEach((card) => {
      const prev = prevRects.get(card);
      const next = card.getBoundingClientRect();
      const dx = prev.left - next.left;
      const dy = prev.top - next.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      card.style.transition = 'none';
      card.style.transform = `translate(${dx}px, ${dy}px)`;
      card.style.willChange = 'transform';
      movers.push(card);
    });

    if (!movers.length) return;
    movers[0].getBoundingClientRect();

    requestAnimationFrame(() => {
      movers.forEach((card) => {
        card.style.transition = `transform ${FLIP_MS / 1000}s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.5s ease`;
        card.style.transform = 'none';
        // transitionend can never fire if the transition is interrupted (e.g. the
        // card's transition is overridden mid-flight), so back it with a timeout.
        let done = false;
        const cleanup = () => {
          if (done) return;
          done = true;
          card.style.transition = '';
          card.style.transform = '';
          card.style.willChange = '';
          card.removeEventListener('transitionend', cleanup);
        };
        card.addEventListener('transitionend', cleanup, { once: true });
        setTimeout(cleanup, FLIP_MS + 120);
      });
    });
  }

  /* Filtering reshuffles the grid, so bring the page back to the first card
     instead of leaving the reader stranded halfway down the old order. Only
     ever scrolls up: clicking a filter from the top of the page stays put. */
  function scrollToGrid() {
    const grid = document.getElementById('grid');
    if (!grid) return;
    // Clear of the nav on desktop; on mobile the nav sits at the bottom.
    const gap = isMobileLayout() ? 12 : 96;
    const target = Math.max(0, grid.getBoundingClientRect().top + window.scrollY - gap);
    if (window.scrollY <= target + 1) return;
    // 'auto', like the back-to-top button: the cards are already animating,
    // and a second easing on top of the FLIP reads as lag.
    window.scrollTo({ top: target, behavior: 'auto' });
  }

  pills.querySelectorAll('.nav-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      if (pill.dataset.filter === currentFilter) return;
      const previous = pills.querySelector('.nav-pill.active');
      previous?.classList.remove('active');
      previous?.setAttribute('aria-pressed', 'false');
      pill.classList.add('active');
      pill.setAttribute('aria-pressed', 'true');
      placeIndicator(pill);
      currentFilter = pill.dataset.filter;
      applyLayout(currentFilter, { animate: true });
      scrollToGrid();
    });
  });

  applyLayout(currentFilter, { animate: false });

  const activePill = pills.querySelector('.nav-pill.active');
  requestAnimationFrame(() => placeIndicator(activePill));

  window.addEventListener('resize', () => {
    const active = pills.querySelector('.nav-pill.active');
    placeIndicator(active);
    applyLayout(currentFilter, { animate: false });
  });
}
