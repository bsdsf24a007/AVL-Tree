
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // Define helpers for step controls to be accessible in both Desktop Controls and Mobile Control Bar
  const onStep = (d: number) => setStepIdx(p => Math.max(-1, Math.min(steps.length - 1, p + d)));
  const canPrev = stepIdx > -1;
  const canNext = stepIdx < steps.length - 1;

  const currStep = steps[stepIdx];
  const displayTree = currStep ? currStep.tree : root;

  let leftTree: AVLNode | null = null;
  let leftLabel = "Ready";
  if (currStep?.comparisonTree && compOffset === 0) {
    leftTree = currStep.comparisonTree;
    leftLabel = "Pre-Rotation";
  } else if (compOffset === 0) {
    leftTree = currStep?.baseTree || null;
    leftLabel = "Initial State";
  } else {
    const hIdx = history.length - compOffset;
    if (hIdx >= 0 && hIdx < history.length) {
      leftTree = calculateLayout(history[hIdx].tree);
      leftLabel = `${history[hIdx].label}`;
    }
  }

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 overflow-hidden font-sans selection:bg-indigo-500/30">
      <Controls 
        onInsert={onInsert} onDelete={onDelete} onReset={() => window.location.reload()} 
        onUndo={onUndo} onStep={onStep}
        onAutoPlay={() => setIsPlaying(!isPlaying)} setSpeed={setSpeed}
        toggles={toggles} setToggles={setToggles} isPlaying={isPlaying} history={history}
        canPrev={canPrev} canNext={canNext}
        isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col relative overflow-hidden z-10">
        {/* Top Header / Status Bar */}
        <header className="px-6 py-5 md:px-8 md:py-8 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800/40 glass-panel lg:border-none lg:bg-transparent">
          <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl text-indigo-500">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.2em] shadow-lg
                  ${currStep?.actionType === 'rotate' ? 'bg-amber-500 text-amber-950' : 
                    currStep?.actionType === 'imbalance' ? 'bg-rose-600 text-rose-50' : 
                    'bg-indigo-600 text-indigo-50'}`}>
                  {currStep?.actionType || 'IDLE'}
                </span>
                <span className="text-[9px] font-mono text-slate-600 font-bold uppercase tracking-widest">
                  FRAME_SEQ // 0x{stepIdx + 1}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight leading-tight truncate max-w-[280px] md:max-w-md">
                {currStep?.description || 'Awaiting Sequence Input...'}
              </h2>
            </div>
          </div>
          
          <div className="hidden md:flex flex-col items-end">
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Temporal Buffer</div>
            <div className="flex gap-1.5">
              {Array.from({length: Math.min(steps.length, 12)}).map((_, i) => (
                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= stepIdx % 12 ? 'bg-indigo-500 w-6 shadow-[0_0_10px_rgba(99,102,241,0.6)]' : 'bg-slate-800 w-3'}`} />
              ))}
            </div>
          </div>
        </header>

        {/* Dynamic Tree Zones */}
        <div className="flex-1 flex flex-col md:flex-row relative">
          {toggles.comp && (
            <div className="flex-1 border-b md:border-b-0 md:border-r border-slate-800/40 relative bg-slate-950/30">
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40">
                <div className="glass-panel px-1 py-1 rounded-2xl flex items-center shadow-2xl border-white/5">
                  <button 
                    onClick={() => setCompOffset(p => Math.min(history.length, p+1))} 
                    className="w-8 h-8 rounded-xl hover:bg-white/10 text-slate-500 disabled:opacity-10"
                    disabled={compOffset >= history.length}
                  >←</button>
                  <span className="px-5 text-[9px] font-black text-indigo-400 uppercase tracking-widest min-w-[120px] text-center">
                    {leftLabel}
                  </span>
                  <button 
                    onClick={() => setCompOffset(p => Math.max(0, p-1))} 
                    className="w-8 h-8 rounded-xl hover:bg-white/10 text-slate-500 disabled:opacity-10"
                    disabled={compOffset === 0}
                  >→</button>
                </div>
              </div>
              <TreeCanvas root={leftTree} showHeights={toggles.h} showBalanceFactors={toggles.bf} label="Comparison Buffer" />
            </div>
          )}
          
          <div className="flex-1 relative">
            <TreeCanvas root={displayTree} highlightNodeId={currStep?.highlightNodeId} showHeights={toggles.h} showBalanceFactors={toggles.bf} label="Execution Trace" />
          </div>
        </div>

        {/* Mobile Control Bar */}
        <div className="md:hidden p-4 glass-panel border-t border-white/5 flex items-center justify-between">
            <button onClick={() => onStep(-1)} disabled={!canPrev} className="p-3 bg-slate-900 rounded-xl text-slate-500 disabled:opacity-20">←</button>
            <button onClick={() => setIsPlaying(!isPlaying)} className={`flex-1 mx-4 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase ${isPlaying ? 'bg-amber-600' : 'bg-indigo-600'}`}>
              {isPlaying ? 'Pause Sequence' : 'Resume Sequence'}
            </button>
            <button onClick={() => onStep(1)} disabled={!canNext} className="p-3 bg-slate-900 rounded-xl text-slate-500 disabled:opacity-20">→</button>
        </div>
      </main>
    </div>
  );
}
