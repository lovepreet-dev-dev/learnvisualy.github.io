import type {
    NetworkState,
    NetworkConfig,
    ExecutionStep,
    StepType
} from './types';
import {
    propagateLayerForward,
    calculateLoss,
    backpropOutputLayer,
    backpropHiddenLayer,
    updateWeights
} from './propagate';

// Helper to determine next step
export const getNextStep = (
    currentStep: StepType,
    currentLayer: number | undefined,
    config: NetworkConfig
): { type: StepType, layer?: number } => {

    // 1. Forward Phase
    if (currentStep === 'IDLE' || currentStep === 'UPDATE_WEIGHTS') {
        return { type: 'FORWARD_LAYER_START', layer: 0 };
    }

    if (currentStep === 'FORWARD_LAYER_START') {
        return { type: 'FORWARD_LAYER_COMPLETE', layer: currentLayer };
    }

    if (currentStep === 'FORWARD_LAYER_COMPLETE') {
        const nextLayer = (currentLayer ?? 0) + 1;
        if (nextLayer < config.layers.length) {
            return { type: 'FORWARD_LAYER_START', layer: nextLayer };
        } else {
            return { type: 'CALC_LOSS' };
        }
    }

    // 2. Loss Calculated -> Start Backprop
    if (currentStep === 'CALC_LOSS') {
        return { type: 'BACKWARD_GRADIENT_START', layer: config.layers.length - 1 };
    }

    // 3. Backward Phase
    if (currentStep === 'BACKWARD_GRADIENT_START') {
        return { type: 'BACKWARD_LAYER_COMPLETE', layer: currentLayer };
    }

    if (currentStep === 'BACKWARD_LAYER_COMPLETE') {
        const prevLayer = (currentLayer ?? 0) - 1;
        if (prevLayer >= 0) {
            return { type: 'BACKWARD_GRADIENT_START', layer: prevLayer };
        } else {
            return { type: 'UPDATE_WEIGHTS' };
        }
    }

    return { type: 'IDLE' };
};

export const executeStep = (
    network: NetworkState,
    config: NetworkConfig,
    currentStep: StepType,
    currentLayer?: number
): { network: NetworkState, stepDescription: ExecutionStep } => {

    let nextNetwork = network;
    let description: ExecutionStep = {
        type: currentStep,
        layerIndex: currentLayer,
        description: ''
    };

    switch (currentStep) {
        case 'FORWARD_LAYER_START':
            description.description = `Preparing to calculate Layer ${currentLayer} (Activations)`;
            break;

        case 'FORWARD_LAYER_COMPLETE':
            if (currentLayer !== undefined) {
                nextNetwork = propagateLayerForward(network, currentLayer, config);
                description.description = `Computed activation (a) for Layer ${currentLayer}`;
            }
            break;

        case 'CALC_LOSS':
            // Assume target is already set in network or accessible. 
            // Ideally should be passed in, but for now using network.target
            if (network.target.length > 0) {
                nextNetwork = calculateLoss(network, network.target, config);
                description.description = `Calculated Total Loss: ${nextNetwork.totalLoss?.toFixed(4)}`;
            }
            break;

        case 'BACKWARD_GRADIENT_START':
            description.description = `Preparing to calculate gradients for Layer ${currentLayer}`;
            break;

        case 'BACKWARD_LAYER_COMPLETE':
            if (currentLayer !== undefined) {
                const isOutput = currentLayer === config.layers.length - 1;
                if (isOutput) {
                    nextNetwork = backpropOutputLayer(network, network.target, config);
                    description.description = `Computed Gradients (δ) for Output Layer ${currentLayer}`;
                } else {
                    nextNetwork = backpropHiddenLayer(network, currentLayer, config);
                    description.description = `Computed Gradients (δ) for Hidden Layer ${currentLayer}`;
                }
            }
            break;

        case 'UPDATE_WEIGHTS':
            nextNetwork = updateWeights(network, config.learningRate);
            description.description = `Updated all weights and biases (LR: ${config.learningRate})`;
            break;
    }

    return { network: nextNetwork, stepDescription: description };
};
