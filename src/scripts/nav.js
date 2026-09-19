const MOBILE_BREAKPOINT = 860;

/* Desktop — 4 columns x 252px rows. Matched cards come first (top rows),
   everything else is pushed down and dimmed. */
const LAYOUTS = {
  all: {
    about:       { col: '1 / 3', row: '1' },
    gmail:       { col: '3',     row: '1' },
    linkedin:    { col: '4',     row: '1' },
    path:        { col: '1',     row: '2 / 4' },
    cpq:         { col: '2 / 4', row: '2 / 4' },
    nng:         { col: '4',     row: '2' },
    resume:      { col: '4',     row: '3' },
    hobbies:     { col: '1',     row: '4' },
    pictures:    { col: '2',     row: '4' },
    aiquote:     { col: '3 / 5', row: '4' },
    expertise:   { col: '1 / 3', row: '5' },
    diploma:     { col: '3',     row: '5' },
    english:     { col: '4',     row: '5' },
    careerquote: { col: '1 / 3', row: '6' },
    leadquote:   { col: '3 / 5', row: '6' },
    references:  { col: '1',     row: '7' },
  },
  about: {
    about:       { col: '1 / 3', row: '1' },
    gmail:       { col: '3',     row: '1' },
    linkedin:    { col: '4',     row: '1' },
    path:        { col: '1',     row: '2 / 4' },
    nng:         { col: '2',     row: '2' },
    resume:      { col: '3',     row: '2' },
    diploma:     { col: '4',     row: '2' },
    english:     { col: '2',     row: '3' },
    references:  { col: '3',     row: '3' },
    aiquote:     { col: '1 / 3', row: '4' },
    expertise:   { col: '3 / 5', row: '4' },
    careerquote: { col: '1 / 3', row: '5' },
    leadquote:   { col: '3 / 5', row: '5' },
    cpq:         { col: '1 / 3', row: '6 / 8', dim: true },
    hobbies:     { col: '3',     row: '6', dim: true },
    pictures:    { col: '4',     row: '6', dim: true },
  },
  work: {
    cpq:         { col: '1 / 3', row: '1 / 3' },
    about:       { col: '3 / 5', row: '1', dim: true },
    gmail:       { col: '3',     row: '2', dim: true },
    linkedin:    { col: '4',     row: '2', dim: true },
    path:        { col: '1',     row: '3 / 5', dim: true },
    hobbies:     { col: '2',     row: '3', dim: true },
    pictures:    { col: '3',     row: '3', dim: true },
    nng:         { col: '4',     row: '3', dim: true },
    resume:      { col: '2',     row: '4', dim: true },
    diploma:     { col: '3',     row: '4', dim: true },
    english:     { col: '4',     row: '4', dim: true },
    aiquote:     { col: '1 / 3', row: '5', dim: true },
    expertise:   { col: '3 / 5', row: '5', dim: true },
    careerquote: { col: '1 / 3', row: '6', dim: true },
    leadquote:   { col: '3 / 5', row: '6', dim: true },
    references:  { col: '1',     row: '7', dim: true },
  },
  personal: {
    hobbies:     { col: '1',     row: '1' },
    pictures:    { col: '2',     row: '1' },
    diploma:     { col: '3',     row: '1', dim: true },
    english:     { col: '4',     row: '1', dim: true },
    about:       { col: '1 / 3', row: '2', dim: true },
    gmail:       { col: '3',     row: '2', dim: true },
    linkedin:    { col: '4',     row: '2', dim: true },
    path:        { col: '1',     row: '3 / 5', dim: true },
    cpq:         { col: '2 / 4', row: '3 / 5', dim: true },
    nng:         { col: '4',     row: '3', dim: true },
    resume:      { col: '4',     row: '4', dim: true },
    aiquote:     { col: '1 / 3', row: '5', dim: true },
    careerquote: { col: '3 / 5', row: '5', dim: true },
    expertise:   { col: '1 / 3', row: '6', dim: true },
    leadquote:   { col: '3 / 5', row: '6', dim: true },
    references:  { col: '1',     row: '7', dim: true },
  },
};

/* Mobile — 2 columns, auto row height; the path card spans two rows beside the square cards. */
const MOBILE_LAYOUTS = {
  all: {
    about:       { col: '1 / 3', row: '1' },
    gmail:       { col: '1',     row: '2' },
    linkedin:    { col: '2',     row: '2' },
    path:        { col: '1',     row: '3 / 5' },
    nng:         { col: '2',     row: '3' },
    resume:      { col: '2',     row: '4' },
    cpq:         { col: '1 / 3', row: '5' },
    hobbies:     { col: '1',     row: '6' },
    pictures:    { col: '2',     row: '6' },
    aiquote:     { col: '1 / 3', row: '7' },
    expertise:   { col: '1 / 3', row: '8' },
    diploma:     { col: '1',     row: '9' },
    english:     { col: '2',     row: '9' },
    references:  { col: '1',     row: '10' },
    careerquote: { col: '1 / 3', row: '11' },
    leadquote:   { col: '1 / 3', row: '12' },
  },
  about: {
    about:       { col: '1 / 3', row: '1' },
    gmail:       { col: '1',     row: '2' },
    linkedin:    { col: '2',     row: '2' },
    path:        { col: '1',     row: '3 / 5' },
    nng:         { col: '2',     row: '3' },
    resume:      { col: '2',     row: '4' },
    diploma:     { col: '1',     row: '5' },
    english:     { col: '2',     row: '5' },
    references:  { col: '1',     row: '6' },
    aiquote:     { col: '1 / 3', row: '7' },
    expertise:   { col: '1 / 3', row: '8' },
    careerquote: { col: '1 / 3', row: '9' },
    leadquote:   { col: '1 / 3', row: '10' },
    cpq:         { col: '1 / 3', row: '11', dim: true },
    hobbies:     { col: '1',     row: '12', dim: true },
    pictures:    { col: '2',     row: '12', dim: true },
  },
  work: {
    cpq:         { col: '1 / 3', row: '1' },
    about:       { col: '1 / 3', row: '2', dim: true },
    gmail:       { col: '1',     row: '3', dim: true },
    linkedin:    { col: '2',     row: '3', dim: true },
    path:        { col: '1',     row: '4 / 6', dim: true },
    nng:         { col: '2',     row: '4', dim: true },
    resume:      { col: '2',     row: '5', dim: true },
    diploma:     { col: '1',     row: '6', dim: true },
    english:     { col: '2',     row: '6', dim: true },
    hobbies:     { col: '1',     row: '7', dim: true },
    pictures:    { col: '2',     row: '7', dim: true },
    references:  { col: '1',     row: '8', dim: true },
    aiquote:     { col: '1 / 3', row: '9', dim: true },
    expertise:   { col: '1 / 3', row: '10', dim: true },
    careerquote: { col: '1 / 3', row: '11', dim: true },
    leadquote:   { col: '1 / 3', row: '12', dim: true },
  },
  personal: {
    hobbies:     { col: '1',     row: '1' },
    pictures:    { col: '2',     row: '1' },
    about:       { col: '1 / 3', row: '2', dim: true },
    gmail:       { col: '1',     row: '3', dim: true },
    linkedin:    { col: '2',     row: '3', dim: true },
    path:        { col: '1',     row: '4 / 6', dim: true },
    nng:         { col: '2',     row: '4', dim: true },
    resume:      { col: '2',     row: '5', dim: true },
    diploma:     { col: '1',     row: '6', dim: true },
    english:     { col: '2',     row: '6', dim: true },
    references:  { col: '1',     row: '7', dim: true },
    cpq:         { col: '1 / 3', row: '8', dim: true },
    aiquote:     { col: '1 / 3', row: '9', dim: true },
    expertise:   { col: '1 / 3', row: '10', dim: true },
    careerquote: { col: '1 / 3', row: '11', dim: true },
    leadquote:   { col: '1 / 3', row: '12', dim: true },
  },
};

const FLIP_MS = 650;

export function initNav() {
  const pills = document.getElementById('navPills');
  const indicator = document.getElementById('navIndicator');
  const cards = [...document.querySelectorAll('.bento-card[data-card]')];
  if (!pills || !indicator) return;

  let currentFilter = 'all';

  function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
  }

  function placeIndicator(pill) {
    const pillsRect = pills.getBoundingClientRect();
    const rect = pill.getBoundingClientRect();
    indicator.style.left = `${rect.left - pillsRect.left}px`;
    indicator.style.width = `${rect.width}px`;
  }

  function applyLayout(filter, { animate }) {
    const map = isMobile() ? MOBILE_LAYOUTS : LAYOUTS;
    const layout = map[filter] || map.all;

    const prevRects = animate ? new Map(cards.map((c) => [c, c.getBoundingClientRect()])) : null;

    cards.forEach((card) => {
      const pos = layout[card.dataset.card];
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

  pills.querySelectorAll('.nav-pill').forEach((pill) => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      if (pill.dataset.filter === currentFilter) return;
      pills.querySelector('.nav-pill.active')?.classList.remove('active');
      pill.classList.add('active');
      placeIndicator(pill);
      currentFilter = pill.dataset.filter;
      applyLayout(currentFilter, { animate: true });
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
