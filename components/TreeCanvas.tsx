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
          className="transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ opacity: 0.4 }}
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
      className={`absolute w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-10 
        ${isHighlighted ? 'bg-indigo-500 text-white scale-125 z-20 shadow-[0_0_30px_rgba(99,102,241,0.6)] ring-4 ring-indigo-400/30' : 
          isImbalanced ? 'bg-rose-600 text-white animate-ring shadow-[0_0_25px_rgba(225,29,72,0.4)]' : 
          'bg-slate-800 border border-slate-700 text-slate-100 shadow-xl hover:border-indigo-500/50'}`}
      style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <span className="text-base tracking-tight font-extrabold">{node.value}</span>
      
      {/* Decorative inner shine */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

      {/* Metadata Badges */}
      <div className="absolute -bottom-8 flex gap-1.5 opacity-100 pointer-events-none transition-opacity duration-300">
        {showH && (
          <div className="flex items-center bg-slate-900/90 border border-slate-700 px-1.5 py-0.5 rounded text-[8px] font-black text-indigo-400 uppercase tracking-tighter">
            H<span className="ml-0.5 text-white">{node.height}</span>
          </div>
        )}
        {showBF && (
          <div className={`flex items-center px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border 
            ${Math.abs(node.balanceFactor) > 1 
              ? 'bg-rose-900/90 border-rose-500 text-rose-300' 
              : 'bg-slate-900/90 border-slate-700 text-emerald-400'}`}>
            BF<span className="ml-0.5 text-white">{node.balanceFactor}</span>
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
    <div className="flex flex-col h-full w-full overflow-hidden relative group">
      {label && (
        <div className="absolute top-4 left-6 z-30 pointer-events-none">
          <span className="px-3 py-1 glass rounded-full text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {label}
          </span>
        </div>
      )}
      
      <div className="relative flex-1 w-full h-full p-20 cursor-default">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        {root ? (
          <>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>
              </defs>
              {getEdges(root)}
            </svg>
            {getNodes(root, [], highlightNodeId, showHeights, showBalanceFactors)}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-3xl border-2 border-dashed border-slate-800 flex items-center justify-center opacity-20">
              <div className="w-8 h-8 rounded-full border-2 border-slate-700" />
            </div>
            <p className="text-slate-600 font-medium text-sm tracking-wide">Awaiting Sequence...</p>
          </div>
        )}
      </div>
    </div>
  );
};