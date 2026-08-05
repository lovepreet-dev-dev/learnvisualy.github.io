/* ══════════════════════════════════════════════════════════════
   HOME SECTIONS

   The landing page used to end in a grid of 42 identical cards — a
   database dump that gave no reason to click any particular one, and
   duplicated what the sidebar and ⌘K already provide.

   Replaced with two things:

     · a set of questions rather than a set of nouns. "Can a straight
       line separate anything?" is a reason to click; "Perceptron" is
       only a label. Each carries a small generated sketch drawn from
       the same primitives the labs use, so the cards look like the
       thing they lead to.

     · a compact text index for the full catalog, dense enough to scan
       without dominating the page.
   ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const U = window.MLUtils;
  const catalog = window.MLAlgorithms;
  if (!U || !catalog || document.body.dataset.page !== "home") return;

  const C = () => U.chartColors();

  /* ── Sketches ──────────────────────────────────────────────────
     Small, static, generated. Each says something true about the page
     it links to rather than being decoration. */
  const W = 160;
  const H = 96;

  function sketch(draw) {
    const svg = U.svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "q-sketch", "aria-hidden": "true" });
    draw(svg);
    return svg;
  }

  const circle = (svg, x, y, r, fill, extra = {}) =>
    svg.appendChild(U.svgEl("circle", Object.assign({ cx: x, cy: y, r, fill }, extra)));

  const line = (svg, x1, y1, x2, y2, stroke, width = 2, extra = {}) =>
    svg.appendChild(
      U.svgEl("line", Object.assign({ x1, y1, x2, y2, stroke, "stroke-width": width }, extra))
    );

  const sketches = {
    /* Two points and the gap between them. */
    distance(svg) {
      circle(svg, 42, 62, 7, C().a);
      circle(svg, 118, 34, 7, C().b);
      line(svg, 42, 62, 118, 34, C().ink, 1.8, { "stroke-dasharray": "5 4" });
      line(svg, 42, 62, 118, 62, C().neutral, 1.2, { opacity: 0.5 });
      line(svg, 118, 62, 118, 34, C().neutral, 1.2, { opacity: 0.5 });
    },

    /* Two interlocking crescents — the shape that breaks k-means. The
       upper arc opens downward and the lower one upward, offset by half
       a period so they nest without merging into one band. */
    moons(svg) {
      for (let i = 0; i < 10; i += 1) {
        const t = Math.PI * (i / 9);
        circle(svg, 50 + Math.cos(t) * 38, 60 - Math.sin(t) * 26, 4.5, C().a);
      }
      for (let i = 0; i < 10; i += 1) {
        const t = Math.PI * (i / 9);
        circle(svg, 100 - Math.cos(t) * 38, 50 + Math.sin(t) * 26, 4.5, C().b);
      }
    },

    /* XOR: four points no straight line can split. */
    xor(svg) {
      circle(svg, 46, 30, 7, C().a);
      circle(svg, 114, 66, 7, C().a);
      circle(svg, 114, 30, 7, C().b);
      circle(svg, 46, 66, 7, C().b);
      line(svg, 26, 78, 134, 18, C().ink, 2, { "stroke-dasharray": "6 5", opacity: 0.75 });
    },

    /* Bias squared against variance — the tradeoff as two bars. */
    biasVariance(svg) {
      const bars = [
        { x: 40, h: 52, fill: C().b },
        { x: 78, h: 26, fill: C().a },
        { x: 116, h: 40, fill: C().c },
      ];
      bars.forEach((bar) => {
        svg.appendChild(
          U.svgEl("rect", { x: bar.x - 13, y: 76 - bar.h, width: 26, height: bar.h, rx: 4, fill: bar.fill })
        );
      });
      line(svg, 18, 76, 142, 76, C().axis, 1.4);
    },

    /* A small network with the error flowing back. */
    network(svg) {
      const layers = [
        [{ x: 34, y: 34 }, { x: 34, y: 62 }],
        [{ x: 80, y: 24 }, { x: 80, y: 48 }, { x: 80, y: 72 }],
        [{ x: 126, y: 48 }],
      ];
      layers.slice(0, -1).forEach((layer, li) => {
        layer.forEach((from) => {
          layers[li + 1].forEach((to) => line(svg, from.x, from.y, to.x, to.y, C().faint, 1.2));
        });
      });
      layers.forEach((layer, li) =>
        layer.forEach((node) =>
          circle(svg, node.x, node.y, 8, li === 0 ? C().c : li === 1 ? C().d : C().b)
        )
      );
      svg.appendChild(
        U.svgEl("path", {
          d: "M 120 78 L 42 78 M 50 73 L 42 78 L 50 83",
          stroke: C().danger,
          "stroke-width": 1.8,
          fill: "none",
        })
      );
    },

    /* Hidden states above, observations below. */
    hidden(svg) {
      const xs = [34, 74, 114];
      xs.forEach((x, i) => {
        circle(svg, x, 30, 9, C().d, { opacity: 0.55, "stroke-dasharray": "3 3", stroke: C().d });
        circle(svg, x, 70, 8, C().a);
        line(svg, x, 39, x, 62, C().neutral, 1.2, { "stroke-dasharray": "3 3" });
        if (i < xs.length - 1) line(svg, x + 9, 30, xs[i + 1] - 9, 30, C().d, 1.6);
      });
    },
  };

  /* ── The questions ─────────────────────────────────────────────
     Ordered so the first two need no prior knowledge at all. */
  const questions = [
    {
      q: "How does a machine decide two things are similar?",
      a: "Three different definitions of “close”, three different answers about the same points.",
      id: "distance-measures",
      sketch: "distance",
    },
    {
      q: "What if the clusters aren’t round?",
      a: "k-means assumes blobs. Feed it two interlocking arcs and watch it cut straight through them.",
      id: "dbscan",
      sketch: "moons",
    },
    {
      q: "Can a straight line separate anything?",
      a: "Four points arranged in a XOR pattern, and no line on earth that splits them correctly.",
      id: "perceptron",
      sketch: "xor",
    },
    {
      q: "Why does a more accurate model sometimes predict worse?",
      a: "Simulate a thousand datasets and watch bias trade against variance in real numbers.",
      id: "bias-and-variance-of-estimators",
      sketch: "biasVariance",
    },
    {
      q: "How does a network know which weight to blame?",
      a: "Follow one error signal backwards through every layer, with the arithmetic at each node.",
      id: "backpropagation",
      sketch: "network",
    },
    {
      q: "What can you infer when the truth is never visible?",
      a: "Only the umbrellas are observable. The weather has to be reconstructed from them.",
      id: "hidden-markov-models",
      sketch: "hidden",
    },
  ];

  function renderQuestions() {
    const host = document.getElementById("home-questions");
    if (!host) return;
    host.innerHTML = "";
    questions.forEach((item) => {
      const entry = catalog.get(item.id);
      if (!entry) return;
      const card = document.createElement("a");
      card.className = "q-card";
      card.href = `./pages/algorithm.html?id=${item.id}`;
      const body = document.createElement("div");
      body.className = "q-body";
      body.innerHTML = `
        <h3>${item.q}</h3>
        <p>${item.a}</p>
        <span class="q-go">${entry.title} <span aria-hidden="true">→</span></span>
      `;
      card.appendChild(sketch(sketches[item.sketch]));
      card.appendChild(body);
      host.appendChild(card);
    });
  }

  /* ── Compact index ─────────────────────────────────────────────
     Everything, as text, in columns. Scannable without being a wall of
     identical cards. */
  function renderIndex() {
    const host = document.getElementById("home-index");
    if (!host) return;
    host.innerHTML = catalog.categories
      .map((category) => {
        const entries = catalog.byCategory(category.id);
        return `
          <div class="index-group">
            <h3><a href="./pages/${category.page}">${category.title}</a> <span>${entries.length}</span></h3>
            <ul>
              ${entries
                .map(
                  (entry) =>
                    `<li><a href="./pages/algorithm.html?id=${entry.id}">${entry.title}</a></li>`
                )
                .join("")}
            </ul>
          </div>
        `;
      })
      .join("");
  }

  function renderAll() {
    renderQuestions();
    renderIndex();
  }

  renderAll();
  /* Sketches bake palette colours into attributes, so repaint on theme
     change like the labs do. */
  window.addEventListener("mls:themechange", renderQuestions);
})();
