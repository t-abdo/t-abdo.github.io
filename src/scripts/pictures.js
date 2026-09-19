const INTERVAL_MS = 5000;

// Some Moments order: a shuffled-looking spread so consecutive frames don't repeat a theme.
const PICTURES = [5, 14, 12, 10, 16, 6, 1, 13, 21, 17, 15, 2, 3, 20, 18, 7, 23, 4]
  .map((n) => `assets/pictures/${n}.jpg`);

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

export function initPictures() {
  // Offset each stack so neighbouring cards don't swap on the same beat.
  document.querySelectorAll('.pics-stack[data-slideshow]').forEach((stack, i) => {
    startSlideshow(stack, i * (INTERVAL_MS / 2));
  });
}
