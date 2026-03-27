(function () {
  if (document.body.dataset.page !== "introduction") {
    return;
  }

  const U = window.MLUtils;

  function initGaussianLab() {
    const samplesInput = U.qs("#gaussian-samples");
    const priorMeanInput = U.qs("#prior-mean");
    const priorVarianceInput = U.qs("#prior-variance");
    const obsVarianceInput = U.qs("#obs-variance");
    const rangeInput = U.qs("#gaussian-range");
    const stepButton = U.qs("#gaussian-step");
    const resetButton = U.qs("#gaussian-reset");
    const stepsNode = U.qs("#gaussian-steps");
    const outputNode = U.qs("#gaussian-output");
    const plot = U.qs("#gaussian-plot");
    let revealed = 0;

    function render() {
      const samples = U.parseNumberList(samplesInput.value);
      const priorMean = Number(priorMeanInput.value) || 0;
      const priorVariance = Math.max(Number(priorVarianceInput.value) || 1, 0.05);
      const obsVariance = Math.max(Number(obsVarianceInput.value) || 1, 0.05);
      const viewRange = Math.max(Number(rangeInput.value) || 4, 2);

      if (!samples.length) {
        U.renderMetrics(outputNode, [{ label: "Status", value: "Add samples" }]);
        U.renderSteps(stepsNode, [], 0);
        U.clear(plot);
        return;
      }

      const sampleMean = U.mean(samples);
      const mleVariance = U.variance(samples);
      const { posteriorMean, posteriorVariance } = U.normalPosterior(
        samples,
        obsVariance,
        priorMean,
        priorVariance
      );
      const predictiveVariance = obsVariance + posteriorVariance;

      U.renderMetrics(outputNode, [
        { label: "Sample mean", value: U.round(sampleMean, 3) },
        { label: "MLE variance", value: U.round(mleVariance, 3) },
        { label: "MAP mean", value: U.round(posteriorMean, 3) },
        { label: "Posterior variance", value: U.round(posteriorVariance, 3) },
      ]);

      const steps = [
        `<strong>Summarize the sample.</strong> There are <strong>${samples.length}</strong> observations and their average is <strong>${U.round(sampleMean, 3)}</strong>.`,
        `<strong>Estimate spread.</strong> The Gaussian MLE variance uses <span class="mono">1/n</span>, giving <strong>${U.round(mleVariance, 3)}</strong>.`,
        `<strong>Fit by maximum likelihood.</strong> MLE chooses <span class="mono">μ = x̄</span> and <span class="mono">σ² = ${U.round(mleVariance, 3)}</span> because those values maximize the probability of the observed sample.`,
        `<strong>Add prior precision.</strong> The prior contributes precision <span class="mono">1/τ² = ${U.round(
          1 / priorVariance,
          3
        )}</span>, while the data contribute <span class="mono">n/σ² = ${U.round(samples.length / obsVariance, 3)}</span>.`,
        `<strong>Obtain the posterior.</strong> The posterior mean is <strong>${U.round(
          posteriorMean,
          3
        )}</strong> with variance <strong>${U.round(
          posteriorVariance,
          3
        )}</strong>. For this conjugate Gaussian setup, the MAP estimate equals the posterior mean.`,
      ];
      U.renderSteps(stepsNode, steps, revealed);

      const center = 0.5 * (sampleMean + priorMean);
      const xMin = Math.min(
        center - viewRange / 2,
        Math.min(...samples) - 0.8,
        priorMean - 0.8
      );
      const xMax = Math.max(
        center + viewRange / 2,
        Math.max(...samples) + 0.8,
        priorMean + 0.8
      );
      const xs = U.linspace(xMin, xMax, 180);
      const priorCurve = xs.map((x) => ({ x, y: U.gaussianPdf(x, priorMean, priorVariance) }));
      const mleCurve = xs.map((x) => ({
        x,
        y: U.gaussianPdf(x, sampleMean, Math.max(mleVariance, 0.08)),
      }));
      const posteriorCurve = xs.map((x) => ({
        x,
        y: U.gaussianPdf(x, posteriorMean, predictiveVariance),
      }));
      const yMax =
        1.2 *
        Math.max(
          ...priorCurve.map((p) => p.y),
          ...mleCurve.map((p) => p.y),
          ...posteriorCurve.map((p) => p.y)
        );

      const chart = U.makeChart(plot, {
        xDomain: [xMin, xMax],
        yDomain: [0, yMax],
        title: "Likelihood fit vs prior and posterior predictive",
      });

      plot.appendChild(
        U.svgEl("path", {
          d: U.pathFromPoints(priorCurve, chart.xScale, chart.yScale),
          fill: "none",
          stroke: "#6f8a88",
          "stroke-width": "2.5",
          "stroke-dasharray": "4 6",
        })
      );
      plot.appendChild(
        U.svgEl("path", {
          d: U.pathFromPoints(mleCurve, chart.xScale, chart.yScale),
          class: "curve-primary",
        })
      );
      plot.appendChild(
        U.svgEl("path", {
          d: U.pathFromPoints(posteriorCurve, chart.xScale, chart.yScale),
          class: "curve-secondary",
        })
      );

      samples.forEach((sample) => {
        const x = chart.xScale(sample);
        plot.appendChild(
          U.svgEl("line", {
            x1: x,
            y1: chart.yScale(0),
            x2: x,
            y2: chart.yScale(yMax * 0.08),
            stroke: "#2f4057",
            "stroke-width": "2",
          })
        );
      });

      [
        { text: "Prior", color: "#6f8a88", x: xMin + 0.18 * (xMax - xMin) },
        { text: "MLE fit", color: "#1f7a70", x: xMin + 0.45 * (xMax - xMin) },
        {
          text: "Posterior predictive",
          color: "#d26f2f",
          x: xMin + 0.72 * (xMax - xMin),
        },
      ].forEach((entry, index) => {
        plot.appendChild(
          U.svgEl("text", {
            x: chart.xScale(entry.x),
            y: 32 + index * 18,
            class: "svg-label",
            fill: entry.color,
          })
        ).textContent = entry.text;
      });
    }

    stepButton.addEventListener("click", () => {
      const maxSteps = 5;
      revealed = Math.min(revealed + 1, maxSteps);
      render();
    });
    resetButton.addEventListener("click", () => {
      revealed = 0;
      render();
    });
    [samplesInput, priorMeanInput, priorVarianceInput, obsVarianceInput, rangeInput].forEach((input) =>
      input.addEventListener("input", () => {
        revealed = 0;
        render();
      })
    );

    render();
  }

  function initBiasLab() {
    const trueMeanInput = U.qs("#true-mean");
    const trueStdInput = U.qs("#true-std");
    const sampleSizeInput = U.qs("#sample-size");
    const simulationsInput = U.qs("#simulations");
    const shrinkageInput = U.qs("#shrinkage");
    const shrinkageValue = U.qs("#shrinkage-value");
    const stepButton = U.qs("#bias-step");
    const resetButton = U.qs("#bias-reset");
    const outputNode = U.qs("#bias-output");
    const stepsNode = U.qs("#bias-steps");
    const panel = U.qs("#bias-sample-panel");
    const plot = U.qs("#bias-plot");
    let revealed = 0;

    function render() {
      const trueMean = Number(trueMeanInput.value) || 0;
      const trueStd = Math.max(Number(trueStdInput.value) || 1, 0.05);
      const sampleSize = Math.max(Number(sampleSizeInput.value) || 2, 2);
      const simulations = Math.max(Number(simulationsInput.value) || 50, 20);
      const shrinkage = Number(shrinkageInput.value) || 1;
      shrinkageValue.textContent = Number(shrinkage).toFixed(2);

      const rng = U.seededRandom(27);
      const estimates = [];
      for (let sim = 0; sim < simulations; sim += 1) {
        const sample = [];
        for (let index = 0; index < sampleSize; index += 1) {
          sample.push(U.sampleNormal(rng, trueMean, trueStd));
        }
        estimates.push(shrinkage * U.mean(sample));
      }

      const estimateMean = U.mean(estimates);
      const bias = estimateMean - trueMean;
      const variance = U.variance(estimates);
      const mse =
        estimates.reduce((total, value) => total + (value - trueMean) ** 2, 0) / estimates.length;

      U.renderMetrics(outputNode, [
        { label: "Average estimate", value: U.round(estimateMean, 3) },
        { label: "Bias", value: U.round(bias, 3) },
        { label: "Variance", value: U.round(variance, 3) },
        { label: "MSE", value: U.round(mse, 3) },
      ]);

      panel.innerHTML = `
        <h3>First estimates</h3>
        <p>${estimates
          .slice(0, 12)
          .map((value) => `<span class="metric-pill">${U.round(value, 2)}</span>`)
          .join(" ")}</p>
        <p class="caption">The Monte Carlo sample above shows how repeated datasets create a distribution over estimators, not a single number.</p>
      `;

      const steps = [
        `<strong>Generate repeated datasets.</strong> We draw <strong>${simulations}</strong> independent samples, each of size <strong>${sampleSize}</strong>, from the true Gaussian.`,
        `<strong>Apply the estimator.</strong> Every sample mean is scaled by <span class="mono">c = ${U.round(
          shrinkage,
          2
        )}</span>, which intentionally shrinks or stretches the estimate.`,
        `<strong>Measure bias.</strong> The empirical bias is <strong>${U.round(
          bias,
          3
        )}</strong>, meaning the estimator centers itself ${bias >= 0 ? "above" : "below"} the truth.`,
        `<strong>Measure variance.</strong> Across repeated datasets the estimates vary by <strong>${U.round(
          variance,
          3
        )}</strong>.`,
        `<strong>Combine both pieces.</strong> Mean squared error is <span class="mono">bias² + variance</span>, here giving <strong>${U.round(
          mse,
          3
        )}</strong>.`,
      ];
      U.renderSteps(stepsNode, steps, revealed);

      const barData = [
        { label: "bias²", value: bias * bias, color: "#d26f2f" },
        { label: "variance", value: variance, color: "#1f7a70" },
        { label: "mse", value: mse, color: "#2f4057" },
      ];
      const yMax = Math.max(...barData.map((item) => item.value), 0.02) * 1.25;
      const chart = U.makeChart(plot, {
        xDomain: [0, 4],
        yDomain: [0, yMax],
        title: "Bias-variance decomposition",
      });

      barData.forEach((bar, index) => {
        const x1 = chart.xScale(index + 0.45);
        const x2 = chart.xScale(index + 1.05);
        const y = chart.yScale(bar.value);
        plot.appendChild(
          U.svgEl("rect", {
            x: x1,
            y,
            width: x2 - x1,
            height: chart.yScale(0) - y,
            fill: bar.color,
            opacity: "0.86",
            rx: "12",
          })
        );
        plot.appendChild(
          U.svgEl("text", {
            x: (x1 + x2) / 2,
            y: chart.yScale(0) + 18,
            class: "svg-label",
            "text-anchor": "middle",
          })
        ).textContent = bar.label;
        plot.appendChild(
          U.svgEl("text", {
            x: (x1 + x2) / 2,
            y: y - 8,
            class: "svg-label",
            "text-anchor": "middle",
          })
        ).textContent = U.round(bar.value, 3);
      });
    }

    stepButton.addEventListener("click", () => {
      revealed = Math.min(revealed + 1, 5);
      render();
    });
    resetButton.addEventListener("click", () => {
      revealed = 0;
      render();
    });
    [trueMeanInput, trueStdInput, sampleSizeInput, simulationsInput, shrinkageInput].forEach(
      (input) =>
        input.addEventListener("input", () => {
          revealed = 0;
          render();
        })
    );

    render();
  }

  function initCleanupLab() {
    const baseData = [
      { id: "E1", a: 1.4, b: 2.0 },
      { id: "E2", a: 1.8, b: null },
      { id: "E3", a: null, b: 1.7 },
      { id: "E4", a: 2.6, b: 2.9 },
      { id: "E5", a: 7.8, b: 0.5 },
      { id: "E6", a: 2.1, b: 3.2 },
      { id: "E7", a: 2.5, b: 2.7 },
      { id: "E8", a: 1.7, b: 8.4 },
    ];
    const methodInput = U.qs("#cleanup-method");
    const clampInput = U.qs("#noise-clamp");
    const clampValue = U.qs("#noise-clamp-value");
    const button = U.qs("#cleanup-apply");
    const tableBody = U.qs("#cleanup-table");
    const summary = U.qs("#cleanup-summary");
    const plot = U.qs("#cleanup-plot");

    function render() {
      const method = methodInput.value;
      const clampZ = Number(clampInput.value) || 1.8;
      clampValue.textContent = clampZ.toFixed(1);

      const aValues = baseData.map((row) => row.a).filter(Number.isFinite);
      const bValues = baseData.map((row) => row.b).filter(Number.isFinite);
      const fillA = method === "median" ? U.median(aValues) : U.mean(aValues);
      const fillB = method === "median" ? U.median(bValues) : U.mean(bValues);

      const cleaned = [];
      let imputedCount = 0;
      let clampedCount = 0;

      baseData.forEach((row) => {
        if (method === "drop" && (!Number.isFinite(row.a) || !Number.isFinite(row.b))) {
          cleaned.push({
            id: row.id,
            a: row.a,
            b: row.b,
            dropped: true,
            status: "Dropped for missing value",
            changed: false,
          });
          return;
        }

        const next = {
          id: row.id,
          a: Number.isFinite(row.a) ? row.a : fillA,
          b: Number.isFinite(row.b) ? row.b : fillB,
          statusParts: [],
          changed: false,
        };

        if (!Number.isFinite(row.a)) {
          next.statusParts.push(`imputed A=${U.round(fillA, 2)}`);
          imputedCount += 1;
          next.changed = true;
        }
        if (!Number.isFinite(row.b)) {
          next.statusParts.push(`imputed B=${U.round(fillB, 2)}`);
          imputedCount += 1;
          next.changed = true;
        }
        cleaned.push(next);
      });

      const retained = cleaned.filter((row) => !row.dropped);
      const means = {
        a: U.mean(retained.map((row) => row.a)),
        b: U.mean(retained.map((row) => row.b)),
      };
      const stds = {
        a: Math.sqrt(U.variance(retained.map((row) => row.a))),
        b: Math.sqrt(U.variance(retained.map((row) => row.b))),
      };

      retained.forEach((row) => {
        ["a", "b"].forEach((feature) => {
          if (stds[feature] < 1e-6) {
            return;
          }
          const z = (row[feature] - means[feature]) / stds[feature];
          if (Math.abs(z) > clampZ) {
            row[feature] = means[feature] + Math.sign(z) * clampZ * stds[feature];
            row.statusParts.push(`clamped ${feature.toUpperCase()}`);
            row.changed = true;
            clampedCount += 1;
          }
        });
      });

      cleaned.forEach((row) => {
        row.status = row.dropped
          ? row.status
          : row.statusParts.length
          ? row.statusParts.join(", ")
          : "Kept as-is";
      });

      tableBody.innerHTML = cleaned
        .map((row) => {
          const tone = row.dropped
            ? "bad"
            : row.changed
            ? "warn"
            : "";
          return `
            <tr>
              <td>${row.id}</td>
              <td>${Number.isFinite(row.a) ? U.round(row.a, 2) : "?"}</td>
              <td>${Number.isFinite(row.b) ? U.round(row.b, 2) : "?"}</td>
              <td><span class="status-pill ${tone}">${row.status}</span></td>
            </tr>
          `;
        })
        .join("");

      summary.innerHTML = `
        ${retained.length} rows remain after cleanup.
        ${imputedCount} missing feature values were reconstructed with <strong>${method}</strong> statistics.
        ${clampedCount} noisy values were clipped to stay within <strong>±${clampZ.toFixed(
          1
        )}</strong> standard deviations.
      `;

      const chart = U.makeChart(plot, {
        xDomain: [0, 8.8],
        yDomain: [0, 8.8],
        title: "Original points vs cleaned points",
      });

      baseData.forEach((row) => {
        if (!Number.isFinite(row.a) || !Number.isFinite(row.b)) {
          return;
        }
        plot.appendChild(
          U.svgEl("circle", {
            cx: chart.xScale(row.a),
            cy: chart.yScale(row.b),
            r: 5,
            fill: "#6d6457",
            opacity: "0.22",
          })
        );
      });

      cleaned.forEach((row) => {
        if (row.dropped || !Number.isFinite(row.a) || !Number.isFinite(row.b)) {
          return;
        }
        plot.appendChild(
          U.svgEl("circle", {
            cx: chart.xScale(row.a),
            cy: chart.yScale(row.b),
            r: row.changed ? 8 : 7,
            fill: row.changed ? "#d26f2f" : "#1f7a70",
            opacity: "0.9",
          })
        );
        plot.appendChild(
          U.svgEl("text", {
            x: chart.xScale(row.a) + 10,
            y: chart.yScale(row.b) - 8,
            class: "svg-label",
          })
        ).textContent = row.id;
      });
    }

    button.addEventListener("click", render);
    [methodInput, clampInput].forEach((input) => input.addEventListener("input", render));
    render();
  }

  function initKdeLab() {
    const samplesInput = U.qs("#kde-samples");
    const bandwidthInput = U.qs("#kde-bandwidth");
    const bandwidthValue = U.qs("#kde-bandwidth-value");
    const stepButton = U.qs("#kde-step");
    const resetButton = U.qs("#kde-reset");
    const plot = U.qs("#kde-plot");
    const stepsNode = U.qs("#kde-steps");
    let revealed = 0;

    function render() {
      const samples = U.parseNumberList(samplesInput.value);
      const bandwidth = Math.max(Number(bandwidthInput.value) || 0.4, 0.08);
      bandwidthValue.textContent = bandwidth.toFixed(2);

      if (!samples.length) {
        U.clear(plot);
        U.renderSteps(stepsNode, [], 0);
        return;
      }

      const xMin = Math.min(...samples) - 1;
      const xMax = Math.max(...samples) + 1;
      const xs = U.linspace(xMin, xMax, 180);
      const kernels = samples.map((center) =>
        xs.map((x) => ({ x, y: U.gaussianPdf(x, center, bandwidth * bandwidth) / samples.length }))
      );
      const total = xs.map((x) => ({
        x,
        y:
          samples.reduce(
            (acc, center) => acc + U.gaussianPdf(x, center, bandwidth * bandwidth),
            0
          ) / samples.length,
      }));
      const yMax =
        1.25 *
        Math.max(
          ...kernels.flat().map((point) => point.y),
          ...total.map((point) => point.y)
        );

      const steps = samples.map(
        (sample, index) =>
          `<strong>Kernel ${index + 1}.</strong> Center a Gaussian bump at <strong>${U.round(
            sample,
            2
          )}</strong>. Its width is controlled by the bandwidth <span class="mono">h = ${bandwidth.toFixed(
            2
          )}</span>.`
      );
      steps.push(
        `<strong>Add the kernels.</strong> Averaging the ${samples.length} bumps gives a smooth nonparametric density estimate without forcing a single Gaussian.`
      );
      U.renderSteps(stepsNode, steps, revealed);

      const chart = U.makeChart(plot, {
        xDomain: [xMin, xMax],
        yDomain: [0, yMax],
        title: "Kernel contributions and final KDE",
      });

      samples.forEach((sample) => {
        const x = chart.xScale(sample);
        plot.appendChild(
          U.svgEl("line", {
            x1: x,
            y1: chart.yScale(0),
            x2: x,
            y2: chart.yScale(yMax * 0.08),
            stroke: "#2f4057",
            "stroke-width": "1.6",
          })
        );
      });

      for (let index = 0; index < Math.min(revealed, samples.length); index += 1) {
        plot.appendChild(
          U.svgEl("path", {
            d: U.pathFromPoints(kernels[index], chart.xScale, chart.yScale),
            fill: "none",
            stroke: index % 2 ? "#d26f2f" : "#1f7a70",
            "stroke-width": "2.2",
            opacity: "0.62",
          })
        );
      }

      if (revealed > samples.length) {
        plot.appendChild(
          U.svgEl("path", {
            d: U.pathFromPoints(total, chart.xScale, chart.yScale),
            class: "curve-primary",
          })
        );
      }
    }

    stepButton.addEventListener("click", () => {
      const samples = U.parseNumberList(samplesInput.value);
      revealed = Math.min(revealed + 1, samples.length + 1);
      render();
    });
    resetButton.addEventListener("click", () => {
      revealed = 0;
      render();
    });
    [samplesInput, bandwidthInput].forEach((input) =>
      input.addEventListener("input", () => {
        revealed = 0;
        render();
      })
    );

    render();
  }

  initGaussianLab();
  initBiasLab();
  initCleanupLab();
  initKdeLab();
})();
