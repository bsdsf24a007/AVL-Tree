import React, { useState, useEffect } from 'react';
import { AVLNode, AnimationStep, HistoryEntry } from './types';
import { generateAVLTree, calculateLayout } from './utils/avl';
import { TreeCanvas } from './components/TreeCanvas';
import { Controls } from './components/Controls';

export default function App() {
  const [root, setRoot] = useState<AVLNode | null>(null);
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [toggles, setToggles] = useState({ h: true, bf: true, comp: true });
  const [compOffset, setCompOffset] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      const timer = setInterval(() => {
        setStepIdx(prev => {
          if (prev < steps.length - 1) return prev + 1;
          setIsPlaying(false); return prev;
        });
      }, speed);
      return () => clearInterval(timer);
    }
  }, [isPlaying, steps, speed]);

  const addOperation = (newRoot: AVLNode | null, newSteps: AnimationStep[], label: string) => {
    setHistory(prev => [...prev, { tree: root, label, stepStartIndex: steps.length }]);
    setSteps(prev => [...prev, ...newSteps]);
    setStepIdx(steps.length);
    setRoot(newRoot);
    setIsPlaying(true);
    setCompOffset(0);
  };

  const onInsert = (v: number) => {
    if (isNaN(v)) return;
    const res = generateAVLTree(root).insert(v);
    addOperation(res.finalTree, res.steps, `Insert ${v}`);
  };

  const onDelete = (v: number) => {
    if (isNaN(v)) return;
    const res = generateAVLTree(root).delete(v);
    addOperation(res.finalTree, res.steps, `Delete ${v}`);
  };

  const onUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRoot(last.tree);
    setSteps(prev => prev.slice(0, last.stepStartIndex));
    setStepIdx(last.stepStartIndex - 1);
    setHistory(prev => prev.slice(0, -1));
    setIsPlaying(false);
  };

  const currStep = steps[stepIdx];
  const displayTree = currStep ? currStep.tree : root;

  // Comparison Logic - Enhanced for better UX
  let leftTree: AVLNode | null = null;
  let leftLabel = "Ready State";
  if (currStep?.comparisonTree && compOffset === 0) {
    leftTree = currStep.comparisonTree;
    leftLabel = "Pre-Rotation Trace";
  } else if (compOffset === 0) {
    leftTree = currStep?.baseTree || null;
    leftLabel = "Initial State";
  } else {
    const hIdx = history.length - compOffset;
    if (hIdx >= 0 && hIdx < history.length) {
      leftTree = calculateLayout(history[hIdx].tree);
      leftLabel = `Snapshot: ${history[hIdx].label}`;
    }
  }

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-900 rounded-full blur-[100px]" />
      </div>

      <Controls 
        onInsert={onInsert} onDelete={onDelete} onReset={() => window.location.reload()} 
        onUndo={onUndo} onStep={d => setStepIdx(p => Math.max(-1, Math.min(steps.length-1, p+d)))}
        onAutoPlay={() => setIsPlaying(!isPlaying)} setSpeed={setSpeed}
        toggles={toggles} setToggles={setToggles} isPlaying={isPlaying} history={history}
        canPrev={stepIdx > -1} canNext={stepIdx < steps.length - 1}
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Cinematic Header / Status Bar */}
        <div className="p-8 pb-4 flex items-end justify-between border-b border-slate-800/30">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500
                ${currStep?.actionType === 'rotate' ? 'bg-amber-500 text-amber-950' : 
                  currStep?.actionType === 'imbalance' ? 'bg-rose-600 text-rose-50' : 
                  'bg-indigo-600/20 text-indigo-400'}`}>
                {currStep?.actionType || 'System Idle'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                Stack Step // 0x{stepIdx + 1}
              </span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              {currStep?.description || 'Initialize sequence to visualize tree transformations.'}
            </h2>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Frame Progress</div>
            <div className="flex gap-1">
              {Array.from({length: Math.min(steps.length, 12)}).map((_, i) => (
                <div key={i} className={`w-3 h-1 rounded-full transition-all duration-300 ${i <= stepIdx % 12 ? 'bg-indigo-500 w-6' : 'bg-slate-800'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Tree Render Zones */}
        <div className="flex-1 flex relative">
          {toggles.comp && (
            <div className="flex-1 border-r border-slate-800/40 relative bg-slate-950/20">
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40">
                <div className="glass px-1 py-1 rounded-2xl flex items-center shadow-2xl">
                  <button 
                    onClick={() => setCompOffset(p => Math.min(history.length, p+1))} 
                    className="w-8 h-8 rounded-xl hover:bg-white/10 text-slate-400 disabled:opacity-10 transition-colors"
                    disabled={compOffset >= history.length}
                  >
                    ←
                  </button>
                  <span className="px-6 text-[10px] font-black text-indigo-400 uppercase tracking-widest min-w-[160px] text-center">
                    {leftLabel}
                  </span>
                  <button 
                    onClick={() => setCompOffset(p => Math.max(0, p-1))} 
                    className="w-8 h-8 rounded-xl hover:bg-white/10 text-slate-400 disabled:opacity-10 transition-colors"
                    disabled={compOffset === 0}
                  >
                    →
                  </button>
                </div>
              </div>
              <TreeCanvas root={leftTree} showHeights={toggles.h} showBalanceFactors={toggles.bf} label="Comparison Analyzer" />
            </div>
          )}
          
          <div className="flex-1 relative">
            <TreeCanvas root={displayTree} highlightNodeId={currStep?.highlightNodeId} showHeights={toggles.h} showBalanceFactors={toggles.bf} label="Live Animation Buffer" />
          </div>
        </div>
      </main>
    </div>
  );
}