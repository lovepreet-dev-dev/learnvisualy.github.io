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
    return Number(value).toFixed(digits).replace(/\.?0+$/, "");
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

    return { width, height, padding, xScale, yScale };
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
    distance,
    dot,
    gaussianPdf,
    inverse2x2,
    jacobiEigen,
    linspace,
    makeChart,
    matVec,
    mean,
    median,
    normalPosterior,
    parseNumberList,
    pathFromPoints,
    qsa,
    qs,
    renderMetrics,
    renderSteps,
    round,
    sampleNormal,
    seededRandom,
    sigmoid,
    sum,
    svgEl,
    variance,
    viewBoxSize,
  };
})();
