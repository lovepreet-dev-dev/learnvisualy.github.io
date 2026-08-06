# Machine Learning Studio

Interactive pages for learning machine learning. Every concept gets a page with three
things side by side: a visual you can manipulate, the formula with *your* current numbers
substituted into it, and a step-by-step trail explaining why each update happens.

Nothing here is a static illustration — you can retype any coordinate, drag points on a
chart, edit a weight matrix, or add a layer to a network, and every number, formula and
picture recomputes.

## Running it locally

```bash
python3 serve.py
```

Then open **http://localhost:4173**. Press `Ctrl+C` to stop.

Pick a different port with `python3 serve.py 8000`.

The script uses only the Python standard library — nothing to install. It sends
`Cache-Control: no-store` so a plain reload always shows your latest edit instead of a
cached copy.

Any static file server works just as well:

```bash
python3 -m http.server 4173      # built-in, but caches more aggressively
npx serve .                      # if you would rather use Node
```

Opening `index.html` straight from the filesystem mostly works too, but some browsers
block `file://` pages from loading the sibling scripts, so the server is the reliable
route.

## Structure

```
index.html              home — live demo, featured questions, full index
pages/
  introduction.html     Foundations track
  classification.html   Classification track
  graphical-models.html Graphical Models track
  clustering.html       Clustering track
  neural.html           Neural Networks track
  algorithm.html        shared shell for every concept page
assets/
  algorithms.js         the catalog: every concept's metadata and prose
  algorithm-page.js     the interactive labs, one mount function per engine
  nn-engine.js          neural network engine (forward, backward, losses)
  common.js             shared utilities: charts, editors, KaTeX, drag
  catalog.js            renders the home and category listings
  site-nav.js           sidebar, search palette, prev/next, footer, theme
  home-hero.js          the live demo on the landing page
  home-sections.js      featured questions and the full index
  styles.css            the whole design system
neural/                 the original Vite prototype the engine was ported from
```

Individual concepts open through the `id` query parameter:

- `pages/algorithm.html?id=nearest-neighbour`
- `pages/algorithm.html?id=backpropagation`
- `pages/algorithm.html?id=spectral-clustering`

## Adding a concept

Add an entry to `allPages` in `assets/algorithms.js` with an `engine` name, then add a
matching `mount<Engine>` function in `assets/algorithm-page.js` and register it in the
`engines` map at the bottom of that file. The sidebar, search, prev/next links, home
index and `sitemap.xml` all read from the catalog, so they pick it up automatically.

## Notes

- No build step and no runtime dependencies. KaTeX loads from a CDN for maths rendering
  and degrades to plain text if it is unavailable.
- Asset URLs carry a `?v=` query so a deploy is picked up without a hard refresh.
- Dark mode follows the OS by default and remembers an explicit choice.
- `neural/node_modules` and `neural/dist` are gitignored via that folder's own
  `.gitignore` — the prototype's source is kept as provenance for the ported engine.
