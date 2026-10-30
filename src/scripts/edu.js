/*
  Educational Design Artifacts: the card cover and the guide switcher.

  The cover is built here rather than in the HTML because it is decoration —
  two rows of line icons scrolling in opposite directions, behind the title.
*/

/* 24x24 line icons, drawn as stroked paths so they inherit the cover colour. */
const ICONS = [
  'M5 3l14 7-6 2-2 6z',
  'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
  'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  'M11 4a7 7 0 100 14 7 7 0 000-14zM16 16l4 4',
  'M4 20V10M10 20V4M16 20v-7M22 20H2',
  'M4 5h16v11H9l-5 4z',
  'M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6M15 9a1.4 1.4 0 100-2.8 1.4 1.4 0 000 2.8z',
  'M4 20l1-4L16 5l3 3L8 19z',
  'M3 9l6-6 12 12-6 6zM8 8l2 2M11 5l2 2M5 11l2 2',
  'M5 21V4h11l-2 3 2 3H5',
  'M12 3l2.6 5.5 6 .9-4.3 4.3 1 6.1-5.3-2.9L6.7 20l1-6.1L3.4 9.4l6-.9z',
  'M9 19h6M10 22h4M12 2a6 6 0 00-3.5 10.9V16h7v-3.1A6 6 0 0012 2z',
  'M6 2h8l4 4v16H6zM14 2v5h4',
  'M3 6h6l2 3h10v10H3z',
  'M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z',
  'M12 20S3 14.5 3 8.8A4.3 4.3 0 0112 7a4.3 4.3 0 019 1.8C21 14.5 12 20 12 20z',
  'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l3 2',
  'M12 3a4 4 0 100 8 4 4 0 000-8zM4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5',
  'M12 8a4 4 0 100 8 4 4 0 000-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2',
  'M9 15l6-6M8 7H6a5 5 0 000 10h2M16 7h2a5 5 0 010 10h-2',
  'M12 3a9 9 0 100 18 9 9 0 000-18zM8 12l3 3 5-6',
  'M12 3a9 9 0 100 18 9 9 0 000-18zM15 9l-2 4-4 2 2-4z',
  'M4 4h16v12H4zM9 20h6M12 16v4',
  'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8a4 4 0 100 8 4 4 0 000-8z',
];

function iconRow(shift) {
  const svgs = ICONS.map((_, i) => {
    const path = ICONS[(i + shift) % ICONS.length];
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
  }).join('');
  // Twice over: the track scrolls exactly half its width, so the loop is seamless.
  return `<div class="edu-track">${svgs}${svgs}</div>`;
}

export function initEduCover() {
  document.querySelectorAll('.edu-marquee').forEach((row, i) => {
    row.innerHTML = iconRow(i * 7);
  });
}

/*
  Inside the case study: the guides share one panel, and the switcher sits in
  the flow of the page, scrolling away with everything else.
*/
export function bindCaseSwitch(content, scroller, signal) {
  content.querySelectorAll('.case-switch').forEach((sw) => bindOne(sw, scroller, signal));
}

function bindOne(sw, scroller, signal) {
  const indicator = sw.querySelector('.case-switch-indicator');
  const tabs = [...sw.querySelectorAll('.case-tab')];
  // A case study can hold several switchers, so each one owns only the panels
  // that sit beside it.
  const panels = [...sw.parentElement.querySelectorAll('.case-panel')];
  // Pinned: stays put while reading and never steals the scroll position.
  const pinned = sw.hasAttribute('data-switch-pinned');
  if (!indicator || tabs.length === 0 || panels.length === 0) return;

  function placeIndicator(tab) {
    const box = sw.getBoundingClientRect();
    const rect = tab.getBoundingClientRect();
    indicator.style.left = `${rect.left - box.left}px`;
    indicator.style.width = `${rect.width}px`;
  }

  function select(tab) {
    tabs.forEach((el) => {
      const on = el === tab;
      el.classList.toggle('active', on);
      el.setAttribute('aria-selected', String(on));
    });
    panels.forEach((p) => p.classList.toggle('case-panel--on', p.dataset.casePanel === tab.dataset.case));
    placeIndicator(tab);
    // A pinned switcher sits right above its panels, so jumping to the top of
    // the case would take the reader away from what they just picked.
    if (scroller && !pinned) scroller.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabs.forEach((tab) => tab.addEventListener('click', () => select(tab)));

  const active = tabs.find((t) => t.classList.contains('active')) || tabs[0];
  select(active);
  // The panel is measured while the modal is still growing, and web fonts land
  // later still, so follow the switcher's own size instead of guessing a delay.
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(() => {
      const on = tabs.find((t) => t.classList.contains('active'));
      if (on) placeIndicator(on);
    }).observe(sw);
  } else {
    requestAnimationFrame(() => placeIndicator(active));
    setTimeout(() => placeIndicator(tabs.find((t) => t.classList.contains('active'))), 400);
  }

  window.addEventListener('resize', () => {
    const on = tabs.find((t) => t.classList.contains('active'));
    if (on) placeIndicator(on);
  }, { signal });
}
