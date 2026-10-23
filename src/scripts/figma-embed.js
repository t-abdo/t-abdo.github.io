/*
  The "Explore the Interface" switchers in the case studies show a still of
  each part of the application until its Figma prototype is linked. Put the
  prototype's share link in the figure's data-figma and that panel plays the
  live prototype instead. It loads only once its tab is picked and it is on
  screen, since every embed is a whole Figma player.
*/

function embedSrc(link) {
  return `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(link)}`;
}

export function bindFigmaEmbeds(root, scroller) {
  const frames = [...root.querySelectorAll('.cs-live[data-figma]')].filter((f) => f.dataset.figma);
  if (!frames.length) return;

  // A panel hidden behind another tab has no box, so it never intersects
  // until its tab shows it.
  const observer = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach(({ target }) => {
      observer.unobserve(target);
      const still = target.querySelector('img');
      const iframe = document.createElement('iframe');
      iframe.src = embedSrc(target.dataset.figma);
      iframe.title = still?.alt || '';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      target.classList.add('cs-live--playing');
      target.append(iframe);
      // The still holds the frame's place until the player has drawn
      iframe.addEventListener('load', () => still?.remove(), { once: true });
    });
  }, { root: scroller, rootMargin: '200px 0px' });

  frames.forEach((f) => observer.observe(f));
}
