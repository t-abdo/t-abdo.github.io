import { BREAKPOINTS } from './breakpoints.js';

const OFFSET = 16;
const EDGE = 8;

// Set once the tooltip exists. It only does on a fine pointer, so on touch
// screens setCursorTooltip() is a quiet no-op instead of a crash.
let showText = null;

export function setCursorTooltip(text) {
  showText?.(text);
}

export function initCursor() {
  const isFinePointer = window.matchMedia(`(pointer: fine) and (min-width: ${BREAKPOINTS.mobile + 1}px)`).matches;
  if (!isFinePointer) return;

  const tooltip = document.getElementById('cursorTooltip');
  if (!tooltip) return;
  const label = tooltip.querySelector('.cursor-tooltip__label') || tooltip;

  let x = 0;
  let y = 0;
  // The tooltip's size, read once per text rather than on every mouse move:
  // only a new label changes it, and reading it forces a layout each time.
  let w = 0;
  let h = 0;

  // Sits below-right of the pointer, flipping left/up when that would leave the
  // viewport. Re-run after text changes, since the label's width drives the flip.
  function place() {
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
    w = tooltip.offsetWidth;
    h = tooltip.offsetHeight;
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

  /* The tooltip draws once when the pointer enters an element that has one
     and stays until it leaves it. Crossing the element's own children, or
     artwork it swaps out under the pointer (the contact marks replay that
     way), fires mouseover again on the same element and must not redraw it. */
  let current = null;

  function hide() {
    current = null;
    tooltip.classList.remove('cursor-tooltip--visible', 'cursor-tooltip--drawn');
  }

  document.addEventListener('mouseover', (e) => {
    const target = findTooltipTarget(e.target);
    // An element taken out of the page under the pointer (a panel closing)
    // never sends mouseout; arriving somewhere without a tooltip clears it.
    if (!target) {
      if (current) hide();
      return;
    }
    if (target === current) return;
    current = target;
    setText(target.dataset.tooltip);
    tooltip.classList.add('cursor-tooltip--visible');
  });

  document.addEventListener('mouseout', (e) => {
    if (!current) return;
    // Into another element with a tooltip: mouseover takes it from there
    if (findTooltipTarget(e.relatedTarget)) return;
    hide();
  });

  showText = setText;
}
