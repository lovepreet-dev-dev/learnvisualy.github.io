(function () {
  if (document.body.dataset.page !== "graphical-models") {
    return;
  }

  const U = window.MLUtils;

  function normalize(vector) {
    const total = vector[0] + vector[1];
    if (total <= 0) {
      return [0.5, 0.5];
    }
    return [vector[0] / total, vector[1] / total];
  }

  function initConditionalIndependenceLab() {
    const structureInput = U.qs("#ci-structure");
    const observeInput = U.qs("#ci-observe");
    const button = U.qs("#ci-evaluate");
    const plot = U.qs("#ci-plot");
    const stepsNode = U.qs("#ci-steps");
    const callout = U.qs("#ci-callout");

    function evaluate() {
      const structure = structureInput.value;
      const observed = observeInput.value;
      let active = true;
      let explanation = "";

      if (structure === "chain") {
        active = observed !== "b";
        explanation =
          observed === "b"
            ? "In a chain, conditioning on the middle node blocks information flow."
            : "In a chain, the path stays active until the middle node is observed.";
      } else if (structure === "fork") {
        active = observed !== "b";
        explanation =
          observed === "b"
            ? "In a fork, once the common cause is known the endpoints stop informing each other."
            : "In a fork, the shared parent creates dependence between the children.";
      } else if (structure === "collider") {
        active = observed === "b";
        explanation =
          observed === "b"
            ? "A collider normally blocks the path, but observing it opens explaining-away dependence."
            : "A collider keeps the endpoints independent until the collider is observed.";
      } else {
        active = observed !== "b";
        explanation =
          observed === "b"
            ? "In an undirected chain, conditioning on the separator node blocks the path."
            : "In an MRF chain, the middle node separates the endpoints only when conditioned on.";
      }

      callout.innerHTML = active
        ? `<strong>A and C are dependent.</strong> ${explanation}`
        : `<strong>A and C are conditionally independent.</strong> ${explanation}`;

      const steps = [
        `<strong>Pick the graph motif.</strong> ${structure === "mrf" ? "The example is undirected." : "The example is directed."}`,
        `<strong>Apply the local rule.</strong> ${explanation}`,
        `<strong>Read the result.</strong> The path from A to C is <strong>${active ? "active" : "blocked"}</strong>.`,
      ];
      U.renderSteps(stepsNode, steps, 3);

      U.clear(plot);
      const { width, height } = U.viewBoxSize(plot);
      const positions = {
        A: { x: 110, y: 140 },
        B: { x: 280, y: 140 },
        C: { x: 450, y: 140 },
      };
      const stroke = active ? "#1f7a70" : "#6d6457";
      const opacity = active ? "0.95" : "0.38";

      function drawLine(from, to, directed) {
        plot.appendChild(
          U.svgEl("line", {
            x1: positions[from].x,
            y1: positions[from].y,
            x2: positions[to].x,
            y2: positions[to].y,
            stroke,
            "stroke-width": "4",
            opacity,
          })
        );
        if (directed) {
          const dx = positions[to].x - positions[from].x;
          const dy = positions[to].y - positions[from].y;
          const length = Math.hypot(dx, dy);
          const ux = dx / length;
          const uy = dy / length;
          const tipX = positions[to].x - ux * 34;
          const tipY = positions[to].y - uy * 34;
          const leftX = tipX - ux * 14 + uy * 8;
          const leftY = tipY - uy * 14 - ux * 8;
          const rightX = tipX - ux * 14 - uy * 8;
          const rightY = tipY - uy * 14 + ux * 8;
          plot.appendChild(
            U.svgEl("polygon", {
              points: `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`,
              fill: stroke,
              opacity,
            })
          );
        }
      }

      if (structure === "chain") {
        drawLine("A", "B", true);
        drawLine("B", "C", true);
      } else if (structure === "fork") {
        drawLine("B", "A", true);
        drawLine("B", "C", true);
      } else if (structure === "collider") {
        drawLine("A", "B", true);
        drawLine("C", "B", true);
      } else {
        drawLine("A", "B", false);
        drawLine("B", "C", false);
      }

      Object.entries(positions).forEach(([name, pos]) => {
        const observedNode = observed.toUpperCase() === name;
        plot.appendChild(
          U.svgEl("circle", {
            cx: pos.x,
            cy: pos.y,
            r: 32,
            fill: observedNode ? "#d26f2f" : "#fffdf8",
            stroke: observedNode ? "#d26f2f" : "#2f4057",
            "stroke-width": "3",
          })
        );
        plot.appendChild(
          U.svgEl("text", {
            x: pos.x,
            y: pos.y + 6,
            "text-anchor": "middle",
            class: "svg-title",
          })
        ).textContent = name;
      });

      plot.appendChild(
        U.svgEl("text", {
          x: width / 2,
          y: 40,
          class: "svg-title",
          "text-anchor": "middle",
        })
      ).textContent = active ? "Active path" : "Blocked path";
      plot.appendChild(
        U.svgEl("text", {
          x: width / 2,
          y: height - 26,
          class: "svg-label",
          "text-anchor": "middle",
        })
      ).textContent =
        observed === "none"
          ? "No conditioning"
          : `Observed node: ${observed.toUpperCase()}`;
    }

    button.addEventListener("click", evaluate);
    [structureInput, observeInput].forEach((input) => input.addEventListener("input", evaluate));
    evaluate();
  }

  function initBeliefPropagationLab() {
    const leftEvidenceInput = U.qs("#bp-left-evidence");
    const rightEvidenceInput = U.qs("#bp-right-evidence");
    const compatibilityInput = U.qs("#bp-compatibility");
    const stepButton = U.qs("#bp-step");
    const resetButton = U.qs("#bp-reset");
    const plot = U.qs("#bp-plot");
    const output = U.qs("#bp-output");
    const stepsNode = U.qs("#bp-steps");
    let revealed = 0;

    function render() {
      const leftEvidence = Number(leftEvidenceInput.value) || 0.8;
      const rightEvidence = Number(rightEvidenceInput.value) || 0.3;
      const same = Number(compatibilityInput.value) || 0.85;
      const diff = 1 - same;
      const phi1 = [1 - leftEvidence, leftEvidence];
      const phi2 = [0.5, 0.5];
      const phi3 = [1 - rightEvidence, rightEvidence];
      const psi = [
        [same, diff],
        [diff, same],
      ];

      const messages = [];

      const m12 = normalize([
        phi1[0] * psi[0][0] + phi1[1] * psi[1][0],
        phi1[0] * psi[0][1] + phi1[1] * psi[1][1],
      ]);
      messages.push({
        name: "m₁→₂",
        value: m12,
        text: `Left node summarizes its evidence into message <strong>m₁→₂ = [${U.round(
          m12[0],
          3
        )}, ${U.round(m12[1], 3)}]</strong>.`,
      });

      const m32 = normalize([
        phi3[0] * psi[0][0] + phi3[1] * psi[1][0],
        phi3[0] * psi[0][1] + phi3[1] * psi[1][1],
      ]);
      messages.push({
        name: "m₃→₂",
        value: m32,
        text: `Right node sends <strong>m₃→₂ = [${U.round(m32[0], 3)}, ${U.round(
          m32[1],
          3
        )}]</strong>, bringing its local evidence into the center.`,
      });

      const m21 = normalize([
        psi[0][0] * phi2[0] * m32[0] + psi[0][1] * phi2[1] * m32[1],
        psi[1][0] * phi2[0] * m32[0] + psi[1][1] * phi2[1] * m32[1],
      ]);
      messages.push({
        name: "m₂→₁",
        value: m21,
        text: `The center can now answer leftward with <strong>m₂→₁ = [${U.round(
          m21[0],
          3
        )}, ${U.round(m21[1], 3)}]</strong>.`,
      });

      const m23 = normalize([
        psi[0][0] * phi2[0] * m12[0] + psi[0][1] * phi2[1] * m12[1],
        psi[1][0] * phi2[0] * m12[0] + psi[1][1] * phi2[1] * m12[1],
      ]);
      messages.push({
        name: "m₂→₃",
        value: m23,
        text: `Finally the center sends <strong>m₂→₃ = [${U.round(
          m23[0],
          3
        )}, ${U.round(m23[1], 3)}]</strong> to the right.`,
      });

      const visibleMessages = messages.slice(0, revealed);
      const belief1 = normalize([
        phi1[0] * (revealed >= 3 ? m21[0] : 1),
        phi1[1] * (revealed >= 3 ? m21[1] : 1),
      ]);
      const belief2 = normalize([
        phi2[0] * (revealed >= 1 ? m12[0] : 1) * (revealed >= 2 ? m32[0] : 1),
        phi2[1] * (revealed >= 1 ? m12[1] : 1) * (revealed >= 2 ? m32[1] : 1),
      ]);
      const belief3 = normalize([
        phi3[0] * (revealed >= 4 ? m23[0] : 1),
        phi3[1] * (revealed >= 4 ? m23[1] : 1),
      ]);

      U.renderMetrics(output, [
        { label: "P(X1 = 1)", value: U.round(belief1[1], 3) },
        { label: "P(X2 = 1)", value: U.round(belief2[1], 3) },
        { label: "P(X3 = 1)", value: U.round(belief3[1], 3) },
      ]);

      U.renderSteps(stepsNode, visibleMessages.map((message) => message.text), revealed);

      U.clear(plot);
      const positions = [
        { x: 110, y: 140, belief: belief1, label: "X1" },
        { x: 280, y: 140, belief: belief2, label: "X2" },
        { x: 450, y: 140, belief: belief3, label: "X3" },
      ];

      plot.appendChild(
        U.svgEl("text", {
          x: 280,
          y: 28,
          class: "svg-title",
          "text-anchor": "middle",
        })
      ).textContent = "Binary MRF and message passing schedule";

      [
        [0, 1],
        [1, 2],
      ].forEach(([from, to]) => {
        plot.appendChild(
          U.svgEl("line", {
            x1: positions[from].x + 32,
            y1: positions[from].y,
            x2: positions[to].x - 32,
            y2: positions[to].y,
            stroke: "#2f4057",
            "stroke-width": "3",
            opacity: "0.5",
          })
        );
      });

      positions.forEach((node) => {
        plot.appendChild(
          U.svgEl("circle", {
            cx: node.x,
            cy: node.y,
            r: 34,
            fill: "#fffdf8",
            stroke: "#2f4057",
            "stroke-width": "3",
          })
        );
        plot.appendChild(
          U.svgEl("text", {
            x: node.x,
            y: node.y - 2,
            "text-anchor": "middle",
            class: "svg-title",
          })
        ).textContent = node.label;
        plot.appendChild(
          U.svgEl("text", {
            x: node.x,
            y: node.y + 18,
            "text-anchor": "middle",
            class: "svg-label",
          })
        ).textContent = `P(1)=${U.round(node.belief[1], 2)}`;
      });

      const messagePositions = [
        { x: 195, y: 102 },
        { x: 365, y: 102 },
        { x: 195, y: 196 },
        { x: 365, y: 196 },
      ];

      visibleMessages.forEach((message, index) => {
        plot.appendChild(
          U.svgEl("text", {
            x: messagePositions[index].x,
            y: messagePositions[index].y,
            "text-anchor": "middle",
            class: "svg-label",
            fill: index < 2 ? "#1f7a70" : "#d26f2f",
          })
        ).textContent = `${message.name}: [${U.round(message.value[0], 2)}, ${U.round(
          message.value[1],
          2
        )}]`;
      });
    }

    stepButton.addEventListener("click", () => {
      revealed = Math.min(revealed + 1, 4);
      render();
    });
    resetButton.addEventListener("click", () => {
      revealed = 0;
      render();
    });
    [leftEvidenceInput, rightEvidenceInput, compatibilityInput].forEach((input) =>
      input.addEventListener("input", () => {
        revealed = 0;
        render();
      })
    );

    render();
  }

  function parseSequence(raw) {
    return raw
      .split(/[\s,]+/)
      .map((token) => token.trim().toUpperCase())
      .filter((token) => token === "U" || token === "N");
  }

  function buildHmmModel(sequence, stay, emission) {
    const transition = [
      [stay, 1 - stay],
      [1 - stay, stay],
    ];
    const emit = {
      U: [emission, 1 - emission],
      N: [1 - emission, emission],
    };
    const states = ["Rain", "Sun"];
    const alpha = [];
    const delta = [];
    const psi = [];
    let prevAlpha = [0.5, 0.5];
    let prevDelta = [0.5, 0.5];

    sequence.forEach((obs, time) => {
      const prediction = [
        prevAlpha[0] * transition[0][0] + prevAlpha[1] * transition[1][0],
        prevAlpha[0] * transition[0][1] + prevAlpha[1] * transition[1][1],
      ];
      const rawAlpha = [
        prediction[0] * emit[obs][0],
        prediction[1] * emit[obs][1],
      ];
      const normalizedAlpha = normalize(rawAlpha);
      alpha.push(normalizedAlpha);
      prevAlpha = normalizedAlpha;

      const rawDelta = [0, 0];
      const back = [0, 0];
      for (let j = 0; j < 2; j += 1) {
        const scores = [
          prevDelta[0] * transition[0][j] * emit[obs][j],
          prevDelta[1] * transition[1][j] * emit[obs][j],
        ];
        back[j] = scores[0] >= scores[1] ? 0 : 1;
        rawDelta[j] = Math.max(scores[0], scores[1]);
      }
      const normDelta = normalize(rawDelta);
      delta.push(normDelta);
      psi.push(back);
      prevDelta = normDelta;
    });

    const path = Array(sequence.length).fill(0);
    if (sequence.length) {
      path[sequence.length - 1] = delta[sequence.length - 1][0] >= delta[sequence.length - 1][1] ? 0 : 1;
      for (let time = sequence.length - 2; time >= 0; time -= 1) {
        path[time] = psi[time + 1][path[time + 1]];
      }
    }

    return { transition, emit, states, alpha, delta, path };
  }

  function forwardBackward(sequence, stay, emission) {
    const transition = [
      [stay, 1 - stay],
      [1 - stay, stay],
    ];
    const emit = {
      U: [emission, 1 - emission],
      N: [1 - emission, emission],
    };
    const alpha = [];
    const beta = Array.from({ length: sequence.length }, () => [1, 1]);
    alpha[0] = normalize([0.5 * emit[sequence[0]][0], 0.5 * emit[sequence[0]][1]]);

    for (let time = 1; time < sequence.length; time += 1) {
      const obs = sequence[time];
      alpha[time] = normalize([
        emit[obs][0] *
          (alpha[time - 1][0] * transition[0][0] + alpha[time - 1][1] * transition[1][0]),
        emit[obs][1] *
          (alpha[time - 1][0] * transition[0][1] + alpha[time - 1][1] * transition[1][1]),
      ]);
    }

    for (let time = sequence.length - 2; time >= 0; time -= 1) {
      beta[time] = normalize([
        transition[0][0] * emit[sequence[time + 1]][0] * beta[time + 1][0] +
          transition[0][1] * emit[sequence[time + 1]][1] * beta[time + 1][1],
        transition[1][0] * emit[sequence[time + 1]][0] * beta[time + 1][0] +
          transition[1][1] * emit[sequence[time + 1]][1] * beta[time + 1][1],
      ]);
    }

    const gamma = alpha.map((alphas, time) =>
      normalize([alphas[0] * beta[time][0], alphas[1] * beta[time][1]])
    );
    const xi = [];
    for (let time = 0; time < sequence.length - 1; time += 1) {
      const obs = sequence[time + 1];
      const raw = [
        [
          alpha[time][0] * transition[0][0] * emit[obs][0] * beta[time + 1][0],
          alpha[time][0] * transition[0][1] * emit[obs][1] * beta[time + 1][1],
        ],
        [
          alpha[time][1] * transition[1][0] * emit[obs][0] * beta[time + 1][0],
          alpha[time][1] * transition[1][1] * emit[obs][1] * beta[time + 1][1],
        ],
      ];
      const total = raw.flat().reduce((acc, value) => acc + value, 0);
      xi.push(raw.map((row) => row.map((value) => value / total)));
    }

    return { gamma, xi };
  }

  function initHmmLab() {
    const transitionInput = U.qs("#hmm-transition");
    const emissionInput = U.qs("#hmm-emission");
    const sequenceInput = U.qs("#hmm-sequence");
    const stepButton = U.qs("#hmm-step");
    const resetButton = U.qs("#hmm-reset");
    const learnButton = U.qs("#hmm-learn");
    const callout = U.qs("#hmm-callout");
    const plot = U.qs("#hmm-plot");
    const output = U.qs("#hmm-output");
    const stepsNode = U.qs("#hmm-steps");
    const table = U.qs("#hmm-table");
    let revealed = 0;

    function render(statusMessage) {
      const stay = Number(transitionInput.value) || 0.8;
      const emission = Number(emissionInput.value) || 0.75;
      const sequence = parseSequence(sequenceInput.value);
      const model = buildHmmModel(sequence, stay, emission);
      const shown = Math.min(revealed, sequence.length);

      callout.innerHTML =
        statusMessage ||
        `The transition matrix alone is a Markov chain. Adding the umbrella emission model hides the weather state and creates an HMM.`;

      U.renderMetrics(output, [
        { label: "Steps shown", value: String(shown) },
        {
          label: "Current P(Rain)",
          value: shown ? U.round(model.alpha[shown - 1][0], 3) : "0.5",
        },
        {
          label: "Current best state",
          value: shown ? model.states[model.path[shown - 1]] : "Start",
        },
        { label: "Sequence length", value: String(sequence.length) },
      ]);

      const steps = sequence.map((obs, time) => {
        const alphas = model.alpha[time];
        return `<strong>t = ${time + 1}, obs = ${obs}.</strong> Predict with the transition model, multiply by the emission likelihood, then normalize to get <span class="mono">[${U.round(
          alphas[0],
          3
        )}, ${U.round(alphas[1], 3)}]</span>.`;
      });
      U.renderSteps(stepsNode, steps, shown);

      table.innerHTML = sequence
        .map((obs, time) => {
          if (time >= shown) {
            return `
              <tr>
                <td>${time + 1}</td>
                <td>${obs}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
              </tr>
            `;
          }
          return `
            <tr>
              <td>${time + 1}</td>
              <td>${obs}</td>
              <td>${U.round(model.alpha[time][0], 3)}</td>
              <td>${U.round(model.alpha[time][1], 3)}</td>
              <td>${model.states[model.path[time]]}</td>
            </tr>
          `;
        })
        .join("");

      const chart = U.makeChart(plot, {
        xDomain: [1, Math.max(sequence.length, 2)],
        yDomain: [0, 1],
        title: "Filtering probability of Rain over time",
      });

      if (shown) {
        const points = model.alpha
          .slice(0, shown)
          .map((prob, index) => ({ x: index + 1, y: prob[0] }));
        plot.appendChild(
          U.svgEl("path", {
            d: U.pathFromPoints(points, chart.xScale, chart.yScale),
            class: "curve-primary",
          })
        );
        points.forEach((point, index) => {
          plot.appendChild(
            U.svgEl("circle", {
              cx: chart.xScale(point.x),
              cy: chart.yScale(point.y),
              r: 6,
              fill: "#1f7a70",
            })
          );
          plot.appendChild(
            U.svgEl("text", {
              x: chart.xScale(point.x),
              y: chart.yScale(point.y) - 12,
              class: "svg-label",
              "text-anchor": "middle",
            })
          ).textContent = sequence[index];
        });
      }
    }

    stepButton.addEventListener("click", () => {
      const sequence = parseSequence(sequenceInput.value);
      revealed = Math.min(revealed + 1, sequence.length);
      render();
    });

    resetButton.addEventListener("click", () => {
      revealed = 0;
      render();
    });

    learnButton.addEventListener("click", () => {
      const sequence = parseSequence(sequenceInput.value);
      if (sequence.length < 2) {
        render("Add at least two observations to run a learning update.");
        return;
      }
      const stay = Number(transitionInput.value) || 0.8;
      const emission = Number(emissionInput.value) || 0.75;
      const { gamma, xi } = forwardBackward(sequence, stay, emission);

      const sameTransitions =
        xi.reduce((acc, item) => acc + item[0][0] + item[1][1], 0) / xi.length;
      const correctEmissions =
        gamma.reduce((acc, stateProb, time) => {
          const obs = sequence[time];
          return acc + (obs === "U" ? stateProb[0] : stateProb[1]);
        }, 0) / gamma.length;

      transitionInput.value = U.clamp(sameTransitions, 0.55, 0.95).toFixed(2);
      emissionInput.value = U.clamp(correctEmissions, 0.55, 0.95).toFixed(2);
      revealed = sequence.length;
      render(
        `One Baum-Welch style update used soft state counts to propose <strong>stay = ${transitionInput.value}</strong> and <strong>correct emission = ${emissionInput.value}</strong>.`
      );
    });

    [transitionInput, emissionInput, sequenceInput].forEach((input) =>
      input.addEventListener("input", () => {
        revealed = 0;
        render();
      })
    );

    render();
  }

  initConditionalIndependenceLab();
  initBeliefPropagationLab();
  initHmmLab();
})();
