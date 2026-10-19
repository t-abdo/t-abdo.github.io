/* The widths the layout changes at. The stylesheets repeat these numbers in
   their media queries (they can't read variables); tokens.css lists what each
   one does. Keep both in step. */
export const BREAKPOINTS = {
  phone: 560,
  narrow: 720,
  mobile: 860,
  wide: 1140,
};

// At or below this width the page behaves as touch, and panels take the screen.
export function isMobileLayout(width = window.innerWidth) {
  return width <= BREAKPOINTS.mobile;
}

// Which grid the cards are laid out on: two columns, four square ones, or the desktop's.
export function gridLayout(width = window.innerWidth) {
  if (width <= BREAKPOINTS.phone) return 'phone';
  if (width <= BREAKPOINTS.mobile) return 'tablet';
  return 'desktop';
}
