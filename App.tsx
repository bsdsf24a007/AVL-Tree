import React, { useState, useEffect } from 'react';
import { AVLNode, AnimationStep, HistoryEntry } from './types';
import { generateAVLTree } from './utils/avl';
import { TreeCanvas } from './components/TreeCanvas';
import { Controls } from './components/Controls';

export default function App() {
  const [root, setRoot] = useState<AVLNode | null>(null);
  
  // Animation state
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1000);
  
  // History State for Undo and Comparison
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  
  // Display toggles
  const [showHeights, setShowHeights] = useState<boolean>(true);
  const [showBF, setShowBF] = useState<boolean>(true);
  const [alwaysShowComparison, setAlwaysShowComparison] = useState<boolean>(false);
  
  // Comparison Navigation (0 = Default/Current Base, 1 = Previous Op, 2 = Op before that...)
  const [comparisonOffset, setComparisonOffset] = useState<number>(0);

  // Playback Loop
  useEffect(() => {
    let timer: number;
    if (isPlaying) {
      timer = window.setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length, playbackSpeed]);

  // Actions
  const handleOperation = (newRoot: AVLNode | null, newSteps: AnimationStep[], label: string) => {
    // 1. Record current state to history before applying new steps
    setHistory(prev => [
        ...prev, 
        { 
            tree: root, // The tree before this op
            label: label, 
            stepIndex: currentStepIndex // Where this op started in the big step list
        }
    ]);

    // 2. Append new steps
    setSteps(prev => [...prev, ...newSteps]);
    
    // 3. Update Root Logic (visualizer uses steps, but we need logical root for next calc)
    setRoot(newRoot);
    
    // 4. Start playing
    setCurrentStepIndex(prev => prev + 1);
    setIsPlaying(true);
    setComparisonOffset(0); // Reset comparison to default
  };

  const handleInsert = (value: number) => {
    // Determine starting tree: if we are mid-animation or at end, use the logical root 
    // actually, for stability, we should always calculate next move from the current logical root
    // which corresponds to the final state of the previous operation.
    const simulator = generateAVLTree(root);
    const result = simulator.insert(value);
    handleOperation(result.finalTree, result.steps, `Insert ${value}`);
  };

  const handleDelete = (value: number) => {
    const simulator = generateAVLTree(root);
    const result = simulator.delete(value);
    handleOperation(result.finalTree, result.steps, `Delete ${value}`);
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    // Pop the last history entry
    const lastEntry = history[history.length - 1];
    
    // Revert State
    setRoot(lastEntry.tree);
    setHistory(prev => prev.slice(0, -1));
    
    // Truncate steps
    // The history entry stored the stepIndex at the *start* of the operation?
    // Let's check logic:
    // When op starts, we push (currentRoot, label, currentStepIndex)
    // So to undo, we revert steps to that index.
    setSteps(prev => prev.slice(0, lastEntry.stepIndex + 1));
    setCurrentStepIndex(lastEntry.stepIndex);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setRoot(null);
    setSteps([]);
    setHistory([]);
    setCurrentStepIndex(-1);
    setIsPlaying(false);
    setComparisonOffset(0);
  };

  const handlePreset = (values: number[]) => {
    handleReset();
    
    // Rebuild the sequence, but we can't do it async via setState.
    // We must simulate locally.
    let currentRoot: AVLNode | null = null;
    let allSteps: AnimationStep[] = [];
    let localHistory: HistoryEntry[] = [];
    let stepCountAccumulator = -1;

    values.forEach(val => {
        // Record history for this virtual step
        localHistory.push({
            tree: currentRoot,
            label: `Insert ${val}`,
            stepIndex: stepCountAccumulator
        });

        const sim = generateAVLTree(currentRoot);
        const res = sim.insert(val);
        
        allSteps = [...allSteps, ...res.steps];
        stepCountAccumulator += res.steps.length;
        currentRoot = res.finalTree;
    });

    setSteps(allSteps);
    setHistory(localHistory);
    setRoot(currentRoot);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    setComparisonOffset(0);
  };

  // Derived state for render
  const currentStep = steps[currentStepIndex];
  const displayTree = currentStep ? currentStep.tree : root;
  const description = currentStep ? currentStep.description : "Ready. Select a scenario or insert a number.";
  const highlightId = currentStep ? currentStep.highlightNodeId : null;

  // determine styling for the explanation box based on action
  let explanationStyle = "bg-white border-slate-200 text-slate-600";
  if (currentStep) {
      if (currentStep.actionType === 'imbalance') explanationStyle = "bg-rose-50 border-rose-200 text-rose-800";
      else if (currentStep.actionType === 'rotate') explanationStyle = "bg-amber-50 border-amber-200 text-amber-800";
      else if (currentStep.actionType === 'check') explanationStyle = "bg-indigo-50 border-indigo-200 text-indigo-800";
      else if (currentStep.actionType === 'insert') explanationStyle = "bg-emerald-50 border-emerald-200 text-emerald-800";
  }

  // LOGIC FOR COMPARISON PANEL
  // 1. Rotation Context: If a rotation is happening, strictly show the PRE-ROTATION tree (passed in step).
  // 2. User Override: If user is browsing history (offset > 0), show that.
  // 3. Default Base: Show start of current operation.
  
  let leftPanelTree: AVLNode | null = null;
  let leftPanelLabel = "";
  let showSplit = false;
  
  // Is this step a rotation step that has a specific comparison tree?
  const isRotationContext = currentStep?.comparisonTree;

  if (alwaysShowComparison) {
      showSplit = true;
      
      if (isRotationContext && comparisonOffset === 0) {
          // Priority: Rotation Context (unless user explicitly navigated away)
          leftPanelTree = currentStep.comparisonTree!;
          leftPanelLabel = "Immediate Pre-Rotation State";
      } else {
          // Time Travel Logic
          // History Stack: [Init, Op1, Op2, Op3]
          // If Offset 0: Show Op3 (Start of current Op) -- stored in currentStep.baseTree
          // If Offset 1: Show Op3 (Result of Op2) -- stored in History[len-1] ?? No.
          
          // Let's clarify:
          // currentStep.baseTree is the state at start of CURRENT op.
          // history[length-1].tree is ALSO the state at start of CURRENT op.
          
          if (comparisonOffset === 0) {
              leftPanelTree = currentStep?.baseTree || null;
              leftPanelLabel = "Start of Current Op";
          } else {
              // Offset 1 = history[len-1] (Wait, history len-1 IS start of current op)
              // So Offset 1 should be history[len-1]? No, Offset 0 is "Current Base".
              // Let's map it:
              // Offset 0: Start of Current Op
              // Offset 1: Start of Previous Op (Index: len-2)
              // Offset 2: Start of Op before that (Index: len-3)
              
              const historyIndex = history.length - comparisonOffset;
              if (historyIndex >= 0 && historyIndex < history.length) {
                  leftPanelTree = history[historyIndex].tree;
                  leftPanelLabel = `State: ${history[historyIndex].label}`; // e.g. "Insert 30" (This was the label for the op that created this state? No, label is the op ABOUT to happen)
                  // Actually, history stores: { tree: state_before_op, label: op_name }
                  // So history[i].tree is state BEFORE history[i].label happened.
                  leftPanelLabel = `Before ${history[historyIndex].label}`;
              } else if (historyIndex === -1) {
                   leftPanelLabel = "Initial Empty State";
                   leftPanelTree = null;
              }
          }
      }
  } else if (isRotationContext) {
      // Even if toggle is off, auto-show for rotations? 
      // Previous prompt implied "always see not modified trees" was an option.
      // Let's stick to the toggle being the main control, but maybe auto-show if crucial?
      // For now, respect the toggle, but maybe user wants context.
      // Let's assume toggle controls the permanent split.
      // If toggle is OFF, we don't show split.
      showSplit = false;
  }

  const handlePrevComparison = () => {
      if (comparisonOffset < history.length) {
          setComparisonOffset(prev => prev + 1);
      }
  };

  const handleNextComparison = () => {
      if (comparisonOffset > 0) {
          setComparisonOffset(prev => prev - 1);
      }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <Controls 
        onInsert={handleInsert}
        onDelete={handleDelete}
        onReset={handleReset}
        onUndoOp={handleUndo}
        onAutoPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onStepForward={() => setCurrentStepIndex(i => Math.min(i + 1, steps.length - 1))}
        onStepBackward={() => setCurrentStepIndex(i => Math.max(i - 1, -1))}
        setSpeed={setPlaybackSpeed}
        toggleHeights={() => setShowHeights(b => !b)}
        toggleBF={() => setShowBF(b => !b)}
        toggleBaseTree={() => setAlwaysShowComparison(b => !b)}
        onPreset={handlePreset}
        isPlaying={isPlaying}
        speed={playbackSpeed}
        showHeights={showHeights}
        showBF={showBF}
        showBaseTree={alwaysShowComparison}
        canUndoStep={currentStepIndex > -1}
        canRedoStep={currentStepIndex < steps.length - 1}
        history={history}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative h-full">
        
        {/* Top Info Bar */}
        <div className={`p-6 border-b shadow-sm transition-colors duration-300 z-10 ${explanationStyle}`}>
           <div className="max-w-4xl mx-auto w-full">
               <div className="flex items-center gap-3 mb-2">
                 <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/50 border border-white/20`}>
                    {currentStep?.actionType || "IDLE"}
                 </span>
                 <div className="h-4 w-px bg-current opacity-20"></div>
                 <span className="text-xs font-mono opacity-60">Step {currentStepIndex + 1} / {steps.length}</span>
                 
                 {/* Mini Legend */}
                 <div className="ml-auto flex gap-3 text-[10px] uppercase font-bold tracking-wider opacity-50">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Insert</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div>Imbalance</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>Rotate</div>
                 </div>
               </div>
               <p className="text-xl md:text-2xl font-medium leading-snug">
                 {description}
               </p>
           </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative bg-slate-100/50">
            {/* Split View Container if comparison available */}
            {showSplit ? (
                 <div className="absolute inset-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-300">
                    <div className="flex-1 relative bg-slate-100 flex flex-col">
                        {/* Comparison Navigation Header */}
                        <div className="absolute top-4 left-0 w-full flex justify-center z-20 pointer-events-none">
                             <div className="bg-white/90 backdrop-blur shadow-lg rounded-full flex items-center p-1 pointer-events-auto border border-slate-200">
                                 <button 
                                    onClick={handlePrevComparison} 
                                    disabled={comparisonOffset >= history.length}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors"
                                 >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                 </button>
                                 <span className="px-4 text-xs font-bold text-slate-600 uppercase tracking-widest min-w-[140px] text-center">
                                    {leftPanelLabel}
                                 </span>
                                 <button 
                                    onClick={handleNextComparison} 
                                    disabled={comparisonOffset === 0}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 disabled:opacity-30 transition-colors"
                                 >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                 </button>
                             </div>
                        </div>

                        <div className="flex-1 relative">
                            <TreeCanvas 
                                root={leftPanelTree} 
                                highlightNodeId={highlightId} 
                                showHeights={showHeights} 
                                showBalanceFactors={showBF}
                                // label passed via header above
                            />
                        </div>
                    </div>
                    <div className="flex-1 relative bg-white">
                        <TreeCanvas 
                            root={displayTree} 
                            highlightNodeId={highlightId} 
                            showHeights={showHeights} 
                            showBalanceFactors={showBF}
                            label="Animation View"
                        />
                    </div>
                 </div>
            ) : (
                // Single View
                <div className="absolute inset-0">
                    <TreeCanvas 
                        root={displayTree} 
                        highlightNodeId={highlightId} 
                        showHeights={showHeights} 
                        showBalanceFactors={showBF}
                    />
                </div>
            )}
        </div>
      </div>
    </div>
  );
}