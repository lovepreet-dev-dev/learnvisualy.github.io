# Machine Learning Studio

Interactive static web pages for learning machine learning algorithms with controls, step-by-step math, logic explanations, and a detailed explanation section at the bottom of each algorithm page.

## Open the site

Open [`index.html`](/Users/lovepreet/Desktop/ vibe projects/simulationas/index.html) directly in a browser, or serve the folder with any static file server.

## Structure

- [`index.html`](/Users/lovepreet/Desktop/ vibe projects/simulationas/index.html): home catalog for all algorithm pages
- [`pages/introduction.html`](/Users/lovepreet/Desktop/ vibe projects/simulationas/pages/introduction.html): foundations category index
- [`pages/classification.html`](/Users/lovepreet/Desktop/ vibe projects/simulationas/pages/classification.html): classification category index
- [`pages/graphical-models.html`](/Users/lovepreet/Desktop/ vibe projects/simulationas/pages/graphical-models.html): graphical-models category index
- [`pages/clustering.html`](/Users/lovepreet/Desktop/ vibe projects/simulationas/pages/clustering.html): clustering category index
- [`pages/algorithm.html`](/Users/lovepreet/Desktop/ vibe projects/simulationas/pages/algorithm.html): shared algorithm page shell

Each individual algorithm opens through the `id` query parameter, for example:

- [`pages/algorithm.html?id=nearest-neighbour`](/Users/lovepreet/Desktop/ vibe projects/simulationas/pages/algorithm.html?id=nearest-neighbour)
- [`pages/algorithm.html?id=logistic-regression`](/Users/lovepreet/Desktop/ vibe projects/simulationas/pages/algorithm.html?id=logistic-regression)
- [`pages/algorithm.html?id=hidden-markov-models`](/Users/lovepreet/Desktop/ vibe projects/simulationas/pages/algorithm.html?id=hidden-markov-models)
- [`pages/algorithm.html?id=spectral-clustering`](/Users/lovepreet/Desktop/ vibe projects/simulationas/pages/algorithm.html?id=spectral-clustering)

## Notes

- All interactions run in plain JavaScript with no build step.
- The pages are generated from metadata in [`assets/algorithms.js`](/Users/lovepreet/Desktop/ vibe projects/simulationas/assets/algorithms.js) and rendered by [`assets/algorithm-page.js`](/Users/lovepreet/Desktop/ vibe projects/simulationas/assets/algorithm-page.js).
