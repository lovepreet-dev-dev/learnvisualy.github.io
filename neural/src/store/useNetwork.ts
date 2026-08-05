import { useState, useCallback, useRef } from 'react';
import type {
    NetworkState,
    NetworkConfig,
    ExecutionStep,
    StepType
} from '../engine/types';
import { initializeNetwork } from '../engine/propagate';
import { getNextStep, executeStep } from '../engine/controller';

const DEFAULT_CONFIG: NetworkConfig = {
    inputSize: 2,
    layers: [
        { neurons: 3, activation: 'sigmoid' },
        { neurons: 1, activation: 'sigmoid' }
    ],
    lossFunction: 'mse',
    learningRate: 0.1
};

export const useNetwork = () => {
    const [config, setConfig] = useState<NetworkConfig>(DEFAULT_CONFIG);
    const [network, setNetwork] = useState<NetworkState | null>(null);
    const [inputData, setInputData] = useState<number[]>([0.5, 0.5]);
    const [targetData, setTargetData] = useState<number[]>([1]);

    // Execution State
    const [stepType, setStepType] = useState<StepType>('IDLE');
    const [currentLayer, setCurrentLayer] = useState<number | undefined>(undefined);
    const [lastStepDesc, setLastStepDesc] = useState<ExecutionStep | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(500); // ms

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const reset = useCallback(() => {
        const net = initializeNetwork(config, inputData);
        net.target = targetData;
        setNetwork(net);
        setStepType('IDLE');
        setCurrentLayer(undefined);
        setLastStepDesc(null);
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
    }, [config, inputData, targetData]);

    const step = useCallback(() => {
        if (!network) return;

        const nextTransition = getNextStep(stepType, currentLayer, config);

        // If we finished an epoch (IDLE), and want to continue loop, we can restart?
        // Or if IDLE, start Forward.
        let nextType = nextTransition.type;
        let nextLayer = nextTransition.layer;

        if (nextType === 'IDLE' && stepType === 'UPDATE_WEIGHTS') {
            // Auto-restart for next epoch
            nextType = 'FORWARD_LAYER_START';
            nextLayer = 0;
        } else if (nextType === 'IDLE' && stepType === 'IDLE') {
            nextType = 'FORWARD_LAYER_START';
            nextLayer = 0;
        }

        const result = executeStep(network, config, nextType, nextLayer);

        setNetwork(result.network);
        setStepType(nextType);
        setCurrentLayer(nextLayer);
        setLastStepDesc(result.stepDescription);

    }, [network, config, stepType, currentLayer]);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
        } else {
            setIsPlaying(true);
            timerRef.current = setInterval(() => {
                step();
            }, playbackSpeed);
        }
    }, [isPlaying, step, playbackSpeed]);

    // Ensure timer cleans up if step/network changes while playing
    // (This is tricky with interval closures, better to use a useEffect for the interval)
    // Refactoring to useEffect based interval

    return {
        config,
        setConfig,
        network,
        inputData,
        setInputData,
        targetData,
        setTargetData,
        stepType,
        currentLayer,
        lastStepDesc,
        reset,
        step,
        isPlaying,
        togglePlay,
        setPlaybackSpeed
    };
};
