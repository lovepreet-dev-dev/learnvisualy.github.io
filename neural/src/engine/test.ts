import {
    initializeNetwork,
} from './propagate';
import {
    getNextStep,
    executeStep
} from './controller';
import type { NetworkConfig } from './types';

// Configuration: 3 Inputs -> Hidden (4, Sigmoid) -> Hidden (4, ReLU) -> Output (2, Softmax)
const config: NetworkConfig = {
    inputSize: 3,
    layers: [
        { neurons: 4, activation: 'sigmoid' },
        { neurons: 4, activation: 'relu' },
        { neurons: 2, activation: 'softmax' }
    ],
    lossFunction: 'cce',
    learningRate: 0.1
};

// Test Data
const inputs = [0.5, -0.2, 0.1];
const target = [1, 0]; // Class 0 is target

console.log("--- Initializing Network ---");
let network = initializeNetwork(config, inputs);
network.target = target;

console.log(`Layers: ${network.layers.length}`);
console.log(`L0 Weights: ${network.layers[0].neurons[0].weights.length} (Expected 3)`);

// Simulation Loop
let stepType: any = 'IDLE'; // Cast to any or StepType to avoid TS error
let layer = undefined;
let steps = 0;

console.log("\n--- Starting Execution Loop ---");

// Run 1 Full Epoch (Forward + Backward + Update)
while (true) {
    const next = getNextStep(stepType, layer, config);
    // console.log(`Transition: ${stepType} -> ${next.type} (Layer: ${next.layer})`);

    if (next.type === 'IDLE' && steps > 0) break; // Done

    stepType = next.type;
    layer = next.layer;

    const result = executeStep(network, config, stepType, layer);
    network = result.network;

    if (result.stepDescription.description) {
        console.log(`[Step] ${result.stepDescription.description}`);
    }

    if (stepType === 'CALC_LOSS') {
        console.log(`LOSS: ${network.totalLoss}`);
    }

    steps++;
    if (steps > 50) {
        console.log("Hit safety limit!");
        break;
    }
}

console.log("\n--- Verification Complete ---");
// Check if weights changed
const sampleWeight = network.layers[0].neurons[0].weights[0];
console.log(`Sample Weight after update: ${sampleWeight}`);
