import type { ActivationFunction } from './types';

// --- Activations & Derivatives ---

export const sigmoid = (z: number): number => 1 / (1 + Math.exp(-z));
export const sigmoidPrime = (z: number): number => {
    const s = sigmoid(z);
    return s * (1 - s);
};

export const relu = (z: number): number => Math.max(0, z);
export const reluPrime = (z: number): number => (z > 0 ? 1 : 0);

export const tanh = (z: number): number => Math.tanh(z);
export const tanhPrime = (z: number): number => {
    const t = Math.tanh(z);
    return 1 - t * t;
};

export const linear = (z: number): number => z;
export const linearPrime = (_z: number): number => 1;

// Softmax is typically applied to a vector, not scalar z. 
// But for our per-neuron loop, we might need to handle it carefully.
// Standard implementation for vector:
export const softmaxIndex = (zVector: number[], index: number): number => {
    const maxZ = Math.max(...zVector); // Stability shift
    const exps = zVector.map(z => Math.exp(z - maxZ));
    const sumExps = exps.reduce((a, b) => a + b, 0);
    return exps[index] / sumExps;
};

// --- Loss Functions & Derivatives ---

// MSE: L = 0.5 * (y - t)^2  (The 0.5 makes derivative cleaner: y - t)
// Note: Some use (y-t)^2, then deriv is 2(y-t). We'll stick to 0.5*(y-t)^2
export const mse = (y: number, t: number): number => 0.5 * Math.pow(y - t, 2);
export const msePrime = (y: number, t: number): number => (y - t);

// Binary Cross Entropy: L = -[t*log(y) + (1-t)*log(1-y)]
export const bce = (y: number, t: number): number => {
    const epsilon = 1e-15;
    const clippedY = Math.max(epsilon, Math.min(1 - epsilon, y));
    return - (t * Math.log(clippedY) + (1 - t) * Math.log(1 - clippedY));
};
export const bcePrime = (y: number, t: number): number => {
    const epsilon = 1e-15;
    const clippedY = Math.max(epsilon, Math.min(1 - epsilon, y));
    return -(t / clippedY) + ((1 - t) / (1 - clippedY));
    // Simplifies to (y - t) / (y * (1 - y))
};

// Categorical Cross Entropy: L = -Σ t_i * log(y_i)
// For a single output index (assuming one-hot target):
export const cce = (y: number, t: number): number => {
    const epsilon = 1e-15;
    const clippedY = Math.max(epsilon, Math.min(1 - epsilon, y));
    return -t * Math.log(clippedY);
}
// Note: CCE derivative depends on activation. 
// If Softmax + CCE, the gradient wrt z_i is simply (y_i - t_i).

// Factory
export const getActivation = (type: ActivationFunction) => {
    switch (type) {
        case 'sigmoid': return { f: sigmoid, df: sigmoidPrime };
        case 'relu': return { f: relu, df: reluPrime };
        case 'tanh': return { f: tanh, df: tanhPrime };
        case 'linear': return { f: linear, df: linearPrime };
        case 'softmax': return { f: linear, df: linearPrime }; // Special handling needed
        default: return { f: linear, df: linearPrime };
    }
};
