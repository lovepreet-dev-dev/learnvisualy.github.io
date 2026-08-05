export type ActivationFunction = 'sigmoid' | 'relu' | 'tanh' | 'linear' | 'softmax';
export type LossFunction = 'mse' | 'bce' | 'cce'; // Mean Squared Error, Binary/Categorical Cross Entropy

export interface NetworkConfig {
    inputSize: number;
    layers: {
        neurons: number;
        activation: ActivationFunction;
    }[]; // Hidden layers + Output layer
    lossFunction: LossFunction;
    learningRate: number;
}

export interface NeuronState {
    id: string; // e.g., "L1-N0"
    layerIndex: number;
    neuronIndex: number;

    // Forward pass
    bias: number;
    weights: number[]; // Weights from previous layer [0..prevSize-1]
    z: number;         // Pre-activation sum: Σ(w*x) + b
    a: number;         // Activation: f(z)

    // Backward pass gradients
    dLoss_dA?: number; // ∂L/∂a
    dLoss_dZ?: number; // ∂L/∂z (Error term δ)
    dLoss_dW?: number[]; // ∂L/∂w
    dLoss_dB?: number;   // ∂L/∂b
}

export interface LayerState {
    index: number;
    neurons: NeuronState[];
}

export interface NetworkState {
    layers: LayerState[]; // Does NOT include input layer usually, but we need inputs stored somewhere.
    inputs: number[];    // Store the inputs for the current pass
    target: number[];    // Target output for loss calc
    totalLoss?: number;
    epoch: number;
}

export type StepType =
    | 'IDLE'
    | 'FORWARD_LAYER_START'
    // | 'FORWARD_NEURON_CALC' // Granular step if we want to show per-neuron calc
    | 'FORWARD_LAYER_COMPLETE'
    | 'CALC_LOSS'
    | 'BACKWARD_GRADIENT_START' // Backprop starting for a layer
    | 'BACKWARD_LAYER_COMPLETE'
    | 'UPDATE_WEIGHTS';

export interface ExecutionStep {
    type: StepType;
    layerIndex?: number; // Active layer
    neuronIndex?: number; // Active neuron (if granular)
    description: string;
    formula?: string; // LaTeX to display
    values?: Record<string, number | string>; // Variables to substitute in formula
}
