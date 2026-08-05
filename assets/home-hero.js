/* ══════════════════════════════════════════════════════════════
   LIVE HERO

   The landing page used to be a menu: a headline, then 42 cards. That
   is a decision, and decisions are friction. This replaces it with
   something already moving — one dataset being solved four different
   ways, on a loop, that the reader can interrupt at any moment by
   clicking to drop a point.

   Time from landing to first interaction is meant to be a couple of
   seconds, with no instructions to read first.

   Deliberately self-contained: the lab engines live in
   algorithm-page.js behind a `data-page === "algorithm"` guard, so the
   four demos here are compact re-implementations built on the same
   MLUtils primitives.
   ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const U = window.MLUtils;
  const mount = document.getElementById("hero-stage");
  if (!U || !mount) return;

  const svg = mount.querySelector("svg");
  const titleNode = document.getElementById("hero-demo-title");
  const noteNode = document.getElementById("hero-demo-note");
  const linkNode = document.getElementById("hero-demo-link");
  const chipRow = document.getElementById("hero-demo-chips");
  const statNode = document.getElementById("hero-demo-stat");

  const C = () => U.chartColors();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DOMAIN = [0, 10];

  /* ── Seed data ─────────────────────────────────────────────────
     Three loose blobs: enough structure that every demo has something
     true to say about it, loose enough that none of them look trivial. */
  function seedPoints() {
    const rng = U.seededRandom(11);
    const centres = [
      { x: 2.6, y: 7.0, label: 1 },
      { x: 7.4, y: 6.6, label: -1 },
      { x: 5.0, y: 2.6, label: -1 },
    ];
    const points = [];
    centres.forEach((centre, ci) => {
      for (let i = 0; i < 7; i += 1) {
        points.push({
          id: `p${ci}${i}`,
          x: U.clamp(U.sampleNormal(rng, centre.x, 0.95), 0.4, 9.6),
          y: U.clamp(U.sampleNormal(rng, centre.y, 0.95), 0.4, 9.6),
          label: centre.label,
        });
      }
    });
    return points;
  }

  let points = seedPoints();

  /* ── Demos ─────────────────────────────────────────────────────
     Each exposes reset(), step() and draw(). `settled` tells the
     scheduler when a demo has finished so it can hold, then advance. */

  /* k-means: the classic assign / update alternation. */
  const kmeans = {
    id: "k-means",
    title: "k-means clustering",
    note: "Every point joins its nearest centre; every centre moves to the average of its points. Repeat until nothing changes.",
    href: "./pages/algorithm.html?id=k-means",
    reset() {
      const seedIndices = [0, 8, 16];
      this.reps = seedIndices.map((index) => ({
        x: points[Math.min(index, points.length - 1)].x,
        y: points[Math.min(index, points.length - 1)].y,
      }));
      this.assignments = points.map(() => -1);
      this.phase = "assign";
      this.iterations = 0;
      this.settled = false;
    },
    step() {
      if (this.phase === "assign") {
        const next = points.map((point) =>
          U.argMax(this.reps.map((rep) => -U.distance(point, rep, "euclidean")))
        );
        const changed = next.filter((value, index) => value !== this.assignments[index]).length;
        this.assignments = next;
        this.phase = "update";
        if (changed === 0 && this.iterations > 0) this.settled = true;
      } else {
        this.reps = this.reps.map((rep, index) => {
          const members = points.filter((_, i) => this.assignments[i] === index);
          if (!members.length) return rep;
          return { x: U.mean(members.map((p) => p.x)), y: U.mean(members.map((p) => p.y)) };
        });
        this.phase = "assign";
        this.iterations += 1;
        if (this.iterations > 9) this.settled = true;
      }
    },
    draw(chart) {
      points.forEach((point, index) => {
        const cluster = this.assignments[index];
        if (cluster >= 0) {
          const rep = this.reps[cluster];
          svg.appendChild(
            U.svgEl("line", {
              x1: chart.xScale(point.x),
              y1: chart.yScale(point.y),
              x2: chart.xScale(rep.x),
              y2: chart.yScale(rep.y),
              stroke: paletteAt(cluster),
              "stroke-width": 1.1,
              opacity: 0.32,
            })
          );
        }
        dot(chart, point, cluster >= 0 ? paletteAt(cluster) : C().neutral, 6);
      });
      this.reps.forEach((rep, index) => {
        const x = chart.xScale(rep.x);
        const y = chart.yScale(rep.y);
        svg.appendChild(
          U.svgEl("polygon", {
            points: `${x},${y - 11} ${x + 11},${y} ${x},${y + 11} ${x - 11},${y}`,
            fill: paletteAt(index),
            stroke: C().ring,
            "stroke-width": 2.5,
          })
        );
      });
      return `iteration ${this.iterations}`;
    },
  };

  /* k-NN: shade the plane by majority vote of the 5 nearest points. */
  const knn = {
    id: "k-nn",
    title: "k-nearest neighbours",
    note: "No training at all. Every location on the plane simply takes a vote among the 5 labelled points closest to it.",
    href: "./pages/algorithm.html?id=nearest-neighbour",
    reset() {
      this.revealed = 0;
      this.settled = false;
    },
    step() {
      this.revealed = Math.min(this.revealed + 2, 20);
      if (this.revealed >= 20) this.settled = true;
    },
    draw(chart) {
      const cols = 22;
      const rows = 15;
      const fraction = this.revealed / 20;
      for (let gx = 0; gx < cols; gx += 1) {
        for (let gy = 0; gy < rows; gy += 1) {
          if (gx / cols > fraction) continue;
          const x = DOMAIN[0] + ((gx + 0.5) / cols) * (DOMAIN[1] - DOMAIN[0]);
          const y = DOMAIN[0] + ((gy + 0.5) / rows) * (DOMAIN[1] - DOMAIN[0]);
          const near = points
            .map((point) => ({ point, d: U.distance(point, { x, y }, "euclidean") }))
            .sort((a, b) => a.d - b.d)
            .slice(0, 5);
          const score = near.reduce((acc, item) => acc + item.point.label, 0);
          const colour = score >= 0 ? C().a : C().b;
          const x1 = chart.xScale(DOMAIN[0] + (gx / cols) * (DOMAIN[1] - DOMAIN[0]));
          const x2 = chart.xScale(DOMAIN[0] + ((gx + 1) / cols) * (DOMAIN[1] - DOMAIN[0]));
          const y1 = chart.yScale(DOMAIN[0] + ((gy + 1) / rows) * (DOMAIN[1] - DOMAIN[0]));
          const y2 = chart.yScale(DOMAIN[0] + (gy / rows) * (DOMAIN[1] - DOMAIN[0]));
          svg.appendChild(
            U.svgEl("rect", {
              x: Math.min(x1, x2),
              y: Math.min(y1, y2),
              width: Math.abs(x2 - x1) + 0.6,
              height: Math.abs(y2 - y1) + 0.6,
              fill: U.tint(colour, 0.16 + 0.1 * (Math.abs(score) / 5)),
            })
          );
        }
      }
      points.forEach((point) => dot(chart, point, point.label === 1 ? C().a : C().b, 6));
      return `${Math.round(fraction * 100)}% of the plane voted`;
    },
  };

  /* Perceptron: a line that visibly rotates into place, one mistake at
     a time. The most legible "learning" of the four. */
  const perceptron = {
    id: "perceptron",
    title: "the perceptron",
    note: "It only reacts to mistakes. Each misclassified point nudges the boundary toward itself — and then it stops.",
    href: "./pages/algorithm.html?id=perceptron",
    reset() {
      this.w = [0.4, -1.1, 0.35];
      this.cursor = 0;
      this.checked = 0;
      this.settled = false;
      this.lastId = null;
    },
    step() {
      if (!points.length) return;
      const point = points[this.cursor % points.length];
      const x = [1, point.x, point.y];
      const score = U.dot(this.w, x);
      if (point.label * score <= 0) {
        U.addScaled(this.w, x, 0.08 * point.label);
        this.checked = 0;
        this.lastId = point.id;
      } else {
        this.checked += 1;
        this.lastId = null;
      }
      this.cursor += 1;
      if (this.checked >= points.length) this.settled = true;
    },
    draw(chart) {
      const [b, w1, w2] = this.w;
      if (Math.abs(w2) > 1e-6) {
        const y1 = -(b + w1 * DOMAIN[0]) / w2;
        const y2 = -(b + w1 * DOMAIN[1]) / w2;
        /* Shade the two half-planes so the split reads at a glance. */
        svg.appendChild(
          U.svgEl("polygon", {
            points: `${chart.xScale(DOMAIN[0])},${chart.yScale(y1)} ${chart.xScale(DOMAIN[1])},${chart.yScale(y2)} ${chart.xScale(DOMAIN[1])},${chart.yScale(DOMAIN[1])} ${chart.xScale(DOMAIN[0])},${chart.yScale(DOMAIN[1])}`,
            fill: U.tint(C().a, 0.12),
          })
        );
        svg.appendChild(
          U.svgEl("polygon", {
            points: `${chart.xScale(DOMAIN[0])},${chart.yScale(y1)} ${chart.xScale(DOMAIN[1])},${chart.yScale(y2)} ${chart.xScale(DOMAIN[1])},${chart.yScale(DOMAIN[0])} ${chart.xScale(DOMAIN[0])},${chart.yScale(DOMAIN[0])}`,
            fill: U.tint(C().b, 0.12),
          })
        );
        svg.appendChild(
          U.svgEl("line", {
            x1: chart.xScale(DOMAIN[0]),
            y1: chart.yScale(y1),
            x2: chart.xScale(DOMAIN[1]),
            y2: chart.yScale(y2),
            stroke: C().ink,
            "stroke-width": 2.4,
          })
        );
      }
      points.forEach((point) =>
        dot(chart, point, point.label === 1 ? C().a : C().b, point.id === this.lastId ? 9 : 6)
      );
      const correct = points.filter((point) => point.label * U.dot(this.w, [1, point.x, point.y]) > 0).length;
      return `${correct} of ${points.length} correct`;
    },
  };

  /* DBSCAN: clusters grow outward from dense seeds; sparse points are
     left behind as noise, which no other demo here does. */
  const dbscan = {
    id: "dbscan",
    title: "DBSCAN",
    note: "Density, not distance to a centre. Clusters grow outward from crowded neighbourhoods and lonely points stay unassigned.",
    href: "./pages/algorithm.html?id=dbscan",
    eps: 1.5,
    minPts: 3,
    reset() {
      this.labels = points.map(() => 0);
      this.frontier = [];
      this.cluster = 0;
      this.index = 0;
      this.settled = false;
    },
    step() {
      if (this.frontier.length) {
        const current = this.frontier.shift();
        neighbours(current, this.eps).forEach((n) => {
          if (this.labels[n] === 0) {
            this.labels[n] = this.cluster;
            if (neighbours(n, this.eps).length + 1 >= this.minPts) this.frontier.push(n);
          }
        });
        return;
      }
      while (this.index < points.length && this.labels[this.index] !== 0) this.index += 1;
      if (this.index >= points.length) {
        this.settled = true;
        return;
      }
      const near = neighbours(this.index, this.eps);
      if (near.length + 1 >= this.minPts) {
        this.cluster += 1;
        this.labels[this.index] = this.cluster;
        this.frontier.push(this.index);
      } else {
        this.labels[this.index] = -1;
      }
      this.index += 1;
    },
    draw(chart) {
      points.forEach((point, index) => {
        if (this.labels[index] > 0) {
          svg.appendChild(
            U.svgEl("circle", {
              cx: chart.xScale(point.x),
              cy: chart.yScale(point.y),
              r: Math.abs(chart.xScale(this.eps) - chart.xScale(0)),
              fill: U.tint(paletteAt(this.labels[index] - 1), 0.07),
              stroke: U.tint(paletteAt(this.labels[index] - 1), 0.22),
            })
          );
        }
      });
      points.forEach((point, index) => {
        const label = this.labels[index];
        const colour = label > 0 ? paletteAt(label - 1) : label === -1 ? C().danger : C().neutral;
        dot(chart, point, colour, 6);
      });
      const noise = this.labels.filter((l) => l === -1).length;
      return `${this.cluster} clusters, ${noise} noise`;
    },
  };

  const demos = [kmeans, perceptron, knn, dbscan];
  let active = 0;
  let holdFrames = 0;
  let timer = null;

  function neighbours(index, eps) {
    const result = [];
    points.forEach((point, i) => {
      if (i !== index && U.distance(point, points[index], "euclidean") <= eps) result.push(i);
    });
    return result;
  }

  function paletteAt(index) {
    const palette = [C().a, C().b, C().c, C().d];
    return palette[((index % palette.length) + palette.length) % palette.length];
  }

  function dot(chart, point, colour, radius) {
    svg.appendChild(
      U.svgEl("circle", {
        cx: chart.xScale(point.x),
        cy: chart.yScale(point.y),
        r: radius,
        fill: colour,
        stroke: C().ring,
        "stroke-width": 1.5,
      })
    );
  }

  /* ── Render ────────────────────────────────────────────────── */
  function render() {
    const demo = demos[active];
    const chart = U.makeChart(svg, { xDomain: DOMAIN, yDomain: DOMAIN, padding: { top: 10, right: 10, bottom: 10, left: 10 } });
    /* makeChart draws axis furniture that would be noise at hero size. */
    U.qsa(".grid-line, .axis-line, .svg-label, .svg-title", svg).forEach((node) => node.remove());
    const stat = demo.draw(chart);
    if (statNode) statNode.textContent = stat || "";
    titleNode.textContent = demo.title;
    noteNode.textContent = demo.note;
    linkNode.setAttribute("href", demo.href);
    U.qsa(".hero-chip", chipRow).forEach((chip, index) => {
      chip.classList.toggle("is-active", index === active);
      chip.setAttribute("aria-pressed", String(index === active));
    });
  }

  function tick() {
    const demo = demos[active];
    if (demo.settled) {
      holdFrames += 1;
      if (holdFrames > 14) select((active + 1) % demos.length);
      return;
    }
    demo.step();
    render();
  }

  function select(index, fromUser) {
    active = index;
    holdFrames = 0;
    demos[active].reset();
    if (fromUser || reduceMotion) {
      /* Jump straight to the answer rather than making someone who
         asked for this demo sit through the animation. */
      let guard = 0;
      while (!demos[active].settled && guard < 400) {
        demos[active].step();
        guard += 1;
      }
    }
    render();
  }

  function start() {
    if (timer) window.clearInterval(timer);
    if (reduceMotion) return;
    timer = window.setInterval(tick, 260);
  }

  /* ── Interaction ───────────────────────────────────────────── */
  function addPointAt(event) {
    const rect = svg.getBoundingClientRect();
    const { width, height } = U.viewBoxSize(svg);
    const x = ((event.clientX - rect.left) / rect.width) * width;
    const y = ((event.clientY - rect.top) / rect.height) * height;
    const chart = { padding: { top: 10, right: 10, bottom: 10, left: 10 } };
    const dataX = U.clamp(
      DOMAIN[0] + ((x - chart.padding.left) / (width - 20)) * (DOMAIN[1] - DOMAIN[0]),
      DOMAIN[0],
      DOMAIN[1]
    );
    const dataY = U.clamp(
      DOMAIN[0] + ((height - chart.padding.bottom - y) / (height - 20)) * (DOMAIN[1] - DOMAIN[0]),
      DOMAIN[0],
      DOMAIN[1]
    );

    /* Label the new point by what is already nearby, so the classifier
       demos stay coherent when someone clicks into a blob. */
    const nearest = points
      .map((point) => ({ point, d: U.distance(point, { x: dataX, y: dataY }, "euclidean") }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    const label = nearest.reduce((acc, item) => acc + item.point.label, 0) >= 0 ? 1 : -1;

    points.push({ id: `u${points.length}`, x: dataX, y: dataY, label });
    mount.classList.add("has-touched");
    select(active, true);
  }

  svg.addEventListener("click", addPointAt);
  svg.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select((active + 1) % demos.length, true);
    }
  });

  chipRow.addEventListener("click", (event) => {
    const chip = event.target.closest(".hero-chip");
    if (!chip) return;
    window.clearInterval(timer);
    timer = null;
    select(Number(chip.dataset.index), true);
  });

  document.getElementById("hero-reset")?.addEventListener("click", () => {
    points = seedPoints();
    mount.classList.remove("has-touched");
    select(active, true);
    start();
  });

  /* Pause when off screen — an animation nobody is looking at is just
     battery drain. */
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!timer) start();
        } else if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      });
    }, { threshold: 0.15 }).observe(mount);
  }

  window.addEventListener("mls:themechange", render);

  select(0);
  start();
})();
