/* ══════════════════════════════════════════════════════════════
   NEURAL NETWORK ENGINE

   Ported from the TypeScript engine in the `neural/` Vite app so the
   whole site stays dependency-free static HTML. Everything the original
   supported is preserved:

     · arbitrary architecture — any number of layers, any width
     · a bias per neuron
     · a different activation per layer
     · MSE, binary cross-entropy and categorical cross-entropy
     · softmax with the max-subtraction stability shift
     · the exact-gradient shortcuts for softmax+CCE and sigmoid+BCE,
       where the messy intermediate terms cancel to a plain (y − t)

   Kept deliberately free of DOM code: it computes, the page renders.
   ══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ── Activations ─────────────────────────────────────────────── */
  const sigmoid = (z) => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));
  const sigmoidPrime = (z) => {
    const s = sigmoid(z);
    return s * (1 - s);
  };

  const relu = (z) => Math.max(0, z);
  const reluPrime = (z) => (z > 0 ? 1 : 0);

  const leaky = (z) => (z > 0 ? z : 0.1 * z);
  const leakyPrime = (z) => (z > 0 ? 1 : 0.1);

  const tanhFn = (z) => Math.tanh(z);
  const tanhPrime = (z) => 1 - Math.tanh(z) ** 2;

  const linear = (z) => z;
  const linearPrime = () => 1;

  const ACTIVATIONS = {
    sigmoid: {
      label: "Sigmoid",
      f: sigmoid,
      df: sigmoidPrime,
      tex: "\\sigma(z) = \\dfrac{1}{1 + e^{-z}}",
      dTex: "\\sigma'(z) = \\sigma(z)\\,(1 - \\sigma(z))",
      range: "(0, 1)",
      peak: 0.25,
    },
    tanh: {
      label: "Tanh",
      f: tanhFn,
      df: tanhPrime,
      tex: "\\tanh(z) = \\dfrac{e^{z} - e^{-z}}{e^{z} + e^{-z}}",
      dTex: "\\tanh'(z) = 1 - \\tanh^2(z)",
      range: "(−1, 1)",
      peak: 1,
    },
    relu: {
      label: "ReLU",
      f: relu,
      df: reluPrime,
      tex: "\\mathrm{ReLU}(z) = \\max(0, z)",
      dTex: "\\mathrm{ReLU}'(z) = \\mathbb{1}[z > 0]",
      range: "[0, ∞)",
      peak: 1,
    },
    leaky: {
      label: "Leaky ReLU",
      f: leaky,
      df: leakyPrime,
      tex: "f(z) = \\begin{cases} z & z > 0 \\\\ 0.1z & z \\le 0 \\end{cases}",
      dTex: "f'(z) = \\begin{cases} 1 & z > 0 \\\\ 0.1 & z \\le 0 \\end{cases}",
      range: "(−∞, ∞)",
      peak: 1,
    },
    linear: {
      label: "Linear",
      f: linear,
      df: linearPrime,
      tex: "f(z) = z",
      dTex: "f'(z) = 1",
      range: "(−∞, ∞)",
      peak: 1,
    },
    softmax: {
      label: "Softmax",
      /* Applied across the layer, not per neuron — handled in
         forwardLayer. f/df here are only fallbacks. */
      f: linear,
      df: linearPrime,
      vector: true,
      tex: "\\mathrm{softmax}(\\mathbf{z})_i = \\dfrac{e^{z_i}}{\\sum_j e^{z_j}}",
      dTex: "\\dfrac{\\partial a_i}{\\partial z_j} = a_i(\\delta_{ij} - a_j)",
      range: "(0, 1), sums to 1",
      peak: 0.25,
    },
  };

  const LOSSES = {
    mse: {
      label: "Mean squared error",
      tex: "L = \\tfrac{1}{2}\\sum_i (a_i - y_i)^2",
      /* The ½ is what makes the derivative a clean (a − y). */
      total: (outputs, target) =>
        outputs.reduce((acc, value, i) => acc + 0.5 * (value - target[i]) ** 2, 0),
      dA: (y, t) => y - t,
      suits: "Regression, or any continuous target.",
    },
    bce: {
      label: "Binary cross-entropy",
      tex: "L = -\\sum_i \\big[\\, y_i \\log a_i + (1 - y_i)\\log(1 - a_i) \\,\\big]",
      total: (outputs, target) =>
        outputs.reduce((acc, value, i) => {
          const clipped = Math.min(1 - 1e-15, Math.max(1e-15, value));
          return acc - (target[i] * Math.log(clipped) + (1 - target[i]) * Math.log(1 - clipped));
        }, 0),
      dA: (y, t) => {
        const clipped = Math.min(1 - 1e-15, Math.max(1e-15, y));
        return -(t / clipped) + (1 - t) / (1 - clipped);
      },
      suits: "Independent yes/no outputs, paired with sigmoid.",
    },
    cce: {
      label: "Categorical cross-entropy",
      tex: "L = -\\sum_i y_i \\log a_i",
      total: (outputs, target) =>
        outputs.reduce((acc, value, i) => {
          const clipped = Math.min(1 - 1e-15, Math.max(1e-15, value));
          return acc - target[i] * Math.log(clipped);
        }, 0),
      dA: (y, t) => {
        const clipped = Math.min(1 - 1e-15, Math.max(1e-15, y));
        return -t / clipped;
      },
      suits: "Exactly one correct class, paired with softmax.",
    },
  };

  /* ── Construction ────────────────────────────────────────────── */

  /* config = { inputSize, layers: [{ neurons, activation }], loss, learningRate }
     Layer 0 of `layers` is the first hidden layer; the input layer is
     not stored as a layer because it has no weights of its own. */
  function initializeNetwork(config, seed = 1) {
    const rng = seededRandom(seed);
    const layers = [];
    let previousSize = config.inputSize;

    config.layers.forEach((layerConfig, layerIndex) => {
      const neurons = [];
      for (let i = 0; i < layerConfig.neurons; i += 1) {
        /* Xavier-ish scaling keeps early activations away from the flat
           tails of sigmoid/tanh, where training would stall. */
        const scale = 1 / Math.sqrt(previousSize);
        neurons.push({
          id: `L${layerIndex}-N${i}`,
          layerIndex,
          neuronIndex: i,
          bias: 0,
          weights: Array.from({ length: previousSize }, () => (rng() * 2 - 1) * scale),
          z: 0,
          a: 0,
        });
      }
      layers.push({ index: layerIndex, neurons });
      previousSize = layerConfig.neurons;
    });

    return { layers, inputs: [], target: [], totalLoss: undefined, epoch: 0 };
  }

  function seededRandom(seed) {
    let state = seed >>> 0 || 1;
    return function next() {
      state = (1664525 * state + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function activationsInto(network, layerIndex) {
    return layerIndex === 0
      ? network.inputs
      : network.layers[layerIndex - 1].neurons.map((neuron) => neuron.a);
  }

  /* ── Forward ─────────────────────────────────────────────────── */
  function forwardLayer(network, layerIndex, config) {
    const layer = network.layers[layerIndex];
    const previous = activationsInto(network, layerIndex);
    const type = config.layers[layerIndex].activation;

    layer.neurons.forEach((neuron) => {
      let z = neuron.bias;
      for (let j = 0; j < neuron.weights.length; j += 1) {
        z += neuron.weights[j] * previous[j];
      }
      neuron.z = z;
    });

    if (type === "softmax") {
      /* Subtract the max before exponentiating. Mathematically a no-op,
         numerically the difference between working and overflowing. */
      const zs = layer.neurons.map((neuron) => neuron.z);
      const maxZ = Math.max(...zs);
      const exps = zs.map((z) => Math.exp(z - maxZ));
      const sum = exps.reduce((acc, value) => acc + value, 0);
      layer.neurons.forEach((neuron, index) => {
        neuron.a = exps[index] / sum;
      });
    } else {
      const { f } = ACTIVATIONS[type];
      layer.neurons.forEach((neuron) => {
        neuron.a = f(neuron.z);
      });
    }
    return network;
  }

  function forwardAll(network, config) {
    for (let index = 0; index < network.layers.length; index += 1) {
      forwardLayer(network, index, config);
    }
    return network;
  }

  function computeLoss(network, config) {
    const outputs = network.layers[network.layers.length - 1].neurons.map((neuron) => neuron.a);
    network.totalLoss = LOSSES[config.loss].total(outputs, network.target);
    return network.totalLoss;
  }

  /* ── Backward ────────────────────────────────────────────────── */

  /* Two pairings collapse to a plain (a − y): softmax with categorical
     cross-entropy, and sigmoid with binary cross-entropy. In both cases
     the activation derivative exactly cancels the loss derivative. That
     is not a convenience — computing them separately is numerically
     unstable near a = 0 or a = 1. */
  function outputShortcut(activation, loss) {
    return (
      (activation === "softmax" && loss === "cce") || (activation === "sigmoid" && loss === "bce")
    );
  }

  function backpropOutput(network, config) {
    const layerIndex = network.layers.length - 1;
    const layer = network.layers[layerIndex];
    const previous = activationsInto(network, layerIndex);
    const activation = config.layers[layerIndex].activation;
    const lossKey = config.loss;
    const shortcut = outputShortcut(activation, lossKey);
    const { df } = ACTIVATIONS[activation];

    layer.neurons.forEach((neuron, i) => {
      const a = neuron.a;
      const t = network.target[i];

      if (shortcut) {
        neuron.dLoss_dA = LOSSES[lossKey].dA(a, t);
        neuron.dLoss_dZ = a - t;
        neuron.usedShortcut = true;
      } else {
        const dA = LOSSES[lossKey].dA(a, t);
        neuron.dLoss_dA = dA;
        neuron.dLoss_dZ = dA * df(neuron.z);
        neuron.usedShortcut = false;
      }

      neuron.dLoss_dB = neuron.dLoss_dZ;
      neuron.dLoss_dW = previous.map((prevA) => neuron.dLoss_dZ * prevA);
    });
    return network;
  }

  function backpropHidden(network, layerIndex, config) {
    const layer = network.layers[layerIndex];
    const next = network.layers[layerIndex + 1];
    const previous = activationsInto(network, layerIndex);
    const { df } = ACTIVATIONS[config.layers[layerIndex].activation];

    layer.neurons.forEach((neuron, i) => {
      /* Sum the blame arriving from every downstream neuron this one
         feeds. The weight from neuron i to next-layer neuron k lives at
         nextNeuron.weights[i] — the transpose, in index form. */
      let dA = 0;
      next.neurons.forEach((nextNeuron) => {
        dA += nextNeuron.weights[i] * (nextNeuron.dLoss_dZ || 0);
      });

      neuron.dLoss_dA = dA;
      neuron.dLoss_dZ = dA * df(neuron.z);
      neuron.dLoss_dB = neuron.dLoss_dZ;
      neuron.dLoss_dW = previous.map((prevA) => neuron.dLoss_dZ * prevA);
    });
    return network;
  }

  function backpropAll(network, config) {
    backpropOutput(network, config);
    for (let index = network.layers.length - 2; index >= 0; index -= 1) {
      backpropHidden(network, index, config);
    }
    return network;
  }

  function applyUpdate(network, learningRate) {
    network.layers.forEach((layer) => {
      layer.neurons.forEach((neuron) => {
        if (!neuron.dLoss_dW) return;
        neuron.bias -= learningRate * neuron.dLoss_dB;
        neuron.weights = neuron.weights.map((w, i) => w - learningRate * neuron.dLoss_dW[i]);
      });
    });
    network.epoch += 1;
    return network;
  }

  /* One complete cycle, used by "train N epochs". */
  function trainEpoch(network, config) {
    forwardAll(network, config);
    computeLoss(network, config);
    backpropAll(network, config);
    applyUpdate(network, config.learningRate);
    return network;
  }

  function gradientNorm(network, layerIndex) {
    const layer = network.layers[layerIndex];
    let total = 0;
    layer.neurons.forEach((neuron) => {
      (neuron.dLoss_dW || []).forEach((value) => {
        total += value * value;
      });
      total += (neuron.dLoss_dB || 0) ** 2;
    });
    return Math.sqrt(total);
  }

  function clone(network) {
    return JSON.parse(JSON.stringify(network));
  }

  window.NNEngine = {
    ACTIVATIONS,
    LOSSES,
    initializeNetwork,
    forwardLayer,
    forwardAll,
    computeLoss,
    backpropOutput,
    backpropHidden,
    backpropAll,
    applyUpdate,
    trainEpoch,
    gradientNorm,
    outputShortcut,
    activationsInto,
    clone,
  };
})();
