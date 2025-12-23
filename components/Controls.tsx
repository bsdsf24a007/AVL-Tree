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
}

export const Controls: React.FC<ControlsProps> = ({ 
  onInsert, onDelete, onReset, onUndo, onStep, onAutoPlay, 
  setSpeed, toggles, setToggles, isPlaying, history, canPrev, canNext 
}) => {
  const [val, setVal] = useState('');

  const ActionButton = ({ onClick, children, className = "", disabled = false }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`relative overflow-hidden group transition-all duration-300 disabled:opacity-20 active:scale-95 ${className}`}
    >
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      {children}
    </button>
  );

  return (
    <div className="w-80 h-full bg-[#0b1121] border-r border-slate-800/60 flex flex-col p-7 shadow-2xl z-30">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tighter flex items-center gap-2">
            AVL<span className="bg-indigo-600 text-[10px] px-1.5 py-0.5 rounded-sm">PRO</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Algorithmic Engine</p>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
      </div>

      <div className="space-y-8 flex-1 overflow-y-auto custom-scrollbar pr-3">
        {/* Input Section */}
        <section>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">Command Input</label>
          <div className="flex gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-800 focus-within:border-indigo-500/50 transition-colors">
            <input 
              type="number" 
              value={val} 
              onChange={e => setVal(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && onInsert(Number(val))}
              placeholder="Enter node value..." 
              className="flex-1 bg-transparent px-3 py-2 text-white text-sm font-medium outline-none placeholder:text-slate-700"
            />
            <div className="flex gap-1">
              <ActionButton 
                onClick={() => { onInsert(Number(val)); setVal(''); }} 
                className="w-9 h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center justify-center"
              >
                <span className="text-lg font-bold">＋</span>
              </ActionButton>
              <ActionButton 
                onClick={() => { onDelete(Number(val)); setVal(''); }} 
                className="w-9 h-9 bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-lg flex items-center justify-center"
              >
                <span className="text-lg font-bold">−</span>
              </ActionButton>
            </div>
          </div>
          <button 
            onClick={onUndo} 
            disabled={history.length === 0} 
            className="w-full mt-3 py-2.5 bg-slate-900/80 border border-slate-800 hover:border-slate-600 rounded-xl text-[10px] font-black text-slate-400 tracking-widest uppercase transition-all disabled:opacity-30"
          >
            Undo Last Cmd
          </button>
        </section>

        {/* Playback Controls */}
        <section>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">Playback Timeline</label>
          <div className="grid grid-cols-3 gap-2 bg-slate-900/50 p-2 rounded-2xl border border-slate-800/50">
            <ActionButton onClick={() => onStep(-1)} disabled={!canPrev} className="py-2 flex justify-center bg-slate-800 rounded-xl text-slate-300">
              <span className="text-sm">←</span>
            </ActionButton>
            <ActionButton onClick={onAutoPlay} className={`py-2 flex justify-center rounded-xl text-white ${isPlaying ? 'bg-amber-600' : 'bg-emerald-600'}`}>
              <span className="text-sm">{isPlaying ? '⏸' : '▶'}</span>
            </ActionButton>
            <ActionButton onClick={() => onStep(1)} disabled={!canNext} className="py-2 flex justify-center bg-slate-800 rounded-xl text-slate-300">
              <span className="text-sm">→</span>
            </ActionButton>
          </div>
        </section>

        {/* View Options */}
        <section>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3 ml-1">Visualization layers</label>
          <div className="space-y-1.5">
            {[ 
              { k: 'comp', l: 'Split Logic Analyzer', desc: 'Side-by-side comparison' }, 
              { k: 'h', l: 'Node Heights', desc: 'Vertical levels indicator' }, 
              { k: 'bf', l: 'Balance Matrix', desc: 'Critical path delta' } 
            ].map(t => (
              <label key={t.k} className="group flex items-center justify-between p-3 rounded-xl border border-transparent hover:bg-slate-900/80 hover:border-slate-800 cursor-pointer transition-all">
                <div>
                  <div className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{t.l}</div>
                  <div className="text-[9px] text-slate-600 font-medium uppercase tracking-tight">{t.desc}</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input 
                    type="checkbox" 
                    checked={(toggles as any)[t.k]} 
                    onChange={() => setToggles((p: any) => ({ ...p, [t.k]: !p[t.k] }))} 
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-800 rounded-full peer-checked:bg-indigo-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* History Feed */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operation Feed</label>
            <span className="text-[10px] font-bold text-slate-700">{history.length} ITEMS</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
            {history.slice().reverse().map((h, i) => (
              <div key={i} className="group p-3 bg-slate-900/30 border border-slate-800/50 rounded-xl flex items-center gap-3 hover:bg-slate-900/80 transition-all cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                <div className="flex-1">
                  <div className="text-[11px] font-bold text-slate-300">{h.label}</div>
                  <div className="text-[9px] text-slate-600 font-mono mt-0.5">SEQ_ID_{history.length - i}</div>
                </div>
              </div>
            ))}
            {history.length === 0 && (
              <div className="py-8 text-center border border-dashed border-slate-800/50 rounded-xl">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Feed Empty</span>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800/50">
        <button 
          onClick={onReset} 
          className="w-full py-3 bg-rose-950/20 border border-rose-900/30 text-rose-500/60 hover:text-rose-400 hover:bg-rose-900/30 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
        >
          Factory Reset
        </button>
      </div>
    </div>
  );
};