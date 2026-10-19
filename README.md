# Tales Abdo · Portfolio

A bento-grid portfolio: each card opens into a panel, and the project cards open
into full case studies. Plain HTML, CSS and ES modules, no build step.

## Run it

```sh
python3 serve.py
```

Then open http://localhost:8123. The server sends `Cache-Control: no-store`, so
an edit always reaches the browser instead of a cached module (`python3 -m
http.server` would serve stale scripts). Pass another port as the first argument
if 8123 is taken.

## Where things live

```
index.html            the grid, plus one <template> per panel (tpl-<card id>)
src/content/texts.js  every piece of copy on the site, keyed by card or panel
src/scripts/          one module per behaviour, started from main.js
src/styles/           tokens.css, then base, cards, panels, case-studies, responsive
assets/               what the site serves, one folder per card (see source/README.md)
source/               full-size originals, not served and not in git
```

A card's id is its `data-card` value, and the same name is used everywhere:
the panel template (`tpl-bachelor`), the texts (`cards.bachelor`,
`modals.bachelor`), the grid layouts in `nav.js` and the asset folder
(`assets/bachelor/`).

## Conventions

- **Copy** goes in `texts.js`, never in the markup. Elements point at it with
  `data-i18n`, `data-i18n-html` or `data-i18n-attr`; scripts call `t(key)`.
  Keys that are ordered lists (tags, items, paragraphs) are numbered from 1.
- **Colours** come from `tokens.css`. A case study's own palette is declared
  once at the top of its block (`--cs-*`). Text is dimmed with a text colour
  (`--color-text-secondary`, `--color-text-subtle`), never with opacity.
- **Type** comes from `tokens.css` too: sizes `--text-2xs` to `--text-4xl`,
  line heights `--leading-*`, letter spacing `--tracking-*`.
- **Breakpoints** are 560, 720, 860 and 1140px, listed with what each does in
  `tokens.css` and mirrored in `src/scripts/breakpoints.js`.
- **Prose** is left-aligned; centring is for short labels tied to artwork.
- **Images** are JPEG. AVIF made with `sips` decodes blank in Chrome at these sizes, so it is not used.

## Adding content

- A photo to Some of My Days: see `source/README.md`.
- A card: markup in the grid, a position in every layout in `nav.js` (desktop
  and mobile, all four filters), its texts, and a `tpl-<id>` template if it
  opens a panel.
