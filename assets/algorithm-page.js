(function () {
  const catalog = window.MLAlgorithms;
  const U = window.MLUtils;

  if (!catalog || document.body.dataset.page !== "algorithm") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const algorithmId = params.get("id");
  const definition =
    catalog.get(algorithmId) || Object.values(catalog.algorithms).sort((a, b) => a.order - b.order)[0];
  const root = U.qs("#algorithm-page-root");

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

  const clusterPalette = ["#1f7a70", "#d26f2f", "#2f4057", "#7a5c35"];

  function pagePrefix() {
    return "./";
  }

  function categoryOf(categoryId) {
    return catalog.categories.find((category) => category.id === categoryId);
  }

  function algorithmHref(id) {
    return `${pagePrefix()}algorithm.html?id=${id}`;
  }

  function categoryHref(categoryId) {
    const category = categoryOf(categoryId);
    return `${pagePrefix()}${category.page}`;
  }

  function normalize(vector) {
    const total = vector.reduce((acc, value) => acc + value, 0);
    if (total <= 0) {
      return vector.map(() => 1 / vector.length);
    }
    return vector.map((value) => value / total);
  }

  function renderFormulaCards(container, cards) {
    container.innerHTML = `
      <div class="math-grid">
        ${cards
          .map(
            (card) => `
              <article class="formula-card">
                <h3>${card.title}</h3>
                <p>${card.description}</p>
                <code class="formula">${card.formula}</code>
              </article>
            `
          )
          .join("")}
      </div>
    `;
  }

  function drawScatterPoint(plot, chart, point, color, radius = 7) {
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
        x: chart.xScale(point.x) + 10,
        y: chart.yScale(point.y) - 9,
        class: "svg-label",
      })
    ).textContent = point.id;
  }

  function renderShell() {
    const category = categoryOf(definition.category);
    const related = catalog
      .byCategory(definition.category)
      .filter((entry) => entry.id !== definition.id)
      .slice(0, 4);
    document.title = `${definition.title} | Machine Learning Studio`;

    root.innerHTML = `
      <section class="page-hero algorithm-shell">
        <div class="algorithm-hero">
          <div>
            <div class="eyebrow">${category.title}</div>
            <h1>${definition.title}</h1>
            <p class="page-lead">${definition.subtitle}</p>
            <div class="breadcrumbs">
              <a href="../index.html">Home</a>
              <span>/</span>
              <a href="${categoryHref(definition.category)}">${category.title}</a>
              <span>/</span>
              <span>${definition.title}</span>
            </div>
          </div>
          <aside class="algorithm-hero-side">
            <div class="detail-card">
              <h3>What this page includes</h3>
              <ul class="dense-list">
                <li>Editable controls for the algorithm inputs</li>
                <li>Step-by-step math with numbers substituted from the current state</li>
                <li>A logic trail explaining why each update happens</li>
                <li>A detailed explanation section at the bottom</li>
              </ul>
            </div>
            <div class="detail-card">
              <h3>Category</h3>
              <p>${category.description}</p>
            </div>
          </aside>
        </div>
      </section>

      <section id="algorithm-workspace"></section>

      <section class="lab">
        <div class="section-header">
          <div>
            <div class="eyebrow">Detailed Explanation</div>
            <h2>Interpretation, math, usage, and failure modes</h2>
          </div>
        </div>
        <div class="detail-grid">
          <article class="detail-card">
            <h3>Intuition</h3>
            <p>${definition.detail.intuition}</p>
          </article>
          <article class="detail-card">
            <h3>Math</h3>
            <p>${definition.detail.math}</p>
          </article>
          <article class="detail-card">
            <h3>When To Use It</h3>
            <p>${definition.detail.use}</p>
          </article>
          <article class="detail-card">
            <h3>Watch Out For</h3>
            <p>${definition.detail.caution}</p>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <div>
            <div class="eyebrow">Related Pages</div>
            <h2>Stay in the same topic area</h2>
          </div>
        </div>
        <div class="related-grid">
          ${related
            .map(
              (entry) => `
                <article class="related-card">
                  <h3>${entry.title}</h3>
                  <p>${entry.summary}</p>
                  <p style="margin-top:16px"><a class="button ghost" href="${algorithmHref(entry.id)}">Open page</a></p>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
    `;

    const navMap = {
      foundations: "./introduction.html",
      classification: "./classification.html",
      "graphical-models": "./graphical-models.html",
      clustering: "./clustering.html",
    };
    U.qsa(".nav-links a").forEach((link) => {
      if (link.getAttribute("href") === navMap[definition.category]) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function mountSection(rootNode, title, intro, content) {
    rootNode.innerHTML = `
      <section class="lab">
        <div class="section-header">
          <div>
            <div class="eyebrow">Interactive Lab</div>
            <h2>${title}</h2>
          </div>
        </div>
        <p class="section-intro">${intro}</p>
        ${content}
      </section>
    `;
  }

  function mountConceptOverview(rootNode) {
    mountSection(
      rootNode,
      "Learning workflow explorer",
      "Choose a task family and reveal the workflow step by step. The formulas change with the task because the objective changes.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-group">
              <label for="overview-task">Task family</label>
              <select id="overview-task">
                <option value="classification">Classification</option>
                <option value="regression">Regression</option>
                <option value="clustering">Clustering</option>
                <option value="density">Density estimation</option>
              </select>
            </div>
            <div class="control-group">
              <label for="overview-feedback">Feedback available</label>
              <select id="overview-feedback">
                <option value="labels">Full labels</option>
                <option value="partial">Partial supervision</option>
                <option value="none">No labels</option>
              </select>
            </div>
            <div class="step-controls">
              <button class="button primary" id="overview-step">Next step</button>
              <button class="button secondary" id="overview-reset">Reset steps</button>
            </div>
            <div class="callout" id="overview-callout"></div>
          </div>
          <div class="two-column">
            <div class="equation-card" id="overview-math"></div>
            <div class="mini-panel" id="overview-summary"></div>
            <div class="steps"><ol id="overview-steps"></ol></div>
          </div>
        </div>
      `
    );

    const taskInput = rootNode.querySelector("#overview-task");
    const feedbackInput = rootNode.querySelector("#overview-feedback");
    const stepButton = rootNode.querySelector("#overview-step");
    const resetButton = rootNode.querySelector("#overview-reset");
    const mathNode = rootNode.querySelector("#overview-math");
    const summaryNode = rootNode.querySelector("#overview-summary");
    const stepsNode = rootNode.querySelector("#overview-steps");
    const callout = rootNode.querySelector("#overview-callout");
    let revealed = 0;

    function render() {
      const task = taskInput.value;
      const feedback = feedbackInput.value;
      const taskMap = {
        classification: {
          objective: "min_θ Σ_i L(f_θ(x_i), y_i)",
          metric: "accuracy, precision, recall, calibration",
          story: "Predict discrete labels from feature vectors.",
        },
        regression: {
          objective: "min_θ Σ_i (f_θ(x_i) - y_i)^2",
          metric: "MSE, MAE, R²",
          story: "Predict continuous targets from features.",
        },
        clustering: {
          objective: "min_C Σ_i distance(x_i, representative(C_i))",
          metric: "inertia, silhouette, linkage height",
          story: "Discover structure without labels.",
        },
        density: {
          objective: "max_θ Σ_i log p_θ(x_i)",
          metric: "log-likelihood, held-out density fit",
          story: "Model how observations are distributed.",
        },
      };
      const choice = taskMap[task];
      callout.innerHTML = `${choice.story} Current supervision level: <strong>${feedback}</strong>.`;
      renderFormulaCards(mathNode, [
        {
          title: "Core objective",
          description: "The algorithm family changes when the quantity being optimized changes.",
          formula: choice.objective,
        },
        {
          title: "Evaluation",
          description: "Good training is not enough; you need a matching evaluation criterion.",
          formula: choice.metric,
        },
      ]);
      summaryNode.innerHTML = `
        <h3>Workflow summary</h3>
        <p>Task: <strong>${task}</strong></p>
        <p>Feedback: <strong>${feedback}</strong></p>
        <p class="workspace-note">Changing the task family changes the target quantity, the loss, and the validation criterion.</p>
      `;
      const steps = [
        "<strong>Define the task.</strong> Decide what counts as an input, what counts as an output, and whether the output is observed.",
        `<strong>Choose an objective.</strong> For this page the objective is <span class="mono">${choice.objective}</span>.`,
        "<strong>Select a model family.</strong> The model class should match the assumptions of the task and the available feedback.",
        "<strong>Optimize on training data.</strong> Parameter updates or search steps reduce the chosen objective.",
        "<strong>Validate and iterate.</strong> Measure performance on held-out data and adjust the modeling choices if the fit does not generalize.",
      ];
      U.renderSteps(stepsNode, steps, revealed);
    }

    stepButton.addEventListener("click", () => {
      revealed = Math.min(revealed + 1, 5);
      render();
    });
    resetButton.addEventListener("click", () => {
      revealed = 0;
      render();
    });
    [taskInput, feedbackInput].forEach((input) =>
      input.addEventListener("input", () => {
        revealed = 0;
        render();
      })
    );
    render();
  }

  function mountConceptForms(rootNode) {
    mountSection(
      rootNode,
      "Learning-form comparer",
      "Switch the form of learning and reveal the matching objective and workflow. This page is interactive because the right algorithm family depends on the information you actually have.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-group">
              <label for="forms-mode">Learning form</label>
              <select id="forms-mode">
                <option value="supervised">Supervised</option>
                <option value="unsupervised">Unsupervised</option>
                <option value="semi-supervised">Semi-supervised</option>
                <option value="reinforcement">Reinforcement</option>
                <option value="generative">Generative</option>
              </select>
            </div>
            <div class="step-controls">
              <button class="button primary" id="forms-step">Next step</button>
              <button class="button secondary" id="forms-reset">Reset steps</button>
            </div>
            <div class="callout" id="forms-callout"></div>
          </div>
          <div class="two-column">
            <div class="equation-card" id="forms-math"></div>
            <div class="mini-panel" id="forms-summary"></div>
            <div class="steps"><ol id="forms-steps"></ol></div>
          </div>
        </div>
      `
    );

    const modeInput = rootNode.querySelector("#forms-mode");
    const stepButton = rootNode.querySelector("#forms-step");
    const resetButton = rootNode.querySelector("#forms-reset");
    const mathNode = rootNode.querySelector("#forms-math");
    const summaryNode = rootNode.querySelector("#forms-summary");
    const stepsNode = rootNode.querySelector("#forms-steps");
    const callout = rootNode.querySelector("#forms-callout");
    let revealed = 0;

    function render() {
      const mode = modeInput.value;
      const info = {
        supervised: {
          data: "Observed pairs (x, y)",
          objective: "min_θ Σ_i L(f_θ(x_i), y_i)",
          story: "Learn a mapping from inputs to known targets.",
        },
        unsupervised: {
          data: "Observed inputs x only",
          objective: "optimize structure or density criterion on x",
          story: "Find structure without external labels.",
        },
        "semi-supervised": {
          data: "Few labeled samples + many unlabeled samples",
          objective: "L_supervised + λ L_unlabeled",
          story: "Exploit both scarce labels and abundant unlabeled data.",
        },
        reinforcement: {
          data: "States, actions, rewards",
          objective: "max_π E[Σ_t γ^t r_t]",
          story: "Learn behavior from delayed reward signals.",
        },
        generative: {
          data: "Observed data plus a model for how it was produced",
          objective: "fit p(x, y, z, θ) or its factors",
          story: "Represent the data-generation process itself.",
        },
      }[mode];

      callout.innerHTML = info.story;
      renderFormulaCards(mathNode, [
        { title: "Available data", description: "The learning form begins with what is observed.", formula: info.data },
        { title: "Typical objective", description: "The objective reflects that information pattern.", formula: info.objective },
      ]);
      summaryNode.innerHTML = `
        <h3>Selected form</h3>
        <p><strong>${mode}</strong></p>
        <p class="workspace-note">Changing the learning form changes the information content, not just the algorithm name.</p>
      `;
      const steps = [
        "<strong>Inspect the information pattern.</strong> Ask what is observed and what must be inferred.",
        `<strong>Write the objective.</strong> For this form use <span class="mono">${info.objective}</span>.`,
        "<strong>Choose a model family.</strong> Pick models that can actually use the available supervision signal.",
        "<strong>Fit or update.</strong> Apply the learning rule appropriate to the objective and data type.",
        "<strong>Evaluate accordingly.</strong> The validation method should match the learning signal and the final task.",
      ];
      U.renderSteps(stepsNode, steps, revealed);
    }

    stepButton.addEventListener("click", () => {
      revealed = Math.min(revealed + 1, 5);
      render();
    });
    resetButton.addEventListener("click", () => {
      revealed = 0;
      render();
    });
    modeInput.addEventListener("input", () => {
      revealed = 0;
      render();
    });
    render();
  }

  function mountConceptTools(rootNode) {
    mountSection(
      rootNode,
      "Applications and toolchain selector",
      "Pick an application domain and a software stack. The page links the domain objective to a reasonable mathematical workflow and implementation stack.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-group">
              <label for="tools-domain">Application domain</label>
              <select id="tools-domain">
                <option value="healthcare">Healthcare risk modeling</option>
                <option value="robotics">Robotics state estimation</option>
                <option value="recommendation">Recommendation systems</option>
                <option value="finance">Financial forecasting</option>
              </select>
            </div>
            <div class="control-group">
              <label for="tools-stack">Software stack</label>
              <select id="tools-stack">
                <option value="sklearn">NumPy + pandas + scikit-learn</option>
                <option value="pytorch">PyTorch ecosystem</option>
                <option value="tensorflow">TensorFlow ecosystem</option>
                <option value="pymc">PyMC / probabilistic programming</option>
              </select>
            </div>
            <div class="step-controls">
              <button class="button primary" id="tools-step">Next step</button>
              <button class="button secondary" id="tools-reset">Reset steps</button>
            </div>
            <div class="callout" id="tools-callout"></div>
          </div>
          <div class="two-column">
            <div class="equation-card" id="tools-math"></div>
            <div class="mini-panel" id="tools-summary"></div>
            <div class="steps"><ol id="tools-steps"></ol></div>
          </div>
        </div>
      `
    );

    const domainInput = rootNode.querySelector("#tools-domain");
    const stackInput = rootNode.querySelector("#tools-stack");
    const stepButton = rootNode.querySelector("#tools-step");
    const resetButton = rootNode.querySelector("#tools-reset");
    const mathNode = rootNode.querySelector("#tools-math");
    const summaryNode = rootNode.querySelector("#tools-summary");
    const stepsNode = rootNode.querySelector("#tools-steps");
    const callout = rootNode.querySelector("#tools-callout");
    let revealed = 0;

    function render() {
      const domain = domainInput.value;
      const stack = stackInput.value;
      const map = {
        healthcare: {
          objective: "minimize calibrated risk-prediction error under missing and noisy measurements",
          algorithms: "logistic regression, Bayesian estimation, trees, survival models",
        },
        robotics: {
          objective: "estimate hidden state and uncertainty sequentially from noisy sensors",
          algorithms: "Bayesian estimation, HMMs, Kalman-style filters, graphical models",
        },
        recommendation: {
          objective: "predict preference or ranking from sparse user-item interactions",
          algorithms: "nearest neighbours, matrix factorization, probabilistic models",
        },
        finance: {
          objective: "forecast or detect regime changes under uncertainty and nonstationarity",
          algorithms: "density estimation, Markov models, Bayesian updates, classifiers",
        },
      }[domain];
      const stackMap = {
        sklearn: "Best for classical tabular workflows and fast experimentation.",
        pytorch: "Best when custom differentiable models or deep architectures are needed.",
        tensorflow: "Strong for production pipelines and large neural computation graphs.",
        pymc: "Strong when posterior inference and uncertainty are first-class requirements.",
      }[stack];

      callout.innerHTML = `${map.algorithms}. ${stackMap}`;
      renderFormulaCards(mathNode, [
        { title: "Domain objective", description: "The domain determines what a good model must optimize.", formula: map.objective },
        { title: "Tooling fit", description: "The stack should fit the math and deployment constraints.", formula: stackMap },
      ]);
      summaryNode.innerHTML = `
        <h3>Selected pipeline</h3>
        <p>Domain: <strong>${domain}</strong></p>
        <p>Stack: <strong>${stack}</strong></p>
      `;
      const steps = [
        "<strong>Define the business or scientific target.</strong> The correct algorithm follows from the real objective, not from a library preference.",
        "<strong>Inspect the data quality.</strong> Missingness, label noise, and sequence structure narrow the set of reasonable models.",
        "<strong>Choose a model family.</strong> Match the domain needs to a mathematically suitable algorithm.",
        "<strong>Choose the implementation stack.</strong> Use the tooling that best supports that model family.",
        "<strong>Validate operationally.</strong> Deployment constraints, uncertainty needs, and monitoring requirements matter as much as accuracy.",
      ];
      U.renderSteps(stepsNode, steps, revealed);
    }

    stepButton.addEventListener("click", () => {
      revealed = Math.min(revealed + 1, 5);
      render();
    });
    resetButton.addEventListener("click", () => {
      revealed = 0;
      render();
    });
    [domainInput, stackInput].forEach((input) =>
      input.addEventListener("input", () => {
        revealed = 0;
        render();
      })
    );
    render();
  }

  function mountGaussian(rootNode) {
    const focus = definition.options.focus;
    mountSection(
      rootNode,
      "Gaussian evidence and posterior explorer",
      "Edit the sample and prior, then reveal the derivation. The formula cards update with the current numbers so the algebra stays tied to the data.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-group">
              <label for="gaussian-samples">Samples</label>
              <textarea id="gaussian-samples">2.2, 1.7, 2.6, 1.9, 2.4, 2.1, 2.8</textarea>
            </div>
            <div class="control-grid">
              <div class="control-group">
                <label for="prior-mean">Prior mean</label>
                <input id="prior-mean" type="number" step="0.1" value="1.5" />
              </div>
              <div class="control-group">
                <label for="prior-variance">Prior variance</label>
                <input id="prior-variance" type="number" step="0.1" min="0.1" value="0.9" />
              </div>
              <div class="control-group">
                <label for="obs-variance">Observation variance</label>
                <input id="obs-variance" type="number" step="0.1" min="0.1" value="0.6" />
              </div>
              <div class="control-group">
                <label for="query-x">Query x</label>
                <input id="query-x" type="number" step="0.1" value="2.3" />
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="gaussian-step">Next step</button>
              <button class="button secondary" id="gaussian-reset">Reset steps</button>
            </div>
            <div class="callout" id="gaussian-callout"></div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="gaussian-plot" viewBox="0 0 560 280" aria-label="Gaussian estimation plot"></svg>
            </div>
            <div class="readout"><div class="output-grid" id="gaussian-output"></div></div>
            <div class="equation-card" id="gaussian-math"></div>
            <div class="steps"><ol id="gaussian-steps"></ol></div>
          </div>
        </div>
      `
    );

    const samplesInput = rootNode.querySelector("#gaussian-samples");
    const priorMeanInput = rootNode.querySelector("#prior-mean");
    const priorVarianceInput = rootNode.querySelector("#prior-variance");
    const obsVarianceInput = rootNode.querySelector("#obs-variance");
    const queryInput = rootNode.querySelector("#query-x");
    const stepButton = rootNode.querySelector("#gaussian-step");
    const resetButton = rootNode.querySelector("#gaussian-reset");
    const plot = rootNode.querySelector("#gaussian-plot");
    const output = rootNode.querySelector("#gaussian-output");
    const mathNode = rootNode.querySelector("#gaussian-math");
    const stepsNode = rootNode.querySelector("#gaussian-steps");
    const callout = rootNode.querySelector("#gaussian-callout");
    let revealed = 0;

    function render() {
      const samples = U.parseNumberList(samplesInput.value);
      const priorMean = Number(priorMeanInput.value) || 0;
      const priorVariance = Math.max(Number(priorVarianceInput.value) || 1, 0.05);
      const obsVariance = Math.max(Number(obsVarianceInput.value) || 1, 0.05);
      const query = Number(queryInput.value) || 0;

      if (!samples.length) {
        U.renderMetrics(output, [{ label: "Status", value: "Add samples" }]);
        U.renderSteps(stepsNode, [], 0);
        renderFormulaCards(mathNode, []);
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
      const predictiveDensity = U.gaussianPdf(query, posteriorMean, posteriorVariance + obsVariance);
      const logLikelihood =
        -0.5 * samples.length * Math.log(2 * Math.PI * obsVariance) -
        samples.reduce((acc, value) => acc + ((value - sampleMean) ** 2) / (2 * obsVariance), 0);

      callout.innerHTML = {
        gaussian: "This page emphasizes the Gaussian summary itself: mean and variance compress the sample into a tractable model.",
        mle: "This page emphasizes the likelihood term. The MLE is the parameter setting that maximizes it.",
        map: "This page emphasizes how the prior shifts the estimate away from the pure MLE.",
        bayesian: "This page emphasizes the full posterior, not only a single point estimate.",
        generative: "This page emphasizes the data-generation story: likelihood, prior, and posterior all belong to the same generative account.",
      }[focus];

      U.renderMetrics(output, [
        { label: "Sample mean", value: U.round(sampleMean, 3) },
        { label: "MLE variance", value: U.round(mleVariance, 3) },
        { label: "Posterior mean", value: U.round(posteriorMean, 3) },
        { label: "p(x=query)", value: U.round(predictiveDensity, 4) },
      ]);

      renderFormulaCards(mathNode, [
        {
          title: "Sample mean",
          description: "The empirical center of the observed sample.",
          formula: `x̄ = (${samples.map((value) => U.round(value, 2)).join(" + ")}) / ${samples.length} = ${U.round(sampleMean, 3)}`,
        },
        {
          title: focus === "mle" ? "Log-likelihood" : "Gaussian likelihood",
          description: focus === "mle" ? "MLE maximizes this expression with respect to the parameters." : "The sample likelihood under a Gaussian observation model.",
          formula:
            focus === "mle"
              ? `log p(D|μ=x̄) = ${U.round(logLikelihood, 3)}`
              : `p(D|μ,σ²) = ∏_i N(x_i | μ, σ²_obs)`,
        },
        {
          title: focus === "map" ? "MAP / posterior mode" : "Posterior update",
          description: "Prior precision and data precision combine additively.",
          formula: `μ_post = [(${samples.length}/${U.round(obsVariance, 2)})·${U.round(sampleMean, 3)} + (1/${U.round(priorVariance, 2)})·${U.round(priorMean, 3)}] / [${U.round(samples.length / obsVariance + 1 / priorVariance, 3)}] = ${U.round(posteriorMean, 3)}`,
        },
        {
          title: focus === "bayesian" ? "Posterior variance" : "Predictive density",
          description: focus === "bayesian" ? "Uncertainty shrinks as precision grows." : "Integrate over posterior uncertainty before predicting a new x.",
          formula:
            focus === "bayesian"
              ? `σ²_post = 1 / (${U.round(samples.length / obsVariance + 1 / priorVariance, 3)}) = ${U.round(posteriorVariance, 3)}`
              : `p(x=${U.round(query, 2)}|D) = N(${U.round(query, 2)} | ${U.round(posteriorMean, 3)}, ${U.round(obsVariance + posteriorVariance, 3)}) = ${U.round(predictiveDensity, 4)}`,
        },
      ]);

      const steps = [
        `<strong>Summarize the sample.</strong> There are <strong>${samples.length}</strong> observations and their mean is <strong>${U.round(sampleMean, 3)}</strong>.`,
        `<strong>Compute the Gaussian fit.</strong> The sample variance estimate is <strong>${U.round(mleVariance, 3)}</strong>.`,
        `<strong>Write the likelihood.</strong> The Gaussian model contributes a product of densities over the sample.`,
        `<strong>Combine with the prior.</strong> Prior precision <span class="mono">${U.round(1 / priorVariance, 3)}</span> and data precision <span class="mono">${U.round(samples.length / obsVariance, 3)}</span> add.`,
        `<strong>Read the posterior.</strong> The posterior mean is <strong>${U.round(posteriorMean, 3)}</strong> with variance <strong>${U.round(posteriorVariance, 3)}</strong>.`,
      ];
      U.renderSteps(stepsNode, steps, revealed);

      const xMin = Math.min(...samples, priorMean, query) - 1;
      const xMax = Math.max(...samples, priorMean, query) + 1;
      const xs = U.linspace(xMin, xMax, 180);
      const priorCurve = xs.map((x) => ({ x, y: U.gaussianPdf(x, priorMean, priorVariance) }));
      const mleCurve = xs.map((x) => ({ x, y: U.gaussianPdf(x, sampleMean, Math.max(mleVariance, 0.08)) }));
      const posteriorCurve = xs.map((x) => ({ x, y: U.gaussianPdf(x, posteriorMean, obsVariance + posteriorVariance) }));
      const yMax = Math.max(...priorCurve.map((p) => p.y), ...mleCurve.map((p) => p.y), ...posteriorCurve.map((p) => p.y)) * 1.25;
      const chart = U.makeChart(plot, {
        xDomain: [xMin, xMax],
        yDomain: [0, yMax],
        title: "Prior, MLE fit, and posterior predictive",
      });

      plot.appendChild(U.svgEl("path", { d: U.pathFromPoints(priorCurve, chart.xScale, chart.yScale), fill: "none", stroke: "#6f8a88", "stroke-width": "2.4", "stroke-dasharray": "4 6" }));
      plot.appendChild(U.svgEl("path", { d: U.pathFromPoints(mleCurve, chart.xScale, chart.yScale), class: "curve-primary" }));
      plot.appendChild(U.svgEl("path", { d: U.pathFromPoints(posteriorCurve, chart.xScale, chart.yScale), class: "curve-secondary" }));
      samples.forEach((sample) => {
        const x = chart.xScale(sample);
        plot.appendChild(U.svgEl("line", { x1: x, y1: chart.yScale(0), x2: x, y2: chart.yScale(yMax * 0.08), stroke: "#2f4057", "stroke-width": "1.8" }));
      });
      plot.appendChild(U.svgEl("line", { x1: chart.xScale(query), y1: chart.yScale(0), x2: chart.xScale(query), y2: chart.yScale(yMax * 0.9), stroke: "#d26f2f", "stroke-width": "2", "stroke-dasharray": "6 6" }));
    }

    stepButton.addEventListener("click", () => {
      revealed = Math.min(revealed + 1, 5);
      render();
    });
    resetButton.addEventListener("click", () => {
      revealed = 0;
      render();
    });
    [samplesInput, priorMeanInput, priorVarianceInput, obsVarianceInput, queryInput].forEach((input) =>
      input.addEventListener("input", () => {
        revealed = 0;
        render();
      })
    );
    render();
  }

  function mountBiasVariance(rootNode) {
    mountSection(
      rootNode,
      "Bias-variance simulation",
      "Change the true distribution, sample size, and shrinkage factor. The page simulates repeated datasets and computes the bias-variance decomposition numerically.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-grid">
              <div class="control-group">
                <label for="true-mean">True mean</label>
                <input id="true-mean" type="number" step="0.5" value="3" />
              </div>
              <div class="control-group">
                <label for="true-std">True standard deviation</label>
                <input id="true-std" type="number" step="0.1" min="0.2" value="1.2" />
              </div>
              <div class="control-group">
                <label for="sample-size">Sample size</label>
                <input id="sample-size" type="number" min="2" max="60" value="8" />
              </div>
              <div class="control-group">
                <label for="simulations">Simulations</label>
                <input id="simulations" type="number" min="50" max="1000" value="250" />
              </div>
            </div>
            <div class="control-group">
              <label for="shrinkage">Estimator shrinkage factor</label>
              <div class="range-row">
                <input id="shrinkage" type="range" min="0.2" max="1.4" step="0.05" value="0.9" />
                <span class="range-value" id="shrinkage-value">0.90</span>
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="bias-step">Next step</button>
              <button class="button secondary" id="bias-reset">Reset steps</button>
            </div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="bias-plot" viewBox="0 0 560 280" aria-label="Bias variance plot"></svg>
            </div>
            <div class="readout"><div class="output-grid" id="bias-output"></div></div>
            <div class="equation-card" id="bias-math"></div>
            <div class="steps"><ol id="bias-steps"></ol></div>
          </div>
        </div>
      `
    );

    const trueMeanInput = rootNode.querySelector("#true-mean");
    const trueStdInput = rootNode.querySelector("#true-std");
    const sampleSizeInput = rootNode.querySelector("#sample-size");
    const simulationsInput = rootNode.querySelector("#simulations");
    const shrinkageInput = rootNode.querySelector("#shrinkage");
    const shrinkageValue = rootNode.querySelector("#shrinkage-value");
    const stepButton = rootNode.querySelector("#bias-step");
    const resetButton = rootNode.querySelector("#bias-reset");
    const plot = rootNode.querySelector("#bias-plot");
    const output = rootNode.querySelector("#bias-output");
    const mathNode = rootNode.querySelector("#bias-math");
    const stepsNode = rootNode.querySelector("#bias-steps");
    let revealed = 0;

    function render() {
      const trueMean = Number(trueMeanInput.value) || 0;
      const trueStd = Math.max(Number(trueStdInput.value) || 1, 0.05);
      const sampleSize = Math.max(Number(sampleSizeInput.value) || 2, 2);
      const simulations = Math.max(Number(simulationsInput.value) || 50, 20);
      const shrinkage = Number(shrinkageInput.value) || 1;
      shrinkageValue.textContent = shrinkage.toFixed(2);

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
      const mse = U.mean(estimates.map((value) => (value - trueMean) ** 2));

      U.renderMetrics(output, [
        { label: "Average estimate", value: U.round(estimateMean, 3) },
        { label: "Bias", value: U.round(bias, 3) },
        { label: "Variance", value: U.round(variance, 3) },
        { label: "MSE", value: U.round(mse, 3) },
      ]);

      renderFormulaCards(mathNode, [
        { title: "Estimator", description: "The simulation uses a shrunk sample mean.", formula: `μ̂ = c·x̄ = ${U.round(shrinkage, 2)}·x̄` },
        { title: "Bias", description: "Average displacement from the true parameter.", formula: `Bias = E[μ̂] - μ = ${U.round(estimateMean, 3)} - ${U.round(trueMean, 3)} = ${U.round(bias, 3)}` },
        { title: "Variance", description: "Sensitivity to which dataset arrived.", formula: `Var(μ̂) = ${U.round(variance, 3)}` },
        { title: "Mean squared error", description: "Bias and variance combine additively.", formula: `MSE = Bias² + Var = ${U.round(bias * bias, 3)} + ${U.round(variance, 3)} = ${U.round(mse, 3)}` },
      ]);

      const steps = [
        `<strong>Generate ${simulations} datasets.</strong> Each dataset contains ${sampleSize} draws from the true Gaussian.`,
        `<strong>Apply the estimator.</strong> The estimator multiplies the sample mean by <span class="mono">${U.round(shrinkage, 2)}</span>.`,
        `<strong>Compute bias.</strong> The empirical mean estimate is <strong>${U.round(estimateMean, 3)}</strong>, so the bias is <strong>${U.round(bias, 3)}</strong>.`,
        `<strong>Compute variance.</strong> Across runs the estimator varies by <strong>${U.round(variance, 3)}</strong>.`,
        `<strong>Compute MSE.</strong> Squared bias and variance sum to <strong>${U.round(mse, 3)}</strong>.`,
      ];
      U.renderSteps(stepsNode, steps, revealed);

      const bars = [
        { label: "bias²", value: bias * bias, color: "#d26f2f" },
        { label: "variance", value: variance, color: "#1f7a70" },
        { label: "mse", value: mse, color: "#2f4057" },
      ];
      const yMax = Math.max(...bars.map((item) => item.value), 0.02) * 1.25;
      const chart = U.makeChart(plot, {
        xDomain: [0, 4],
        yDomain: [0, yMax],
        title: "Bias-variance decomposition",
      });
      bars.forEach((bar, index) => {
        const x1 = chart.xScale(index + 0.45);
        const x2 = chart.xScale(index + 1.05);
        const y = chart.yScale(bar.value);
        plot.appendChild(U.svgEl("rect", { x: x1, y, width: x2 - x1, height: chart.yScale(0) - y, fill: bar.color, rx: "12", opacity: "0.9" }));
        plot.appendChild(U.svgEl("text", { x: (x1 + x2) / 2, y: chart.yScale(0) + 18, class: "svg-label", "text-anchor": "middle" })).textContent = bar.label;
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
    [trueMeanInput, trueStdInput, sampleSizeInput, simulationsInput, shrinkageInput].forEach((input) =>
      input.addEventListener("input", () => {
        revealed = 0;
        render();
      })
    );
    render();
  }

  function mountCleanup(rootNode) {
    mountSection(
      rootNode,
      "Missing-value and noise cleanup lab",
      "Choose an imputation rule and a noise clamp. The formulas show exactly how missing values and extreme z-scores are transformed before modeling begins.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-group">
              <label for="cleanup-method">Missing-value strategy</label>
              <select id="cleanup-method">
                <option value="mean">Mean imputation</option>
                <option value="median">Median imputation</option>
                <option value="drop">Drop incomplete rows</option>
              </select>
            </div>
            <div class="control-group">
              <label for="noise-clamp">Clamp unusually noisy values at ± this z-score</label>
              <div class="range-row">
                <input id="noise-clamp" type="range" min="0.8" max="3" step="0.1" value="1.8" />
                <span class="range-value" id="noise-clamp-value">1.8</span>
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="cleanup-apply">Apply cleanup</button>
            </div>
            <div class="callout" id="cleanup-summary"></div>
          </div>
          <div class="two-column">
            <div class="table-panel">
              <table>
                <thead>
                  <tr>
                    <th>Example</th>
                    <th>Feature A</th>
                    <th>Feature B</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="cleanup-table"></tbody>
              </table>
            </div>
            <div class="plot-card">
              <svg id="cleanup-plot" viewBox="0 0 560 280" aria-label="Cleaned features plot"></svg>
            </div>
            <div class="equation-card" id="cleanup-math"></div>
          </div>
        </div>
      `
    );

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
    const methodInput = rootNode.querySelector("#cleanup-method");
    const clampInput = rootNode.querySelector("#noise-clamp");
    const clampValue = rootNode.querySelector("#noise-clamp-value");
    const button = rootNode.querySelector("#cleanup-apply");
    const summary = rootNode.querySelector("#cleanup-summary");
    const tableBody = rootNode.querySelector("#cleanup-table");
    const plot = rootNode.querySelector("#cleanup-plot");
    const mathNode = rootNode.querySelector("#cleanup-math");

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
          cleaned.push({ id: row.id, a: row.a, b: row.b, status: "Dropped for missing value", dropped: true });
          return;
        }
        const next = {
          id: row.id,
          a: Number.isFinite(row.a) ? row.a : fillA,
          b: Number.isFinite(row.b) ? row.b : fillB,
          dropped: false,
          changed: !Number.isFinite(row.a) || !Number.isFinite(row.b),
          statusParts: [],
        };
        if (!Number.isFinite(row.a)) {
          next.statusParts.push(`imputed A=${U.round(fillA, 2)}`);
          imputedCount += 1;
        }
        if (!Number.isFinite(row.b)) {
          next.statusParts.push(`imputed B=${U.round(fillB, 2)}`);
          imputedCount += 1;
        }
        cleaned.push(next);
      });
      const retained = cleaned.filter((row) => !row.dropped);
      const means = { a: U.mean(retained.map((row) => row.a)), b: U.mean(retained.map((row) => row.b)) };
      const stds = { a: Math.sqrt(U.variance(retained.map((row) => row.a))), b: Math.sqrt(U.variance(retained.map((row) => row.b))) };

      retained.forEach((row) => {
        ["a", "b"].forEach((feature) => {
          if (stds[feature] <= 1e-6) {
            return;
          }
          const z = (row[feature] - means[feature]) / stds[feature];
          if (Math.abs(z) > clampZ) {
            row[feature] = means[feature] + Math.sign(z) * clampZ * stds[feature];
            row.changed = true;
            row.statusParts.push(`clamped ${feature.toUpperCase()}`);
            clampedCount += 1;
          }
        });
      });
      cleaned.forEach((row) => {
        row.status = row.dropped ? row.status : row.statusParts.length ? row.statusParts.join(", ") : "Kept as-is";
      });

      summary.innerHTML = `${retained.length} rows remain. ${imputedCount} feature values were imputed and ${clampedCount} were clamped.`;
      tableBody.innerHTML = cleaned
        .map(
          (row) => `
            <tr>
              <td>${row.id}</td>
              <td>${Number.isFinite(row.a) ? U.round(row.a, 2) : "?"}</td>
              <td>${Number.isFinite(row.b) ? U.round(row.b, 2) : "?"}</td>
              <td>${row.status}</td>
            </tr>
          `
        )
        .join("");

      renderFormulaCards(mathNode, [
        { title: "Imputation rule", description: "Missing values are replaced before modeling.", formula: method === "drop" ? "remove rows with missing features" : `${method}(A) = ${U.round(fillA, 2)}, ${method}(B) = ${U.round(fillB, 2)}` },
        { title: "Noise rule", description: "Large z-scores are clipped to the threshold.", formula: `x' = μ + sign(z)·min(|z|, ${clampZ.toFixed(1)})·σ` },
      ]);

      const chart = U.makeChart(plot, {
        xDomain: [0, 8.8],
        yDomain: [0, 8.8],
        title: "Original points vs cleaned points",
      });
      baseData.forEach((row) => {
        if (!Number.isFinite(row.a) || !Number.isFinite(row.b)) {
          return;
        }
        plot.appendChild(U.svgEl("circle", { cx: chart.xScale(row.a), cy: chart.yScale(row.b), r: 5, fill: "#6d6457", opacity: "0.24" }));
      });
      cleaned.forEach((row) => {
        if (row.dropped || !Number.isFinite(row.a) || !Number.isFinite(row.b)) {
          return;
        }
        drawScatterPoint(plot, chart, row, row.changed ? "#d26f2f" : "#1f7a70", row.changed ? 8 : 7);
      });
    }

    button.addEventListener("click", render);
    [methodInput, clampInput].forEach((input) => input.addEventListener("input", render));
    render();
  }

  function mountKde(rootNode) {
    mountSection(
      rootNode,
      "Kernel density estimation",
      "Adjust the bandwidth and reveal one kernel at a time. The formula panel keeps the KDE sum visible while the plot shows how local bumps aggregate into a global density.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-group">
              <label for="kde-samples">1D samples</label>
              <textarea id="kde-samples">0.9, 1.1, 1.8, 2.0, 2.1, 2.8, 3.1, 3.3, 4.4</textarea>
            </div>
            <div class="control-group">
              <label for="kde-bandwidth">Bandwidth</label>
              <div class="range-row">
                <input id="kde-bandwidth" type="range" min="0.15" max="1.2" step="0.05" value="0.45" />
                <span class="range-value" id="kde-bandwidth-value">0.45</span>
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="kde-step">Next step</button>
              <button class="button secondary" id="kde-reset">Reset steps</button>
            </div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="kde-plot" viewBox="0 0 560 280" aria-label="Kernel density estimation plot"></svg>
            </div>
            <div class="equation-card" id="kde-math"></div>
            <div class="steps"><ol id="kde-steps"></ol></div>
          </div>
        </div>
      `
    );

    const samplesInput = rootNode.querySelector("#kde-samples");
    const bandwidthInput = rootNode.querySelector("#kde-bandwidth");
    const bandwidthValue = rootNode.querySelector("#kde-bandwidth-value");
    const stepButton = rootNode.querySelector("#kde-step");
    const resetButton = rootNode.querySelector("#kde-reset");
    const plot = rootNode.querySelector("#kde-plot");
    const mathNode = rootNode.querySelector("#kde-math");
    const stepsNode = rootNode.querySelector("#kde-steps");
    let revealed = 0;

    function render() {
      const samples = U.parseNumberList(samplesInput.value);
      const bandwidth = Math.max(Number(bandwidthInput.value) || 0.4, 0.08);
      bandwidthValue.textContent = bandwidth.toFixed(2);
      if (!samples.length) {
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
          samples.reduce((acc, center) => acc + U.gaussianPdf(x, center, bandwidth * bandwidth), 0) /
          samples.length,
      }));
      const yMax = Math.max(...total.map((point) => point.y), ...kernels.flat().map((point) => point.y)) * 1.25;

      renderFormulaCards(mathNode, [
        {
          title: "KDE formula",
          description: "Average one kernel per sample.",
          formula: `p̂(x) = (1/${samples.length}) Σ_i K((x - x_i)/${bandwidth.toFixed(2)}) / ${bandwidth.toFixed(2)}`,
        },
        {
          title: "Bandwidth effect",
          description: "Bandwidth controls smoothness.",
          formula: `h = ${bandwidth.toFixed(2)} → smaller h = sharper estimate, larger h = smoother estimate`,
        },
      ]);

      const steps = samples.map(
        (sample, index) =>
          `<strong>Kernel ${index + 1}.</strong> Center a Gaussian bump at <strong>${U.round(sample, 2)}</strong>.`
      );
      steps.push("<strong>Average the kernels.</strong> The final density is the pointwise average of all kernel contributions.");
      U.renderSteps(stepsNode, steps, revealed);

      const chart = U.makeChart(plot, {
        xDomain: [xMin, xMax],
        yDomain: [0, yMax],
        title: "Kernel contributions and final density",
      });
      samples.forEach((sample) => {
        const x = chart.xScale(sample);
        plot.appendChild(U.svgEl("line", { x1: x, y1: chart.yScale(0), x2: x, y2: chart.yScale(yMax * 0.08), stroke: "#2f4057", "stroke-width": "1.6" }));
      });
      for (let index = 0; index < Math.min(revealed, samples.length); index += 1) {
        plot.appendChild(U.svgEl("path", { d: U.pathFromPoints(kernels[index], chart.xScale, chart.yScale), fill: "none", stroke: index % 2 ? "#d26f2f" : "#1f7a70", "stroke-width": "2.2", opacity: "0.6" }));
      }
      if (revealed > samples.length) {
        plot.appendChild(U.svgEl("path", { d: U.pathFromPoints(total, chart.xScale, chart.yScale), class: "curve-primary" }));
      }
    }

    stepButton.addEventListener("click", () => {
      const count = U.parseNumberList(samplesInput.value).length;
      revealed = Math.min(revealed + 1, count + 1);
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

  function mountKnn(rootNode) {
    mountSection(
      rootNode,
      "k-nearest neighbour voting",
      "Move the query point and reveal neighbours one by one. The math panel keeps the distance definition and majority vote visible as the classifier forms.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-grid">
              <div class="control-group">
                <label for="knn-k">k neighbours</label>
                <input id="knn-k" type="number" min="1" max="7" value="3" />
              </div>
              <div class="control-group">
                <label for="knn-metric">Distance</label>
                <select id="knn-metric">
                  <option value="euclidean">Euclidean</option>
                  <option value="manhattan">Manhattan</option>
                </select>
              </div>
              <div class="control-group">
                <label for="knn-query-x">Query x</label>
                <input id="knn-query-x" type="number" min="0" max="10" step="0.1" value="5.4" />
              </div>
              <div class="control-group">
                <label for="knn-query-y">Query y</label>
                <input id="knn-query-y" type="number" min="0" max="10" step="0.1" value="4.4" />
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="knn-step">Next neighbour</button>
              <button class="button secondary" id="knn-reset">Reset</button>
            </div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="knn-plot" viewBox="0 0 560 280" aria-label="k nearest neighbours plot"></svg>
            </div>
            <div class="readout"><div class="output-grid" id="knn-output"></div></div>
            <div class="equation-card" id="knn-math"></div>
            <div class="steps"><ol id="knn-steps"></ol></div>
            <div class="table-panel">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Point</th>
                    <th>Class</th>
                    <th>Distance</th>
                  </tr>
                </thead>
                <tbody id="knn-table"></tbody>
              </table>
            </div>
          </div>
        </div>
      `
    );

    const kInput = rootNode.querySelector("#knn-k");
    const metricInput = rootNode.querySelector("#knn-metric");
    const queryXInput = rootNode.querySelector("#knn-query-x");
    const queryYInput = rootNode.querySelector("#knn-query-y");
    const stepButton = rootNode.querySelector("#knn-step");
    const resetButton = rootNode.querySelector("#knn-reset");
    const plot = rootNode.querySelector("#knn-plot");
    const output = rootNode.querySelector("#knn-output");
    const mathNode = rootNode.querySelector("#knn-math");
    const stepsNode = rootNode.querySelector("#knn-steps");
    const table = rootNode.querySelector("#knn-table");
    let revealed = 0;

    function render() {
      const k = Math.max(Number(kInput.value) || 3, 1);
      const metric = metricInput.value;
      const query = { id: "Q", x: Number(queryXInput.value) || 0, y: Number(queryYInput.value) || 0 };
      const sorted = knnPoints
        .map((point) => ({ ...point, distance: U.distance(point, query, metric) }))
        .sort((a, b) => a.distance - b.distance);
      const visibleCount = Math.max(0, Math.min(k, revealed - 2));
      const visible = sorted.slice(0, visibleCount);
      const votes = visible.reduce(
        (acc, point) => {
          acc[point.label] += 1;
          return acc;
        },
        { A: 0, B: 0 }
      );
      const prediction =
        visibleCount < k ? "Pending" : votes.A === votes.B ? "Tie" : votes.A > votes.B ? "Class A" : "Class B";
      U.renderMetrics(output, [
        { label: "k", value: String(k) },
        { label: "Metric", value: metric },
        { label: "Vote", value: `${votes.A} : ${votes.B}` },
        { label: "Prediction", value: prediction },
      ]);
      renderFormulaCards(mathNode, [
        {
          title: "Distance",
          description: "k-NN relies entirely on the chosen metric.",
          formula:
            metric === "euclidean"
              ? `d(x,q) = √((x₁-q₁)² + (x₂-q₂)²)`
              : `d(x,q) = |x₁-q₁| + |x₂-q₂|`,
        },
        {
          title: "Vote rule",
          description: "Use the first k neighbours after sorting by distance.",
          formula: `ŷ = mode({y_(1), …, y_(${k})}) = ${prediction}`,
        },
      ]);
      const steps = [
        "<strong>Measure distances.</strong> Compare the query to every labeled example.",
        "<strong>Sort by closeness.</strong> The nearest examples become the most relevant evidence.",
        ...sorted.slice(0, k).map(
          (point, index) =>
            `<strong>Neighbour ${index + 1}.</strong> ${point.id} is class <strong>${point.label}</strong> at distance <strong>${U.round(point.distance, 3)}</strong>.`
        ),
        `<strong>Vote.</strong> Among the first ${k} neighbours the majority class is <strong>${prediction}</strong>.`,
      ];
      U.renderSteps(stepsNode, steps, revealed);
      table.innerHTML = sorted
        .map(
          (point, index) => `
            <tr style="background:${index < visibleCount ? "rgba(31,122,112,0.08)" : "transparent"}">
              <td>${index + 1}</td>
              <td>${point.id} (${U.round(point.x, 1)}, ${U.round(point.y, 1)})</td>
              <td>${point.label}</td>
              <td>${U.round(point.distance, 3)}</td>
            </tr>
          `
        )
        .join("");

      const chart = U.makeChart(plot, { xDomain: [0, 10], yDomain: [0, 10], title: "Neighbourhood around the query" });
      sorted.slice(0, visibleCount).forEach((point) => {
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
      knnPoints.forEach((point) => drawScatterPoint(plot, chart, point, point.label === "A" ? "#1f7a70" : "#d26f2f", visible.some((entry) => entry.id === point.id) ? 9 : 7));
      const qx = chart.xScale(query.x);
      const qy = chart.yScale(query.y);
      plot.appendChild(U.svgEl("polygon", { points: `${qx},${qy - 11} ${qx + 11},${qy} ${qx},${qy + 11} ${qx - 11},${qy}`, fill: "#2f4057" }));
      plot.appendChild(U.svgEl("text", { x: qx + 14, y: qy - 12, class: "svg-label" })).textContent = "Query";
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
    const avg = U.mean(rows.map((row) => row.score));
    return U.mean(rows.map((row) => (row.score - avg) ** 2));
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
          const score = parent - (left.length / rows.length) * gini(left) - (right.length / rows.length) * gini(right);
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
      const score = parent - (left.length / rows.length) * mse(left) - (right.length / rows.length) * mse(right);
      return { feature: "hours", threshold, score, left, right };
    });
  }

  function mountTree(rootNode) {
    const allowModeSwitch = definition.id === "classification-and-regression-trees";
    const initialMode = definition.options.mode || "classification";
    mountSection(
      rootNode,
      "Greedy tree split explorer",
      "Advance the tree one split at a time. Candidate thresholds are scored explicitly so the greedy choice is visible instead of implicit.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-grid">
              <div class="control-group">
                <label for="tree-mode">Mode</label>
                <select id="tree-mode" ${allowModeSwitch ? "" : "disabled"}>
                  <option value="classification">Classification tree</option>
                  <option value="regression">Regression tree</option>
                </select>
              </div>
              <div class="control-group">
                <label for="tree-depth">Maximum depth shown</label>
                <input id="tree-depth" type="number" min="1" max="3" value="2" />
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="tree-step">Next split</button>
              <button class="button secondary" id="tree-reset">Reset tree</button>
            </div>
            <div class="callout" id="tree-callout"></div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="tree-plot" viewBox="0 0 560 280" aria-label="Tree plot"></svg>
            </div>
            <div class="equation-card" id="tree-math"></div>
            <div class="steps"><ol id="tree-steps"></ol></div>
            <div class="table-panel">
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Threshold</th>
                    <th>Gain</th>
                    <th>Leaf</th>
                  </tr>
                </thead>
                <tbody id="tree-candidates"></tbody>
              </table>
            </div>
          </div>
        </div>
      `
    );

    const modeInput = rootNode.querySelector("#tree-mode");
    const depthInput = rootNode.querySelector("#tree-depth");
    const stepButton = rootNode.querySelector("#tree-step");
    const resetButton = rootNode.querySelector("#tree-reset");
    const plot = rootNode.querySelector("#tree-plot");
    const mathNode = rootNode.querySelector("#tree-math");
    const stepsNode = rootNode.querySelector("#tree-steps");
    const candidatesNode = rootNode.querySelector("#tree-candidates");
    const callout = rootNode.querySelector("#tree-callout");
    let state;

    modeInput.value = initialMode;

    function resetState() {
      const mode = modeInput.value;
      const rows = mode === "classification" ? treeClassificationData : treeRegressionData;
      state = {
        mode,
        leaves: [
          {
            id: "root",
            depth: 0,
            rows,
            region: mode === "classification" ? { xMin: 0.6, xMax: 6, yMin: 1.6, yMax: 7.8 } : { xMin: 0.5, xMax: 6.8 },
          },
        ],
        history: [],
      };
    }

    function takeSplit() {
      const maxDepth = Math.max(Number(depthInput.value) || 2, 1);
      const choices = state.leaves
        .filter((leaf) => leaf.depth < maxDepth)
        .map((leaf) => {
          const candidates = getCandidateSplits(leaf.rows, state.mode).sort((a, b) => b.score - a.score);
          return { leaf, best: candidates[0] };
        })
        .filter((entry) => entry.best && entry.best.score > 1e-6);
      if (!choices.length) {
        return;
      }
      const choice = choices.sort((a, b) => b.best.score - a.best.score)[0];
      const leaf = choice.leaf;
      const best = choice.best;
      const leftRegion =
        state.mode === "classification"
          ? best.feature === "hours"
            ? { xMin: leaf.region.xMin, xMax: best.threshold, yMin: leaf.region.yMin, yMax: leaf.region.yMax }
            : { xMin: leaf.region.xMin, xMax: leaf.region.xMax, yMin: leaf.region.yMin, yMax: best.threshold }
          : { xMin: leaf.region.xMin, xMax: best.threshold };
      const rightRegion =
        state.mode === "classification"
          ? best.feature === "hours"
            ? { xMin: best.threshold, xMax: leaf.region.xMax, yMin: leaf.region.yMin, yMax: leaf.region.yMax }
            : { xMin: leaf.region.xMin, xMax: leaf.region.xMax, yMin: best.threshold, yMax: leaf.region.yMax }
          : { xMin: best.threshold, xMax: leaf.region.xMax };
      state.leaves = state.leaves
        .filter((entry) => entry.id !== leaf.id)
        .concat([
          { id: `${leaf.id}L`, depth: leaf.depth + 1, rows: best.left, region: leftRegion },
          { id: `${leaf.id}R`, depth: leaf.depth + 1, rows: best.right, region: rightRegion },
        ]);
      state.history.push({ feature: best.feature, threshold: best.threshold, score: best.score, depth: leaf.depth, region: leaf.region });
    }

    function render() {
      if (!state || state.mode !== modeInput.value) {
        resetState();
      }
      const maxDepth = Math.max(Number(depthInput.value) || 2, 1);
      const nextCandidates = state.leaves
        .filter((leaf) => leaf.depth < maxDepth)
        .flatMap((leaf) =>
          getCandidateSplits(leaf.rows, state.mode).map((candidate) => ({ leafId: leaf.id, ...candidate }))
        )
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      callout.innerHTML = nextCandidates.length
        ? `Best available split: <strong>${nextCandidates[0].feature} ≤ ${U.round(nextCandidates[0].threshold, 2)}</strong> with gain <strong>${U.round(nextCandidates[0].score, 3)}</strong>.`
        : "No additional split improves the current tree within the selected depth.";

      renderFormulaCards(mathNode, [
        {
          title: state.mode === "classification" ? "Impurity reduction" : "Squared-error reduction",
          description: "Trees choose the split with the largest objective improvement.",
          formula:
            state.mode === "classification"
              ? "Gain = Gini(parent) - weighted Gini(children)"
              : "Gain = SSE(parent) - weighted SSE(children)",
        },
        {
          title: "Greedy rule",
          description: "At each node the best available split is chosen locally.",
          formula: nextCandidates[0]
            ? `${nextCandidates[0].feature} ≤ ${U.round(nextCandidates[0].threshold, 2)}`
            : "no valid split",
        },
      ]);

      U.renderSteps(
        stepsNode,
        state.history.map(
          (entry, index) =>
            `<strong>Split ${index + 1}.</strong> Use <span class="mono">${entry.feature} ≤ ${U.round(entry.threshold, 2)}</span> because it improves the objective by <strong>${U.round(entry.score, 3)}</strong>.`
        ),
        state.history.length
      );

      candidatesNode.innerHTML = nextCandidates
        .map(
          (candidate) => `
            <tr>
              <td>${candidate.feature}</td>
              <td>${U.round(candidate.threshold, 2)}</td>
              <td>${U.round(candidate.score, 3)}</td>
              <td>${candidate.leafId}</td>
            </tr>
          `
        )
        .join("");

      if (state.mode === "classification") {
        const chart = U.makeChart(plot, { xDomain: [0.8, 5.8], yDomain: [1.8, 7.6], title: "Classification tree regions" });
        treeClassificationData.forEach((row) => {
          drawScatterPoint(plot, chart, { id: row.id, x: row.hours, y: row.attendance }, row.label ? "#1f7a70" : "#d26f2f", 7);
        });
        state.history.forEach((entry) => {
          if (entry.feature === "hours") {
            plot.appendChild(U.svgEl("line", { x1: chart.xScale(entry.threshold), y1: chart.yScale(entry.region.yMin), x2: chart.xScale(entry.threshold), y2: chart.yScale(entry.region.yMax), class: "cluster-line" }));
          } else {
            plot.appendChild(U.svgEl("line", { x1: chart.xScale(entry.region.xMin), y1: chart.yScale(entry.threshold), x2: chart.xScale(entry.region.xMax), y2: chart.yScale(entry.threshold), class: "cluster-line" }));
          }
        });
      } else {
        const chart = U.makeChart(plot, { xDomain: [0.6, 6.8], yDomain: [38, 94], title: "Regression tree predictions" });
        treeRegressionData.forEach((row) => drawScatterPoint(plot, chart, { id: row.id, x: row.hours, y: row.score }, "#635545", 7));
        state.history.forEach((entry) => {
          plot.appendChild(U.svgEl("line", { x1: chart.xScale(entry.threshold), y1: chart.yScale(38), x2: chart.xScale(entry.threshold), y2: chart.yScale(94), class: "cluster-line" }));
        });
        state.leaves.forEach((leaf) => {
          const prediction = U.mean(leaf.rows.map((row) => row.score));
          plot.appendChild(U.svgEl("line", { x1: chart.xScale(leaf.region.xMin), y1: chart.yScale(prediction), x2: chart.xScale(leaf.region.xMax), y2: chart.yScale(prediction), stroke: "#1f7a70", "stroke-width": "4" }));
        });
      }
    }

    stepButton.addEventListener("click", () => {
      takeSplit();
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

  function mountLinear(rootNode) {
    const forcedAlgorithm = definition.options.algorithm;
    const allowFeatureMap = forcedAlgorithm === "svm";
    const defaultFeatureMap = definition.options.featureMap || "linear";
    const rbfCenters = [
      { x: 2, y: 2 },
      { x: 2, y: 8 },
      { x: 8, y: 2 },
      { x: 8, y: 8 },
    ];

    mountSection(
      rootNode,
      `${definition.title} trainer`,
      "Change the dataset and step the update rule. The boundary moves according to the algorithm-specific objective shown in the formula cards.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-grid">
              <div class="control-group">
                <label for="linear-dataset">Dataset</label>
                <select id="linear-dataset">
                  <option value="separable">Linearly separable</option>
                  <option value="overlap">Overlapping classes</option>
                  <option value="xor">XOR challenge</option>
                </select>
              </div>
              <div class="control-group">
                <label for="feature-map">Feature representation</label>
                <select id="feature-map" ${allowFeatureMap ? "" : "disabled"}>
                  <option value="linear">Original 2D space</option>
                  <option value="rbf">Radial basis lift</option>
                </select>
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="linear-step">Train one step</button>
              <button class="button secondary" id="linear-reset">Reset model</button>
            </div>
            <div class="callout" id="linear-callout"></div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="linear-plot" viewBox="0 0 560 280" aria-label="Linear classification plot"></svg>
            </div>
            <div class="readout"><div class="output-grid" id="linear-output"></div></div>
            <div class="equation-card" id="linear-math"></div>
            <div class="steps"><ol id="linear-steps"></ol></div>
          </div>
        </div>
      `
    );

    const datasetInput = rootNode.querySelector("#linear-dataset");
    const featureMapInput = rootNode.querySelector("#feature-map");
    const stepButton = rootNode.querySelector("#linear-step");
    const resetButton = rootNode.querySelector("#linear-reset");
    const callout = rootNode.querySelector("#linear-callout");
    const plot = rootNode.querySelector("#linear-plot");
    const output = rootNode.querySelector("#linear-output");
    const mathNode = rootNode.querySelector("#linear-math");
    const stepsNode = rootNode.querySelector("#linear-steps");
    let state;

    featureMapInput.value = defaultFeatureMap;

    function rows() {
      return linearDatasets[datasetInput.value];
    }

    function featureVector(point) {
      if (featureMapInput.value === "rbf" && forcedAlgorithm === "svm") {
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

    function computeLDA(points) {
      const positives = points.filter((row) => row.label === 1);
      const negatives = points.filter((row) => row.label === -1);
      const mu1 = [U.mean(positives.map((row) => row.x)), U.mean(positives.map((row) => row.y))];
      const mu0 = [U.mean(negatives.map((row) => row.x)), U.mean(negatives.map((row) => row.y))];
      const covariance = [
        [0, 0],
        [0, 0],
      ];
      points.forEach((row) => {
        const meanVec = row.label === 1 ? mu1 : mu0;
        const diff = [row.x - meanVec[0], row.y - meanVec[1]];
        covariance[0][0] += diff[0] * diff[0];
        covariance[0][1] += diff[0] * diff[1];
        covariance[1][0] += diff[1] * diff[0];
        covariance[1][1] += diff[1] * diff[1];
      });
      covariance[0][0] /= points.length - 2;
      covariance[0][1] /= points.length - 2;
      covariance[1][0] /= points.length - 2;
      covariance[1][1] /= points.length - 2;
      const inverse = U.inverse2x2(covariance);
      const diff = [mu1[0] - mu0[0], mu1[1] - mu0[1]];
      const w = U.matVec(inverse, diff);
      const quad0 =
        0.5 *
        (mu0[0] * (inverse[0][0] * mu0[0] + inverse[0][1] * mu0[1]) +
          mu0[1] * (inverse[1][0] * mu0[0] + inverse[1][1] * mu0[1]));
      const quad1 =
        0.5 *
        (mu1[0] * (inverse[0][0] * mu1[0] + inverse[0][1] * mu1[1]) +
          mu1[1] * (inverse[1][0] * mu1[0] + inverse[1][1] * mu1[1]));
      const prior = Math.log(positives.length / negatives.length);
      return { w, b: -quad1 + quad0 + prior, mu1, mu0 };
    }

    function scorePoint(point, params) {
      if (forcedAlgorithm === "lda") {
        return params.b + params.w[0] * point.x + params.w[1] * point.y;
      }
      return U.dot(params.weights, featureVector(point));
    }

    function trainingAccuracy(params) {
      let correct = 0;
      rows().forEach((row) => {
        const prediction = scorePoint(row, params) >= 0 ? 1 : -1;
        if (prediction === row.label) {
          correct += 1;
        }
      });
      return correct / rows().length;
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

    function takeStep() {
      if (forcedAlgorithm === "lda") {
        state.step = Math.min(state.step + 1, 3);
        return;
      }
      const row = rows()[state.sampleIndex % rows().length];
      const x = featureVector(row);
      const y = row.label;
      const score = U.dot(state.weights, x);
      if (forcedAlgorithm === "perceptron") {
        if (y * score <= 0) {
          U.addScaled(state.weights, x, 0.35 * y);
          state.history.push(`Perceptron update on <strong>${row.id}</strong>: misclassified point, so update <span class="mono">w ← w + ηyx</span>.`);
        } else {
          state.history.push(`Perceptron check on <strong>${row.id}</strong>: point already classified correctly, so the weights stay fixed.`);
        }
      } else if (forcedAlgorithm === "logistic") {
        const target = y === 1 ? 1 : 0;
        const probability = U.sigmoid(score);
        U.addScaled(state.weights, x, 0.28 * (target - probability));
        state.history.push(`Logistic step on <strong>${row.id}</strong>: probability ${U.round(probability, 3)}, then move weights along the cross-entropy gradient.`);
      } else {
        const margin = y * score;
        const learningRate = 0.2;
        const lambda = 0.04;
        state.weights = state.weights.map((weight, index) => (index === 0 ? weight : weight * (1 - learningRate * lambda)));
        if (margin < 1) {
          U.addScaled(state.weights, x, learningRate * y);
          state.history.push(`Large-margin step on <strong>${row.id}</strong>: margin ${U.round(margin, 3)} is below 1, so apply a hinge-style update.`);
        } else {
          state.history.push(`Large-margin step on <strong>${row.id}</strong>: margin ${U.round(margin, 3)} is already safe, so regularization dominates.`);
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
      if (!state || state.weights.length !== featureVector({ x: 0, y: 0 }).length) {
        resetState();
      }
      const ldaParams = forcedAlgorithm === "lda" ? computeLDA(rows()) : null;
      const params = forcedAlgorithm === "lda" ? ldaParams : state;
      const accuracy = trainingAccuracy(params);
      const scores = rows().map((row) => scorePoint(row, params));
      const avgMargin = U.mean(rows().map((row, index) => row.label * scores[index]));
      const norm =
        forcedAlgorithm === "lda"
          ? Math.hypot(ldaParams.w[0], ldaParams.w[1])
          : Math.sqrt(state.weights.reduce((acc, value) => acc + value * value, 0));

      U.renderMetrics(output, [
        { label: "Steps", value: String(state.step) },
        { label: "Accuracy", value: `${Math.round(accuracy * 100)}%` },
        { label: "Weight norm", value: U.round(norm, 3) },
        { label: "Avg. margin", value: U.round(avgMargin, 3) },
      ]);

      const formulaMap = {
        lda: [
          {
            title: "Discriminant",
            description: "LDA derives a linear score from class statistics.",
            formula: `δ(x) = xᵀΣ⁻¹(μ₁-μ₀) + b`,
          },
          {
            title: "Current means",
            description: "The separator depends on the class means and shared covariance.",
            formula: `μ₁ = (${U.round(ldaParams.mu1[0], 2)}, ${U.round(ldaParams.mu1[1], 2)}), μ₀ = (${U.round(ldaParams.mu0[0], 2)}, ${U.round(ldaParams.mu0[1], 2)})`,
          },
        ],
        logistic: [
          { title: "Probability model", description: "Logistic regression maps scores into probabilities.", formula: `p(y=1|x) = σ(wᵀx)` },
          { title: "Gradient step", description: "Each click follows the log-loss gradient.", formula: `w ← w + η (y - σ(wᵀx)) x` },
        ],
        perceptron: [
          { title: "Update rule", description: "Only mistakes cause updates.", formula: `if y(wᵀx) ≤ 0 then w ← w + ηyx` },
          { title: "Current step", description: "The boundary changes only on mistakes.", formula: `last update after ${state.step} steps` },
        ],
        svm: [
          { title: "Margin score", description: "Large-margin methods prefer y(wᵀx) ≥ 1.", formula: `margin = y(wᵀx)` },
          {
            title: featureMapInput.value === "rbf" ? "Kernel-style lift" : "Hinge-style update",
            description: featureMapInput.value === "rbf" ? "The radial basis lift makes nonlinear boundaries possible." : "The update acts on margin violations.",
            formula:
              featureMapInput.value === "rbf"
                ? `φ(x) = [1, exp(-γ||x-c₁||²), …, exp(-γ||x-c_m||²)]`
                : `if y(wᵀx) < 1 then w ← (1-ηλ)w + ηyx`,
          },
        ],
      };
      renderFormulaCards(mathNode, formulaMap[forcedAlgorithm]);

      if (forcedAlgorithm === "lda") {
        U.renderSteps(
          stepsNode,
          [
            `<strong>Estimate class means.</strong> Positive and negative classes get separate Gaussian centers.`,
            `<strong>Estimate shared covariance.</strong> LDA pools covariance across classes instead of fitting one covariance per class.`,
            `<strong>Build the linear discriminant.</strong> The boundary comes from <span class="mono">Σ⁻¹(μ₁-μ₀)</span> and the prior-adjusted bias term.`,
          ],
          state.step
        );
      } else {
        U.renderSteps(stepsNode, state.history, state.history.length);
      }

      callout.innerHTML =
        forcedAlgorithm === "lda"
          ? "LDA is derived from a Gaussian generative model with shared covariance."
          : forcedAlgorithm === "logistic"
          ? "Logistic regression optimizes probability fit directly through cross-entropy."
          : forcedAlgorithm === "perceptron"
          ? "The perceptron reacts only to mistakes, which is why its update rule is so sparse."
          : featureMapInput.value === "rbf"
          ? "The radial-basis lift behaves like a simple kernelized feature space."
          : "Large-margin updates focus on examples that sit too close to the boundary.";

      const chart = U.makeChart(plot, { xDomain: [0, 10], yDomain: [0, 10], title: "Decision regions and training points" });
      for (let gx = 0; gx < 18; gx += 1) {
        for (let gy = 0; gy < 12; gy += 1) {
          const x = 0.4 + (gx / 17) * 9.2;
          const y = 0.4 + (gy / 11) * 9.2;
          const score = scorePoint({ x, y }, params);
          const fill = score >= 0 ? `rgba(31,122,112,${0.08 + Math.min(Math.abs(score) / 6, 0.22)})` : `rgba(210,111,47,${0.08 + Math.min(Math.abs(score) / 6, 0.22)})`;
          const x1 = chart.xScale(x - 0.28);
          const y1 = chart.yScale(y + 0.42);
          const x2 = chart.xScale(x + 0.28);
          const y2 = chart.yScale(y - 0.42);
          plot.appendChild(U.svgEl("rect", { x: Math.min(x1, x2), y: Math.min(y1, y2), width: Math.abs(x2 - x1), height: Math.abs(y2 - y1), fill }));
        }
      }
      if ((forcedAlgorithm === "lda" || featureMapInput.value === "linear") && Math.abs((forcedAlgorithm === "lda" ? ldaParams.w[1] : state.weights[2] || 0)) > 1e-6) {
        const b = forcedAlgorithm === "lda" ? ldaParams.b : state.weights[0];
        const w0 = forcedAlgorithm === "lda" ? ldaParams.w[0] : state.weights[1];
        const w1 = forcedAlgorithm === "lda" ? ldaParams.w[1] : state.weights[2];
        const x1 = 0.5;
        const y1 = -(b + w0 * x1) / w1;
        const x2 = 9.5;
        const y2 = -(b + w0 * x2) / w1;
        plot.appendChild(U.svgEl("line", { x1: chart.xScale(x1), y1: chart.yScale(y1), x2: chart.xScale(x2), y2: chart.yScale(y2), class: "decision-line" }));
      }
      rows().forEach((row) => drawScatterPoint(plot, chart, row, row.label === 1 ? "#1f7a70" : "#d26f2f", state.lastId === row.id ? 10 : 7));
    }

    stepButton.addEventListener("click", () => {
      takeStep();
      render();
    });
    resetButton.addEventListener("click", () => {
      resetState();
      render();
    });
    [datasetInput, featureMapInput].forEach((input) =>
      input.addEventListener("input", () => {
        resetState();
        render();
      })
    );
    resetState();
    render();
  }

  function mountBayesNet(rootNode) {
    const focus = definition.options.focus;
    mountSection(
      rootNode,
      "Graph structure and conditional independence",
      "Choose a motif, mark observed nodes, and inspect whether the path between the endpoints is active. This is the structural logic behind Bayesian networks.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-group">
              <label for="ci-structure">Structure</label>
              <select id="ci-structure">
                <option value="chain">Chain: A → B → C</option>
                <option value="fork">Fork: A ← B → C</option>
                <option value="collider">Collider: A → B ← C</option>
                <option value="mrf">MRF chain: A — B — C</option>
              </select>
            </div>
            <div class="control-group">
              <label for="ci-observe">Observed nodes</label>
              <select id="ci-observe">
                <option value="none">None</option>
                <option value="b">Observe B</option>
                <option value="a">Observe A</option>
                <option value="c">Observe C</option>
              </select>
            </div>
            <div class="step-controls">
              <button class="button primary" id="ci-evaluate">Evaluate path</button>
            </div>
            <div class="callout" id="ci-callout"></div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="ci-plot" viewBox="0 0 560 280" aria-label="Conditional independence graph"></svg>
            </div>
            <div class="equation-card" id="ci-math"></div>
            <div class="steps"><ol id="ci-steps"></ol></div>
          </div>
        </div>
      `
    );

    const structureInput = rootNode.querySelector("#ci-structure");
    const observeInput = rootNode.querySelector("#ci-observe");
    const button = rootNode.querySelector("#ci-evaluate");
    const plot = rootNode.querySelector("#ci-plot");
    const mathNode = rootNode.querySelector("#ci-math");
    const stepsNode = rootNode.querySelector("#ci-steps");
    const callout = rootNode.querySelector("#ci-callout");

    function render() {
      const structure = structureInput.value;
      const observed = observeInput.value;
      let active = true;
      let explanation = "";
      if (structure === "chain") {
        active = observed !== "b";
        explanation = observed === "b" ? "Conditioning on the middle node blocks the chain." : "Without observing the middle node, information can flow through the chain.";
      } else if (structure === "fork") {
        active = observed !== "b";
        explanation = observed === "b" ? "Conditioning on the common cause removes dependence between the children." : "The common cause induces dependence between the children.";
      } else if (structure === "collider") {
        active = observed === "b";
        explanation = observed === "b" ? "Conditioning on the collider opens explaining-away dependence." : "An unobserved collider blocks the path.";
      } else {
        active = observed !== "b";
        explanation = observed === "b" ? "In an undirected chain the separator node blocks the path when conditioned on." : "In an undirected chain the path stays active until the separator is fixed.";
      }

      callout.innerHTML = active ? `<strong>A and C are dependent.</strong> ${explanation}` : `<strong>A and C are conditionally independent.</strong> ${explanation}`;
      renderFormulaCards(mathNode, [
        {
          title: focus === "network" ? "Factorization" : "Separation rule",
          description: focus === "network" ? "Bayesian networks factor the joint by parents." : "Path activity depends on motif type and conditioning.",
          formula:
            structure === "chain"
              ? "p(a,b,c) = p(a)p(b|a)p(c|b)"
              : structure === "fork"
              ? "p(a,b,c) = p(b)p(a|b)p(c|b)"
              : structure === "collider"
              ? "p(a,b,c) = p(a)p(c)p(b|a,c)"
              : "p(a,b,c) ∝ ψ(a,b)ψ(b,c)",
        },
        {
          title: "Current result",
          description: "The structural condition determines dependence.",
          formula: `path(A,C) = ${active ? "active" : "blocked"}`,
        },
      ]);

      U.renderSteps(
        stepsNode,
        [
          `<strong>Choose the motif.</strong> Current structure: <strong>${structure}</strong>.`,
          `<strong>Mark observations.</strong> Current observed set: <strong>${observed === "none" ? "∅" : observed.toUpperCase()}</strong>.`,
          `<strong>Apply the separation rule.</strong> ${explanation}`,
        ],
        3
      );

      U.clear(plot);
      const positions = { A: { x: 110, y: 140 }, B: { x: 280, y: 140 }, C: { x: 450, y: 140 } };
      const stroke = active ? "#1f7a70" : "#6d6457";
      const opacity = active ? "0.95" : "0.35";
      function drawLine(from, to, directed) {
        plot.appendChild(U.svgEl("line", { x1: positions[from].x, y1: positions[from].y, x2: positions[to].x, y2: positions[to].y, stroke, "stroke-width": "4", opacity }));
        if (directed) {
          const dx = positions[to].x - positions[from].x;
          const dy = positions[to].y - positions[from].y;
          const len = Math.hypot(dx, dy);
          const ux = dx / len;
          const uy = dy / len;
          const tipX = positions[to].x - ux * 34;
          const tipY = positions[to].y - uy * 34;
          const leftX = tipX - ux * 14 + uy * 8;
          const leftY = tipY - uy * 14 - ux * 8;
          const rightX = tipX - ux * 14 - uy * 8;
          const rightY = tipY - uy * 14 + ux * 8;
          plot.appendChild(U.svgEl("polygon", { points: `${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`, fill: stroke, opacity }));
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
        plot.appendChild(U.svgEl("circle", { cx: pos.x, cy: pos.y, r: 32, fill: observedNode ? "#d26f2f" : "#fffdf8", stroke: observedNode ? "#d26f2f" : "#2f4057", "stroke-width": "3" }));
        plot.appendChild(U.svgEl("text", { x: pos.x, y: pos.y + 6, "text-anchor": "middle", class: "svg-title" })).textContent = name;
      });
    }

    button.addEventListener("click", render);
    [structureInput, observeInput].forEach((input) => input.addEventListener("input", render));
    render();
  }

  function mountMRF(rootNode) {
    mountSection(
      rootNode,
      "Local conditional in a Markov random field",
      "Set the neighbor states and the compatibility strength. The center node’s conditional distribution is computed from local factors only.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-grid">
              <div class="control-group">
                <label for="mrf-left">Left state X₁</label>
                <select id="mrf-left">
                  <option value="0">0</option>
                  <option value="1">1</option>
                </select>
              </div>
              <div class="control-group">
                <label for="mrf-right">Right state X₃</label>
                <select id="mrf-right">
                  <option value="0">0</option>
                  <option value="1">1</option>
                </select>
              </div>
              <div class="control-group">
                <label for="mrf-compatibility">Same-state compatibility</label>
                <input id="mrf-compatibility" type="number" min="1.1" max="5" step="0.1" value="2.3" />
              </div>
              <div class="control-group">
                <label for="mrf-bias">Unary bias toward state 1</label>
                <input id="mrf-bias" type="number" min="-2" max="2" step="0.1" value="0.4" />
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="mrf-step">Next step</button>
              <button class="button secondary" id="mrf-reset">Reset steps</button>
            </div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="mrf-plot" viewBox="0 0 560 280" aria-label="MRF plot"></svg>
            </div>
            <div class="readout"><div class="output-grid" id="mrf-output"></div></div>
            <div class="equation-card" id="mrf-math"></div>
            <div class="steps"><ol id="mrf-steps"></ol></div>
          </div>
        </div>
      `
    );

    const leftInput = rootNode.querySelector("#mrf-left");
    const rightInput = rootNode.querySelector("#mrf-right");
    const compatInput = rootNode.querySelector("#mrf-compatibility");
    const biasInput = rootNode.querySelector("#mrf-bias");
    const stepButton = rootNode.querySelector("#mrf-step");
    const resetButton = rootNode.querySelector("#mrf-reset");
    const plot = rootNode.querySelector("#mrf-plot");
    const output = rootNode.querySelector("#mrf-output");
    const mathNode = rootNode.querySelector("#mrf-math");
    const stepsNode = rootNode.querySelector("#mrf-steps");
    let revealed = 0;

    function render() {
      const left = Number(leftInput.value);
      const right = Number(rightInput.value);
      const same = Number(compatInput.value) || 2;
      const diff = 1;
      const bias = Number(biasInput.value) || 0;
      const unary0 = Math.exp(-bias);
      const unary1 = Math.exp(bias);
      const score0 = unary0 * (left === 0 ? same : diff) * (right === 0 ? same : diff);
      const score1 = unary1 * (left === 1 ? same : diff) * (right === 1 ? same : diff);
      const probs = normalize([score0, score1]);

      U.renderMetrics(output, [
        { label: "Unnorm score x₂=0", value: U.round(score0, 3) },
        { label: "Unnorm score x₂=1", value: U.round(score1, 3) },
        { label: "P(X₂=0)", value: U.round(probs[0], 3) },
        { label: "P(X₂=1)", value: U.round(probs[1], 3) },
      ]);
      renderFormulaCards(mathNode, [
        { title: "MRF distribution", description: "Undirected models use compatibility factors and a partition function.", formula: "p(x) = (1/Z) ∏_c ψ_c(x_c)" },
        {
          title: "Local conditional",
          description: "Only neighboring factors appear in the center-node conditional.",
          formula: `p(x₂|x₁,x₃) ∝ φ(x₂) ψ(x₁,x₂) ψ(x₂,x₃)`,
        },
        {
          title: "Current normalized result",
          description: "The two local scores are normalized into a probability.",
          formula: `p(x₂=1|x₁,x₃) = ${U.round(score1, 3)} / (${U.round(score0 + score1, 3)}) = ${U.round(probs[1], 3)}`,
        },
      ]);
      U.renderSteps(
        stepsNode,
        [
          "<strong>Read the neighbor states.</strong> The center node only needs the current states of its Markov blanket.",
          `<strong>Compute local scores.</strong> For x₂=0 use score <strong>${U.round(score0, 3)}</strong>; for x₂=1 use score <strong>${U.round(score1, 3)}</strong>.`,
          "<strong>Normalize.</strong> Divide each score by the total score so the two values sum to 1.",
          `<strong>Interpret.</strong> The center node currently prefers state <strong>${probs[1] >= probs[0] ? 1 : 0}</strong>.`,
        ],
        revealed
      );

      U.clear(plot);
      const positions = [{ x: 120, y: 140 }, { x: 280, y: 140 }, { x: 440, y: 140 }];
      plot.appendChild(U.svgEl("line", { x1: 152, y1: 140, x2: 248, y2: 140, class: "cluster-line" }));
      plot.appendChild(U.svgEl("line", { x1: 312, y1: 140, x2: 408, y2: 140, class: "cluster-line" }));
      [left, probs[1] >= probs[0] ? 1 : 0, right].forEach((value, index) => {
        plot.appendChild(U.svgEl("circle", { cx: positions[index].x, cy: positions[index].y, r: 34, fill: index === 1 ? "#fffdf8" : value ? "#1f7a70" : "#d26f2f", stroke: "#2f4057", "stroke-width": "3" }));
        plot.appendChild(U.svgEl("text", { x: positions[index].x, y: positions[index].y - 3, "text-anchor": "middle", class: "svg-title" })).textContent = `X${index + 1}`;
        plot.appendChild(U.svgEl("text", { x: positions[index].x, y: positions[index].y + 18, "text-anchor": "middle", class: "svg-label" })).textContent = index === 1 ? `P(1)=${U.round(probs[1], 2)}` : String(value);
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
    [leftInput, rightInput, compatInput, biasInput].forEach((input) =>
      input.addEventListener("input", () => {
        revealed = 0;
        render();
      })
    );
    render();
  }

  function mountBeliefPropagation(rootNode) {
    mountSection(
      rootNode,
      "Belief propagation on a three-node chain",
      "Pass messages one edge at a time and watch local evidence propagate into marginals.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-grid">
              <div class="control-group">
                <label for="bp-left-evidence">Left evidence P(x=1)</label>
                <input id="bp-left-evidence" type="number" min="0.05" max="0.95" step="0.05" value="0.8" />
              </div>
              <div class="control-group">
                <label for="bp-right-evidence">Right evidence P(x=1)</label>
                <input id="bp-right-evidence" type="number" min="0.05" max="0.95" step="0.05" value="0.3" />
              </div>
              <div class="control-group">
                <label for="bp-compatibility">Pairwise compatibility</label>
                <input id="bp-compatibility" type="number" min="0.55" max="0.95" step="0.05" value="0.85" />
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="bp-step">Pass next message</button>
              <button class="button secondary" id="bp-reset">Reset messages</button>
            </div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="bp-plot" viewBox="0 0 560 280" aria-label="Belief propagation plot"></svg>
            </div>
            <div class="readout"><div class="output-grid" id="bp-output"></div></div>
            <div class="equation-card" id="bp-math"></div>
            <div class="steps"><ol id="bp-steps"></ol></div>
          </div>
        </div>
      `
    );

    const leftEvidenceInput = rootNode.querySelector("#bp-left-evidence");
    const rightEvidenceInput = rootNode.querySelector("#bp-right-evidence");
    const compatibilityInput = rootNode.querySelector("#bp-compatibility");
    const stepButton = rootNode.querySelector("#bp-step");
    const resetButton = rootNode.querySelector("#bp-reset");
    const plot = rootNode.querySelector("#bp-plot");
    const output = rootNode.querySelector("#bp-output");
    const mathNode = rootNode.querySelector("#bp-math");
    const stepsNode = rootNode.querySelector("#bp-steps");
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
      const m12 = normalize([phi1[0] * psi[0][0] + phi1[1] * psi[1][0], phi1[0] * psi[0][1] + phi1[1] * psi[1][1]]);
      messages.push({ name: "m₁→₂", value: m12, text: `Send <strong>m₁→₂ = [${U.round(m12[0], 3)}, ${U.round(m12[1], 3)}]</strong>.` });
      const m32 = normalize([phi3[0] * psi[0][0] + phi3[1] * psi[1][0], phi3[0] * psi[0][1] + phi3[1] * psi[1][1]]);
      messages.push({ name: "m₃→₂", value: m32, text: `Send <strong>m₃→₂ = [${U.round(m32[0], 3)}, ${U.round(m32[1], 3)}]</strong>.` });
      const m21 = normalize([psi[0][0] * phi2[0] * m32[0] + psi[0][1] * phi2[1] * m32[1], psi[1][0] * phi2[0] * m32[0] + psi[1][1] * phi2[1] * m32[1]]);
      messages.push({ name: "m₂→₁", value: m21, text: `Return <strong>m₂→₁ = [${U.round(m21[0], 3)}, ${U.round(m21[1], 3)}]</strong>.` });
      const m23 = normalize([psi[0][0] * phi2[0] * m12[0] + psi[0][1] * phi2[1] * m12[1], psi[1][0] * phi2[0] * m12[0] + psi[1][1] * phi2[1] * m12[1]]);
      messages.push({ name: "m₂→₃", value: m23, text: `Return <strong>m₂→₃ = [${U.round(m23[0], 3)}, ${U.round(m23[1], 3)}]</strong>.` });
      const belief1 = normalize([phi1[0] * (revealed >= 3 ? m21[0] : 1), phi1[1] * (revealed >= 3 ? m21[1] : 1)]);
      const belief2 = normalize([phi2[0] * (revealed >= 1 ? m12[0] : 1) * (revealed >= 2 ? m32[0] : 1), phi2[1] * (revealed >= 1 ? m12[1] : 1) * (revealed >= 2 ? m32[1] : 1)]);
      const belief3 = normalize([phi3[0] * (revealed >= 4 ? m23[0] : 1), phi3[1] * (revealed >= 4 ? m23[1] : 1)]);

      U.renderMetrics(output, [
        { label: "P(X1 = 1)", value: U.round(belief1[1], 3) },
        { label: "P(X2 = 1)", value: U.round(belief2[1], 3) },
        { label: "P(X3 = 1)", value: U.round(belief3[1], 3) },
      ]);
      renderFormulaCards(mathNode, [
        { title: "Variable-to-factor message", description: "Messages summarize what one side of the graph says about another.", formula: "m_{i→j}(x_j) = Σ_{x_i} φ_i(x_i) ψ_{ij}(x_i,x_j) ∏_{k∈N(i)\\j} m_{k→i}(x_i)" },
        { title: "Belief", description: "A marginal is local evidence times incoming messages.", formula: "b_i(x_i) ∝ φ_i(x_i) ∏_{k∈N(i)} m_{k→i}(x_i)" },
      ]);
      U.renderSteps(stepsNode, messages.map((message) => message.text), revealed);

      U.clear(plot);
      const positions = [{ x: 110, y: 140 }, { x: 280, y: 140 }, { x: 450, y: 140 }];
      plot.appendChild(U.svgEl("text", { x: 280, y: 28, class: "svg-title", "text-anchor": "middle" })).textContent = "Message passing schedule";
      [[0, 1], [1, 2]].forEach(([from, to]) => {
        plot.appendChild(U.svgEl("line", { x1: positions[from].x + 32, y1: positions[from].y, x2: positions[to].x - 32, y2: positions[to].y, stroke: "#2f4057", "stroke-width": "3", opacity: "0.5" }));
      });
      [belief1, belief2, belief3].forEach((belief, index) => {
        plot.appendChild(U.svgEl("circle", { cx: positions[index].x, cy: positions[index].y, r: 34, fill: "#fffdf8", stroke: "#2f4057", "stroke-width": "3" }));
        plot.appendChild(U.svgEl("text", { x: positions[index].x, y: positions[index].y - 4, class: "svg-title", "text-anchor": "middle" })).textContent = `X${index + 1}`;
        plot.appendChild(U.svgEl("text", { x: positions[index].x, y: positions[index].y + 18, class: "svg-label", "text-anchor": "middle" })).textContent = `P(1)=${U.round(belief[1], 2)}`;
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

  function mountMarkov(rootNode) {
    mountSection(
      rootNode,
      "Visible-state Markov chain",
      "Propagate a two-state weather distribution forward in time. Each step is a matrix multiplication by the transition matrix.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-grid">
              <div class="control-group">
                <label for="markov-start">Initial P(Rain)</label>
                <input id="markov-start" type="number" min="0.05" max="0.95" step="0.05" value="0.5" />
              </div>
              <div class="control-group">
                <label for="markov-stay">Stay probability</label>
                <input id="markov-stay" type="number" min="0.55" max="0.95" step="0.05" value="0.8" />
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="markov-step">Next time step</button>
              <button class="button secondary" id="markov-reset">Reset chain</button>
            </div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="markov-plot" viewBox="0 0 560 280" aria-label="Markov chain plot"></svg>
            </div>
            <div class="readout"><div class="output-grid" id="markov-output"></div></div>
            <div class="equation-card" id="markov-math"></div>
            <div class="steps"><ol id="markov-steps"></ol></div>
          </div>
        </div>
      `
    );

    const startInput = rootNode.querySelector("#markov-start");
    const stayInput = rootNode.querySelector("#markov-stay");
    const stepButton = rootNode.querySelector("#markov-step");
    const resetButton = rootNode.querySelector("#markov-reset");
    const plot = rootNode.querySelector("#markov-plot");
    const output = rootNode.querySelector("#markov-output");
    const mathNode = rootNode.querySelector("#markov-math");
    const stepsNode = rootNode.querySelector("#markov-steps");
    let history = [];

    function reset() {
      const rain = Number(startInput.value) || 0.5;
      history = [[rain, 1 - rain]];
    }

    function advance() {
      const stay = Number(stayInput.value) || 0.8;
      const prev = history[history.length - 1];
      history.push([
        prev[0] * stay + prev[1] * (1 - stay),
        prev[0] * (1 - stay) + prev[1] * stay,
      ]);
    }

    function render() {
      const stay = Number(stayInput.value) || 0.8;
      const current = history[history.length - 1];
      U.renderMetrics(output, [
        { label: "Time steps", value: String(history.length - 1) },
        { label: "P(Rain)", value: U.round(current[0], 3) },
        { label: "P(Sun)", value: U.round(current[1], 3) },
      ]);
      renderFormulaCards(mathNode, [
        { title: "Transition matrix", description: "The next state depends only on the current state.", formula: `T = [[${U.round(stay, 2)}, ${U.round(1 - stay, 2)}], [${U.round(1 - stay, 2)}, ${U.round(stay, 2)}]]` },
        { title: "Distribution update", description: "Multiply the previous distribution by T.", formula: `p_t = p_{t-1} T` },
      ]);
      U.renderSteps(
        stepsNode,
        history.map(
          (dist, index) =>
            `<strong>t = ${index}.</strong> Distribution = [Rain ${U.round(dist[0], 3)}, Sun ${U.round(dist[1], 3)}].`
        ),
        history.length
      );
      const chart = U.makeChart(plot, { xDomain: [0, Math.max(history.length - 1, 1)], yDomain: [0, 1], title: "State probability over time" });
      const points = history.map((dist, index) => ({ x: index, y: dist[0] }));
      plot.appendChild(U.svgEl("path", { d: U.pathFromPoints(points, chart.xScale, chart.yScale), class: "curve-primary" }));
      points.forEach((point) => {
        plot.appendChild(U.svgEl("circle", { cx: chart.xScale(point.x), cy: chart.yScale(point.y), r: 5, fill: "#1f7a70" }));
      });
    }

    stepButton.addEventListener("click", () => {
      advance();
      render();
    });
    resetButton.addEventListener("click", () => {
      reset();
      render();
    });
    [startInput, stayInput].forEach((input) =>
      input.addEventListener("input", () => {
        reset();
        render();
      })
    );
    reset();
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
    const emit = { U: [emission, 1 - emission], N: [1 - emission, emission] };
    const states = ["Rain", "Sun"];
    const alpha = [];
    const delta = [];
    const psi = [];
    if (!sequence.length) {
      return { transition, emit, states, alpha, delta, psi, path: [] };
    }
    alpha[0] = normalize([0.5 * emit[sequence[0]][0], 0.5 * emit[sequence[0]][1]]);
    delta[0] = normalize([0.5 * emit[sequence[0]][0], 0.5 * emit[sequence[0]][1]]);
    psi[0] = [0, 0];
    for (let time = 1; time < sequence.length; time += 1) {
      const obs = sequence[time];
      alpha[time] = normalize([
        emit[obs][0] * (alpha[time - 1][0] * transition[0][0] + alpha[time - 1][1] * transition[1][0]),
        emit[obs][1] * (alpha[time - 1][0] * transition[0][1] + alpha[time - 1][1] * transition[1][1]),
      ]);
      const rawDelta = [0, 0];
      const back = [0, 0];
      for (let j = 0; j < 2; j += 1) {
        const candidates = [
          delta[time - 1][0] * transition[0][j] * emit[obs][j],
          delta[time - 1][1] * transition[1][j] * emit[obs][j],
        ];
        back[j] = candidates[0] >= candidates[1] ? 0 : 1;
        rawDelta[j] = Math.max(candidates[0], candidates[1]);
      }
      delta[time] = normalize(rawDelta);
      psi[time] = back;
    }
    const path = Array(sequence.length).fill(0);
    path[sequence.length - 1] = delta[sequence.length - 1][0] >= delta[sequence.length - 1][1] ? 0 : 1;
    for (let time = sequence.length - 1; time > 0; time -= 1) {
      path[time - 1] = psi[time][path[time]];
    }
    return { transition, emit, states, alpha, delta, psi, path };
  }

  function forwardBackward(sequence, stay, emission) {
    const transition = [
      [stay, 1 - stay],
      [1 - stay, stay],
    ];
    const emit = { U: [emission, 1 - emission], N: [1 - emission, emission] };
    const alpha = [];
    const beta = Array.from({ length: sequence.length }, () => [1, 1]);
    if (!sequence.length) {
      return { gamma: [], xi: [] };
    }
    alpha[0] = normalize([0.5 * emit[sequence[0]][0], 0.5 * emit[sequence[0]][1]]);
    for (let time = 1; time < sequence.length; time += 1) {
      const obs = sequence[time];
      alpha[time] = normalize([
        emit[obs][0] * (alpha[time - 1][0] * transition[0][0] + alpha[time - 1][1] * transition[1][0]),
        emit[obs][1] * (alpha[time - 1][0] * transition[0][1] + alpha[time - 1][1] * transition[1][1]),
      ]);
    }
    for (let time = sequence.length - 2; time >= 0; time -= 1) {
      beta[time] = normalize([
        transition[0][0] * emit[sequence[time + 1]][0] * beta[time + 1][0] + transition[0][1] * emit[sequence[time + 1]][1] * beta[time + 1][1],
        transition[1][0] * emit[sequence[time + 1]][0] * beta[time + 1][0] + transition[1][1] * emit[sequence[time + 1]][1] * beta[time + 1][1],
      ]);
    }
    const gamma = alpha.map((alphas, time) => normalize([alphas[0] * beta[time][0], alphas[1] * beta[time][1]]));
    const xi = [];
    for (let time = 0; time < sequence.length - 1; time += 1) {
      const obs = sequence[time + 1];
      const raw = [
        [alpha[time][0] * transition[0][0] * emit[obs][0] * beta[time + 1][0], alpha[time][0] * transition[0][1] * emit[obs][1] * beta[time + 1][1]],
        [alpha[time][1] * transition[1][0] * emit[obs][0] * beta[time + 1][0], alpha[time][1] * transition[1][1] * emit[obs][1] * beta[time + 1][1]],
      ];
      const total = raw.flat().reduce((acc, value) => acc + value, 0);
      xi.push(raw.map((row) => row.map((value) => value / total)));
    }
    return { gamma, xi };
  }

  function mountHmm(rootNode) {
    const focus = definition.options.focus;
    mountSection(
      rootNode,
      "Hidden Markov model explorer",
      "Edit transition and emission probabilities, then reveal filtering, decoding, or learning logic from the same sequence model.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-grid">
              <div class="control-group">
                <label for="hmm-transition">Stay probability</label>
                <input id="hmm-transition" type="number" min="0.55" max="0.95" step="0.05" value="0.8" />
              </div>
              <div class="control-group">
                <label for="hmm-emission">Correct observation probability</label>
                <input id="hmm-emission" type="number" min="0.55" max="0.95" step="0.05" value="0.75" />
              </div>
            </div>
            <div class="control-group">
              <label for="hmm-sequence">Observation sequence (U = umbrella, N = no umbrella)</label>
              <input id="hmm-sequence" type="text" value="U,U,N,U,N" />
            </div>
            <div class="step-controls">
              <button class="button primary" id="hmm-step">${focus === "decoding" ? "Next Viterbi/forward step" : "Next forward step"}</button>
              <button class="button secondary" id="hmm-reset">Reset sequence</button>
              <button class="button ghost" id="hmm-learn">Run one learning update</button>
            </div>
            <div class="callout" id="hmm-callout"></div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="hmm-plot" viewBox="0 0 560 280" aria-label="Hidden Markov model plot"></svg>
            </div>
            <div class="readout"><div class="output-grid" id="hmm-output"></div></div>
            <div class="equation-card" id="hmm-math"></div>
            <div class="steps"><ol id="hmm-steps"></ol></div>
            <div class="table-panel">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Observation</th>
                    <th>P(Rain)</th>
                    <th>P(Sun)</th>
                    <th>Best state</th>
                  </tr>
                </thead>
                <tbody id="hmm-table"></tbody>
              </table>
            </div>
          </div>
        </div>
      `
    );

    const transitionInput = rootNode.querySelector("#hmm-transition");
    const emissionInput = rootNode.querySelector("#hmm-emission");
    const sequenceInput = rootNode.querySelector("#hmm-sequence");
    const stepButton = rootNode.querySelector("#hmm-step");
    const resetButton = rootNode.querySelector("#hmm-reset");
    const learnButton = rootNode.querySelector("#hmm-learn");
    const callout = rootNode.querySelector("#hmm-callout");
    const plot = rootNode.querySelector("#hmm-plot");
    const output = rootNode.querySelector("#hmm-output");
    const mathNode = rootNode.querySelector("#hmm-math");
    const stepsNode = rootNode.querySelector("#hmm-steps");
    const table = rootNode.querySelector("#hmm-table");
    let revealed = 0;

    function render(statusMessage) {
      const stay = Number(transitionInput.value) || 0.8;
      const emission = Number(emissionInput.value) || 0.75;
      const sequence = parseSequence(sequenceInput.value);
      const model = buildHmmModel(sequence, stay, emission);
      const shown = Math.min(revealed, sequence.length);
      const currentRain = shown ? model.alpha[shown - 1][0] : 0.5;
      const currentBest = shown ? model.states[model.path[shown - 1]] : "Start";

      callout.innerHTML =
        statusMessage ||
        (focus === "decoding"
          ? "This page emphasizes Viterbi decoding alongside forward filtering."
          : focus === "learning"
          ? "This page emphasizes parameter learning from soft hidden-state counts."
          : "This page emphasizes the combined HMM picture: filtering, decoding, and learning.");

      U.renderMetrics(output, [
        { label: "Steps shown", value: String(shown) },
        { label: "Current P(Rain)", value: U.round(currentRain, 3) },
        { label: "Current best state", value: currentBest },
        { label: "Sequence length", value: String(sequence.length) },
      ]);
      renderFormulaCards(mathNode, [
        { title: "Forward update", description: "Filtering combines transition and emission probabilities.", formula: "α_t(j) = η · b_j(o_t) Σ_i α_{t-1}(i) a_{ij}" },
        { title: "Viterbi update", description: "Decoding uses max instead of sum.", formula: "δ_t(j) = b_j(o_t) max_i δ_{t-1}(i) a_{ij}" },
        { title: "Learning update", description: "Baum-Welch re-estimates parameters from expected counts.", formula: "a_{ij} ← expected transitions i→j / expected occupancy of i" },
      ]);
      const steps = sequence.map(
        (obs, time) =>
          `<strong>t = ${time + 1}, obs = ${obs}.</strong> Forward belief = <span class="mono">[${U.round(model.alpha[time][0], 3)}, ${U.round(model.alpha[time][1], 3)}]</span>; best state = <strong>${model.states[model.path[time]]}</strong>.`
      );
      U.renderSteps(stepsNode, steps, shown);
      table.innerHTML = sequence
        .map((obs, time) =>
          time >= shown
            ? `<tr><td>${time + 1}</td><td>${obs}</td><td>-</td><td>-</td><td>-</td></tr>`
            : `<tr><td>${time + 1}</td><td>${obs}</td><td>${U.round(model.alpha[time][0], 3)}</td><td>${U.round(model.alpha[time][1], 3)}</td><td>${model.states[model.path[time]]}</td></tr>`
        )
        .join("");

      const chart = U.makeChart(plot, { xDomain: [1, Math.max(sequence.length, 2)], yDomain: [0, 1], title: "Filtering probability of Rain" });
      if (shown) {
        const points = model.alpha.slice(0, shown).map((prob, index) => ({ x: index + 1, y: prob[0] }));
        plot.appendChild(U.svgEl("path", { d: U.pathFromPoints(points, chart.xScale, chart.yScale), class: "curve-primary" }));
        points.forEach((point, index) => {
          plot.appendChild(U.svgEl("circle", { cx: chart.xScale(point.x), cy: chart.yScale(point.y), r: 6, fill: "#1f7a70" }));
          plot.appendChild(U.svgEl("text", { x: chart.xScale(point.x), y: chart.yScale(point.y) - 12, class: "svg-label", "text-anchor": "middle" })).textContent = sequence[index];
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
      const sameTransitions = xi.reduce((acc, item) => acc + item[0][0] + item[1][1], 0) / xi.length;
      const correctEmissions =
        gamma.reduce((acc, stateProb, time) => acc + (sequence[time] === "U" ? stateProb[0] : stateProb[1]), 0) / gamma.length;
      transitionInput.value = U.clamp(sameTransitions, 0.55, 0.95).toFixed(2);
      emissionInput.value = U.clamp(correctEmissions, 0.55, 0.95).toFixed(2);
      revealed = sequence.length;
      render(`One Baum-Welch style update proposed <strong>stay = ${transitionInput.value}</strong> and <strong>correct emission = ${emissionInput.value}</strong>.`);
    });
    [transitionInput, emissionInput, sequenceInput].forEach((input) =>
      input.addEventListener("input", () => {
        revealed = 0;
        render();
      })
    );
    render();
  }

  function mountPartition(rootNode) {
    const lockedMethod =
      definition.options.focus === "kmeans"
        ? "kmeans"
        : definition.options.focus === "kmedoids"
        ? "kmedoids"
        : null;

    mountSection(
      rootNode,
      "Partition clustering loop",
      "Alternate between assignment and representative updates. Use the method selector to compare centroids and medoids when the page allows it.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-grid">
              <div class="control-group">
                <label for="partition-method">Method</label>
                <select id="partition-method" ${lockedMethod ? "disabled" : ""}>
                  <option value="kmeans">K-means</option>
                  <option value="kmedoids">K-medoids</option>
                </select>
              </div>
              <div class="control-group">
                <label for="partition-k">Clusters</label>
                <input id="partition-k" type="number" min="2" max="4" value="3" />
              </div>
              <div class="control-group">
                <label for="partition-metric">Distance</label>
                <select id="partition-metric">
                  <option value="euclidean">Euclidean</option>
                  <option value="manhattan">Manhattan</option>
                </select>
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="partition-step">Next step</button>
              <button class="button secondary" id="partition-reset">Reset</button>
            </div>
            <div class="callout" id="partition-callout"></div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="partition-plot" viewBox="0 0 560 280" aria-label="Partition clustering plot"></svg>
            </div>
            <div class="readout"><div class="output-grid" id="partition-output"></div></div>
            <div class="equation-card" id="partition-math"></div>
            <div class="steps"><ol id="partition-steps"></ol></div>
          </div>
        </div>
      `
    );

    const methodInput = rootNode.querySelector("#partition-method");
    const kInput = rootNode.querySelector("#partition-k");
    const metricInput = rootNode.querySelector("#partition-metric");
    const stepButton = rootNode.querySelector("#partition-step");
    const resetButton = rootNode.querySelector("#partition-reset");
    const callout = rootNode.querySelector("#partition-callout");
    const plot = rootNode.querySelector("#partition-plot");
    const output = rootNode.querySelector("#partition-output");
    const mathNode = rootNode.querySelector("#partition-math");
    const stepsNode = rootNode.querySelector("#partition-steps");
    let state;

    if (lockedMethod) {
      methodInput.value = lockedMethod;
    }

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

    function takeStep() {
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
        state.history.push(`Assignment step ${state.step}: ${changed} memberships changed.`);
      } else {
        const grouped = state.reps.map((_, clusterIndex) => partitionPoints.filter((_, pointIndex) => state.assignments[pointIndex] === clusterIndex));
        const nextReps = grouped.map((clusterPoints, clusterIndex) => {
          if (!clusterPoints.length) {
            return state.reps[clusterIndex];
          }
          if (method === "kmeans") {
            return { id: `C${clusterIndex + 1}`, x: U.mean(clusterPoints.map((point) => point.x)), y: U.mean(clusterPoints.map((point) => point.y)) };
          }
          return clusterPoints
            .map((candidate) => ({
              candidate,
              cost: clusterPoints.reduce((acc, point) => acc + U.distance(candidate, point, metric), 0),
            }))
            .sort((a, b) => a.cost - b.cost)[0].candidate;
        });
        const move = nextReps.reduce((acc, rep, index) => acc + U.distance(rep, state.reps[index], "euclidean"), 0);
        state.reps = nextReps;
        state.phase = "assign";
        state.history.push(`${method === "kmeans" ? "Centroid" : "Medoid"} update ${state.step}: representative movement = ${U.round(move, 3)}.`);
      }
    }

    function render() {
      if (!state || state.reps.length !== Math.max(Number(kInput.value) || 3, 2)) {
        resetState();
      }
      const method = methodInput.value;
      const metric = metricInput.value;
      const obj = objective(metric, state.reps, state.assignments);
      callout.innerHTML =
        method === "kmeans"
          ? "K-means uses arithmetic means as cluster representatives."
          : "K-medoids restricts representatives to actual observed points.";
      U.renderMetrics(output, [
        { label: "Phase", value: state.phase },
        { label: "Objective", value: U.round(obj, 3) },
        { label: "Clusters", value: String(state.reps.length) },
        { label: "Method", value: method },
      ]);
      renderFormulaCards(mathNode, [
        { title: "Assignment", description: "Every point joins the closest representative.", formula: "c_i = argmin_k distance(x_i, r_k)" },
        {
          title: method === "kmeans" ? "Centroid update" : "Medoid update",
          description: method === "kmeans" ? "The representative is the cluster average." : "The representative is the in-cluster point with minimal total distance.",
          formula: method === "kmeans" ? "r_k = mean({x_i : c_i = k})" : "r_k = argmin_{x_j in cluster k} Σ_i distance(x_i, x_j)",
        },
      ]);
      U.renderSteps(stepsNode, state.history, state.history.length);

      const chart = U.makeChart(plot, { xDomain: [0, 10], yDomain: [0, 10], title: "Partition clustering state" });
      partitionPoints.forEach((point, index) => {
        const cluster = state.assignments[index];
        drawScatterPoint(plot, chart, point, cluster >= 0 ? clusterPalette[cluster % clusterPalette.length] : "#6d6457", 7);
      });
      state.reps.forEach((rep, index) => {
        const x = chart.xScale(rep.x);
        const y = chart.yScale(rep.y);
        plot.appendChild(U.svgEl("polygon", { points: `${x},${y - 12} ${x + 12},${y} ${x},${y + 12} ${x - 12},${y}`, fill: clusterPalette[index % clusterPalette.length], stroke: "#fff", "stroke-width": "2.5" }));
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
    const distances = clusterA.members.flatMap((a) => clusterB.members.map((b) => U.distance(a, b, "euclidean")));
    if (linkage === "single") {
      return Math.min(...distances);
    }
    if (linkage === "complete") {
      return Math.max(...distances);
    }
    return U.mean(distances);
  }

  function clusterCentroid(points) {
    return { x: U.mean(points.map((point) => point.x)), y: U.mean(points.map((point) => point.y)) };
  }

  function clusterSSE(points) {
    if (points.length <= 1) {
      return 0;
    }
    const centroid = clusterCentroid(points);
    return points.reduce((acc, point) => acc + U.distance(point, centroid, "euclidean") ** 2, 0);
  }

  function splitCluster(points) {
    if (points.length <= 1) {
      return [points, []];
    }
    let bestPair = [points[0], points[1]];
    let bestDistance = -1;
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const d = U.distance(points[i], points[j], "euclidean");
        if (d > bestDistance) {
          bestDistance = d;
          bestPair = [points[i], points[j]];
        }
      }
    }
    const left = [];
    const right = [];
    points.forEach((point) => {
      const leftDistance = U.distance(point, bestPair[0], "euclidean");
      const rightDistance = U.distance(point, bestPair[1], "euclidean");
      if (leftDistance <= rightDistance) {
        left.push(point);
      } else {
        right.push(point);
      }
    });
    if (!left.length || !right.length) {
      const sorted = [...points].sort((a, b) => a.x - b.x);
      return [sorted.slice(0, Math.ceil(sorted.length / 2)), sorted.slice(Math.ceil(sorted.length / 2))];
    }
    return [left, right];
  }

  function mountHierarchy(rootNode) {
    const lockedFocus = definition.options.focus === "general" ? null : definition.options.focus;
    mountSection(
      rootNode,
      "Hierarchical clustering explorer",
      "Switch between agglomerative and divisive reasoning, then reveal one merge or split at a time.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-grid">
              <div class="control-group">
                <label for="hier-mode">Hierarchy mode</label>
                <select id="hier-mode" ${lockedFocus ? "disabled" : ""}>
                  <option value="agglomerative">Agglomerative</option>
                  <option value="divisive">Divisive</option>
                </select>
              </div>
              <div class="control-group">
                <label for="hier-linkage">Linkage</label>
                <select id="hier-linkage">
                  <option value="single">Single linkage</option>
                  <option value="complete">Complete linkage</option>
                  <option value="average">Average linkage</option>
                </select>
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="hier-step">Next hierarchy step</button>
              <button class="button secondary" id="hier-reset">Reset hierarchy</button>
            </div>
            <div class="callout" id="hier-callout"></div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="hier-plot" viewBox="0 0 560 280" aria-label="Hierarchical clustering plot"></svg>
            </div>
            <div class="mini-panel" id="hier-history"></div>
            <div class="equation-card" id="hier-math"></div>
            <div class="steps"><ol id="hier-steps"></ol></div>
          </div>
        </div>
      `
    );

    const modeInput = rootNode.querySelector("#hier-mode");
    const linkageInput = rootNode.querySelector("#hier-linkage");
    const stepButton = rootNode.querySelector("#hier-step");
    const resetButton = rootNode.querySelector("#hier-reset");
    const plot = rootNode.querySelector("#hier-plot");
    const historyNode = rootNode.querySelector("#hier-history");
    const mathNode = rootNode.querySelector("#hier-math");
    const stepsNode = rootNode.querySelector("#hier-steps");
    const callout = rootNode.querySelector("#hier-callout");
    let state;

    if (lockedFocus) {
      modeInput.value = lockedFocus;
    }

    function resetState() {
      if (modeInput.value === "agglomerative") {
        state = {
          mode: "agglomerative",
          clusters: hierarchicalPoints.map((point) => ({ id: point.id, members: [point] })),
          history: [],
          nextId: 1,
        };
      } else {
        state = {
          mode: "divisive",
          clusters: [{ id: "C0", members: hierarchicalPoints.slice() }],
          history: [],
          nextId: 1,
        };
      }
    }

    function takeStep() {
      if (state.mode === "agglomerative") {
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
        const merged = { id: `M${state.nextId}`, members: [...left.members, ...right.members] };
        state.nextId += 1;
        state.history.push({ action: "merge", left: left.id, right: right.id, distance: best.distance });
        state.clusters = state.clusters.filter((_, index) => index !== best.i && index !== best.j);
        state.clusters.push(merged);
      } else {
        const candidates = state.clusters.filter((cluster) => cluster.members.length > 1);
        if (!candidates.length) {
          return;
        }
        const target = candidates.sort((a, b) => clusterSSE(b.members) - clusterSSE(a.members))[0];
        const [leftMembers, rightMembers] = splitCluster(target.members);
        const leftId = `S${state.nextId}`;
        const rightId = `S${state.nextId + 1}`;
        state.nextId += 2;
        state.history.push({ action: "split", parent: target.id, left: leftId, right: rightId, score: clusterSSE(target.members) });
        state.clusters = state.clusters.filter((cluster) => cluster.id !== target.id).concat([
          { id: leftId, members: leftMembers },
          { id: rightId, members: rightMembers },
        ]);
      }
    }

    function render() {
      if (!state || state.mode !== modeInput.value) {
        resetState();
      }
      const linkage = linkageInput.value;
      callout.innerHTML =
        state.mode === "agglomerative"
          ? `Agglomerative mode with <strong>${linkage}</strong> linkage merges the closest clusters first.`
          : "Divisive mode repeatedly splits the cluster with the largest internal spread.";
      renderFormulaCards(mathNode, [
        {
          title: state.mode === "agglomerative" ? "Linkage rule" : "Split heuristic",
          description: state.mode === "agglomerative" ? "Distance between clusters depends on the linkage definition." : "Divisive clustering chooses a cluster to split by internal spread.",
          formula:
            state.mode === "agglomerative"
              ? linkage === "single"
                ? "d(A,B) = min_{a∈A,b∈B} d(a,b)"
                : linkage === "complete"
                ? "d(A,B) = max_{a∈A,b∈B} d(a,b)"
                : "d(A,B) = average_{a∈A,b∈B} d(a,b)"
              : "choose cluster with largest SSE, then split by farthest-pair seeds",
        },
      ]);
      U.renderSteps(
        stepsNode,
        state.history.map((entry, index) =>
          entry.action === "merge"
            ? `<strong>Merge ${index + 1}.</strong> Combine ${entry.left} and ${entry.right} at distance <strong>${U.round(entry.distance, 3)}</strong>.`
            : `<strong>Split ${index + 1}.</strong> Split ${entry.parent} into ${entry.left} and ${entry.right} from parent SSE <strong>${U.round(entry.score, 3)}</strong>.`
        ),
        state.history.length
      );
      historyNode.innerHTML = `
        <h3>${state.mode === "agglomerative" ? "Current clusters" : "Current split frontier"}</h3>
        <ul class="dense-list">
          ${state.clusters
            .map((cluster) => `<li><strong>${cluster.id}</strong>: ${cluster.members.map((point) => point.id).join(", ")}</li>`)
            .join("")}
        </ul>
      `;
      const colorMap = {};
      state.clusters.forEach((cluster, index) => {
        cluster.members.forEach((point) => {
          colorMap[point.id] = clusterPalette[index % clusterPalette.length];
        });
      });
      const chart = U.makeChart(plot, { xDomain: [0.8, 8.4], yDomain: [1.2, 8.2], title: "Current hierarchical clustering state" });
      hierarchicalPoints.forEach((point) => drawScatterPoint(plot, chart, point, colorMap[point.id] || "#6d6457", 8));
    }

    stepButton.addEventListener("click", () => {
      takeStep();
      render();
    });
    resetButton.addEventListener("click", () => {
      resetState();
      render();
    });
    [modeInput, linkageInput].forEach((input) =>
      input.addEventListener("input", () => {
        resetState();
        render();
      })
    );
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
      events.push({ type: "visit", pointId: point.id, neighbors: seedNeighbors.map((item) => item.id), core: seedNeighbors.length >= minPts });
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
          events.push({ type: "visit", pointId: current.id, neighbors: currentNeighbors.map((item) => item.id), core: currentNeighbors.length >= minPts, clusterId });
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
          events.push({ type: "assign", pointId: current.id, clusterId, pointType: currentNeighbors.length >= minPts ? "core" : "border" });
        }
      }
    });
    return events;
  }

  function mountDbscan(rootNode) {
    mountSection(
      rootNode,
      "DBSCAN density expansion",
      "Reveal the algorithm as a sequence of ε-neighborhood tests, cluster starts, and cluster expansions.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-grid">
              <div class="control-group">
                <label for="dbscan-eps">Neighborhood radius ε</label>
                <input id="dbscan-eps" type="number" min="0.4" max="2.2" step="0.1" value="1.2" />
              </div>
              <div class="control-group">
                <label for="dbscan-minpts">Minimum points</label>
                <input id="dbscan-minpts" type="number" min="2" max="6" value="3" />
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="dbscan-step">Next DBSCAN step</button>
              <button class="button secondary" id="dbscan-reset">Reset</button>
            </div>
            <div class="callout" id="dbscan-callout"></div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="dbscan-plot" viewBox="0 0 560 280" aria-label="DBSCAN plot"></svg>
            </div>
            <div class="readout"><div class="output-grid" id="dbscan-output"></div></div>
            <div class="equation-card" id="dbscan-math"></div>
            <div class="steps"><ol id="dbscan-steps"></ol></div>
          </div>
        </div>
      `
    );

    const epsInput = rootNode.querySelector("#dbscan-eps");
    const minPtsInput = rootNode.querySelector("#dbscan-minpts");
    const stepButton = rootNode.querySelector("#dbscan-step");
    const resetButton = rootNode.querySelector("#dbscan-reset");
    const callout = rootNode.querySelector("#dbscan-callout");
    const plot = rootNode.querySelector("#dbscan-plot");
    const output = rootNode.querySelector("#dbscan-output");
    const mathNode = rootNode.querySelector("#dbscan-math");
    const stepsNode = rootNode.querySelector("#dbscan-steps");
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
          lastText = `${event.pointId} has ${event.neighbors.length} points in its ε-neighborhood.`;
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
      const clusterIds = new Set(Object.values(state).map((item) => item.clusterId).filter((value) => value !== null));
      const noiseCount = Object.values(state).filter((item) => item.type === "noise").length;
      const coreCount = Object.values(state).filter((item) => item.type === "core").length;
      U.renderMetrics(output, [
        { label: "Events shown", value: String(revealed) },
        { label: "Clusters", value: String(clusterIds.size) },
        { label: "Core points", value: String(coreCount) },
        { label: "Noise", value: String(noiseCount) },
      ]);
      renderFormulaCards(mathNode, [
        { title: "Neighborhood", description: "DBSCAN begins by querying a point’s ε-neighborhood.", formula: `N_ε(p) = { q : distance(p,q) ≤ ${U.round(eps, 2)} }` },
        { title: "Core condition", description: "A point is core if its neighborhood is dense enough.", formula: `|N_ε(p)| ≥ minPts = ${minPts}` },
      ]);
      U.renderSteps(
        stepsNode,
        events.map((event) => {
          if (event.type === "visit") {
            return `<strong>Visit ${event.pointId}.</strong> Query its ε-neighborhood and test core status.`;
          }
          if (event.type === "noise") {
            return `<strong>Noise.</strong> ${event.pointId} does not yet have enough nearby points.`;
          }
          if (event.type === "start") {
            return `<strong>Start cluster ${event.clusterId}.</strong> ${event.pointId} is dense enough to seed a cluster.`;
          }
          return `<strong>Expand cluster ${event.clusterId}.</strong> ${event.pointId} is density-reachable and gets assigned.`;
        }),
        revealed
      );
      const chart = U.makeChart(plot, { xDomain: [0.8, 9.8], yDomain: [0.8, 8.8], title: "DBSCAN growth" });
      if (active) {
        const point = dbscanPoints.find((entry) => entry.id === active);
        plot.appendChild(U.svgEl("ellipse", { cx: chart.xScale(point.x), cy: chart.yScale(point.y), rx: Math.abs(chart.xScale(point.x + eps) - chart.xScale(point.x)), ry: Math.abs(chart.yScale(point.y + eps) - chart.yScale(point.y)), fill: "rgba(31,122,112,0.08)", stroke: "#1f7a70", "stroke-width": "2", "stroke-dasharray": "6 6" }));
      }
      dbscanPoints.forEach((point) => {
        const item = state[point.id];
        const color = item.clusterId !== null ? clusterPalette[(item.clusterId - 1) % clusterPalette.length] : item.type === "noise" ? "#b4473f" : "#6d6457";
        drawScatterPoint(plot, chart, point, color, active === point.id ? 9 : 7);
      });
    }

    stepButton.addEventListener("click", () => {
      const events = buildDbscanEvents(dbscanPoints, Number(epsInput.value) || 1.2, Number(minPtsInput.value) || 3);
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

  function mountDistance(rootNode) {
    mountSection(
      rootNode,
      "Distance measure comparer",
      "Move the query point and compare how Euclidean, Manhattan, and cosine geometry rank the same candidates.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-grid">
              <div class="control-group">
                <label for="distance-metric">Metric</label>
                <select id="distance-metric">
                  <option value="euclidean">Euclidean</option>
                  <option value="manhattan">Manhattan</option>
                  <option value="cosine">Cosine-style similarity</option>
                </select>
              </div>
              <div class="control-group">
                <label for="distance-qx">Query x</label>
                <input id="distance-qx" type="number" step="0.1" value="3.2" />
              </div>
              <div class="control-group">
                <label for="distance-qy">Query y</label>
                <input id="distance-qy" type="number" step="0.1" value="4.1" />
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="distance-step">Next step</button>
              <button class="button secondary" id="distance-reset">Reset steps</button>
            </div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="distance-plot" viewBox="0 0 560 280" aria-label="Distance plot"></svg>
            </div>
            <div class="readout"><div class="output-grid" id="distance-output"></div></div>
            <div class="equation-card" id="distance-math"></div>
            <div class="steps"><ol id="distance-steps"></ol></div>
          </div>
        </div>
      `
    );

    const metricInput = rootNode.querySelector("#distance-metric");
    const qxInput = rootNode.querySelector("#distance-qx");
    const qyInput = rootNode.querySelector("#distance-qy");
    const stepButton = rootNode.querySelector("#distance-step");
    const resetButton = rootNode.querySelector("#distance-reset");
    const plot = rootNode.querySelector("#distance-plot");
    const output = rootNode.querySelector("#distance-output");
    const mathNode = rootNode.querySelector("#distance-math");
    const stepsNode = rootNode.querySelector("#distance-steps");
    const candidates = [
      { id: "A", x: 6.0, y: 6.2 },
      { id: "B", x: 7.5, y: 3.9 },
      { id: "C", x: 2.2, y: 7.4 },
    ];
    let revealed = 0;

    function distanceMetric(a, b, metric) {
      if (metric === "cosine") {
        const denom = Math.hypot(a.x, a.y) * Math.hypot(b.x, b.y) || 1;
        return 1 - (a.x * b.x + a.y * b.y) / denom;
      }
      return U.distance(a, b, metric);
    }

    function render() {
      const metric = metricInput.value;
      const query = { id: "Q", x: Number(qxInput.value) || 0, y: Number(qyInput.value) || 0 };
      const scored = candidates.map((point) => ({ ...point, distance: distanceMetric(point, query, metric) })).sort((a, b) => a.distance - b.distance);
      U.renderMetrics(output, [
        { label: "Nearest", value: scored[0].id },
        { label: `${scored[0].id} score`, value: U.round(scored[0].distance, 3) },
        { label: `${scored[1].id} score`, value: U.round(scored[1].distance, 3) },
      ]);
      renderFormulaCards(mathNode, [
        {
          title: "Metric definition",
          description: "Different metrics create different neighborhoods.",
          formula:
            metric === "euclidean"
              ? "d(x,q) = √((x₁-q₁)² + (x₂-q₂)²)"
              : metric === "manhattan"
              ? "d(x,q) = |x₁-q₁| + |x₂-q₂|"
              : "d_cos(x,q) = 1 - (x·q)/(||x|| ||q||)",
        },
      ]);
      U.renderSteps(
        stepsNode,
        [
          `<strong>Compute coordinate differences.</strong> For candidate ${scored[0].id}, Δx = ${U.round(scored[0].x - query.x, 2)}, Δy = ${U.round(scored[0].y - query.y, 2)}.`,
          `<strong>Aggregate according to the metric.</strong> The chosen metric is <strong>${metric}</strong>.`,
          `<strong>Rank the candidates.</strong> The current order is ${scored.map((item) => `${item.id} (${U.round(item.distance, 2)})`).join(" < ")}.`,
        ],
        revealed
      );
      const chart = U.makeChart(plot, { xDomain: [0, 9], yDomain: [0, 9], title: "Metric-dependent nearest neighbor" });
      candidates.forEach((point, index) => {
        drawScatterPoint(plot, chart, point, index === 0 ? "#1f7a70" : index === 1 ? "#d26f2f" : "#2f4057", scored[0].id === point.id ? 9 : 7);
      });
      const qx = chart.xScale(query.x);
      const qy = chart.yScale(query.y);
      plot.appendChild(U.svgEl("polygon", { points: `${qx},${qy - 11} ${qx + 11},${qy} ${qx},${qy + 11} ${qx - 11},${qy}`, fill: "#2f4057" }));
    }

    stepButton.addEventListener("click", () => {
      revealed = Math.min(revealed + 1, 3);
      render();
    });
    resetButton.addEventListener("click", () => {
      revealed = 0;
      render();
    });
    [metricInput, qxInput, qyInput].forEach((input) =>
      input.addEventListener("input", () => {
        revealed = 0;
        render();
      })
    );
    render();
  }

  function mountSpectral(rootNode) {
    mountSection(
      rootNode,
      "Spectral clustering and graph Laplacians",
      "Build a similarity graph, compute the graph Laplacian, and inspect the Fiedler vector that splits the graph.",
      `
        <div class="lab-grid">
          <div class="controls">
            <div class="control-grid">
              <div class="control-group">
                <label for="spectral-sigma">Similarity width σ</label>
                <input id="spectral-sigma" type="number" min="0.3" max="2.5" step="0.1" value="1" />
              </div>
              <div class="control-group">
                <label for="spectral-threshold">Edge threshold</label>
                <input id="spectral-threshold" type="number" min="0.05" max="0.8" step="0.05" value="0.2" />
              </div>
            </div>
            <div class="step-controls">
              <button class="button primary" id="spectral-run">Recompute spectral split</button>
            </div>
            <div class="callout" id="spectral-callout"></div>
          </div>
          <div class="two-column">
            <div class="plot-card">
              <svg id="spectral-plot" viewBox="0 0 560 280" aria-label="Spectral clustering plot"></svg>
            </div>
            <div class="plot-card">
              <svg id="spectral-bars" viewBox="0 0 560 280" aria-label="Fiedler vector plot"></svg>
            </div>
            <div class="equation-card" id="spectral-math"></div>
            <div class="steps"><ol id="spectral-steps"></ol></div>
          </div>
        </div>
      `
    );

    const sigmaInput = rootNode.querySelector("#spectral-sigma");
    const thresholdInput = rootNode.querySelector("#spectral-threshold");
    const button = rootNode.querySelector("#spectral-run");
    const callout = rootNode.querySelector("#spectral-callout");
    const plot = rootNode.querySelector("#spectral-plot");
    const bars = rootNode.querySelector("#spectral-bars");
    const mathNode = rootNode.querySelector("#spectral-math");
    const stepsNode = rootNode.querySelector("#spectral-steps");

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
      const L = W.map((row, i) => row.map((value, j) => (i === j ? D[i] : 0) - value));
      const { eigenvalues, eigenvectors } = U.jacobiEigen(L);
      const order = eigenvalues.map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
      const fiedler = eigenvectors[order[Math.min(1, order.length - 1)].index];
      const cut = fiedler.some((value) => value > 0) && fiedler.some((value) => value < 0) ? 0 : U.median(fiedler);
      const assignments = fiedler.map((value) => (value >= cut ? 1 : 0));

      callout.innerHTML = `Current cut threshold: <strong>${U.round(cut, 3)}</strong>. The sign pattern of the Fiedler vector defines the partition.`;
      renderFormulaCards(mathNode, [
        { title: "Similarity graph", description: "Edges are weighted by a radial basis function.", formula: `W_ij = exp(-||x_i-x_j||² / (2·${U.round(sigma, 2)}²))` },
        { title: "Laplacian", description: "The graph Laplacian drives the spectral split.", formula: "L = D - W" },
        { title: "Fiedler split", description: "The second-smallest eigenvector induces the cut.", formula: `v₂ = [${fiedler.map((value) => U.round(value, 2)).join(", ")}]` },
      ]);
      U.renderSteps(
        stepsNode,
        [
          `<strong>Build W.</strong> Keep graph edges whose weight is at least <strong>${threshold}</strong>.`,
          "<strong>Build D and L.</strong> The diagonal degree matrix D and the Laplacian L = D - W summarize graph connectivity.",
          "<strong>Compute the Fiedler vector.</strong> The second-smallest eigenvector captures a low-cut partition direction.",
          "<strong>Split by sign.</strong> Positive and negative coordinates define the two spectral clusters.",
        ],
        4
      );

      const chart = U.makeChart(plot, { xDomain: [0.8, 8.2], yDomain: [2.2, 6.2], title: "Similarity graph partition" });
      for (let i = 0; i < n; i += 1) {
        for (let j = i + 1; j < n; j += 1) {
          if (W[i][j] > 0) {
            plot.appendChild(U.svgEl("line", { x1: chart.xScale(spectralPoints[i].x), y1: chart.yScale(spectralPoints[i].y), x2: chart.xScale(spectralPoints[j].x), y2: chart.yScale(spectralPoints[j].y), stroke: "#2f4057", "stroke-width": 1 + 4 * W[i][j], opacity: "0.22" }));
          }
        }
      }
      spectralPoints.forEach((point, index) => drawScatterPoint(plot, chart, point, clusterPalette[assignments[index]], 8));

      const yMin = Math.min(...fiedler) - 0.1;
      const yMax = Math.max(...fiedler) + 0.1;
      const barChart = U.makeChart(bars, { xDomain: [0, n + 1], yDomain: [yMin, yMax], title: "Fiedler vector coordinates" });
      fiedler.forEach((value, index) => {
        const x1 = barChart.xScale(index + 0.45);
        const x2 = barChart.xScale(index + 1.05);
        const zeroY = barChart.yScale(0);
        const y = barChart.yScale(value);
        bars.appendChild(U.svgEl("rect", { x: x1, y: Math.min(y, zeroY), width: x2 - x1, height: Math.abs(zeroY - y), fill: clusterPalette[assignments[index]], rx: "10" }));
        bars.appendChild(U.svgEl("text", { x: 0.5 * (x1 + x2), y: zeroY + 18, class: "svg-label", "text-anchor": "middle" })).textContent = spectralPoints[index].id;
      });
    }

    button.addEventListener("click", render);
    [sigmaInput, thresholdInput].forEach((input) => input.addEventListener("input", render));
    render();
  }

  renderShell();
  const workspace = root.querySelector("#algorithm-workspace");
  const engines = {
    "concept-overview": mountConceptOverview,
    "concept-forms": mountConceptForms,
    "concept-tools": mountConceptTools,
    gaussian: mountGaussian,
    "bias-variance": mountBiasVariance,
    cleanup: mountCleanup,
    kde: mountKde,
    knn: mountKnn,
    tree: mountTree,
    linear: mountLinear,
    "bayes-net": mountBayesNet,
    mrf: mountMRF,
    "belief-propagation": mountBeliefPropagation,
    markov: mountMarkov,
    hmm: mountHmm,
    partition: mountPartition,
    hierarchy: mountHierarchy,
    distance: mountDistance,
    dbscan: mountDbscan,
    spectral: mountSpectral,
  };
  if (engines[definition.engine]) {
    engines[definition.engine](workspace);
  } else {
    workspace.innerHTML = `<section class="lab"><p class="section-intro">The renderer for <strong>${definition.engine}</strong> has not been attached yet.</p></section>`;
  }
})();
