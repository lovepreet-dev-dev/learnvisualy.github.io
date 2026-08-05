import React from 'react';
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react';

interface PlayerControlsProps {
    isPlaying: boolean;
    onTogglePlay: () => void;
    onStep: () => void;
    onReset: () => void;
    currentEpoch: number;
    stepDescription: string;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
    isPlaying,
    onTogglePlay,
    onStep,
    onReset,
    currentEpoch,
    stepDescription
}) => {
    return (
        <div className="flex flex-col gap-4 bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={onReset}
                        className="p-2 rounded hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Reset Network"
                    >
                        <RotateCcw size={20} />
                    </button>

                    <button
                        onClick={onTogglePlay}
                        className="p-2 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>

                    <button
                        onClick={onStep}
                        disabled={isPlaying}
                        className="p-2 rounded hover:bg-slate-700 text-slate-300 disabled:opacity-50 transition-colors"
                        title="Step Forward"
                    >
                        <SkipForward size={20} />
                    </button>
                </div>

                <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Epoch</div>
                    <div className="text-xl font-mono text-blue-400">{currentEpoch}</div>
                </div>
            </div>

            <div className="bg-slate-950 p-3 rounded border border-slate-800 font-mono text-sm text-green-400 min-h-[3rem] flex items-center">
                {stepDescription || "Ready to start..."}
            </div>
        </div>
    );
};
