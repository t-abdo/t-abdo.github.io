const OFFSET = 16;
const EDGE = 8;

export function initCursor() {
  const isFinePointer = window.matchMedia('(pointer: fine) and (min-width: 769px)').matches;
  if (!isFinePointer) return;

  const tooltip = document.getElementById('cursorTooltip');
  if (!tooltip) return;
  const label = tooltip.querySelector('.cursor-tooltip__label') || tooltip;

  let x = 0;
  let y = 0;

  // Sits below-right of the pointer, flipping left/up when that would leave the
  // viewport. Re-run after text changes, since the label's width drives the flip.
  function place() {
    const w = tooltip.offsetWidth;
    const h = tooltip.offsetHeight;
    const left = x + OFFSET + w > window.innerWidth - EDGE ? x - OFFSET - w : x + OFFSET;
    const top = y + OFFSET + h > window.innerHeight - EDGE ? y - OFFSET - h : y + OFFSET;
    tooltip.style.transform = `translate(${Math.max(EDGE, left)}px, ${Math.max(EDGE, top)}px)`;
  }

  // The draw is a separate class from the one that fades the tooltip in, so a
  // new target can replay it without the tooltip blinking: dropping the class
  // and re-adding it on the next frame rewinds every transition to zero.
  function setText(text) {
    label.textContent = text;
    // Rewind, then play. The transitions have to be switched off for the rewind:
    // dropping the class and resolving the style takes no time, so the values
    // are still sitting at the end of the last run and re-adding the class
    // would transition from finished to finished, which is to say not at all.
    tooltip.classList.add('cursor-tooltip--rewind');
    tooltip.classList.remove('cursor-tooltip--drawn');
    tooltip.getBoundingClientRect();
    tooltip.classList.remove('cursor-tooltip--rewind');
    tooltip.classList.add('cursor-tooltip--drawn');
    place();
  }

  window.addEventListener('mousemove', (e) => {
    x = e.clientX;
    y = e.clientY;
    place();
  });

  function findTooltipTarget(el) {
    return el ? el.closest('[data-tooltip]') : null;
  }

  document.addEventListener('mouseover', (e) => {
    const target = findTooltipTarget(e.target);
    if (target) {
      setText(target.dataset.tooltip);
      tooltip.classList.add('cursor-tooltip--visible');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = findTooltipTarget(e.target);
    if (target && !findTooltipTarget(e.relatedTarget)) {
      tooltip.classList.remove('cursor-tooltip--visible', 'cursor-tooltip--drawn');
    }
  });

  window.setCursorTooltip = setText;
}
