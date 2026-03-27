(function () {
  const categories = [
    {
      id: "foundations",
      title: "Foundations",
      page: "introduction.html",
      description:
        "Overview of machine learning, learning paradigms, generative modeling, parameter estimation, estimator quality, noisy data, density estimation, applications, and tools.",
    },
    {
      id: "classification",
      title: "Classification",
      page: "classification.html",
      description:
        "Instance-based, probabilistic, discriminative, tree-based, and margin-based classification methods.",
    },
    {
      id: "graphical-models",
      title: "Graphical Models",
      page: "graphical-models.html",
      description:
        "Bayesian networks, Markov random fields, inference, Markov chains, hidden states, decoding, and parameter learning.",
    },
    {
      id: "clustering",
      title: "Clustering",
      page: "clustering.html",
      description:
        "Partition-based, hierarchical, density-based, and graph-based clustering methods.",
    },
  ];

  function details(intuition, math, use, caution) {
    return { intuition, math, use, caution };
  }

  function page(definition) {
    return definition;
  }

  function gaussianPage(id, title, focus, summary, extra) {
    return page({
      id,
      title,
      category: "foundations",
      engine: "gaussian",
      options: { focus },
      subtitle: summary,
      summary,
      detail: extra,
    });
  }

  function linearPage(id, title, algorithm, summary, extra, options = {}) {
    return page({
      id,
      title,
      category: "classification",
      engine: "linear",
      options: Object.assign({ algorithm }, options),
      subtitle: summary,
      summary,
      detail: extra,
    });
  }

  function hmmPage(id, title, focus, summary, extra) {
    return page({
      id,
      title,
      category: "graphical-models",
      engine: "hmm",
      options: { focus },
      subtitle: summary,
      summary,
      detail: extra,
    });
  }

  function partitionPage(id, title, focus, summary, extra) {
    return page({
      id,
      title,
      category: "clustering",
      engine: "partition",
      options: { focus },
      subtitle: summary,
      summary,
      detail: extra,
    });
  }

  function hierarchyPage(id, title, focus, summary, extra) {
    return page({
      id,
      title,
      category: "clustering",
      engine: "hierarchy",
      options: { focus },
      subtitle: summary,
      summary,
      detail: extra,
    });
  }

  const allPages = [
    page({
      id: "ml-overview",
      title: "Overview of Machine Learning",
      category: "foundations",
      engine: "concept-overview",
      subtitle: "See the end-to-end learning workflow from data definition to validation and deployment.",
      summary:
        "See the end-to-end learning workflow from data definition to validation and deployment.",
      detail: details(
        "Machine learning is the discipline of choosing a parameterized model and adjusting it so that it performs well on data. The important move is not memorizing a definition, but seeing the loop: define a task, choose an objective, optimize parameters, and evaluate generalization.",
        "The page shows the common training objective shape: choose parameters θ to minimize empirical risk across a dataset. The exact loss changes by task, but the structure is stable: data, objective, optimization, validation, and deployment.",
        "Use this page before diving into a specific algorithm. It gives you a frame for asking what the inputs are, what the model assumes, what quantity is optimized, and how success is measured.",
        "A common failure mode is confusing training success with real-world success. A model can fit the training set and still fail under distribution shift, poor labels, or the wrong evaluation metric."
      ),
    }),
    page({
      id: "different-forms-of-learning",
      title: "Different Forms of Learning",
      category: "foundations",
      engine: "concept-forms",
      subtitle: "Compare supervised, unsupervised, semi-supervised, reinforcement, and generative views.",
      summary:
        "Compare supervised, unsupervised, semi-supervised, reinforcement, and generative views.",
      detail: details(
        "Different forms of learning are distinguished by what information is available. Supervised learning has targets, unsupervised learning has only structure in x, semi-supervised learning has a few labels plus many unlabeled inputs, reinforcement learning has delayed rewards, and generative learning models how data arise.",
        "The mathematical differences appear in the objective. Supervised learning minimizes prediction loss, unsupervised learning optimizes structure criteria such as distortion or likelihood, and generative learning factors the joint distribution into interpretable pieces such as p(y)p(x|y).",
        "Use this page when deciding what class of method matches a dataset. If labels are absent, forcing a classifier is the wrong starting point; if uncertainty is central, generative or Bayesian methods become more attractive.",
        "Many beginners treat these as isolated boxes, but practical systems often combine them. Semi-supervised pipelines, self-training, generative pretraining, and reinforcement learning with world models all mix these forms."
      ),
    }),
    gaussianPage(
      "generative-learning",
      "Generative Learning",
      "generative",
      "Model how observations are produced, then update beliefs about the hidden parameters.",
      details(
        "Generative learning starts from a story about how data were produced. Instead of directly drawing a decision boundary, it models distributions such as p(x|y) and priors such as p(y), or more generally p(x, z, θ).",
        "The page emphasizes likelihood and posterior calculations. You can see how the sample contributes a likelihood term and how the prior combines with it through Bayes' rule to produce a posterior over parameters.",
        "Use generative learning when uncertainty matters, when simulation is useful, when missing data are common, or when you need to reason about hidden causes rather than only outputs.",
        "The main risk is misspecification. If the assumed data-generation process is badly wrong, the posterior can look mathematically clean while being practically misleading."
      )
    ),
    gaussianPage(
      "gaussian-parameter-estimation",
      "Gaussian Parameter Estimation",
      "gaussian",
      "Estimate the mean and spread of a Gaussian source from observed data.",
      details(
        "Gaussian parameter estimation reduces a cloud of real-valued observations to a small set of parameters, usually a mean and a variance. The point is not compression for its own sake, but obtaining a mathematically tractable model for future inference.",
        "The page shows the exact formulas for the sample mean, the Gaussian likelihood, and the variance estimate. Because the Gaussian is analytically convenient, many updates can be written in closed form and inspected step by step.",
        "Use this page when you want to understand why the Gaussian appears so often in statistics, filtering, control, anomaly detection, and scientific measurement.",
        "The method is sensitive to heavy tails and strong outliers. If the data are multimodal or extremely skewed, a single Gaussian estimate can hide the real structure."
      )
    ),
    gaussianPage(
      "maximum-likelihood-estimation",
      "Maximum Likelihood Estimation",
      "mle",
      "Choose parameter values that make the observed data most probable under the model.",
      details(
        "Maximum likelihood estimation asks a direct question: for which parameter values would the observed dataset have been most likely? In many classical models, this produces simple analytic estimators.",
        "On the page the likelihood is written explicitly as a product over data points, then converted into a more convenient log-likelihood. You can inspect the substitution from your sample into the Gaussian MLE formulas.",
        "Use MLE when you want a clean, data-driven estimate without injecting prior beliefs. It is the default estimator behind a large amount of classical statistics and many machine learning models.",
        "MLE can overreact when sample size is small or when parameters are weakly identified. It also provides no direct mechanism for encoding prior knowledge or regularization unless you add it separately."
      )
    ),
    gaussianPage(
      "map-estimation",
      "MAP Estimation",
      "map",
      "Combine prior preference and data evidence, then choose the posterior mode.",
      details(
        "Maximum a posteriori estimation modifies pure likelihood with prior information. Instead of only asking what fits the data best, it asks what parameter value is most plausible after seeing both prior belief and evidence.",
        "The page shows the posterior as proportional to likelihood times prior. In the Gaussian-conjugate setting, the resulting MAP estimate is easy to inspect numerically because the posterior remains Gaussian.",
        "Use MAP when you want regularization or prior structure without carrying the full posterior through every downstream computation. Many regularized estimators can be interpreted as MAP solutions.",
        "A MAP estimate is still just one point from the posterior. If uncertainty width matters, a full Bayesian treatment is more informative than focusing only on the posterior mode."
      )
    ),
    gaussianPage(
      "bayesian-estimation",
      "Bayesian Estimation",
      "bayesian",
      "Update a full posterior distribution instead of keeping only one best estimate.",
      details(
        "Bayesian estimation treats parameters as uncertain quantities. Before seeing data you have a prior; after seeing data you have a posterior; predictions integrate over that posterior instead of pretending one point estimate is exact.",
        "The page makes the posterior precision update explicit, showing how prior precision and data precision add. That is the key reason conjugate Bayesian updates are so transparent in Gaussian models.",
        "Use Bayesian estimation when uncertainty intervals, prior knowledge, sequential updating, or predictive calibration are central to the task.",
        "The tradeoff is computational. Simple conjugate cases are elegant, but general Bayesian models require approximation methods such as variational inference or MCMC."
      )
    ),
    page({
      id: "bias-and-variance-of-estimators",
      title: "Bias and Variance of Estimators",
      category: "foundations",
      engine: "bias-variance",
      subtitle: "See how repeated sampling creates a distribution over estimators, not just one answer.",
      summary:
        "See how repeated sampling creates a distribution over estimators, not just one answer.",
      detail: details(
        "An estimator is random because the dataset is random. Bias measures systematic displacement from the truth, while variance measures sensitivity to which sample happened to arrive.",
        "The page computes the empirical bias, variance, and mean squared error from repeated simulations. It makes the decomposition concrete: MSE = bias² + variance.",
        "Use this lens whenever you compare two estimators. A seemingly worse estimator can outperform another if it trades a little bias for a large variance reduction.",
        "The danger is optimizing only one term. Zero bias is not enough if variance is explosive, and low variance is not enough if the estimator is systematically wrong."
      ),
    }),
    page({
      id: "missing-and-noisy-features",
      title: "Missing and Noisy Features",
      category: "foundations",
      engine: "cleanup",
      subtitle: "Preprocessing decisions change the data distribution before the model even begins.",
      summary:
        "Preprocessing decisions change the data distribution before the model even begins.",
      detail: details(
        "Missing features and noisy features are not minor cleaning issues; they directly alter the information content that reaches the learner. Imputation changes estimates, and clipping or denoising changes geometry.",
        "The page exposes the formulas for mean or median imputation and for z-score based clamping. Every time you apply a rule, the feature summary statistics change and so will downstream parameter estimates.",
        "Use this page before fitting classifiers or density models on imperfect datasets. It is especially important when the missingness mechanism or sensor corruption is not random.",
        "Naive preprocessing can inject false certainty. Mean imputation can shrink variance, dropping rows can distort class balance, and aggressive clamping can erase real signal along with noise."
      ),
    }),
    page({
      id: "nonparametric-density-estimation",
      title: "Nonparametric Density Estimation",
      category: "foundations",
      engine: "kde",
      subtitle: "Build a density estimate by summing local kernels instead of assuming one global Gaussian.",
      summary:
        "Build a density estimate by summing local kernels instead of assuming one global Gaussian.",
      detail: details(
        "Nonparametric density estimation avoids committing to a fixed parametric family such as one Gaussian. Instead, it lets the observed data shape the density more flexibly.",
        "The page writes the kernel density estimate explicitly as an average over kernels centered on sample points. The bandwidth parameter is the key control because it determines the bias-variance tradeoff of the density estimate itself.",
        "Use KDE for exploratory density modeling, anomaly detection, mode discovery, or understanding how smooth or rough the sample distribution appears.",
        "Bandwidth choice is the central risk. Too small gives a spiky estimate that memorizes the sample; too large oversmooths and hides real modes."
      ),
    }),
    page({
      id: "applications-and-software-tools",
      title: "Applications and Software Tools",
      category: "foundations",
      engine: "concept-tools",
      subtitle: "Connect algorithms to domains and to the software stack used to build real systems.",
      summary:
        "Connect algorithms to domains and to the software stack used to build real systems.",
      detail: details(
        "Algorithms live inside pipelines. A useful mental model includes the domain, the data collection process, the modeling library, the evaluation setup, and the deployment constraints.",
        "The page links application settings to mathematical task types and common tools. For example, density models and Bayesian estimation connect naturally to PyMC or probabilistic programming, while large-scale discriminative training often lives in PyTorch or TensorFlow.",
        "Use this page to understand where each method fits in practice and which software ecosystem is typically used to implement it.",
        "Tool choice should follow the problem, not the other way around. A flashy framework does not fix weak data collection or a poorly matched objective."
      ),
    }),
    page({
      id: "nearest-neighbour",
      title: "Nearest Neighbour",
      category: "classification",
      engine: "knn",
      subtitle: "Predict from local evidence by comparing the query to labeled examples.",
      summary:
        "Predict from local evidence by comparing the query to labeled examples.",
      detail: details(
        "Nearest neighbour methods store the dataset and defer most computation until query time. The key idea is locality: similar points should have similar labels.",
        "The page shows the exact distance formula and the majority-vote rule. Because the neighbors are revealed one at a time, you can see how the prediction forms from concrete evidence instead of global parameters.",
        "Use k-NN as a baseline, when the dataset is modest in size, or when local structure matters more than a single smooth boundary.",
        "The method is sensitive to feature scaling, irrelevant dimensions, and the metric choice. In high-dimensional spaces the notion of ‘nearest’ can become unstable."
      ),
    }),
    page({
      id: "decision-trees",
      title: "Decision Trees",
      category: "classification",
      engine: "tree",
      options: { mode: "classification", focus: "tree" },
      subtitle: "Split the feature space greedily using impurity reduction.",
      summary:
        "Split the feature space greedily using impurity reduction.",
      detail: details(
        "Decision trees partition the input space using simple threshold questions. Each split is chosen greedily, making the method easy to interpret and easy to visualize.",
        "The page computes candidate split scores explicitly, using Gini impurity reduction for classification. Every threshold has a measurable before-and-after effect on class purity.",
        "Use decision trees when interpretability matters, when nonlinear boundaries are needed, or when mixed feature types make linear models awkward.",
        "Individual trees can overfit. Small changes in data can also change the top splits, which is why ensembles such as random forests and boosting are so common."
      ),
    }),
    linearPage(
      "linear-discriminant-analysis",
      "Linear Discriminant Analysis",
      "lda",
      "Derive a linear boundary from class means, shared covariance, and priors.",
      details(
        "LDA is a generative classifier. It assumes each class is Gaussian with a shared covariance matrix, then derives a discriminant function from those assumptions.",
        "The page shows the pooled covariance estimate, the discriminant vector Σ⁻¹(μ1 - μ0), and the bias term that includes priors. The resulting separator is linear even though it comes from a probabilistic model.",
        "Use LDA when the Gaussian-with-shared-covariance assumption is plausible or when you want a fast, interpretable baseline with a statistical derivation.",
        "If class covariances differ substantially or class shapes are strongly non-Gaussian, LDA can misplace the decision boundary."
      )
    ),
    linearPage(
      "logistic-regression",
      "Logistic Regression",
      "logistic",
      "Fit probabilities directly by minimizing log-loss.",
      details(
        "Logistic regression is discriminative: it models p(y|x) directly rather than modeling how each class generates x. The sigmoid converts a linear score into a probability.",
        "The page shows the score z = wᵀx, the probability σ(z), and the gradient step that reduces cross-entropy loss. Each training click updates the weights using the current example.",
        "Use logistic regression for calibrated probabilities, interpretable coefficients, and strong linear baselines.",
        "The method still depends on feature representation. If the raw space is not close to linearly separable, you need feature engineering or a nonlinear lift."
      )
    ),
    linearPage(
      "perceptron",
      "Perceptron",
      "perceptron",
      "Correct mistakes with the simplest online linear update rule.",
      details(
        "The perceptron is a classic online learning algorithm. It does not optimize a smooth probability model; it simply reacts whenever an example is misclassified.",
        "The page displays the perceptron update w ← w + ηyx when y(wᵀx) ≤ 0. This makes the logic easy to follow: only mistakes move the boundary.",
        "Use the perceptron to understand online linear classification and to build intuition for margin-based updates and convergence on separable data.",
        "Because it ignores confidence once points are correctly classified, it can be unstable on noisy or nonseparable datasets and does not provide calibrated probabilities."
      )
    ),
    linearPage(
      "large-margin-classification",
      "Large Margin Classification",
      "svm",
      "Push the boundary away from training points instead of only making them correct.",
      details(
        "Large-margin methods care about how confidently points are separated, not just whether they are on the correct side. A larger margin often improves generalization.",
        "The page shows the hinge-style logic: if the margin y(wᵀx) is below 1, the update pushes the separator away from the point; otherwise the model mostly regularizes.",
        "Use large-margin thinking when you want robust separation and a geometric interpretation of generalization.",
        "Margin methods can still fail if the representation is poor. The margin is only meaningful in the feature space the algorithm sees."
      )
    ),
    linearPage(
      "kernel-methods",
      "Kernel Methods",
      "svm",
      "Lift inputs into a richer feature space so a linear separator can solve a nonlinear problem.",
      details(
        "Kernel methods avoid explicitly building every high-dimensional feature. Instead they rely on similarity computations that behave as if the data had been mapped into a richer space.",
        "The page uses a radial-basis feature lift to make the idea visible: the model remains linear in transformed features while producing nonlinear boundaries in the original plane.",
        "Use kernel methods when linear geometry in the raw space is too restrictive but you still want strong theoretical structure and convex training objectives.",
        "Kernel methods can become expensive on very large datasets because the number of support or reference points can grow with the training set."
      ),
      { featureMap: "rbf" }
    ),
    linearPage(
      "support-vector-machines",
      "Support Vector Machines",
      "svm",
      "Optimize a large-margin separator and focus the solution on the boundary-critical points.",
      details(
        "Support vector machines are the canonical large-margin classifier. The solution is determined mainly by examples that sit closest to the boundary, the support vectors.",
        "The page shows a simple hinge-driven update rule and the effect of a radial basis lift when the raw input is not linearly separable. This exposes both the margin logic and the kernel extension.",
        "Use SVMs when you want a strong classifier with a clear geometric objective and when the dataset size is moderate enough to support margin-based training.",
        "SVM performance depends on scaling, regularization, and kernel choice. Without tuning, the margin objective can still give poor decision boundaries."
      ),
      { featureMap: "rbf" }
    ),
    page({
      id: "classification-and-regression-trees",
      title: "Classification and Regression Trees",
      category: "classification",
      engine: "tree",
      options: { mode: "regression", focus: "cart" },
      subtitle: "Use the same tree idea for both class labels and continuous targets.",
      summary:
        "Use the same tree idea for both class labels and continuous targets.",
      detail: details(
        "CART unifies classification and regression trees under one greedy splitting framework. The split criterion changes, but the recursive partitioning logic stays the same.",
        "The page highlights squared-error reduction for regression leaves, where each leaf predicts a constant mean value. This makes the piecewise-constant structure very explicit.",
        "Use CART when you want interpretable nonlinear regression or when you want the foundational tree algorithm behind many ensemble methods.",
        "Like classification trees, regression trees can become unstable and jagged without pruning or ensemble averaging."
      ),
    }),
    page({
      id: "bayesian-networks",
      title: "Bayesian Networks",
      category: "graphical-models",
      engine: "bayes-net",
      options: { focus: "network" },
      subtitle: "Factor a joint distribution with a directed acyclic graph and local conditionals.",
      summary:
        "Factor a joint distribution with a directed acyclic graph and local conditionals.",
      detail: details(
        "Bayesian networks use directed graphs to encode factorization structure. Each node depends only on its parents, so the joint distribution becomes a product of local conditional probability tables.",
        "The page shows the factorization and lets you test how observation changes dependence. This links graph structure directly to inference logic rather than treating the graph as decoration.",
        "Use Bayesian networks when causal or conditional structure matters, when local conditionals are interpretable, or when hidden-variable reasoning is needed.",
        "The graph does not automatically make inference easy. Some network structures still induce difficult inference or difficult parameter learning."
      ),
    }),
    page({
      id: "conditional-independence",
      title: "Conditional Independence",
      category: "graphical-models",
      engine: "bayes-net",
      options: { focus: "independence" },
      subtitle: "Use graph structure to determine when information flow is blocked or active.",
      summary:
        "Use graph structure to determine when information flow is blocked or active.",
      detail: details(
        "Conditional independence is the language that lets graphical models scale. If two variables become independent once a third is known, the joint distribution can be factorized more efficiently.",
        "The page focuses on chains, forks, colliders, and separators. It makes the d-separation rules explicit so you can see why conditioning sometimes blocks a path and sometimes opens one.",
        "Use this page when you want to read a graphical model correctly instead of guessing dependence from the drawing.",
        "A frequent mistake is treating every path as the same. Colliders behave differently from chains and forks, and that difference matters enormously for inference."
      ),
    }),
    page({
      id: "markov-random-fields",
      title: "Markov Random Fields",
      category: "graphical-models",
      engine: "mrf",
      subtitle: "Model undirected dependencies through compatibility functions and energies.",
      summary:
        "Model undirected dependencies through compatibility functions and energies.",
      detail: details(
        "Markov random fields represent dependencies without assigning a directional parent-child story. They are often more natural when interactions are symmetric or when the main object is an energy function.",
        "The page shows the local conditional and the Gibbs-style update induced by pairwise compatibilities. It also makes the energy interpretation visible through compatibility scores.",
        "Use MRFs for spatial data, image labeling, smoothness priors, and other settings where neighboring variables influence each other symmetrically.",
        "The partition function Z can make exact probability calculations difficult. That is why approximate inference and sampling methods are so important in undirected models."
      ),
    }),
    page({
      id: "inference-in-graphical-models",
      title: "Inference in Graphical Models",
      category: "graphical-models",
      engine: "belief-propagation",
      options: { focus: "inference" },
      subtitle: "Compute marginals by pushing local information through the graph.",
      summary:
        "Compute marginals by pushing local information through the graph.",
      detail: details(
        "Inference asks what you can conclude about one variable after observing others. In graphical models, the answer comes from combining local factors without expanding the full joint distribution naively.",
        "The page uses message passing because it makes inference algebra local: each message summarizes how one part of the graph constrains another part.",
        "Use this page to build intuition for exact inference on trees and for why graph structure changes computational difficulty so dramatically.",
        "Exact inference is easy on some structures and hard on others. The same factorization idea can lead to very different computational costs depending on loops and treewidth."
      ),
    }),
    page({
      id: "belief-propagation",
      title: "Belief Propagation",
      category: "graphical-models",
      engine: "belief-propagation",
      options: { focus: "bp" },
      subtitle: "Send messages between factors and variables to compute marginals.",
      summary:
        "Send messages between factors and variables to compute marginals.",
      detail: details(
        "Belief propagation decomposes global inference into message updates on edges. Each message is a compact summary of how one side of the graph constrains the other.",
        "The page shows the binary message vectors numerically at every step so you can see how local evidence is transformed by pairwise compatibility and then normalized into beliefs.",
        "Use belief propagation on tree-structured models for exact marginals or on loopy graphs when a practical approximation is acceptable.",
        "On loopy graphs, belief propagation is no longer guaranteed to be exact or even to converge. The updates remain useful, but the interpretation becomes approximate."
      ),
    }),
    page({
      id: "markov-models",
      title: "Markov Models",
      category: "graphical-models",
      engine: "markov",
      subtitle: "Propagate a visible-state distribution forward with a transition matrix.",
      summary:
        "Propagate a visible-state distribution forward with a transition matrix.",
      detail: details(
        "A Markov model assumes the present state summarizes all relevant past information for the future. That simplifies sequence modeling to repeated matrix multiplication by transition probabilities.",
        "The page shows the distribution update p_t = p_{t-1}T step by step. Because the states are visible, there is no emission uncertainty yet; the transition model is the whole story.",
        "Use Markov models for simple sequence dynamics, queueing systems, population state evolution, and as the starting point before hidden-state models.",
        "The Markov assumption can be too restrictive if long-range history matters. In that case the state space must be enlarged or the model class changed."
      ),
    }),
    hmmPage(
      "hidden-markov-models",
      "Hidden Markov Models",
      "general",
      "Combine hidden state transitions with noisy observations.",
      details(
        "A hidden Markov model adds a second layer to a Markov chain: the states evolve privately, and each state emits observations probabilistically. This separates latent dynamics from visible evidence.",
        "The page computes forward beliefs, Viterbi best states, and parameter updates on the same example so you can see the three main tasks: filtering, decoding, and learning.",
        "Use HMMs when sequential dependence exists but the relevant state is not directly observed, such as weather, phonemes, biological motifs, or user intent.",
        "HMMs are limited by their discrete state assumptions and conditional independence structure. Richer sequence problems often need more expressive state or emission models."
      )
    ),
    hmmPage(
      "decoding-states-from-observations",
      "Decoding States from Observations",
      "decoding",
      "Use Viterbi recursion to recover the most likely hidden-state path.",
      details(
        "Decoding is different from filtering. Filtering asks for the current state distribution, while decoding asks for the single most likely global path through hidden states.",
        "The page exposes the Viterbi recursion with max operations and backpointers. This is the right mathematical object when the goal is one coherent state sequence rather than separate per-time marginals.",
        "Use decoding when you need a discrete interpretation of the entire sequence, such as part-of-speech tags, regime labels, or gesture states.",
        "The most likely path is not the same as choosing the most likely state independently at each time. Global consistency matters."
      )
    ),
    hmmPage(
      "learning-hmm-parameters",
      "Learning HMM Parameters",
      "learning",
      "Use soft counts from forward-backward style inference to update transitions and emissions.",
      details(
        "Learning HMM parameters means inferring transition and emission probabilities from observed sequences when the true hidden states are unknown. The standard approach alternates inference and parameter re-estimation.",
        "The page shows one Baum-Welch style update using expected state occupancies and expected transition counts. That makes the EM logic concrete: infer hidden structure, then maximize expected complete-data likelihood.",
        "Use this page when you want to understand where HMM parameters come from rather than treating them as hand-tuned constants.",
        "Learning is sensitive to initialization and local optima. Different starting parameters can lead to different fitted models even on the same observations."
      )
    ),
    partitionPage(
      "partition-based-clustering",
      "Partition-Based Clustering",
      "general",
      "Alternate assignment and representative updates to divide points into groups.",
      details(
        "Partition-based clustering assumes the data can be summarized by a fixed number of representatives. Each iteration assigns points to representatives and then moves the representatives.",
        "The page lets you switch between centroid and medoid style updates, making the shared assignment-update structure explicit while keeping the mathematical difference visible.",
        "Use this page to understand the common skeleton behind K-means and K-medoids before specializing to each method.",
        "The main limitations are the need to choose k and the assumption that clusters are well captured by representative-based partitions."
      )
    ),
    partitionPage(
      "k-means",
      "K-Means",
      "kmeans",
      "Update centroids by averaging the points currently assigned to each cluster.",
      details(
        "K-means is the canonical partition-based clustering method. It seeks compact clusters by minimizing within-cluster squared distance to centroids.",
        "The page shows the assignment rule and the centroid update μ_k = average of cluster k. Each click alternates those two steps so the objective descent becomes visible.",
        "Use K-means when clusters are roughly spherical, similar in size, and well represented by arithmetic means.",
        "K-means is sensitive to initialization, scaling, outliers, and the chosen value of k. It is also a poor match for non-convex cluster shapes."
      )
    ),
    partitionPage(
      "k-medoids",
      "K-Medoids",
      "kmedoids",
      "Restrict each representative to be an actual data point, improving robustness to outliers.",
      details(
        "K-medoids shares the assignment-update loop of K-means but chooses medoids from the observed data points instead of unconstrained centroids.",
        "The page makes the difference explicit by computing the total in-cluster distance for each candidate medoid. That lets you see why the representative can jump only onto existing observations.",
        "Use K-medoids when outliers are present or when the mean is not a meaningful representative of a cluster.",
        "The cost is extra computation. Evaluating candidate medoids is more expensive than computing simple averages."
      )
    ),
    hierarchyPage(
      "hierarchical-clustering",
      "Hierarchical Clustering",
      "general",
      "Build a nested cluster tree instead of committing immediately to one partition.",
      details(
        "Hierarchical clustering records how clusters form across multiple resolutions. Instead of selecting one k immediately, it builds a dendrogram that can be cut at different heights.",
        "The page supports both agglomerative and divisive views, along with linkage logic. That makes the hierarchy itself the object of study, not just the final partition.",
        "Use hierarchical clustering when nested structure matters or when you want to inspect clustering stability across scales.",
        "The hierarchy can be distorted by a poor linkage rule or noisy distances. Once a merge or split happens in a greedy hierarchy, it is typically not reconsidered."
      )
    ),
    hierarchyPage(
      "agglomerative-clustering",
      "Agglomerative Clustering",
      "agglomerative",
      "Start with singleton points and repeatedly merge the closest clusters.",
      details(
        "Agglomerative clustering is the bottom-up form of hierarchical clustering. Every point starts alone, and the algorithm repeatedly merges the nearest pair of clusters.",
        "The page shows exactly which pair merges at each step and why the chosen linkage produces that merge distance. The dendrogram is built alongside the scatter plot.",
        "Use agglomerative clustering when you want a transparent merge history and when dataset size is moderate enough for pairwise distance bookkeeping.",
        "Different linkage definitions can produce very different dendrograms, so interpretation depends heavily on that modeling choice."
      )
    ),
    hierarchyPage(
      "divisive-clustering",
      "Divisive Clustering",
      "divisive",
      "Start with one cluster and repeatedly split the cluster with the largest internal spread.",
      details(
        "Divisive clustering is the top-down counterpart to agglomerative clustering. It begins with all points together and recursively splits clusters into smaller pieces.",
        "The page uses a simple two-way split heuristic so you can inspect the logic of choosing which cluster to cut and how the cut redistributes points.",
        "Use divisive clustering when you prefer reasoning from coarse structure to fine structure or when a top-down split heuristic matches the application.",
        "Divisive methods require a split strategy, and those heuristics can be less standardized than bottom-up linkage rules."
      )
    ),
    page({
      id: "distance-measures",
      title: "Distance Measures",
      category: "clustering",
      engine: "distance",
      subtitle: "Compare Euclidean, Manhattan, and cosine geometry on the same points.",
      summary:
        "Compare Euclidean, Manhattan, and cosine geometry on the same points.",
      detail: details(
        "Distance is not a neutral preprocessing detail; it defines what similarity means. Many algorithms change behavior dramatically when the metric changes.",
        "The page computes Euclidean, Manhattan, and cosine quantities from the same pair of vectors so you can inspect the arithmetic and the geometric interpretation together.",
        "Use this page before trusting nearest-neighbour or clustering outputs. Often the metric choice matters as much as the algorithm choice.",
        "A poor metric can destroy a good algorithm. If scaling, sparsity, or directional structure are ignored, closeness can become meaningless."
      ),
    }),
    page({
      id: "dbscan",
      title: "DBSCAN",
      category: "clustering",
      engine: "dbscan",
      subtitle: "Grow clusters from dense neighborhoods and leave sparse points as noise.",
      summary:
        "Grow clusters from dense neighborhoods and leave sparse points as noise.",
      detail: details(
        "DBSCAN defines clusters by density connectivity rather than by centroid compactness. Core points seed clusters, border points attach to them, and isolated points remain noise.",
        "The page shows the ε-neighborhood of the active point, the core-point test |Nε(p)| ≥ minPts, and the cluster expansion order.",
        "Use DBSCAN for irregularly shaped clusters and when you want noise detection without specifying the number of clusters in advance.",
        "DBSCAN depends heavily on the radius and minimum-points settings. A single global density threshold can also struggle when the dataset contains clusters of very different densities."
      ),
    }),
    page({
      id: "spectral-clustering",
      title: "Spectral Clustering",
      category: "clustering",
      engine: "spectral",
      subtitle: "Turn a similarity graph into a Laplacian eigenproblem, then split by the Fiedler vector.",
      summary:
        "Turn a similarity graph into a Laplacian eigenproblem, then split by the Fiedler vector.",
      detail: details(
        "Spectral clustering reframes clustering as a graph partition problem. Similarity weights become an adjacency matrix, degrees become a diagonal matrix, and the cut structure emerges from eigenvectors of the Laplacian.",
        "The page computes similarity weights, the Laplacian L = D - W, and the second-smallest eigenvector that defines the split. This makes the algebra behind graph-based clustering visible.",
        "Use spectral clustering when cluster shape is not well captured by centroids, especially when the data lie on manifolds or form curved groups.",
        "Its success depends on constructing a good similarity graph. If the graph is poor, the eigenvectors will faithfully reflect the wrong structure."
      ),
    }),
  ];

  const algorithms = {};
  allPages.forEach((definition, index) => {
    algorithms[definition.id] = Object.assign({ order: index }, definition);
  });

  function get(id) {
    return algorithms[id] || null;
  }

  function byCategory(categoryId) {
    return Object.values(algorithms)
      .filter((entry) => entry.category === categoryId)
      .sort((a, b) => a.order - b.order);
  }

  window.MLAlgorithms = {
    categories,
    algorithms,
    get,
    byCategory,
  };
})();
