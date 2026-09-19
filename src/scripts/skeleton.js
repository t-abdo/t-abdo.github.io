// Shimmer placeholder for images that are still downloading. Only images that
// aren't ready yet get it, so cached or instant images never flash a skeleton.
function watch(img) {
  if (!img.getAttribute('src') || (img.complete && img.naturalWidth > 0)) return;
  img.classList.add('is-loading');
  const done = () => img.classList.remove('is-loading');
  img.addEventListener('load', done, { once: true });
  img.addEventListener('error', done, { once: true });
}

export function watchImages(root = document) {
  root.querySelectorAll('img').forEach(watch);
}

export function initSkeleton() {
  watchImages();
}
