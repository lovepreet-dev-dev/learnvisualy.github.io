import { useEffect } from 'react';
import { useNetwork } from './store/useNetwork';
import { NetworkGraph } from './components/viz/NetworkGraph';
import { PlayerControls } from './components/controls/PlayerControls';
import { FormulaDisplay } from './components/math/FormulaDisplay';

function App() {
  const {
    network,
    reset,
    step,
    isPlaying,
    togglePlay,
    lastStepDesc,
    stepType
  } = useNetwork();

  // Initialize on mount
  useEffect(() => {
    reset();
  }, []); // eslint-disable-line

  const getFormulaForStep = (type: string): string => {
    switch (type) {
      case 'FORWARD_LAYER_START': return 'a^{[l]} = \\sigma(W^{[l]} a^{[l-1]} + b^{[l]})';
      case 'CALC_LOSS': return 'L = \\frac{1}{2}\\sum (y - t)^2'; // Generic MSE show for now
      case 'BACKWARD_GRADIENT': return '\\delta^{[l]} = (W^{[l+1]})^T \\delta^{[l+1]} \\circ \\sigma\'(z^{[l]})';
      case 'UPDATE_WEIGHTS': return 'W \\leftarrow W - \\alpha \\frac{\\partial L}{\\partial W}';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col gap-6">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Neural Network Visualizer
        </h1>
        <p className="text-slate-400">Interactive Forward & Backward Propagation</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Visualization Area */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <NetworkGraph network={network} height={500} />

          <PlayerControls
            isPlaying={isPlaying}
            onTogglePlay={togglePlay}
            onStep={step}
            onReset={reset}
            currentEpoch={network?.epoch || 0}
            stepDescription={lastStepDesc?.description || ''}
          />
        </div>

        {/* Sidebar / Info */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-100 mb-4">Math & Logic</h2>
            <div className="bg-slate-800 p-4 rounded min-h-[100px] flex items-center justify-center border border-slate-700">
              {stepType !== 'IDLE' ? (
                <FormulaDisplay tex={getFormulaForStep(stepType)} />
              ) : (
                <span className="text-slate-500 italic">Ready</span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-slate-300 font-medium">Network Stats</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-950 p-3 rounded">
                <div className="text-slate-500">Total Loss</div>
                <div className="text-emerald-400 font-mono text-lg">
                  {network?.totalLoss?.toFixed(6) ?? '---'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="p-4 bg-blue-950/30 border border-blue-900/50 rounded text-sm text-blue-200">
              <p>
                <strong>Current Step:</strong> {lastStepDesc?.type || 'Idle'}
              </p>
              <p className="mt-2 text-blue-300/80">
                {lastStepDesc?.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
