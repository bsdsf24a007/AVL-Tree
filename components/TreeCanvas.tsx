import React from 'react';
import { AVLNode } from '../types';

interface TreeCanvasProps {
  root: AVLNode | null;
  highlightNodeId?: string | null;
  showHeights: boolean;
  showBalanceFactors: boolean;
  label?: string;
}

const getEdges = (node: AVLNode | null, edges: React.ReactElement[] = []) => {
  if (!node) return edges;
  [node.left, node.right].forEach(child => {
    if (child) {
      edges.push(
        <line
          key={`${node.id}-${child.id}`}
          x1={`${node.x}%`} y1={`${node.y}%`}
          x2={`${child.x}%`} y2={`${child.y}%`}
          stroke="url(#edgeGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] edge-flow"
          style={{ opacity: 0.3 }}
        />
      );
      getEdges(child, edges);
    }
  });
  return edges;
};

const getNodes = (node: AVLNode | null, nodes: React.ReactElement[] = [], highlightId: string | null | undefined, showH: boolean, showBF: boolean) => {
  if (!node) return nodes;
  const isHighlighted = node.id === highlightId;
  const isImbalanced = Math.abs(node.balanceFactor) > 1;

  nodes.push(
    <div
      key={node.id}
      className={`absolute w-12 h-12 md:w-14 md:h-14 rounded-2xl flex flex-col items-center justify-center font-bold transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-10 node-enter
        ${isHighlighted ? 'bg-indigo-500 text-white scale-125 z-20 shadow-[0_0_40px_rgba(99,102,241,0.8)] ring-4 ring-indigo-400/40 border-indigo-300' : 
          isImbalanced ? 'bg-rose-600 text-white shadow-[0_0_30px_rgba(225,29,72,0.5)] border-rose-400' : 
          'bg-slate-900/80 border border-slate-700/50 text-slate-100 shadow-2xl hover:border-indigo-500/50'}`}
      style={{ 
        left: `${node.x}%`, 
        top: `${node.y}%`, 
        transform: 'translate(-50%, -50%)',
        boxShadow: isHighlighted ? '0 0 40px rgba(99,102,241,0.8)' : '0 10px 25px -5px rgba(0, 0, 0, 0.4)'
      }}
    >
      <span className="text-sm md:text-base tracking-tight font-black">{node.value}</span>
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      {/* Metadata Badges */}
      <div className="absolute -bottom-8 flex gap-1 items-center justify-center w-full pointer-events-none transition-opacity duration-300">
        {showH && (
          <div className="bg-slate-950/80 border border-slate-800 px-1.5 py-0.5 rounded-md text-[7px] font-black text-indigo-400 uppercase tracking-tighter shadow-lg">
            H:<span className="text-white ml-0.5">{node.height}</span>
          </div>
        )}
        {showBF && (
          <div className={`px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter border shadow-lg
            ${Math.abs(node.balanceFactor) > 1 
              ? 'bg-rose-950/90 border-rose-500 text-rose-300' 
              : 'bg-slate-950/90 border-slate-800 text-emerald-400'}`}>
            BF:<span className="text-white ml-0.5">{node.balanceFactor}</span>
          </div>
        )}
      </div>
    </div>
  );
  getNodes(node.left, nodes, highlightId, showH, showBF);
  getNodes(node.right, nodes, highlightId, showH, showBF);
  return nodes;
};

export const TreeCanvas: React.FC<TreeCanvasProps> = ({ root, highlightNodeId, showHeights, showBalanceFactors, label }) => {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden relative">
      {label && (
        <div className="absolute top-4 left-4 z-30 pointer-events-none">
          <span className="px-3 py-1 glass-panel rounded-full text-[8px] font-black text-indigo-400 uppercase tracking-[0.2em] shadow-2xl border border-white/5">
            {label}
          </span>
        </div>
      )}
      
      <div className="relative flex-1 w-full h-full p-12 md:p-20 cursor-default touch-none overflow-auto custom-scrollbar">
        <div className="min-w-[400px] h-full relative">
           {root ? (
            <>
              <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                <defs>
                  <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#312e81" />
                  </linearGradient>
                </defs>
                {getEdges(root)}
              </svg>
              {getNodes(root, [], highlightNodeId, showHeights, showBalanceFactors)}
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-indigo-500 mb-4 animate-[spin_10s_linear_infinite]" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Neutral State</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};