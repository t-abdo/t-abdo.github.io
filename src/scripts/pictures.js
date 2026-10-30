import { t } from './i18n.js';

const INTERVAL_MS = 5000;

/* Some of My Days, in one list: the card's drift and the panel's grid both read
   it, so a photo is added here once. The order alternates people, places, food,
   sport and nature, so neighbouring frames never repeat a theme. Each slug has
   a caption and alt text under modals.pictures in texts.js, keyed in camelCase. */
const PICTURE_NAMES = [
  'at-the-grill',
  'companion',
  'match-with-a-friend',
  'tennis-court',
  'another-city',
  'ducks-at-the-park',
  'indian-cake',
  'tennis-class',
  'family-gathering',
  'among-the-flowers',
  'coffee-shop',
  'playing-pool',
  'game-night',
  'angry-macaw',
  'volleyball-tournament',
  'beach-day',
  'orchids',
  'church-day',
  'little-chick',
  'dessert-first',
  'playing-tennis',
  'coffee-with-a-friend',
  'garden-fountain',
  'donuts',
  'garden-statues',
  'on-the-mower',
  'monkey-on-the-trail',
  'dessert-day',
  'dino-at-the-office',
  'bouquet',
  'finishing-the-cake',
  'at-the-zoo',
  'stroll-together',
  'carnations',
  'office-day',
  'natural-spring',
];

const PICTURES = PICTURE_NAMES.map((name) => `assets/pictures/${name}.jpg`);

// A stack's data-slideshow is either "pictures" or a comma-separated list of images.
function sourcesFor(stack) {
  const value = stack.dataset.slideshow;
  if (value === 'pictures') return PICTURES;
  return value.split(',').map((src) => src.trim()).filter(Boolean);
}

// Even pictures pan from the left, odd ones from the right. The pan starts
// over as the picture comes in, so it always sets off from its own edge.
function setPan(layer, index) {
  layer.dataset.pan = index % 2 ? 'rtl' : 'ltr';
  layer.style.animation = 'none';
  void layer.offsetWidth;
  layer.style.animation = '';
}

function startSlideshow(stack, delay) {
  const layers = [...stack.querySelectorAll('.pics-img')];
  const sources = sourcesFor(stack);
  if (layers.length < 2 || sources.length < 2) return;
  setPan(layers[0], 0);

  let index = 0;
  let front = 0;

  const advance = () => {
    // Nothing to show while the tab is hidden, the card is scrolled away or a
    // panel covers the grid; skip the decode entirely.
    if (document.hidden || stack.closest('.motion-off, .grid--still')) return;

    const next = (index + 1) % sources.length;
    const back = 1 - front;
    const incoming = layers[back];

    const swap = () => {
      layers[front].classList.remove('is-active');
      setPan(incoming, next);
      incoming.classList.add('is-active');
      front = back;
      index = next;
    };
    // Reassigning an identical src never fires load, so swap straight away.
    if (incoming.getAttribute('src') === sources[next]) return swap();
    incoming.onload = swap;
    incoming.src = sources[next];
  };

  setTimeout(() => setInterval(advance, INTERVAL_MS), delay);
}

/* Some of My Days drifts the whole set past the card instead of cutting between
   photos: the list is laid down twice so the loop has no seam. */
function buildFlow(stack) {
  const sources = stack.dataset.flow === 'pictures'
    ? PICTURES
    : stack.dataset.flow.split(',').map((src) => src.trim()).filter(Boolean);
  if (!sources.length) return;

  const track = document.createElement('div');
  track.className = 'pics-flow';
  [...sources, ...sources].forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.width = 600;
    img.height = 600;
    // Only the first screenful is worth blocking on.
    if (i > 2) img.loading = 'lazy';
    track.appendChild(img);
  });
  // One pass covers half the track (the original list), at a steady ~7s a photo.
  track.style.animationDuration = `${sources.length * 7}s`;
  stack.appendChild(track);
}

// "game-night" → "gameNight", the key its caption lives under.
function textKey(name) {
  return name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/* The panel's grid is written into its <template> from the same list. Nodes are
   made by the template's own inert document, so nothing downloads until the
   panel is opened and the grid is cloned into the page. */
function fillGrid() {
  const grid = document.getElementById('tpl-pictures')?.content.querySelector('.pic-grid');
  if (!grid) return;
  const doc = grid.ownerDocument;
  grid.replaceChildren(...PICTURE_NAMES.map((name, i) => {
    const key = `modals.pictures.${textKey(name)}`;
    const img = doc.createElement('img');
    img.width = 600;
    img.height = 600;
    img.loading = 'lazy';
    img.alt = t(`${key}.imageAlt`);
    img.src = PICTURES[i];
    const caption = doc.createElement('figcaption');
    caption.textContent = t(`${key}.caption`);
    const figure = doc.createElement('figure');
    figure.className = 'pic-card';
    figure.append(img, caption);
    return figure;
  }));
}

export function initPictures() {
  fillGrid();
  document.querySelectorAll('.pics-stack[data-flow]').forEach(buildFlow);

  // Offset each stack so neighbouring cards don't swap on the same beat.
  document.querySelectorAll('.pics-stack[data-slideshow]').forEach((stack, i) => {
    startSlideshow(stack, i * (INTERVAL_MS / 2));
  });
}
