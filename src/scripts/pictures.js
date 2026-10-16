const INTERVAL_MS = 5000;

// Some Moments order: a shuffled-looking spread so consecutive frames don't repeat a theme.
const PICTURES = [
  'companion',
  'at-the-grill',
  'match-with-a-friend',
  'indian-cake',
  'coffee-shop',
  'ducks-at-the-park',
  'game-night',
  'tennis-class',
  'lotus-pie',
  'another-city',
  'among-the-flowers',
  'family-barbecue',
  'dessert-first',
  'orchids',
  'garden-fountain',
  'donuts',
  'gym',
  'match-day',
  'family-gathering',
  'angry-macaw',
  'on-the-mower',
  'at-the-zoo',
  'beach-day',
  'cafe-with-a-friend',
  'stained-glass',
  'dessert-day',
  'dino-at-the-office',
  'finishing-the-cake',
  'natural-spring',
  'little-chick',
  'monkey-on-the-trail',
  'stroll-together',
  'playing-tennis',
  'playing-pool',
  'volleyball-tournament',
].map((name) => `assets/pictures/${name}.jpg`);

// A stack's data-slideshow is either "pictures" or a comma-separated list of images.
function sourcesFor(stack) {
  const value = stack.dataset.slideshow;
  if (value === 'pictures') return PICTURES;
  return value.split(',').map((src) => src.trim()).filter(Boolean);
}

function startSlideshow(stack, delay) {
  const layers = [...stack.querySelectorAll('.pics-img')];
  const sources = sourcesFor(stack);
  if (layers.length < 2 || sources.length < 2) return;

  let index = 0;
  let front = 0;

  const advance = () => {
    // Nothing to show while the tab is hidden; skip the decode entirely.
    if (document.hidden) return;

    const next = (index + 1) % sources.length;
    const back = 1 - front;
    const incoming = layers[back];

    const swap = () => {
      layers[front].classList.remove('is-active');
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

/* Some Moments drifts the whole set past the card instead of cutting between
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

export function initPictures() {
  document.querySelectorAll('.pics-stack[data-flow]').forEach(buildFlow);

  // Offset each stack so neighbouring cards don't swap on the same beat.
  document.querySelectorAll('.pics-stack[data-slideshow]').forEach((stack, i) => {
    startSlideshow(stack, i * (INTERVAL_MS / 2));
  });
}
