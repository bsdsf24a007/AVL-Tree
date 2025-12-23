import React, { useState } from 'react';
import { HistoryEntry } from '../types';

interface ControlsProps {
  onInsert: (v: number) => void;
  onDelete: (v: number) => void;
  onReset: () => void;
  onUndo: () => void;
  onStep: (dir: number) => void;
  onAutoPlay: () => void;
  setSpeed: (s: number) => void;
  toggles: { h: boolean, bf: boolean, comp: boolean };
  setToggles: any;
  isPlaying: boolean;
  history: HistoryEntry[];
  canPrev: boolean;
  canNext: boolean;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

export const Controls: React.FC<ControlsProps> = ({ 
  onInsert, onDelete, onReset, onUndo, onStep, onAutoPlay, 
  setSpeed, toggles, setToggles, isPlaying, history, canPrev, canNext,
  isOpen, setIsOpen
}) => {
  const [val, setVal] = useState('');

  const ActionButton = ({ onClick, children, className = "", disabled = false }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`relative overflow-hidden group transition-all duration-300 disabled:opacity-20 active:scale-90 ${className}`}
    >
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      {children}
    </button>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Panel */}
      <div className={`fixed lg:relative inset-y-0 left-0 w-80 bg-[#020617]/90 lg:bg-transparent border-r border-slate-800/40 flex flex-col p-6 z-50 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-black text-white tracking-tighter leading-tight">
              ABDULLAH'S<br/><span className="text-indigo-500">AVL VISUALIZER</span>
            </h1>
            <button onClick={() => setIsOpen(false)} className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-500">✕</button>
          </div>
          <div className="h-0.5 w-12 bg-indigo-600 mt-3 rounded-full" />
        </div>

        <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
          {/* Operations */}
          <section>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 ml-1">Execution Core</label>
            <div className="flex gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-slate-800/50 shadow-inner">
              <input 
                type="number" 
                value={val} 
                onChange={e => setVal(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && (onInsert(Number(val)), setVal(''))}
                placeholder="Value..." 
                className="flex-1 bg-transparent px-4 py-2 text-white text-sm font-bold outline-none placeholder:text-slate-800"
              />
              <div className="flex gap-1">
                <ActionButton 
                  onClick={() => { if(val) onInsert(Number(val)); setVal(''); }} 
                  className="w-10 h-10 bg-indigo-600 text-white rounded-xl shadow-[0_4px_12px_rgba(79,70,229,0.3)]"
                >
                  <span className="text-xl">＋</span>
                </ActionButton>
                <ActionButton 
                  onClick={() => { if(val) onDelete(Number(val)); setVal(''); }} 
                  className="w-10 h-10 bg-slate-800 text-slate-400 hover:text-rose-400 rounded-xl"
                >
                  <span className="text-xl">−</span>
                </ActionButton>
              </div>
            </div>
            <button 
              onClick={onUndo} 
              disabled={history.length === 0} 
              className="w-full mt-3 py-3 bg-slate-900/50 border border-slate-800/60 hover:border-slate-500 rounded-xl text-[9px] font-black text-slate-400 tracking-widest uppercase transition-all disabled:opacity-20"
            >
              Rollback Operation
            </button>
          </section>

          {/* Timeline */}
          <section>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 ml-1">Temporal Sync</label>
            <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800/50 shadow-2xl">
              <ActionButton onClick={() => onStep(-1)} disabled={!canPrev} className="py-2.5 flex justify-center bg-slate-900 rounded-xl text-slate-400">
                <span className="text-sm">←</span>
              </ActionButton>
              <ActionButton onClick={onAutoPlay} className={`py-2.5 flex justify-center rounded-xl text-white shadow-lg ${isPlaying ? 'bg-amber-600 shadow-amber-900/20' : 'bg-emerald-600 shadow-emerald-900/20'}`}>
                <span className="text-sm">{isPlaying ? '⏸' : '▶'}</span>
              </ActionButton>
              <ActionButton onClick={() => onStep(1)} disabled={!canNext} className="py-2.5 flex justify-center bg-slate-900 rounded-xl text-slate-400">
                <span className="text-sm">→</span>
              </ActionButton>
            </div>
          </section>

          {/* Layers */}
          <section>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 ml-1">Visualization Layers</label>
            <div className="space-y-2">
              {[ 
                { k: 'comp', l: 'Split Logic Analyzer', d: 'Analyze rotations side-by-side' }, 
                { k: 'h', l: 'Node Height Matrix', d: 'Toggle level indicators' }, 
                { k: 'bf', l: 'Balance Variance', d: 'Highlight critical imbalance' } 
              ].map(t => (
                <label key={t.k} className="group flex items-center justify-between p-4 rounded-2xl border border-transparent hover:bg-white/5 cursor-pointer transition-all active:scale-[0.98]">
                  <div className="flex-1">
                    <div className="text-xs font-black text-slate-300 group-hover:text-white">{t.l}</div>
                    <div className="text-[8px] text-slate-600 font-bold uppercase tracking-tight mt-0.5">{t.d}</div>
                  </div>
                  <div className="relative inline-flex items-center ml-4">
                    <input 
                      type="checkbox" 
                      checked={(toggles as any)[t.k]} 
                      onChange={() => setToggles((p: any) => ({ ...p, [t.k]: !p[t.k] }))} 
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-5 bg-slate-800 rounded-full peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:after:translate-x-5" />
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Feed */}
          <section>
             <div className="flex items-center justify-between mb-4 px-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operation Feed</label>
              <span className="text-[8px] font-black bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded tracking-widest">{history.length}</span>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
              {history.slice().reverse().map((h, i) => (
                <div key={i} className="group p-3 bg-slate-900/40 border border-slate-800/40 rounded-xl flex items-center gap-4 hover:border-indigo-500/30 transition-all">
                  <div className="w-1 h-1 rounded-full bg-indigo-500" />
                  <div className="flex-1">
                    <div className="text-[11px] font-black text-slate-300">{h.label}</div>
                    <div className="text-[8px] text-slate-600 font-mono mt-0.5">BUFFER_LOG_{history.length - i}</div>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="py-10 text-center border border-dashed border-slate-800/50 rounded-2xl opacity-20">
                  <span className="text-[9px] font-black uppercase tracking-widest">Feed Null</span>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="pt-6 border-t border-slate-800/50">
          <button 
            onClick={onReset} 
            className="w-full py-3 bg-rose-950/10 border border-rose-900/20 text-rose-500/50 hover:text-rose-400 hover:bg-rose-900/30 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all"
          >
            System Wipe
          </button>
        </div>
      </div>
    </>
  );
};