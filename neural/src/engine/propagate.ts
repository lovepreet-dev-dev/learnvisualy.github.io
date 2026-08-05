import type {
    NetworkState,
    NetworkConfig,
    NeuronState,
    LayerState
} from './types';
import { getActivation, msePrime, bcePrime } from './math';

// Helper to initialize a blank network state
export const initializeNetwork = (config: NetworkConfig, initialInputs: number[]): NetworkState => {
    const layers: LayerState[] = [];

    // Create hidden layers + output layer
    // Note: We don't explicitly store Input Layer as a LayerState to keep indices aligned with weights.
    // Layer 0 in `layers` corresponds to the first Hidden Layer (receiving weights from Input).

    let previousLayerSize = config.inputSize;

    config.layers.forEach((layerConfig, layerIndex) => {
        const neurons: NeuronState[] = [];
        for (let i = 0; i < layerConfig.neurons; i++) {
            // Init Random Weights (Xavier/He initialization ideally, but random -1 to 1 for now)
            const weights = Array(previousLayerSize).fill(0).map(() => (Math.random() * 2 - 1) / Math.sqrt(previousLayerSize));
            const bias = 0; // Start with 0 bias

            neurons.push({
                id: `L${layerIndex}-N${i}`,
                layerIndex,
                neuronIndex: i,
                bias,
                weights,
                z: 0,
                a: 0
            });
        }
        layers.push({ index: layerIndex, neurons });
        previousLayerSize = layerConfig.neurons;
    });

    return {
        layers,
        inputs: initialInputs,
        target: [], // Set later
        epoch: 0
    };
};

/**
 * Performs one full step of Forward Propagation for a specific Layer.
 * Updates the network state in place (or returns new one).
 * For step-by-step, we might want to calculate specific neurons, but usually executing a whole layer at once is fine for "Step" granularity.
 */
export const propagateLayerForward = (
    currentNetwork: NetworkState,
    layerIndex: number,
    config: NetworkConfig
): NetworkState => {
    const newState = structuredClone(currentNetwork);
    const layer = newState.layers[layerIndex];
    const prevActivations = layerIndex === 0
        ? newState.inputs
        : newState.layers[layerIndex - 1].neurons.map(n => n.a);

    const activationType = config.layers[layerIndex].activation;
    const { f } = getActivation(activationType);

    // If softmax, we need Z's first
    if (activationType === 'softmax') {
        // 1. Calculate all Zs
        layer.neurons.forEach(neuron => {
            let z = neuron.bias;
            for (let j = 0; j < neuron.weights.length; j++) {
                z += neuron.weights[j] * prevActivations[j];
            }
            neuron.z = z;
        });

        // 2. Calculate Softmax
        const allZs = layer.neurons.map(n => n.z);
        const maxZ = Math.max(...allZs);
        const exps = allZs.map(z => Math.exp(z - maxZ));
        const sumExps = exps.reduce((a, b) => a + b, 0);

        layer.neurons.forEach((neuron, idx) => {
            neuron.a = exps[idx] / sumExps;
        });

    } else {
        // Standard activation (Sigmoid, ReLU, etc)
        layer.neurons.forEach(neuron => {
            let z = neuron.bias;
            for (let j = 0; j < neuron.weights.length; j++) {
                z += neuron.weights[j] * prevActivations[j];
            }
            neuron.z = z;
            neuron.a = f(z);
        });
    }

    return newState;
};

/**
 * Calculates Loss after full forward pass
 */
export const calculateLoss = (network: NetworkState, target: number[], config: NetworkConfig): NetworkState => {
    const newState = structuredClone(network);
    newState.target = target;
    const outputLayer = newState.layers[newState.layers.length - 1];
    const outputs = outputLayer.neurons.map(n => n.a);

    // Calculate total loss based on config
    if (config.lossFunction === 'mse') {
        // Sum of (0.5 * (y-t)^2)
        let sum = 0;
        outputs.forEach((y, i) => {
            sum += 0.5 * Math.pow(y - target[i], 2);
        });
        newState.totalLoss = sum;
    } else if (config.lossFunction === 'bce') {
        // Binary Cross Entropy (usually for single neuron output, but sum if multiple)
        let sum = 0;
        outputs.forEach((y, i) => {
            const t = target[i];
            const epsilon = 1e-15;
            const clippedY = Math.max(epsilon, Math.min(1 - epsilon, y));
            sum += - (t * Math.log(clippedY) + (1 - t) * Math.log(1 - clippedY));
        });
        newState.totalLoss = sum;
    } else if (config.lossFunction === 'cce') {
        // CCE: - SUM(t * log(y))
        let sum = 0;
        outputs.forEach((y, i) => {
            const epsilon = 1e-15;
            const clippedY = Math.max(epsilon, Math.min(1 - epsilon, y));
            sum += -target[i] * Math.log(clippedY);
        });
        newState.totalLoss = sum;
    }

    return newState;
}

/**
 * Backward Propagation for the Output Layer
 * Calculates dLoss/dZ (delta) directly.
 */
export const backpropOutputLayer = (
    network: NetworkState,
    target: number[],
    config: NetworkConfig
): NetworkState => {
    const newState = structuredClone(network);
    const lastLayerIdx = newState.layers.length - 1;
    const layer = newState.layers[lastLayerIdx];
    const prevActivations = lastLayerIdx === 0
        ? newState.inputs
        : newState.layers[lastLayerIdx - 1].neurons.map(n => n.a);

    const { activation } = config.layers[lastLayerIdx];
    const { df } = getActivation(activation);

    layer.neurons.forEach((neuron, i) => {
        const y = neuron.a;
        const t = target[i];

        let dLoss_dZ = 0;

        // Special Case: Softmax + CCE => dL/dZ = y - t
        if (activation === 'softmax' && config.lossFunction === 'cce') {
            dLoss_dZ = y - t;
            // For visualization we store dLoss/dA but it's complex for Softmax, 
            // often we just show delta (dZ). 
            // dL/dA_i = -t_i/y_i (for the target class)
            neuron.dLoss_dA = -t / y;
        }
        // Special Case: Sigmoid + BCE => dL/dZ = y - t
        else if (activation === 'sigmoid' && config.lossFunction === 'bce') {
            dLoss_dZ = y - t;
            neuron.dLoss_dA = -(t / y) + (1 - t) / (1 - y);
        }
        else if (config.lossFunction === 'mse') {
            const dLoss_dA = msePrime(y, t); // (y - t)
            const dA_dZ = df(neuron.z);
            dLoss_dZ = dLoss_dA * dA_dZ;
            neuron.dLoss_dA = dLoss_dA;
        } else {
            // Default generic Chain Rule
            // This might be numerically unstable for BCE/CCE if not handled by special cases above
            let dLoss_dA = 0;
            if (config.lossFunction === 'bce') dLoss_dA = bcePrime(y, t);
            // ... CCE deriv is vector based, simple scalar fallback here is tricky. 
            // Ideally we force Softmax+CCE pair.

            const dA_dZ = df(neuron.z);
            dLoss_dZ = dLoss_dA * dA_dZ;
            neuron.dLoss_dA = dLoss_dA;
        }

        neuron.dLoss_dZ = dLoss_dZ;

        // Gradients for Weights and Bias
        neuron.dLoss_dB = dLoss_dZ; // * 1
        neuron.dLoss_dW = prevActivations.map(prevA => dLoss_dZ * prevA);
    });

    return newState;
}

/**
 * Backward Propagation for Hidden Layers
 */
export const backpropHiddenLayer = (
    network: NetworkState,
    layerIndex: number,
    config: NetworkConfig
): NetworkState => {
    const newState = structuredClone(network);
    const layer = newState.layers[layerIndex];
    const nextLayer = newState.layers[layerIndex + 1];
    const prevActivations = layerIndex === 0
        ? newState.inputs
        : newState.layers[layerIndex - 1].neurons.map(n => n.a);

    const { activation } = config.layers[layerIndex];
    const { df } = getActivation(activation);

    layer.neurons.forEach((neuron, i) => {
        // dLoss/dA_i = SUM( dLoss/dZ_k * W_ki ) where k is next layer neurons
        let dLoss_dA = 0;
        nextLayer.neurons.forEach(nextNeuron => {
            // weight connecting THIS neuron (i) to NEXT neuron (k) is nextNeuron.weights[i]
            const w_ki = nextNeuron.weights[i];
            const delta_k = nextNeuron.dLoss_dZ || 0;
            dLoss_dA += w_ki * delta_k;
        });

        const dA_dZ = df(neuron.z);
        const dLoss_dZ = dLoss_dA * dA_dZ;

        neuron.dLoss_dA = dLoss_dA;
        neuron.dLoss_dZ = dLoss_dZ;
        neuron.dLoss_dB = dLoss_dZ;
        neuron.dLoss_dW = prevActivations.map(a => dLoss_dZ * a);
    });

    return newState;
}

export const updateWeights = (network: NetworkState, learningRate: number): NetworkState => {
    const newState = structuredClone(network);

    newState.layers.forEach(layer => {
        layer.neurons.forEach(neuron => {
            if (neuron.dLoss_dW && neuron.dLoss_dB !== undefined) {
                neuron.bias = neuron.bias - learningRate * neuron.dLoss_dB;
                neuron.weights = neuron.weights.map((w, i) => w - learningRate * neuron.dLoss_dW![i]);
            }
        });
    });

    newState.epoch += 1;
    return newState;
}
