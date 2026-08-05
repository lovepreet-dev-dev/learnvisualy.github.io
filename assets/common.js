(function () {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function clear(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function round(value, digits = 3) {
    if (!Number.isFinite(value)) {
      return "n/a";
    }
    const fixed = Number(value).toFixed(digits);
    /* Only trim trailing zeros from the fractional part. The previous
       version stripped them unconditionally, which turned "60" into "6"
       and "100" into "1" whenever digits was 0. */
    if (!fixed.includes(".")) {
      return fixed;
    }
    return fixed.replace(/0+$/, "").replace(/\.$/, "");
  }

  function sum(values) {
    return values.reduce((total, value) => total + value, 0);
  }

  function mean(values) {
    return values.length ? sum(values) / values.length : 0;
  }

  function variance(values, unbiased = false) {
    if (values.length <= (unbiased ? 1 : 0)) {
      return 0;
    }
    const mu = mean(values);
    const denom = unbiased ? values.length - 1 : values.length;
    return sum(values.map((value) => (value - mu) ** 2)) / denom;
  }

  function median(values) {
    if (!values.length) {
      return 0;
    }
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2) {
      return sorted[mid];
    }
    return 0.5 * (sorted[mid - 1] + sorted[mid]);
  }

  function gaussianPdf(x, mu, sigma2) {
    const varianceValue = Math.max(sigma2, 1e-6);
    const normalizer = Math.sqrt(2 * Math.PI * varianceValue);
    return Math.exp(-((x - mu) ** 2) / (2 * varianceValue)) / normalizer;
  }

  function sigmoid(value) {
    if (value >= 0) {
      const z = Math.exp(-value);
      return 1 / (1 + z);
    }
    const z = Math.exp(value);
    return z / (1 + z);
  }

  function linspace(min, max, count) {
    if (count <= 1) {
      return [min];
    }
    const step = (max - min) / (count - 1);
    return Array.from({ length: count }, (_, index) => min + index * step);
  }

  function parseNumberList(raw) {
    return raw
      .split(/[\s,]+/)
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value));
  }

  function svgEl(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => {
      node.setAttribute(key, String(value));
    });
    return node;
  }

  function viewBoxSize(svg) {
    const parts = svg.getAttribute("viewBox").split(/\s+/).map(Number);
    return { width: parts[2], height: parts[3] };
  }

  function makeChart(svg, options) {
    clear(svg);
    const { width, height } = viewBoxSize(svg);
    const padding = Object.assign(
      { top: 28, right: 22, bottom: 36, left: 46 },
      options.padding || {}
    );
    const xDomain = options.xDomain;
    const yDomain = options.yDomain;
    const xScale = (x) =>
      padding.left +
      ((x - xDomain[0]) / (xDomain[1] - xDomain[0] || 1)) *
        (width - padding.left - padding.right);
    const yScale = (y) =>
      height -
      padding.bottom -
      ((y - yDomain[0]) / (yDomain[1] - yDomain[0] || 1)) *
        (height - padding.top - padding.bottom);
    const xInvert = (px) =>
      xDomain[0] +
      ((px - padding.left) / (width - padding.left - padding.right || 1)) *
        (xDomain[1] - xDomain[0]);
    const yInvert = (py) =>
      yDomain[0] +
      ((height - padding.bottom - py) / (height - padding.top - padding.bottom || 1)) *
        (yDomain[1] - yDomain[0]);

    for (let index = 0; index <= 5; index += 1) {
      const xValue = xDomain[0] + ((xDomain[1] - xDomain[0]) * index) / 5;
      const x = xScale(xValue);
      svg.appendChild(
        svgEl("line", {
          x1: x,
          y1: padding.top,
          x2: x,
          y2: height - padding.bottom,
          class: "grid-line",
        })
      );
      svg.appendChild(
        svgEl("text", {
          x,
          y: height - 12,
          class: "svg-label",
          "text-anchor": "middle",
        })
      ).textContent = round(xValue, 1);
    }

    for (let index = 0; index <= 5; index += 1) {
      const yValue = yDomain[0] + ((yDomain[1] - yDomain[0]) * index) / 5;
      const y = yScale(yValue);
      svg.appendChild(
        svgEl("line", {
          x1: padding.left,
          y1: y,
          x2: width - padding.right,
          y2: y,
          class: "grid-line",
        })
      );
      svg.appendChild(
        svgEl("text", {
          x: 12,
          y: y + 4,
          class: "svg-label",
        })
      ).textContent = round(yValue, 1);
    }

    svg.appendChild(
      svgEl("line", {
        x1: padding.left,
        y1: height - padding.bottom,
        x2: width - padding.right,
        y2: height - padding.bottom,
        class: "axis-line",
      })
    );
    svg.appendChild(
      svgEl("line", {
        x1: padding.left,
        y1: padding.top,
        x2: padding.left,
        y2: height - padding.bottom,
        class: "axis-line",
      })
    );

    if (options.title) {
      svg.appendChild(
        svgEl("text", {
          x: padding.left,
          y: 18,
          class: "svg-title",
        })
      ).textContent = options.title;
    }

    return { width, height, padding, xScale, yScale, xInvert, yInvert, xDomain, yDomain };
  }


  /* ── Theme-aware chart colours ────────────────────────────────
     The SVG code cannot use CSS variables directly for attributes like
     `fill` set via setAttribute, so resolve them once per render. Cached
     per theme, and invalidated when the theme changes. */
  let paletteCache = null;
  let paletteTheme = null;

  function chart_colors() {
    const theme = document.documentElement.getAttribute("data-theme") || "light";
    if (paletteCache && paletteTheme === theme) return paletteCache;
    const styles = getComputedStyle(document.documentElement);
    const read = (name, fallback) => (styles.getPropertyValue(name) || fallback).trim();
    paletteCache = {
      a: read("--c-a", "#0d7a72"),
      b: read("--c-b", "#c2410c"),
      c: read("--c-c", "#2563a8"),
      d: read("--c-d", "#7c3aed"),
      neutral: read("--c-neutral", "#6d6457"),
      faint: read("--c-faint", "#c3ccd6"),
      danger: read("--c-danger", "#b42318"),
      ink: read("--c-ink", "#101720"),
      grid: read("--c-grid", "rgba(16,23,32,0.08)"),
      axis: read("--c-axis", "rgba(16,23,32,0.24)"),
      ring: read("--c-node-ring", "#ffffff"),
      onFill: read("--c-on-fill", "#ffffff"),
      plotBg: read("--c-plot-bg", "#f6f8fa"),
    };
    paletteTheme = theme;
    return paletteCache;
  }

  function invalidatePalette() {
    paletteCache = null;
  }

  /* Labs paint colours into SVG attributes, so a theme switch cannot be
     handled by CSS alone — the active lab re-registers its render here
     and gets called once the new palette is in place. */
  const redrawHandlers = [];

  function onRedraw(fn) {
    redrawHandlers.push(fn);
  }

  window.addEventListener("mls:themechange", () => {
    invalidatePalette();
    redrawHandlers.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        /* One failing lab must not stop the others repainting. */
      }
    });
  });

  /* Translucent fill derived from a palette colour, for region shading. */
  function tint(color, alpha) {
    const probe = document.createElement("div");
    probe.style.color = color;
    document.body.appendChild(probe);
    const rgb = getComputedStyle(probe).color.match(/\d+/g);
    probe.remove();
    if (!rgb) return color;
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
  }

  /* ── Math typesetting (KaTeX) ─────────────────────────────────
     tex() returns an HTML string so it can be embedded directly in the
     template literals the lab engines already use. If KaTeX has not
     loaded (offline, CDN blocked) it degrades to a <code> element so the
     formula is still readable. */
  function tex(latex, display = false) {
    if (window.katex) {
      try {
        return window.katex.renderToString(latex, {
          displayMode: display,
          throwOnError: false,
          /* htmlAndMathml (the default) emits a MathML copy alongside the
             visual markup. Screen readers use the MathML; dropping it
             leaves them reading the presentational spans as gibberish,
             which matters a lot on a site made of formulas. */
          output: "htmlAndMathml",
          strict: false,
        });
      } catch (error) {
        /* fall through to the plain-text fallback */
      }
    }
    const escaped = String(latex).replace(/[&<>]/g, (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch])
    );
    return `<code class="tex-fallback">${escaped}</code>`;
  }

  /* Render a number into LaTeX with a fixed precision, keeping negative
     numbers wrapped so they read correctly inside larger expressions. */
  function texNum(value, digits = 3) {
    if (!Number.isFinite(value)) return "\\text{n/a}";
    return Number(value).toFixed(digits);
  }

  /* ── Drag interaction for scatter plots ───────────────────────
     Makes an SVG node draggable in *data* space. onDrag receives the new
     clamped {x, y} in domain units on every pointer move. */
  function draggable(node, svg, chart, onDrag, onDone) {
    node.classList.add("draggable-point");
    node.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      const point = svg.createSVGPoint();
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const inverse = ctm.inverse();

      function toData(clientX, clientY) {
        point.x = clientX;
        point.y = clientY;
        const local = point.matrixTransform(inverse);
        return {
          x: clamp(chart.xInvert(local.x), chart.xDomain[0], chart.xDomain[1]),
          y: clamp(chart.yInvert(local.y), chart.yDomain[0], chart.yDomain[1]),
        };
      }

      function move(moveEvent) {
        onDrag(toData(moveEvent.clientX, moveEvent.clientY));
      }

      function up(upEvent) {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        if (onDone) onDone(toData(upEvent.clientX, upEvent.clientY));
      }

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    });
  }

  /* ── Editable data table ──────────────────────────────────────
     The single most important building block for "edit the input data".
     Every scatter-based lab feeds its dataset through one of these, so a
     learner can retype a coordinate, add an outlier, delete a point, or
     load a differently-shaped preset and watch the algorithm react.

     config = {
       columns: [{ key, label, type, step, min, max, options }],
       rows:    [ {...} ],
       presets: { label: rows },        optional
       minRows, maxRows,                optional
       newRow: () => ({...}),           optional, enables "add row"
       onChange: (rows) => void
     }
     Returns { getRows, setRows, refresh }. */
  function dataEditor(container, config) {
    const columns = config.columns;
    const minRows = config.minRows || 1;
    const maxRows = config.maxRows || 40;
    let rows = config.rows.map((row) => ({ ...row }));
    const initial = config.rows.map((row) => ({ ...row }));

    function emit() {
      if (config.onChange) config.onChange(getRows());
    }

    function getRows() {
      return rows.map((row) => ({ ...row }));
    }

    function cellMarkup(row, rowIndex, column) {
      const value = row[column.key];
      /* Each generated cell needs its own accessible name — a screen
         reader otherwise announces a wall of unlabelled "edit text". */
      const rowName = row[columns[0].key] ?? `row ${rowIndex + 1}`;
      const cellLabel = `${column.label} for ${rowName}`;

      if (column.type === "select") {
        return `<select aria-label="${cellLabel}" data-row="${rowIndex}" data-key="${column.key}">
          ${column.options
            .map(
              (option) =>
                `<option value="${option.value}" ${
                  String(option.value) === String(value) ? "selected" : ""
                }>${option.label}</option>`
            )
            .join("")}
        </select>`;
      }
      /* size="3" keeps the input's *intrinsic* width tiny so a fixed-layout
         table can shrink to its container; width:100% in CSS then makes it
         fill whatever column width it is actually given. Without this the
         browser's default input width (~150px) sets the table's min-content
         and the panel overflows. */
      if (column.type === "text") {
        return `<input type="text" size="3" aria-label="${cellLabel}" data-row="${rowIndex}" data-key="${column.key}" value="${value}" />`;
      }
      return `<input type="number" size="3" aria-label="${cellLabel}" data-row="${rowIndex}" data-key="${column.key}" value="${value}"
        step="${column.step ?? 0.1}" ${column.min !== undefined ? `min="${column.min}"` : ""}
        ${column.max !== undefined ? `max="${column.max}"` : ""} />`;
    }

    function render() {
      const canDelete = rows.length > minRows;
      const canAdd = config.newRow && rows.length < maxRows;
      container.innerHTML = `
        <div class="data-editor">
          <div class="data-editor-head">
            <h4>${config.title || "Input data"}</h4>
            <div class="data-editor-actions">
              ${
                config.presets
                  ? `<select class="preset-select" aria-label="Load a preset dataset">
                      <option value="">Load preset…</option>
                      ${Object.keys(config.presets)
                        .map((name) => `<option value="${name}">${name}</option>`)
                        .join("")}
                    </select>`
                  : ""
              }
              ${canAdd ? `<button type="button" class="mini-button add-row">+ Row</button>` : ""}
              <button type="button" class="mini-button reset-rows">Reset</button>
            </div>
          </div>
          <p class="data-editor-hint">${
            config.hint || "Edit any value, add or remove rows — every chart, formula and step below recomputes instantly."
          }</p>
          <div class="data-editor-scroll">
            <table>
              <thead>
                <tr>
                  ${columns.map((column) => `<th>${column.label}</th>`).join("")}
                  ${canDelete ? '<th class="del-cell"></th>' : ""}
                </tr>
              </thead>
              <tbody>
                ${rows
                  .map(
                    (row, rowIndex) => `
                      <tr>
                        ${columns.map((column) => `<td>${cellMarkup(row, rowIndex, column)}</td>`).join("")}
                        ${
                          canDelete
                            ? `<td class="del-cell"><button type="button" class="mini-button danger delete-row" data-row="${rowIndex}" aria-label="Delete row ${rowIndex + 1}">×</button></td>`
                            : ""
                        }
                      </tr>
                    `
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </div>
      `;

      qsa("input, select", container).forEach((field) => {
        if (field.classList.contains("preset-select")) return;
        const handler = () => {
          const rowIndex = Number(field.dataset.row);
          const key = field.dataset.key;
          const column = columns.find((entry) => entry.key === key);
          let value = field.value;
          if (!column || column.type === "number" || column.type === undefined) {
            value = Number(value);
            if (!Number.isFinite(value)) return;
            if (column && column.min !== undefined) value = Math.max(column.min, value);
            if (column && column.max !== undefined) value = Math.min(column.max, value);
          }
          rows[rowIndex][key] = value;
          emit();
        };
        field.addEventListener(field.tagName === "SELECT" ? "change" : "input", handler);
      });

      const presetSelect = qs(".preset-select", container);
      if (presetSelect) {
        presetSelect.addEventListener("change", () => {
          const preset = config.presets[presetSelect.value];
          if (!preset) return;
          rows = preset.map((row) => ({ ...row }));
          render();
          emit();
        });
      }

      const addButton = qs(".add-row", container);
      if (addButton) {
        addButton.addEventListener("click", () => {
          rows.push(config.newRow(rows));
          render();
          emit();
        });
      }

      qs(".reset-rows", container).addEventListener("click", () => {
        rows = initial.map((row) => ({ ...row }));
        render();
        emit();
      });

      qsa(".delete-row", container).forEach((button) => {
        button.addEventListener("click", () => {
          rows.splice(Number(button.dataset.row), 1);
          render();
          emit();
        });
      });
    }

    render();

    return {
      getRows,
      setRows(next, silent) {
        rows = next.map((row) => ({ ...row }));
        render();
        if (!silent) emit();
      },
      /* Update one cell without rebuilding the table. Used while a point
         is being dragged so the numbers track the cursor smoothly and
         the input the learner is looking at does not lose focus. */
      setCell(rowIndex, key, value) {
        if (!rows[rowIndex]) return;
        rows[rowIndex][key] = value;
        const field = qs(`[data-row="${rowIndex}"][data-key="${key}"]`, container);
        if (field) field.value = typeof value === "number" ? round(value, 2) : value;
      },
      indexOf(predicate) {
        return rows.findIndex(predicate);
      },
      refresh: render,
    };
  }

  /* Coalesce rapid calls (pointermove, range input) into one paint. */
  function rafThrottle(fn) {
    let queued = false;
    let lastArgs = null;
    return function throttled(...args) {
      lastArgs = args;
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => {
        queued = false;
        fn(...lastArgs);
      });
    };
  }

  /* ── Editable matrix ──────────────────────────────────────────
     Used by the graphical-model labs so learners can retype a full
     transition matrix, emission table or CPT instead of nudging a single
     scalar. rowStochastic re-normalises each row to sum to 1. */
  function matrixEditor(container, config) {
    let values = config.values.map((row) => [...row]);
    const initial = config.values.map((row) => [...row]);

    function normalized() {
      if (!config.rowStochastic) return values.map((row) => [...row]);
      return values.map((row) => {
        const total = row.reduce((acc, value) => acc + Math.max(value, 0), 0);
        if (total <= 0) return row.map(() => 1 / row.length);
        return row.map((value) => Math.max(value, 0) / total);
      });
    }

    function emit() {
      if (config.onChange) config.onChange(normalized(), values.map((row) => [...row]));
    }

    function render() {
      container.innerHTML = `
        <div class="matrix-editor">
          <div class="data-editor-head">
            <h4>${config.title}</h4>
            <button type="button" class="mini-button reset-matrix">Reset</button>
          </div>
          ${config.hint ? `<p class="data-editor-hint">${config.hint}</p>` : ""}
          <table>
            <thead>
              <tr>
                <th></th>
                ${config.colLabels.map((label) => `<th>${label}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${values
                .map(
                  (row, rowIndex) => `
                    <tr>
                      <th scope="row">${config.rowLabels[rowIndex]}</th>
                      ${row
                        .map(
                          (value, colIndex) => `
                            <td><input type="number" size="3"
                              aria-label="${config.rowLabels[rowIndex]} to ${config.colLabels[colIndex]}"
                              data-r="${rowIndex}" data-c="${colIndex}"
                              value="${round(value, 3)}" step="${config.step ?? 0.05}"
                              min="${config.min ?? 0}" ${config.max !== undefined ? `max="${config.max}"` : ""} /></td>
                          `
                        )
                        .join("")}
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
          ${
            config.rowStochastic
              ? `<p class="data-editor-hint subtle">Rows are re-normalised to sum to 1 automatically.</p>`
              : ""
          }
        </div>
      `;

      qsa("input", container).forEach((field) => {
        field.addEventListener("input", () => {
          const value = Number(field.value);
          if (!Number.isFinite(value)) return;
          values[Number(field.dataset.r)][Number(field.dataset.c)] = value;
          emit();
        });
      });

      qs(".reset-matrix", container).addEventListener("click", () => {
        values = initial.map((row) => [...row]);
        render();
        emit();
      });
    }

    render();

    return {
      get: normalized,
      getRaw: () => values.map((row) => [...row]),
      set(next, silent) {
        values = next.map((row) => [...row]);
        render();
        if (!silent) emit();
      },
    };
  }

  /* Convenience: render an array of labelled formula rows where each
     expression is LaTeX. Keeps the "formula, then the same formula with
     your numbers in it" pattern consistent across every lab. */
  function renderSubstitution(rows) {
    return `<div class="substitution">${rows
      .map(
        (row) => `
          <div class="substitution-row">
            <span class="substitution-label">${row.label}</span>
            <span class="substitution-expr">${tex(row.tex)}</span>
            ${row.value !== undefined ? `<span class="substitution-value">${row.value}</span>` : ""}
          </div>
          ${row.note ? `<p class="substitution-note">${row.note}</p>` : ""}
        `
      )
      .join("")}</div>`;
  }

  function pathFromPoints(points, xScale, yScale) {
    if (!points.length) {
      return "";
    }
    return points
      .map((point, index) => `${index ? "L" : "M"} ${xScale(point.x)} ${yScale(point.y)}`)
      .join(" ");
  }

  function distance(a, b, metric = "euclidean") {
    if (metric === "manhattan") {
      return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function argMax(values) {
    let bestIndex = 0;
    for (let index = 1; index < values.length; index += 1) {
      if (values[index] > values[bestIndex]) {
        bestIndex = index;
      }
    }
    return bestIndex;
  }

  function dot(a, b) {
    return a.reduce((total, value, index) => total + value * b[index], 0);
  }

  function addScaled(target, source, scale) {
    for (let index = 0; index < target.length; index += 1) {
      target[index] += source[index] * scale;
    }
  }

  function normalPosterior(samples, obsVariance, priorMean, priorVariance) {
    const precision = samples.length / obsVariance + 1 / priorVariance;
    const posteriorVariance = 1 / precision;
    const posteriorMean =
      posteriorVariance *
      (sum(samples) / obsVariance + priorMean / priorVariance);
    return { posteriorMean, posteriorVariance };
  }

  function renderMetrics(container, metrics) {
    /* Results change as the reader edits inputs; announce them politely
       rather than leaving the change silent. */
    if (!container.hasAttribute("aria-live")) {
      container.setAttribute("aria-live", "polite");
      container.setAttribute("aria-atomic", "false");
    }
    container.innerHTML = metrics
      .map(
        (metric) => `
          <div class="output">
            <span>${metric.label}</span>
            <strong>${metric.value}</strong>
          </div>
        `
      )
      .join("");
  }

  function renderSteps(container, steps, shownCount) {
    container.innerHTML = "";
    if (!steps.length) {
      const item = document.createElement("li");
      item.textContent = "No steps available.";
      container.appendChild(item);
      return;
    }
    if (shownCount <= 0) {
      const item = document.createElement("li");
      item.textContent = "Use the step button to reveal the algorithm logic.";
      container.appendChild(item);
      return;
    }
    steps.slice(0, shownCount).forEach((text, index) => {
      const item = document.createElement("li");
      if (index === shownCount - 1) {
        item.className = "current";
      }
      item.innerHTML = text;
      container.appendChild(item);
    });
  }

  function seededRandom(seed) {
    let state = seed >>> 0;
    return function next() {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function sampleNormal(rng, mu = 0, sigma = 1) {
    const u1 = Math.max(rng(), 1e-9);
    const u2 = Math.max(rng(), 1e-9);
    const mag = Math.sqrt(-2 * Math.log(u1));
    return mu + sigma * mag * Math.cos(2 * Math.PI * u2);
  }

  function inverse2x2(matrix) {
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    if (Math.abs(det) < 1e-8) {
      return [
        [1, 0],
        [0, 1],
      ];
    }
    return [
      [matrix[1][1] / det, -matrix[0][1] / det],
      [-matrix[1][0] / det, matrix[0][0] / det],
    ];
  }

  function matVec(matrix, vector) {
    return matrix.map((row) => dot(row, vector));
  }

  function jacobiEigen(matrix, maxIterations = 80) {
    const n = matrix.length;
    const a = matrix.map((row) => [...row]);
    const v = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );

    for (let iteration = 0; iteration < maxIterations; iteration += 1) {
      let p = 0;
      let q = 1;
      let maxValue = Math.abs(a[p][q]);

      for (let i = 0; i < n; i += 1) {
        for (let j = i + 1; j < n; j += 1) {
          if (Math.abs(a[i][j]) > maxValue) {
            maxValue = Math.abs(a[i][j]);
            p = i;
            q = j;
          }
        }
      }

      if (maxValue < 1e-9) {
        break;
      }

      const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t =
        Math.sign(theta || 1) /
        (Math.abs(theta) + Math.sqrt(theta * theta + 1));
      const c = 1 / Math.sqrt(1 + t * t);
      const s = t * c;

      const app = a[p][p];
      const aqq = a[q][q];
      const apq = a[p][q];

      a[p][p] = c * c * app - 2 * s * c * apq + s * s * aqq;
      a[q][q] = s * s * app + 2 * s * c * apq + c * c * aqq;
      a[p][q] = 0;
      a[q][p] = 0;

      for (let index = 0; index < n; index += 1) {
        if (index !== p && index !== q) {
          const aip = a[index][p];
          const aiq = a[index][q];
          a[index][p] = c * aip - s * aiq;
          a[p][index] = a[index][p];
          a[index][q] = s * aip + c * aiq;
          a[q][index] = a[index][q];
        }
      }

      for (let index = 0; index < n; index += 1) {
        const vip = v[index][p];
        const viq = v[index][q];
        v[index][p] = c * vip - s * viq;
        v[index][q] = s * vip + c * viq;
      }
    }

    const eigenvalues = Array.from({ length: matrix.length }, (_, index) => a[index][index]);
    const eigenvectors = Array.from({ length: matrix.length }, (_, index) =>
      v.map((row) => row[index])
    );
    return { eigenvalues, eigenvectors };
  }

  const currentPage = document.body.dataset.page;
  const pageToHref = {
    home: "index.html",
    introduction: "introduction.html",
    classification: "classification.html",
    "graphical-models": "graphical-models.html",
    clustering: "clustering.html",
  };

  qsa(".nav-links a").forEach((link) => {
    if (link.getAttribute("href").endsWith(pageToHref[currentPage])) {
      link.setAttribute("aria-current", "page");
    }
  });

  window.MLUtils = {
    addScaled,
    argMax,
    clamp,
    clear,
    dataEditor,
    distance,
    dot,
    draggable,
    gaussianPdf,
    inverse2x2,
    jacobiEigen,
    linspace,
    makeChart,
    matrixEditor,
    matVec,
    mean,
    median,
    normalPosterior,
    parseNumberList,
    chartColors: chart_colors,
    invalidatePalette,
    onRedraw,
    pathFromPoints,
    qsa,
    qs,
    rafThrottle,
    tint,
    renderMetrics,
    renderSteps,
    renderSubstitution,
    round,
    sampleNormal,
    seededRandom,
    sigmoid,
    sum,
    svgEl,
    tex,
    texNum,
    variance,
    viewBoxSize,
  };
})();
