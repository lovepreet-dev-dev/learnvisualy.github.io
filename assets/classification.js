(function () {
  if (document.body.dataset.page !== "classification") {
    return;
  }

  const U = window.MLUtils;

  const knnPoints = [
    { id: "A1", x: 1.8, y: 7.2, label: "A", yClass: 1 },
    { id: "A2", x: 2.6, y: 6.4, label: "A", yClass: 1 },
    { id: "A3", x: 3.1, y: 8.0, label: "A", yClass: 1 },
    { id: "A4", x: 3.8, y: 6.9, label: "A", yClass: 1 },
    { id: "A5", x: 4.2, y: 5.8, label: "A", yClass: 1 },
    { id: "B1", x: 6.1, y: 3.8, label: "B", yClass: -1 },
    { id: "B2", x: 7.2, y: 2.8, label: "B", yClass: -1 },
    { id: "B3", x: 8.0, y: 4.3, label: "B", yClass: -1 },
    { id: "B4", x: 7.3, y: 5.2, label: "B", yClass: -1 },
    { id: "B5", x: 5.8, y: 2.4, label: "B", yClass: -1 },
  ];

  const treeClassificationData = [
    { id: "S1", hours: 1.2, attendance: 2.4, label: 0 },
    { id: "S2", hours: 2.0, attendance: 3.2, label: 0 },
    { id: "S3", hours: 2.4, attendance: 4.8, label: 0 },
    { id: "S4", hours: 3.0, attendance: 6.1, label: 1 },
    { id: "S5", hours: 4.1, attendance: 6.6, label: 1 },
    { id: "S6", hours: 4.8, attendance: 7.2, label: 1 },
    { id: "S7", hours: 3.5, attendance: 3.6, label: 0 },
    { id: "S8", hours: 5.4, attendance: 5.8, label: 1 },
    { id: "S9", hours: 2.8, attendance: 5.8, label: 1 },
    { id: "S10", hours: 4.2, attendance: 4.0, label: 1 },
  ];

  const treeRegressionData = [
    { id: "R1", hours: 1.0, score: 42 },
    { id: "R2", hours: 1.8, score: 47 },
    { id: "R3", hours: 2.4, score: 51 },
    { id: "R4", hours: 3.1, score: 60 },
    { id: "R5", hours: 4.0, score: 68 },
    { id: "R6", hours: 4.8, score: 75 },
    { id: "R7", hours: 5.6, score: 83 },
    { id: "R8", hours: 6.3, score: 89 },
  ];

  const linearDatasets = {
    separable: [
      { id: "P1", x: 2.0, y: 7.1, label: 1 },
      { id: "P2", x: 2.8, y: 6.4, label: 1 },
      { id: "P3", x: 3.6, y: 7.8, label: 1 },
      { id: "P4", x: 4.4, y: 6.2, label: 1 },
      { id: "N1", x: 6.2, y: 2.8, label: -1 },
      { id: "N2", x: 7.2, y: 3.6, label: -1 },
      { id: "N3", x: 7.7, y: 2.0, label: -1 },
      { id: "N4", x: 8.2, y: 4.2, label: -1 },
    ],
    overlap: [
      { id: "P1", x: 2.2, y: 6.4, label: 1 },
      { id: "P2", x: 3.3, y: 5.8, label: 1 },
      { id: "P3", x: 4.4, y: 5.2, label: 1 },
      { id: "P4", x: 5.0, y: 4.7, label: 1 },
      { id: "N1", x: 4.8, y: 5.0, label: -1 },
      { id: "N2", x: 5.8, y: 4.2, label: -1 },
      { id: "N3", x: 6.6, y: 3.4, label: -1 },
      { id: "N4", x: 6.1, y: 5.4, label: -1 },
    ],
    xor: [
      { id: "P1", x: 2.0, y: 2.0, label: 1 },
      { id: "P2", x: 7.8, y: 8.0, label: 1 },
      { id: "P3", x: 2.5, y: 1.4, label: 1 },
      { id: "P4", x: 8.3, y: 8.5, label: 1 },
      { id: "N1", x: 2.1, y: 8.0, label: -1 },
      { id: "N2", x: 8.0, y: 2.1, label: -1 },
      { id: "N3", x: 1.4, y: 7.2, label: -1 },
      { id: "N4", x: 7.4, y: 2.6, label: -1 },
    ],
  };

  function drawScatterPoints(plot, chart, points, highlightIds = new Set()) {
    points.forEach((point) => {
      plot.appendChild(
        U.svgEl("circle", {
          cx: chart.xScale(point.x),
          cy: chart.yScale(point.y),
          r: highlightIds.has(point.id) ? 9 : 7,
          class: point.label === "A" || point.label === 1 ? "point-a" : "point-b",
          opacity: highlightIds.has(point.id) ? "1" : "0.92",
        })
      );
      plot.appendChild(
        U.svgEl("text", {
          x: chart.xScale(point.x) + 10,
          y: chart.yScale(point.y) - 8,
          class: "svg-label",
        })
      ).textContent = point.id;
    });
  }

  function initKnnLab() {
    const kInput = U.qs("#knn-k");
    const metricInput = U.qs("#knn-metric");
    const queryXInput = U.qs("#knn-query-x");
    const queryYInput = U.qs("#knn-query-y");
    const stepButton = U.qs("#knn-step");
    const resetButton = U.qs("#knn-reset");
    const plot = U.qs("#knn-plot");
    const output = U.qs("#knn-output");
    const stepsNode = U.qs("#knn-steps");
    const table = U.qs("#knn-table");
    let revealed = 0;

    function render() {
      const k = Math.max(Number(kInput.value) || 3, 1);
      const metric = metricInput.value;
      const query = {
        id: "Q",
        x: Number(queryXInput.value) || 0,
        y: Number(queryYInput.value) || 0,
      };
      const sorted = knnPoints
        .map((point) => ({
          ...point,
          distance: U.distance(point, query, metric),
        }))
        .sort((a, b) => a.distance - b.distance);

      const shownNeighbours = Math.max(0, Math.min(k, revealed - 2));
      const visible = sorted.slice(0, shownNeighbours);
      const votes = visible.reduce(
        (acc, point) => {
          acc[point.label] += 1;
          return acc;
        },
        { A: 0, B: 0 }
      );
      const predicted =
        shownNeighbours < k
          ? "Pending"
          : votes.A === votes.B
          ? "Tie"
          : votes.A > votes.B
          ? "Class A"
          : "Class B";

      U.renderMetrics(output, [
        { label: "k", value: String(k) },
        { label: "Metric", value: metric },
        { label: "Visible vote", value: `${votes.A} : ${votes.B}` },
        { label: "Prediction", value: predicted },
      ]);

      const steps = [
        "<strong>Measure distance.</strong> Compare the query to every labeled example.",
        "<strong>Sort the neighbours.</strong> The closest points become the most relevant evidence.",
        ...sorted.slice(0, k).map(
          (point, index) =>
            `<strong>Neighbour ${index + 1}.</strong> ${point.id} belongs to class <strong>${
              point.label
            }</strong> and sits at distance <strong>${U.round(point.distance, 3)}</strong>.`
        ),
        `<strong>Take the vote.</strong> Among the first ${k} neighbours, the majority class is <strong>${predicted}</strong>.`,
      ];
      U.renderSteps(stepsNode, steps, revealed);

      table.innerHTML = sorted
        .map((point, index) => {
          const active = index < shownNeighbours;
          return `
            <tr style="background:${active ? "rgba(31,122,112,0.08)" : "transparent"}">
              <td>${index + 1}</td>
              <td>${point.id} (${U.round(point.x, 1)}, ${U.round(point.y, 1)})</td>
              <td>${point.label}</td>
              <td>${U.round(point.distance, 3)}</td>
            </tr>
          `;
        })
        .join("");

      const chart = U.makeChart(plot, {
        xDomain: [0, 10],
        yDomain: [0, 10],
        title: "Neighbourhood around the query point",
      });

      sorted.slice(0, shownNeighbours).forEach((point) => {
        plot.appendChild(
          U.svgEl("line", {
            x1: chart.xScale(query.x),
            y1: chart.yScale(query.y),
            x2: chart.xScale(point.x),
            y2: chart.yScale(point.y),
            stroke: "#2f4057",
            "stroke-width": "2",
            opacity: "0.55",
          })
        );
      });

      drawScatterPoints(plot, chart, knnPoints, new Set(visible.map((point) => point.id)));

      const qx = chart.xScale(query.x);
      const qy = chart.yScale(query.y);
      plot.appendChild(
        U.svgEl("polygon", {
          points: `${qx},${qy - 11} ${qx + 11},${qy} ${qx},${qy + 11} ${qx - 11},${qy}`,
          fill: "#2f4057",
        })
      );
      plot.appendChild(
        U.svgEl("text", {
          x: qx + 14,
          y: qy - 12,
          class: "svg-label",
        })
      ).textContent = "Query";
    }

    stepButton.addEventListener("click", () => {
      const k = Math.max(Number(kInput.value) || 3, 1);
      revealed = Math.min(revealed + 1, k + 3);
      render();
    });
    resetButton.addEventListener("click", () => {
      revealed = 0;
      render();
    });
    [kInput, metricInput, queryXInput, queryYInput].forEach((input) =>
      input.addEventListener("input", () => {
        revealed = 0;
        render();
      })
    );

    render();
  }

  function gini(rows) {
    if (!rows.length) {
      return 0;
    }
    const p = rows.filter((row) => row.label === 1).length / rows.length;
    return 1 - p * p - (1 - p) * (1 - p);
  }

  function mse(rows) {
    if (!rows.length) {
      return 0;
    }
    const meanValue = U.mean(rows.map((row) => row.score));
    return U.mean(rows.map((row) => (row.score - meanValue) ** 2));
  }

  function getCandidateSplits(rows, mode) {
    if (mode === "classification") {
      const features = ["hours", "attendance"];
      const parent = gini(rows);
      return features.flatMap((feature) => {
        const values = [...new Set(rows.map((row) => row[feature]).sort((a, b) => a - b))];
        return values.slice(0, -1).map((value, index) => {
          const threshold = 0.5 * (value + values[index + 1]);
          const left = rows.filter((row) => row[feature] <= threshold);
          const right = rows.filter((row) => row[feature] > threshold);
          const score =
            parent -
            (left.length / rows.length) * gini(left) -
            (right.length / rows.length) * gini(right);
          return { feature, threshold, score, left, right };
        });
      });
    }

    const values = [...new Set(rows.map((row) => row.hours).sort((a, b) => a - b))];
    const parent = mse(rows);
    return values.slice(0, -1).map((value, index) => {
      const threshold = 0.5 * (value + values[index + 1]);
      const left = rows.filter((row) => row.hours <= threshold);
      const right = rows.filter((row) => row.hours > threshold);
      const score =
        parent -
        (left.length / rows.length) * mse(left) -
        (right.length / rows.length) * mse(right);
      return { feature: "hours", threshold, score, left, right };
    });
  }

  function initTreeLab() {
    const modeInput = U.qs("#tree-mode");
    const depthInput = U.qs("#tree-depth");
    const stepButton = U.qs("#tree-step");
    const resetButton = U.qs("#tree-reset");
    const plot = U.qs("#tree-plot");
    const stepsNode = U.qs("#tree-steps");
    const summaryNode = U.qs("#tree-summary");
    const candidatesNode = U.qs("#tree-candidates");
    const explainerNode = U.qs("#tree-explainer");

    let state = null;

    function resetState() {
      const mode = modeInput.value;
      const rows =
        mode === "classification" ? treeClassificationData : treeRegressionData;
      state = {
        mode,
        leaves: [
          {
            id: "root",
            depth: 0,
            rows,
            region:
              mode === "classification"
                ? { xMin: 0.6, xMax: 6, yMin: 1.6, yMax: 7.8 }
                : { xMin: 0.5, xMax: 6.8 },
          },
        ],
        history: [],
      };
    }

    function nextSplit() {
      const maxDepth = Math.max(Number(depthInput.value) || 2, 1);
      const candidatesByLeaf = state.leaves
        .filter((leaf) => leaf.depth < maxDepth)
        .map((leaf) => {
          const candidates = getCandidateSplits(leaf.rows, state.mode).sort(
            (a, b) => b.score - a.score
          );
          return { leaf, candidates, best: candidates[0] };
        })
        .filter((entry) => entry.best && entry.best.score > 1e-6);

      if (!candidatesByLeaf.length) {
        return;
      }

      const choice = candidatesByLeaf.sort((a, b) => b.best.score - a.best.score)[0];
      const { leaf, best } = choice;
      const leftRegion =
        state.mode === "classification"
          ? best.feature === "hours"
            ? {
                xMin: leaf.region.xMin,
                xMax: best.threshold,
                yMin: leaf.region.yMin,
                yMax: leaf.region.yMax,
              }
            : {
                xMin: leaf.region.xMin,
                xMax: leaf.region.xMax,
                yMin: leaf.region.yMin,
                yMax: best.threshold,
              }
          : { xMin: leaf.region.xMin, xMax: best.threshold };
      const rightRegion =
        state.mode === "classification"
          ? best.feature === "hours"
            ? {
                xMin: best.threshold,
                xMax: leaf.region.xMax,
                yMin: leaf.region.yMin,
                yMax: leaf.region.yMax,
              }
            : {
                xMin: leaf.region.xMin,
                xMax: leaf.region.xMax,
                yMin: best.threshold,
                yMax: leaf.region.yMax,
              }
          : { xMin: best.threshold, xMax: leaf.region.xMax };

      state.leaves = state.leaves
        .filter((entry) => entry.id !== leaf.id)
        .concat([
          {
            id: `${leaf.id}L`,
            depth: leaf.depth + 1,
            rows: best.left,
            region: leftRegion,
          },
          {
            id: `${leaf.id}R`,
            depth: leaf.depth + 1,
            rows: best.right,
            region: rightRegion,
          },
        ]);
      state.history.push({
        feature: best.feature,
        threshold: best.threshold,
        score: best.score,
        depth: leaf.depth,
        region: leaf.region,
      });
    }

    function render() {
      if (!state || state.mode !== modeInput.value) {
        resetState();
      }

      const maxDepth = Math.max(Number(depthInput.value) || 2, 1);
      const nextCandidates = state.leaves
        .filter((leaf) => leaf.depth < maxDepth)
        .flatMap((leaf) =>
          getCandidateSplits(leaf.rows, state.mode).map((candidate) => ({
            leafId: leaf.id,
            ...candidate,
          }))
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      candidatesNode.innerHTML = nextCandidates
        .map(
          (candidate) => `
            <tr>
              <td>${candidate.feature}</td>
              <td>${U.round(candidate.threshold, 2)}</td>
              <td>${U.round(candidate.score, 3)}</td>
              <td>Split leaf ${candidate.leafId} into ${candidate.left.length} / ${candidate.right.length}</td>
            </tr>
          `
        )
        .join("");

      const stepLines = state.history.map(
        (entry, index) =>
          `<strong>Split ${index + 1}.</strong> Use <span class="mono">${entry.feature} ≤ ${U.round(
            entry.threshold,
            2
          )}</span> at depth ${entry.depth} because it improves the tree score by <strong>${U.round(
            entry.score,
            3
          )}</strong>.`
      );
      U.renderSteps(stepsNode, stepLines, state.history.length);

      explainerNode.innerHTML = nextCandidates.length
        ? `The next best split is <strong>${nextCandidates[0].feature} ≤ ${U.round(
            nextCandidates[0].threshold,
            2
          )}</strong>, which yields score gain <strong>${U.round(
            nextCandidates[0].score,
            3
          )}</strong>.`
        : "No additional split improves the objective at the selected depth.";

      summaryNode.innerHTML = `
        <h3>Current leaves</h3>
        <ul>
          ${state.leaves
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((leaf) => {
              if (state.mode === "classification") {
                const positive = leaf.rows.filter((row) => row.label === 1).length;
                const negative = leaf.rows.length - positive;
                const prediction = positive >= negative ? "Pass" : "Fail";
                return `<li>${leaf.id}: predict <strong>${prediction}</strong> from ${leaf.rows.length} rows (${positive}/${negative}).</li>`;
              }
              const prediction = U.mean(leaf.rows.map((row) => row.score));
              return `<li>${leaf.id}: predict score <strong>${U.round(
                prediction,
                1
              )}</strong> on hours in [${U.round(leaf.region.xMin, 1)}, ${U.round(
                leaf.region.xMax,
                1
              )}].</li>`;
            })
            .join("")}
        </ul>
      `;

      if (state.mode === "classification") {
        const chart = U.makeChart(plot, {
          xDomain: [0.8, 5.8],
          yDomain: [1.8, 7.6],
          title: "Classification tree over study hours and attendance",
        });

        treeClassificationData.forEach((row) => {
          plot.appendChild(
            U.svgEl("circle", {
              cx: chart.xScale(row.hours),
              cy: chart.yScale(row.attendance),
              r: 8,
              class: row.label ? "point-a" : "point-b",
            })
          );
          plot.appendChild(
            U.svgEl("text", {
              x: chart.xScale(row.hours) + 10,
              y: chart.yScale(row.attendance) - 9,
              class: "svg-label",
            })
          ).textContent = row.id;
        });

        state.history.forEach((entry) => {
          if (entry.feature === "hours") {
            plot.appendChild(
              U.svgEl("line", {
                x1: chart.xScale(entry.threshold),
                y1: chart.yScale(entry.region.yMin),
                x2: chart.xScale(entry.threshold),
                y2: chart.yScale(entry.region.yMax),
                class: "cluster-line",
              })
            );
          } else {
            plot.appendChild(
              U.svgEl("line", {
                x1: chart.xScale(entry.region.xMin),
                y1: chart.yScale(entry.threshold),
                x2: chart.xScale(entry.region.xMax),
                y2: chart.yScale(entry.threshold),
                class: "cluster-line",
              })
            );
          }
        });
      } else {
        const chart = U.makeChart(plot, {
          xDomain: [0.6, 6.8],
          yDomain: [38, 94],
          title: "Regression tree with piecewise-constant predictions",
        });

        treeRegressionData.forEach((row) => {
          plot.appendChild(
            U.svgEl("circle", {
              cx: chart.xScale(row.hours),
              cy: chart.yScale(row.score),
              r: 7,
              class: "point-neutral",
            })
          );
          plot.appendChild(
            U.svgEl("text", {
              x: chart.xScale(row.hours) + 8,
              y: chart.yScale(row.score) - 10,
              class: "svg-label",
            })
          ).textContent = row.id;
        });

        state.history.forEach((entry) => {
          plot.appendChild(
            U.svgEl("line", {
              x1: chart.xScale(entry.threshold),
              y1: chart.yScale(38),
              x2: chart.xScale(entry.threshold),
              y2: chart.yScale(94),
              class: "cluster-line",
            })
          );
        });

        state.leaves.forEach((leaf) => {
          const prediction = U.mean(leaf.rows.map((row) => row.score));
          plot.appendChild(
            U.svgEl("line", {
              x1: chart.xScale(leaf.region.xMin),
              y1: chart.yScale(prediction),
              x2: chart.xScale(leaf.region.xMax),
              y2: chart.yScale(prediction),
              stroke: "#1f7a70",
              "stroke-width": "4",
            })
          );
        });
      }
    }

    stepButton.addEventListener("click", () => {
      nextSplit();
      render();
    });
    resetButton.addEventListener("click", () => {
      resetState();
      render();
    });
    [modeInput, depthInput].forEach((input) =>
      input.addEventListener("input", () => {
        resetState();
        render();
      })
    );

    resetState();
    render();
  }

  function initLinearLab() {
    const algorithmInput = U.qs("#linear-algorithm");
    const datasetInput = U.qs("#linear-dataset");
    const featureMapInput = U.qs("#feature-map");
    const stepButton = U.qs("#linear-step");
    const resetButton = U.qs("#linear-reset");
    const callout = U.qs("#linear-callout");
    const output = U.qs("#linear-output");
    const stepsNode = U.qs("#linear-steps");
    const kernelPanel = U.qs("#kernel-panel");
    const plot = U.qs("#linear-plot");

    const rbfCenters = [
      { x: 2, y: 2 },
      { x: 2, y: 8 },
      { x: 8, y: 2 },
      { x: 8, y: 8 },
    ];

    let state = null;

    function dataset() {
      return linearDatasets[datasetInput.value];
    }

    function featureVector(point) {
      if (featureMapInput.value === "rbf" && algorithmInput.value !== "lda") {
        const gamma = 0.18;
        return [
          1,
          ...rbfCenters.map((center) =>
            Math.exp(-gamma * ((point.x - center.x) ** 2 + (point.y - center.y) ** 2))
          ),
        ];
      }
      return [1, point.x, point.y];
    }

    function scorePoint(point, params) {
      if (algorithmInput.value === "lda") {
        return params.b + params.w[0] * point.x + params.w[1] * point.y;
      }
      return U.dot(params.weights, featureVector(point));
    }

    function computeLDA(rows) {
      const positives = rows.filter((row) => row.label === 1);
      const negatives = rows.filter((row) => row.label === -1);
      const mu1 = [U.mean(positives.map((row) => row.x)), U.mean(positives.map((row) => row.y))];
      const mu0 = [U.mean(negatives.map((row) => row.x)), U.mean(negatives.map((row) => row.y))];
      const covariance = [
        [0, 0],
        [0, 0],
      ];
      rows.forEach((row) => {
        const meanVec = row.label === 1 ? mu1 : mu0;
        const diff = [row.x - meanVec[0], row.y - meanVec[1]];
        covariance[0][0] += diff[0] * diff[0];
        covariance[0][1] += diff[0] * diff[1];
        covariance[1][0] += diff[1] * diff[0];
        covariance[1][1] += diff[1] * diff[1];
      });
      covariance[0][0] /= rows.length - 2;
      covariance[0][1] /= rows.length - 2;
      covariance[1][0] /= rows.length - 2;
      covariance[1][1] /= rows.length - 2;

      const inverse = U.inverse2x2(covariance);
      const diff = [mu1[0] - mu0[0], mu1[1] - mu0[1]];
      const w = U.matVec(inverse, diff);
      const quad1 = 0.5 * (mu1[0] * w[0] + mu1[1] * w[1]);
      const quad0 =
        0.5 *
        (mu0[0] * (inverse[0][0] * mu0[0] + inverse[0][1] * mu0[1]) +
          mu0[1] * (inverse[1][0] * mu0[0] + inverse[1][1] * mu0[1]));
      const quad1Exact =
        0.5 *
        (mu1[0] * (inverse[0][0] * mu1[0] + inverse[0][1] * mu1[1]) +
          mu1[1] * (inverse[1][0] * mu1[0] + inverse[1][1] * mu1[1]));
      const prior = Math.log(positives.length / negatives.length);
      const b = -quad1Exact + quad0 + prior;
      return { w, b, mu1, mu0, covariance };
    }

    function resetState() {
      state = {
        weights: Array(featureVector({ x: 0, y: 0 }).length).fill(0),
        step: 0,
        sampleIndex: 0,
        history: [],
        lastId: null,
      };
    }

    function trainingAccuracy(params) {
      const rows = dataset();
      let correct = 0;
      rows.forEach((row) => {
        const prediction = scorePoint(row, params) >= 0 ? 1 : -1;
        if (prediction === row.label) {
          correct += 1;
        }
      });
      return correct / rows.length;
    }

    function takeStep() {
      const algorithm = algorithmInput.value;
      const rows = dataset();
      if (algorithm === "lda") {
        state.step = Math.min(state.step + 1, 3);
        return;
      }

      const row = rows[state.sampleIndex % rows.length];
      const x = featureVector(row);
      const y = row.label;
      const score = U.dot(state.weights, x);

      if (algorithm === "perceptron") {
        if (y * score <= 0) {
          U.addScaled(state.weights, x, 0.35 * y);
          state.history.push(
            `Perceptron update on <strong>${row.id}</strong>: the point was misclassified, so move the boundary toward class ${y === 1 ? "positive" : "negative"}.`
          );
        } else {
          state.history.push(
            `Perceptron check on <strong>${row.id}</strong>: margin is already correct, so no update is needed.`
          );
        }
      } else if (algorithm === "logistic") {
        const target = y === 1 ? 1 : 0;
        const probability = U.sigmoid(score);
        U.addScaled(state.weights, x, 0.28 * (target - probability));
        state.history.push(
          `Logistic step on <strong>${row.id}</strong>: predicted probability ${U.round(
            probability,
            3
          )}, then adjusted weights to reduce log-loss.`
        );
      } else if (algorithm === "svm") {
        const margin = y * score;
        const learningRate = 0.2;
        const lambda = 0.04;
        state.weights = state.weights.map((weight, index) =>
          index === 0 ? weight : weight * (1 - learningRate * lambda)
        );
        if (margin < 1) {
          U.addScaled(state.weights, x, learningRate * y);
          state.history.push(
            `Margin step on <strong>${row.id}</strong>: margin ${U.round(
              margin,
              3
            )} is below 1, so the SVM-style update pushes the separator away from the point.`
          );
        } else {
          state.history.push(
            `Margin step on <strong>${row.id}</strong>: margin ${U.round(
              margin,
              3
            )} is sufficient, so the update mostly regularizes the weights.`
          );
        }
      }

      state.sampleIndex += 1;
      state.step += 1;
      state.lastId = row.id;
      if (state.history.length > 8) {
        state.history = state.history.slice(-8);
      }
    }

    function render() {
      const rows = dataset();
      const algorithm = algorithmInput.value;
      if (!state || state.weights.length !== featureVector({ x: 0, y: 0 }).length) {
        resetState();
      }

      const ldaParams = algorithm === "lda" ? computeLDA(rows) : null;
      const params = algorithm === "lda" ? ldaParams : state;
      const accuracy = trainingAccuracy(params);
      const scores = rows.map((row) => scorePoint(row, params));
      const averageMargin = U.mean(rows.map((row, index) => row.label * scores[index]));
      const weightNorm =
        algorithm === "lda"
          ? Math.hypot(ldaParams.w[0], ldaParams.w[1])
          : Math.sqrt(state.weights.reduce((total, value) => total + value * value, 0));

      U.renderMetrics(output, [
        { label: "Steps", value: String(state.step) },
        { label: "Accuracy", value: `${Math.round(accuracy * 100)}%` },
        { label: "Weight norm", value: U.round(weightNorm, 3) },
        { label: "Avg. margin", value: U.round(averageMargin, 3) },
      ]);

      if (algorithm === "lda") {
        const ldaSteps = [
          `<strong>Estimate class means.</strong> Positive mean is (${U.round(
            ldaParams.mu1[0],
            2
          )}, ${U.round(ldaParams.mu1[1], 2)}), negative mean is (${U.round(
            ldaParams.mu0[0],
            2
          )}, ${U.round(ldaParams.mu0[1], 2)}).`,
          `<strong>Pool the covariance.</strong> LDA assumes both classes share the same covariance matrix, so it estimates one common shape for both clouds.`,
          `<strong>Build the discriminant.</strong> The boundary uses <span class="mono">Σ⁻¹(μ₁ - μ₀)</span> and class priors to form a linear separator.`,
        ];
        U.renderSteps(stepsNode, ldaSteps, state.step);
      } else {
        U.renderSteps(stepsNode, state.history, state.history.length);
      }

      const usesKernel = featureMapInput.value === "rbf" && algorithm !== "lda";
      callout.innerHTML =
        algorithm === "lda"
          ? "LDA is a generative classifier: it models each class distribution and derives the boundary from those class statistics."
          : usesKernel
          ? "The radial-basis feature lift approximates kernel methods by comparing each point to anchor prototypes before fitting a linear separator in the transformed space."
          : algorithm === "logistic"
          ? "Logistic regression is probabilistic and optimizes log-loss, so every step moves probabilities rather than just correcting mistakes."
          : algorithm === "perceptron"
          ? "The perceptron only reacts to mistakes. If the point is already on the correct side, the weights stay unchanged."
          : "Large-margin learning prefers not only correct separation, but a safety margin around the boundary.";

      kernelPanel.innerHTML = `
        <h3>Representation</h3>
        <p>${
          usesKernel
            ? `Feature space has ${featureVector({ x: 0, y: 0 }).length} dimensions. Each extra feature measures similarity to an anchor at ${rbfCenters
                .map((center) => `(${center.x}, ${center.y})`)
                .join(", ")}.`
            : "The model sees the original x and y coordinates directly, so the separator is linear in the input space."
        }</p>
        <p class="caption">${
          datasetInput.value === "xor" && !usesKernel
            ? "The XOR dataset is intentionally hard for plain linear separators."
            : datasetInput.value === "xor" && usesKernel
            ? "With a nonlinear lift, the XOR points become easier to separate."
            : "Switch datasets to compare stable and unstable boundaries."
        }</p>
      `;

      const chart = U.makeChart(plot, {
        xDomain: [0, 10],
        yDomain: [0, 10],
        title: "Decision regions and training examples",
      });

      for (let gx = 0; gx < 18; gx += 1) {
        for (let gy = 0; gy < 12; gy += 1) {
          const x = 0.4 + (gx / 17) * 9.2;
          const y = 0.4 + (gy / 11) * 9.2;
          const score = scorePoint({ x, y }, params);
          const fill =
            score >= 0
              ? `rgba(31,122,112,${0.08 + Math.min(Math.abs(score) / 6, 0.22)})`
              : `rgba(210,111,47,${0.08 + Math.min(Math.abs(score) / 6, 0.22)})`;
          const x1 = chart.xScale(x - 0.28);
          const y1 = chart.yScale(y + 0.42);
          const x2 = chart.xScale(x + 0.28);
          const y2 = chart.yScale(y - 0.42);
          plot.appendChild(
            U.svgEl("rect", {
              x: Math.min(x1, x2),
              y: Math.min(y1, y2),
              width: Math.abs(x2 - x1),
              height: Math.abs(y2 - y1),
              fill,
            })
          );
        }
      }

      if (!usesKernel) {
        const line =
          algorithm === "lda"
            ? { w: ldaParams.w, b: ldaParams.b }
            : state.weights.length === 3
            ? { w: [state.weights[1], state.weights[2]], b: state.weights[0] }
            : null;
        if (line && Math.abs(line.w[1]) > 1e-6) {
          const x1 = 0.5;
          const y1 = -(line.b + line.w[0] * x1) / line.w[1];
          const x2 = 9.5;
          const y2 = -(line.b + line.w[0] * x2) / line.w[1];
          plot.appendChild(
            U.svgEl("line", {
              x1: chart.xScale(x1),
              y1: chart.yScale(y1),
              x2: chart.xScale(x2),
              y2: chart.yScale(y2),
              class: "decision-line",
            })
          );
        }
      }

      rows.forEach((row) => {
        plot.appendChild(
          U.svgEl("circle", {
            cx: chart.xScale(row.x),
            cy: chart.yScale(row.y),
            r: state.lastId === row.id ? 10 : 7.5,
            class: row.label === 1 ? "point-a" : "point-b",
            opacity: state.lastId === row.id ? "1" : "0.94",
          })
        );
        plot.appendChild(
          U.svgEl("text", {
            x: chart.xScale(row.x) + 10,
            y: chart.yScale(row.y) - 10,
            class: "svg-label",
          })
        ).textContent = row.id;
      });
    }

    stepButton.addEventListener("click", () => {
      takeStep();
      render();
    });
    resetButton.addEventListener("click", () => {
      resetState();
      render();
    });
    [algorithmInput, datasetInput, featureMapInput].forEach((input) =>
      input.addEventListener("input", () => {
        resetState();
        render();
      })
    );

    resetState();
    render();
  }

  initKnnLab();
  initTreeLab();
  initLinearLab();
})();
