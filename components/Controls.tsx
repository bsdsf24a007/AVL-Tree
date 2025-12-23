import React, { useState } from 'react';
import { HistoryEntry } from '../types';

interface ControlsProps {
  onInsert: (val: number) => void;
  onDelete: (val: number) => void;
  onReset: () => void;
  onUndoOp: () => void;
  onAutoPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  setSpeed: (val: number) => void;
  toggleHeights: () => void;
  toggleBF: () => void;
  toggleBaseTree: () => void;
  onPreset: (values: number[]) => void;
  isPlaying: boolean;
  speed: number;
  showHeights: boolean;
  showBF: boolean;
  showBaseTree: boolean;
  canUndoStep: boolean;
  canRedoStep: boolean;
  history: HistoryEntry[];
}

export const Controls: React.FC<ControlsProps> = ({
  onInsert,
  onDelete,
  onReset,
  onUndoOp,
  onAutoPlay,
  onPause,
  onStepForward,
  onStepBackward,
  setSpeed,
  toggleHeights,
  toggleBF,
  toggleBaseTree,
  onPreset,
  isPlaying,
  speed,
  showHeights,
  showBF,
  showBaseTree,
  canUndoStep,
  canRedoStep,
  history
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleInsert = () => {
    const val = parseInt(inputValue);
    if (!isNaN(val)) {
      onInsert(val);
      setInputValue('');
    }
  };

  const handleDelete = () => {
    const val = parseInt(inputValue);
    if (!isNaN(val)) {
      onDelete(val);
      setInputValue('');
    }
  };

  // Educational Presets
  const presets = [
    { name: "LL Case", seq: [30, 20, 10], desc: "Triggers Right Rotation" },
    { name: "RR Case", seq: [10, 20, 30], desc: "Triggers Left Rotation" },
    { name: "LR Case", seq: [30, 10, 20], desc: "Left then Right Rotation" },
    { name: "RL Case", seq: [10, 30, 20], desc: "Right then Left Rotation" },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 w-full md:w-80 shadow-2xl z-20 overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-900 shrink-0">
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
          AVL Visualizer
        </h1>
        <p className="text-xs text-slate-400 mt-1">Interactive Learning Simulator</p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">
        
        {/* Operations */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Operations</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Value"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-sky-500 outline-none text-white placeholder-slate-500 transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleInsert}
              disabled={isPlaying || !inputValue}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>+ Insert</span>
            </button>
            <button 
              onClick={handleDelete}
              disabled={isPlaying || !inputValue}
              className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-rose-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>- Delete</span>
            </button>
          </div>
          <button 
             onClick={onUndoOp}
             disabled={isPlaying || history.length === 0}
             className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
             Undo Last Op
          </button>
        </div>

        {/* Playback */}
        <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Animation Control</label>
            
            <div className="bg-slate-800 p-2 rounded-xl flex items-center justify-between border border-slate-700">
                <button onClick={onStepBackward} disabled={!canUndoStep || isPlaying} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors disabled:opacity-30">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                
                {!isPlaying ? (
                    <button onClick={onAutoPlay} disabled={!canRedoStep} className="w-10 h-10 flex items-center justify-center bg-sky-500 hover:bg-sky-400 text-white rounded-full shadow-lg shadow-sky-500/30 transition-all disabled:opacity-50 disabled:bg-slate-600">
                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                ) : (
                    <button onClick={onPause} className="w-10 h-10 flex items-center justify-center bg-amber-500 hover:bg-amber-400 text-white rounded-full shadow-lg shadow-amber-500/30 transition-all">
                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </button>
                )}

                <button onClick={onStepForward} disabled={!canRedoStep || isPlaying} className="p-2 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors disabled:opacity-30">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>

            <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                    <span>Slow</span>
                    <span>Fast</span>
                </div>
                <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
            </div>
        </div>

        {/* History Log */}
        {history.length > 0 && (
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Operation Log</label>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
                    {history.map((entry, idx) => (
                        <div key={idx} className="text-xs text-slate-400 px-2 py-1 bg-slate-800/50 rounded border border-slate-700/50 flex justify-between">
                            <span>{idx + 1}. {entry.label}</span>
                        </div>
                    ))}
                    <div className="text-xs text-sky-400 px-2 py-1 bg-sky-900/20 rounded border border-sky-500/30 font-medium animate-pulse">
                        Current...
                    </div>
                </div>
            </div>
        )}

        {/* Learn / Presets */}
        <div className="flex flex-col gap-3">
             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Learn Scenarios</label>
             <div className="grid grid-cols-1 gap-2">
                {presets.map((preset) => (
                    <button 
                        key={preset.name}
                        onClick={() => onPreset(preset.seq)}
                        disabled={isPlaying}
                        className="text-left px-4 py-3 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 rounded-lg transition-all group disabled:opacity-50"
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-sm text-sky-400 group-hover:text-sky-300">{preset.name}</span>
                            <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">{preset.seq.join(', ')}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{preset.desc}</p>
                    </button>
                ))}
             </div>
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Visualization</label>
            <div className="flex flex-col gap-2">
                 <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${showBaseTree ? 'bg-amber-500 border-amber-500' : 'border-slate-600'}`}>
                        {showBaseTree && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                    <input type="checkbox" checked={showBaseTree} onChange={toggleBaseTree} className="hidden" />
                    <div className="flex flex-col">
                        <span className="text-sm text-slate-200 font-medium">Compare Mode</span>
                        <span className="text-[10px] text-slate-400">Side-by-side view</span>
                    </div>
                 </label>

                 <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${showHeights ? 'bg-sky-500 border-sky-500' : 'border-slate-600'}`}>
                        {showHeights && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                    <input type="checkbox" checked={showHeights} onChange={toggleHeights} className="hidden" />
                    <span className="text-sm text-slate-300">Show Node Heights</span>
                 </label>
                 
                 <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors">
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${showBF ? 'bg-sky-500 border-sky-500' : 'border-slate-600'}`}>
                        {showBF && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                    </div>
                    <input type="checkbox" checked={showBF} onChange={toggleBF} className="hidden" />
                    <span className="text-sm text-slate-300">Show Balance Factors</span>
                 </label>
            </div>
        </div>

        <div className="mt-auto pt-6">
            <button 
                onClick={onReset}
                className="w-full border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 py-3 rounded-lg text-sm transition-all"
            >
                Reset Canvas
            </button>
        </div>

      </div>
    </div>
  );
};