# Mesh case study (on hold)

Taken off the site until the case is written. Everything it needed is here, so
it can go back as it was. Nothing in `drafts/` is linked from the page.

- `markup.html`: the card, its `tpl-mesh` panel, the "View the Mesh case" link
  in the About panel and the Mesh button under AgileEngine in Professional Path.
- `cards.css`: the placeholder plate and the cover (the three rows of stand-in
  screens), both from `src/styles/cards.css`.
- `texts.js`: `cards.mesh` and `modals.about.meshCase`.

Still on the site, because other parts use them:

- `assets/projects/mesh/logo.svg` and the `mesh` entry in `src/scripts/logos.js`
  (the About panel shows the mark).
- `modals.mesh` in `texts.js`: its tags are listed under AgileEngine in
  Professional Path.
- The `.cs-logo[data-logo='mesh']` rules in `case-studies.css`.

## Putting it back

Restore the four pieces of `markup.html`, the CSS and the texts where each
comment says, then give `mesh` a position in every layout in
`src/scripts/nav.js` (desktop, tablet and phone, all four filters). Under All
on desktop it was a 2 by 2 card at `col: '3 / 5', row: '5 / 7'`.
