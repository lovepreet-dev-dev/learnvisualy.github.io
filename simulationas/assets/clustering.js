(function () {
  if (document.body.dataset.page !== "clustering") {
    return;
  }

  const U = window.MLUtils;
  const clusterPalette = ["#1f7a70", "#d26f2f", "#2f4057", "#7a5c35"];

  const partitionPoints = [
    { id: "P1", x: 1.4, y: 2.0 },
    { id: "P2", x: 2.0, y: 1.6 },
    { id: "P3", x: 2.4, y: 2.6 },
    { id: "P4", x: 3.1, y: 7.0 },
    { id: "P5", x: 3.6, y: 7.8 },
    { id: "P6", x: 4.2, y: 6.4 },
    { id: "P7", x: 6.5, y: 3.8 },
    { id: "P8", x: 7.2, y: 4.5 },
    { id: "P9", x: 7.8, y: 3.0 },
    { id: "P10", x: 8.5, y: 7.6 },
    { id: "P11", x: 8.9, y: 6.8 },
    { id: "P12", x: 8.0, y: 8.3 },
  ];

  const hierarchicalPoints = [
    { id: "A", x: 1.2, y: 2.0 },
    { id: "B", x: 1.9, y: 2.8 },
    { id: "C", x: 3.8, y: 7.0 },
    { id: "D", x: 4.5, y: 7.5 },
    { id: "E", x: 7.0, y: 3.0 },
    { id: "F", x: 7.8, y: 3.7 },
  ];

  const dbscanPoints = [
    { id: "A", x: 1.4, y: 2.0 },
    { id: "B", x: 1.8, y: 2.7 },
    { id: "C", x: 2.4, y: 1.8 },
    { id: "D", x: 2.6, y: 2.5 },
    { id: "E", x: 5.1, y: 6.0 },
    { id: "F", x: 5.6, y: 6.6 },
    { id: "G", x: 6.2, y: 6.1 },
    { id: "H", x: 6.4, y: 5.5 },
    { id: "I", x: 8.3, y: 2.0 },
    { id: "J", x: 8.9, y: 2.6 },
    { id: "K", x: 9.2, y: 1.7 },
    { id: "L", x: 4.2, y: 1.4 },
    { id: "M", x: 7.5, y: 8.1 },
  ];

  const spectralPoints = [
    { id: "S1", x: 1.5, y: 4.0 },
    { id: "S2", x: 2.3, y: 5.0 },
    { id: "S3", x: 3.3, y: 5.4 },
    { id: "S4", x: 4.1, y: 4.7 },
    { id: "S5", x: 5.8, y: 3.2 },
    { id: "S6", x: 6.7, y: 3.7 },
    { id: "S7", x: 7.4, y: 4.6 },
    { id: "S8", x: 6.1, y: 5.3 },
  ];

  function drawPoint(plot, chart, point, color, radius = 7, labelOffset = [9, -9]) {
    plot.appendChild(
      U.svgEl("circle", {
        cx: chart.xScale(point.x),
        cy: chart.yScale(point.y),
        r: radius,
        fill: color,
        opacity: "0.92",
      })
    );
    plot.appendChild(
      U.svgEl("text", {
        x: chart.xScale(point.x) + labelOffset[0],
        y: chart.yScale(point.y) + labelOffset[1],
        class: "svg-label",
      })
    ).textContent = point.id;
  }

  function initPartitionLab() {
    const methodInput = U.qs("#partition-method");
    const kInput = U.qs("#partition-k");
    const metricInput = U.qs("#partition-metric");
    const stepButton = U.qs("#partition-step");
    const resetButton = U.qs("#partition-reset");
    const callout = U.qs("#partition-callout");
    const plot = U.qs("#partition-plot");
    const output = U.qs("#partition-output");
    const stepsNode = U.qs("#partition-steps");

    let state = null;

    function seedRepresentatives(k) {
      const seedOrder = [0, 4, 8, 11];
      return seedOrder.slice(0, k).map((index) => ({ ...partitionPoints[index] }));
    }

    function resetState() {
      const k = Math.max(Number(kInput.value) || 3, 2);
      state = {
        phase: "assign",
        assignments: Array(partitionPoints.length).fill(-1),
        reps: seedRepresentatives(k),
        history: [],
        step: 0,
      };
    }

    function objective(metric, reps, assignments) {
      return partitionPoints.reduce((acc, point, index) => {
        const cluster = assignments[index];
        if (cluster < 0 || !reps[cluster]) {
          return acc;
        }
        return acc + U.distance(point, reps[cluster], metric);
      }, 0);
    }

    function stepPartition() {
      const method = methodInput.value;
      const metric = metricInput.value;
      if (state.phase === "assign") {
        const nextAssignments = partitionPoints.map((point) => {
          const distances = state.reps.map((rep) => U.distance(point, rep, metric));
          return U.argMax(distances.map((value) => -value));
        });
        const changed = nextAssignments.filter((value, index) => value !== state.assignments[index]).length;
        state.assignments = nextAssignments;
        state.phase = "update";
        state.step += 1;
        state.history.push(
          `Assignment step ${state.step}: each point joins the closest representative. <strong>${changed}</strong> memberships changed.`
        );
      } else {
        const grouped = state.reps.map((_, clusterIndex) =>
          partitionPoints.filter((_, pointIndex) => state.assignments[pointIndex] === clusterIndex)
        );
        const metric = metricInput.value;
        const nextReps = grouped.map((clusterPoints, clusterIndex) => {
          if (!clusterPoints.length) {
            return state.reps[clusterIndex];
          }
          if (method === "kmeans") {
            return {
              id: `C${clusterIndex + 1}`,
              x: U.mean(clusterPoints.map((point) => point.x)),
              y: U.mean(clusterPoints.map((point) => point.y)),
            };
          }
          return clusterPoints
            .map((candidate) => ({
              candidate,
              cost: clusterPoints.reduce(
                (acc, point) => acc + U.distance(candidate, point, metric),
                0
              ),
            }))
            .sort((a, b) => a.cost - b.cost)[0].candidate;
        });
        const move = nextReps.reduce(
          (acc, rep, index) => acc + U.distance(rep, state.reps[index], "euclidean"),
          0
        );
        state.reps = nextReps;
        state.phase = "assign";
        state.history.push(
          `${
            method === "kmeans" ? "Centroid" : "Medoid"
          } update ${state.step}: representatives moved by total distance <strong>${U.round(
            move,
            3
          )}</strong>.`
        );
      }
    }

    function render() {
      if (!state || state.reps.length !== Math.max(Number(kInput.value) || 3, 2)) {
        resetState();
      }

      const method = methodInput.value;
      const metric = metricInput.value;
      const objectiveValue = objective(metric, state.reps, state.assignments);
      const occupiedClusters = new Set(state.assignments.filter((value) => value >= 0));

      U.renderMetrics(output, [
        { label: "Phase", value: state.phase },
        { label: "Objective", value: U.round(objectiveValue, 3) },
        { label: "Clusters used", value: String(occupiedClusters.size || state.reps.length) },
        { label: "Representatives", value: method === "kmeans" ? "centroids" : "medoids" },
      ]);
      U.renderSteps(stepsNode, state.history, state.history.length);

      callout.innerHTML =
        method === "kmeans"
          ? "K-means updates the representative to the arithmetic mean of each cluster."
          : "K-medoids restricts the representative to an actual data point, which makes it less sensitive to outliers.";

      const chart = U.makeChart(plot, {
        xDomain: [0, 10],
        yDomain: [0, 10],
        title: "Partition-based clustering loop",
      });

      partitionPoints.forEach((point, index) => {
        const cluster = state.assignments[index];
        const color = cluster >= 0 ? clusterPalette[cluster % clusterPalette.length] : "#6d6457";
        drawPoint(plot, chart, point, color);
      });

      state.reps.forEach((rep, index) => {
        const x = chart.xScale(rep.x);
        const y = chart.yScale(rep.y);
        plot.appendChild(
          U.svgEl("polygon", {
            points: `${x},${y - 12} ${x + 12},${y} ${x},${y + 12} ${x - 12},${y}`,
            fill: clusterPalette[index % clusterPalette.length],
            stroke: "#fff",
            "stroke-width": "2.5",
          })
        );
      });
    }

    stepButton.addEventListener("click", () => {
      stepPartition();
      render();
    });
    resetButton.addEventListener("click", () => {
      resetState();
      render();
    });
    [methodInput, kInput, metricInput].forEach((input) =>
      input.addEventListener("input", () => {
        resetState();
        render();
      })
    );

    resetState();
    render();
  }

  function clusterDistance(clusterA, clusterB, linkage) {
    const distances = clusterA.members.flatMap((a) =>
      clusterB.members.map((b) => U.distance(a, b, "euclidean"))
    );
    if (linkage === "single") {
      return Math.min(...distances);
    }
    if (linkage === "complete") {
      return Math.max(...distances);
    }
    return U.mean(distances);
  }

  function initHierarchicalLab() {
    const linkageInput = U.qs("#hier-linkage");
    const stepButton = U.qs("#hier-step");
    const resetButton = U.qs("#hier-reset");
    const callout = U.qs("#hier-callout");
    const scatterPlot = U.qs("#hier-plot");
    const dendrogramPlot = U.qs("#dendrogram-plot");
    const stepsNode = U.qs("#hier-steps");
    let state = null;

    function resetState() {
      state = {
        clusters: hierarchicalPoints.map((point) => ({
          id: point.id,
          members: [point],
        })),
        history: [],
        nextId: 1,
      };
    }

    function takeMerge() {
      const linkage = linkageInput.value;
      if (state.clusters.length <= 1) {
        return;
      }
      let best = null;
      for (let i = 0; i < state.clusters.length; i += 1) {
        for (let j = i + 1; j < state.clusters.length; j += 1) {
          const distance = clusterDistance(state.clusters[i], state.clusters[j], linkage);
          if (!best || distance < best.distance) {
            best = { i, j, distance };
          }
        }
      }
      const left = state.clusters[best.i];
      const right = state.clusters[best.j];
      const merged = {
        id: `M${state.nextId}`,
        members: [...left.members, ...right.members],
      };
      state.nextId += 1;
      state.history.push({
        id: merged.id,
        left: left.id,
        right: right.id,
        members: merged.members.map((point) => point.id),
        distance: best.distance,
      });
      state.clusters = state.clusters.filter((_, index) => index !== best.i && index !== best.j);
      state.clusters.push(merged);
    }

    function renderDendrogram() {
      U.clear(dendrogramPlot);
      const { width, height } = U.viewBoxSize(dendrogramPlot);
      const margin = { left: 40, right: 30, top: 26, bottom: 28 };
      const baseY = height - margin.bottom;
      const leafOrder = hierarchicalPoints.map((point) => point.id);
      const xPositions = {};
      leafOrder.forEach((label, index) => {
        xPositions[label] =
          margin.left + (index / (leafOrder.length - 1)) * (width - margin.left - margin.right);
      });
      const maxDistance = Math.max(...state.history.map((entry) => entry.distance), 1);
      const nodeInfo = {};

      leafOrder.forEach((label) => {
        nodeInfo[label] = { x: xPositions[label], y: baseY };
        dendrogramPlot.appendChild(
          U.svgEl("text", {
            x: xPositions[label],
            y: height - 8,
            class: "svg-label",
            "text-anchor": "middle",
          })
        ).textContent = label;
      });

      state.history.forEach((entry) => {
        const left = nodeInfo[entry.left];
        const right = nodeInfo[entry.right];
        const y =
          baseY - (entry.distance / maxDistance) * (height - margin.top - margin.bottom - 24);
        const x = 0.5 * (left.x + right.x);
        dendrogramPlot.appendChild(
          U.svgEl("line", {
            x1: left.x,
            y1: left.y,
            x2: left.x,
            y2: y,
            class: "cluster-line",
          })
        );
        dendrogramPlot.appendChild(
          U.svgEl("line", {
            x1: right.x,
            y1: right.y,
            x2: right.x,
            y2: y,
            class: "cluster-line",
          })
        );
        dendrogramPlot.appendChild(
          U.svgEl("line", {
            x1: left.x,
            y1: y,
            x2: right.x,
            y2: y,
            class: "cluster-line",
          })
        );
        nodeInfo[entry.id] = { x, y };
      });

      dendrogramPlot.appendChild(
        U.svgEl("text", {
          x: width / 2,
          y: 18,
          class: "svg-title",
          "text-anchor": "middle",
        })
      ).textContent = "Agglomerative merge history";
    }

    function render() {
      const linkage = linkageInput.value;
      const steps = state.history.map(
        (entry, index) =>
          `<strong>Merge ${index + 1}.</strong> Combine ${entry.left} and ${entry.right} at distance <strong>${U.round(
            entry.distance,
            3
          )}</strong>.`
      );
      U.renderSteps(stepsNode, steps, steps.length);

      if (state.clusters.length > 1) {
        let bestDistance = Infinity;
        let bestPair = "";
        for (let i = 0; i < state.clusters.length; i += 1) {
          for (let j = i + 1; j < state.clusters.length; j += 1) {
            const distance = clusterDistance(state.clusters[i], state.clusters[j], linkage);
            if (distance < bestDistance) {
              bestDistance = distance;
              bestPair = `${state.clusters[i].id} + ${state.clusters[j].id}`;
            }
          }
        }
        callout.innerHTML = `With <strong>${linkage}</strong> linkage, the next merge would be <strong>${bestPair}</strong> at distance <strong>${U.round(
          bestDistance,
          3
        )}</strong>.`;
      } else {
        callout.innerHTML = "All points have been merged into one hierarchy.";
      }

      const clusterColor = {};
      state.clusters.forEach((cluster, index) => {
        cluster.members.forEach((point) => {
          clusterColor[point.id] = clusterPalette[index % clusterPalette.length];
        });
      });

      const chart = U.makeChart(scatterPlot, {
        xDomain: [0, 9],
        yDomain: [1, 8.5],
        title: "Current clustering state",
      });
      hierarchicalPoints.forEach((point) =>
        drawPoint(scatterPlot, chart, point, clusterColor[point.id] || "#6d6457")
      );
      renderDendrogram();
    }

    stepButton.addEventListener("click", () => {
      takeMerge();
      render();
    });
    resetButton.addEventListener("click", () => {
      resetState();
      render();
    });
    linkageInput.addEventListener("input", () => {
      resetState();
      render();
    });

    resetState();
    render();
  }

  function buildDbscanEvents(points, eps, minPts) {
    const visited = new Set();
    const assigned = new Map();
    const events = [];
    let clusterId = 0;

    function neighbors(point) {
      return points.filter((candidate) => U.distance(point, candidate, "euclidean") <= eps);
    }

    points.forEach((point) => {
      if (visited.has(point.id)) {
        return;
      }
      visited.add(point.id);
      const seedNeighbors = neighbors(point);
      events.push({
        type: "visit",
        pointId: point.id,
        neighbors: seedNeighbors.map((item) => item.id),
        core: seedNeighbors.length >= minPts,
      });

      if (seedNeighbors.length < minPts) {
        events.push({ type: "noise", pointId: point.id });
        return;
      }

      clusterId += 1;
      assigned.set(point.id, clusterId);
      events.push({ type: "start", pointId: point.id, clusterId });
      const queue = seedNeighbors.filter((item) => item.id !== point.id);

      while (queue.length) {
        const current = queue.shift();
        if (!visited.has(current.id)) {
          visited.add(current.id);
          const currentNeighbors = neighbors(current);
          events.push({
            type: "visit",
            pointId: current.id,
            neighbors: currentNeighbors.map((item) => item.id),
            core: currentNeighbors.length >= minPts,
            clusterId,
          });
          if (currentNeighbors.length >= minPts) {
            currentNeighbors.forEach((candidate) => {
              if (!visited.has(candidate.id) && !queue.some((item) => item.id === candidate.id)) {
                queue.push(candidate);
              }
            });
          }
        }
        if (!assigned.has(current.id)) {
          assigned.set(current.id, clusterId);
          const currentNeighbors = neighbors(current);
          events.push({
            type: "assign",
            pointId: current.id,
            clusterId,
            pointType: currentNeighbors.length >= minPts ? "core" : "border",
          });
        }
      }
    });

    return events;
  }

  function initDbscanLab() {
    const epsInput = U.qs("#dbscan-eps");
    const minPtsInput = U.qs("#dbscan-minpts");
    const stepButton = U.qs("#dbscan-step");
    const resetButton = U.qs("#dbscan-reset");
    const callout = U.qs("#dbscan-callout");
    const plot = U.qs("#dbscan-plot");
    const output = U.qs("#dbscan-output");
    const stepsNode = U.qs("#dbscan-steps");
    let revealed = 0;

    function replay(events, count) {
      const state = {};
      dbscanPoints.forEach((point) => {
        state[point.id] = { clusterId: null, type: "unvisited", visited: false };
      });
      let active = null;
      let lastText = "Use the step button to start DBSCAN.";

      events.slice(0, count).forEach((event) => {
        active = event.pointId;
        if (event.type === "visit") {
          state[event.pointId].visited = true;
          state[event.pointId].type = event.core ? "core" : "candidate";
          lastText = `${event.pointId} has ${event.neighbors.length} neighbors inside ε.`;
        } else if (event.type === "noise") {
          state[event.pointId].type = "noise";
          lastText = `${event.pointId} is currently marked as noise.`;
        } else if (event.type === "start") {
          state[event.pointId].clusterId = event.clusterId;
          state[event.pointId].type = "core";
          lastText = `${event.pointId} starts cluster ${event.clusterId}.`;
        } else if (event.type === "assign") {
          state[event.pointId].clusterId = event.clusterId;
          state[event.pointId].type = event.pointType;
          lastText = `${event.pointId} joins cluster ${event.clusterId} as a ${event.pointType} point.`;
        }
      });

      return { state, active, lastText };
    }

    function render() {
      const eps = Number(epsInput.value) || 1.2;
      const minPts = Number(minPtsInput.value) || 3;
      const events = buildDbscanEvents(dbscanPoints, eps, minPts);
      const { state, active, lastText } = replay(events, revealed);
      callout.innerHTML = lastText;

      const clusterIds = new Set(
        Object.values(state)
          .map((item) => item.clusterId)
          .filter((value) => value !== null)
      );
      const noiseCount = Object.values(state).filter((item) => item.type === "noise").length;
      const coreCount = Object.values(state).filter((item) => item.type === "core").length;
      U.renderMetrics(output, [
        { label: "Events shown", value: String(revealed) },
        { label: "Clusters", value: String(clusterIds.size) },
        { label: "Core points", value: String(coreCount) },
        { label: "Noise", value: String(noiseCount) },
      ]);
      U.renderSteps(stepsNode, events.map((event) => {
        if (event.type === "visit") {
          return `<strong>Visit ${event.pointId}.</strong> Query its ε-neighborhood and test whether it is a core point.`;
        }
        if (event.type === "noise") {
          return `<strong>Noise.</strong> ${event.pointId} does not have enough nearby points yet.`;
        }
        if (event.type === "start") {
          return `<strong>Start cluster ${event.clusterId}.</strong> ${event.pointId} is dense enough to seed a cluster.`;
        }
        return `<strong>Expand cluster ${event.clusterId}.</strong> ${event.pointId} is density-reachable and gets assigned.`;
      }), revealed);

      const chart = U.makeChart(plot, {
        xDomain: [0.8, 9.8],
        yDomain: [0.8, 8.8],
        title: "DBSCAN neighborhood growth",
      });

      if (active) {
        const point = dbscanPoints.find((entry) => entry.id === active);
        plot.appendChild(
          U.svgEl("ellipse", {
            cx: chart.xScale(point.x),
            cy: chart.yScale(point.y),
            rx: Math.abs(chart.xScale(point.x + eps) - chart.xScale(point.x)),
            ry: Math.abs(chart.yScale(point.y + eps) - chart.yScale(point.y)),
            fill: "rgba(31,122,112,0.08)",
            stroke: "#1f7a70",
            "stroke-width": "2",
            "stroke-dasharray": "6 6",
          })
        );
      }

      dbscanPoints.forEach((point) => {
        const item = state[point.id];
        const color =
          item.clusterId !== null
            ? clusterPalette[(item.clusterId - 1) % clusterPalette.length]
            : item.type === "noise"
            ? "#b4473f"
            : "#6d6457";
        drawPoint(plot, chart, point, color, active === point.id ? 9 : 7);
      });
    }

    stepButton.addEventListener("click", () => {
      const events = buildDbscanEvents(
        dbscanPoints,
        Number(epsInput.value) || 1.2,
        Number(minPtsInput.value) || 3
      );
      revealed = Math.min(revealed + 1, events.length);
      render();
    });
    resetButton.addEventListener("click", () => {
      revealed = 0;
      render();
    });
    [epsInput, minPtsInput].forEach((input) =>
      input.addEventListener("input", () => {
        revealed = 0;
        render();
      })
    );

    render();
  }

  function initSpectralLab() {
    const sigmaInput = U.qs("#spectral-sigma");
    const thresholdInput = U.qs("#spectral-threshold");
    const button = U.qs("#spectral-run");
    const callout = U.qs("#spectral-callout");
    const plot = U.qs("#spectral-plot");
    const bars = U.qs("#spectral-bars");
    const stepsNode = U.qs("#spectral-steps");

    function render() {
      const sigma = Math.max(Number(sigmaInput.value) || 1, 0.2);
      const threshold = Number(thresholdInput.value) || 0.2;
      const n = spectralPoints.length;
      const W = Array.from({ length: n }, () => Array(n).fill(0));

      for (let i = 0; i < n; i += 1) {
        for (let j = i + 1; j < n; j += 1) {
          const distance = U.distance(spectralPoints[i], spectralPoints[j], "euclidean");
          const weight = Math.exp(-(distance * distance) / (2 * sigma * sigma));
          if (weight >= threshold) {
            W[i][j] = weight;
            W[j][i] = weight;
          }
        }
      }

      const D = W.map((row) => row.reduce((acc, value) => acc + value, 0));
      const L = W.map((row, i) =>
        row.map((value, j) => (i === j ? D[i] : 0) - value)
      );
      const { eigenvalues, eigenvectors } = U.jacobiEigen(L);
      const order = eigenvalues
        .map((value, index) => ({ value, index }))
        .sort((a, b) => a.value - b.value);
      const fiedler = eigenvectors[order[Math.min(1, order.length - 1)].index];
      const thresholdValue =
        fiedler.some((value) => value > 0) && fiedler.some((value) => value < 0)
          ? 0
          : U.median(fiedler);
      const assignments = fiedler.map((value) => (value >= thresholdValue ? 1 : 0));

      callout.innerHTML = `The second-smallest eigenvector splits the graph at threshold <strong>${U.round(
        thresholdValue,
        3
      )}</strong>. Similarity width <strong>σ = ${U.round(
        sigma,
        2
      )}</strong> controls how far graph influence reaches.`;

      U.renderSteps(
        stepsNode,
        [
          `<strong>Build a similarity graph.</strong> Connect points with weight <span class="mono">exp(-||xi - xj||² / 2σ²)</span> and drop weak edges below ${threshold}.`,
          `<strong>Form the Laplacian.</strong> Compute <span class="mono">L = D - W</span> so graph cuts become an eigenproblem.`,
          `<strong>Extract the Fiedler vector.</strong> The second-smallest eigenvector is [${fiedler
            .map((value) => U.round(value, 2))
            .join(", ")}].`,
          `<strong>Split the graph.</strong> Positive and negative entries identify two spectral clusters.`,
        ],
        4
      );

      const chart = U.makeChart(plot, {
        xDomain: [0.8, 8.2],
        yDomain: [2.2, 6.2],
        title: "Similarity graph and spectral partition",
      });

      for (let i = 0; i < n; i += 1) {
        for (let j = i + 1; j < n; j += 1) {
          if (W[i][j] > 0) {
            plot.appendChild(
              U.svgEl("line", {
                x1: chart.xScale(spectralPoints[i].x),
                y1: chart.yScale(spectralPoints[i].y),
                x2: chart.xScale(spectralPoints[j].x),
                y2: chart.yScale(spectralPoints[j].y),
                stroke: "#2f4057",
                "stroke-width": 1 + 4 * W[i][j],
                opacity: "0.22",
              })
            );
          }
        }
      }

      spectralPoints.forEach((point, index) =>
        drawPoint(plot, chart, point, clusterPalette[assignments[index]], 8)
      );

      const yMin = Math.min(...fiedler) - 0.1;
      const yMax = Math.max(...fiedler) + 0.1;
      const barChart = U.makeChart(bars, {
        xDomain: [0, n + 1],
        yDomain: [yMin, yMax],
        title: "Fiedler vector coordinates",
      });

      fiedler.forEach((value, index) => {
        const x1 = barChart.xScale(index + 0.45);
        const x2 = barChart.xScale(index + 1.05);
        const zeroY = barChart.yScale(0);
        const y = barChart.yScale(value);
        bars.appendChild(
          U.svgEl("rect", {
            x: x1,
            y: Math.min(y, zeroY),
            width: x2 - x1,
            height: Math.abs(zeroY - y),
            fill: clusterPalette[assignments[index]],
            rx: "10",
          })
        );
        bars.appendChild(
          U.svgEl("text", {
            x: 0.5 * (x1 + x2),
            y: zeroY + 18,
            class: "svg-label",
            "text-anchor": "middle",
          })
        ).textContent = spectralPoints[index].id;
      });
    }

    button.addEventListener("click", render);
    [sigmaInput, thresholdInput].forEach((input) => input.addEventListener("input", render));
    render();
  }

  initPartitionLab();
  initHierarchicalLab();
  initDbscanLab();
  initSpectralLab();
})();
