import React from 'react';
import { AVLNode } from '../types';

interface TreeCanvasProps {
  root: AVLNode | null;
  highlightNodeId?: string | null;
  showHeights: boolean;
  showBalanceFactors: boolean;
  label?: string; // Optional label for the whole tree panel
}

// Recursive helper to collect edges
const getEdges = (node: AVLNode | null, edges: React.ReactElement[] = []) => {
  if (!node) return edges;

  if (node.left) {
    edges.push(
      <line
        key={`${node.id}-${node.left.id}`}
        x1={`${node.x}%`}
        y1={`${node.y}%`}
        x2={`${node.left.x}%`}
        y2={`${node.left.y}%`}
        stroke="#cbd5e1" // Slate-300
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-all duration-500 ease-in-out"
      />
    );
    getEdges(node.left, edges);
  }

  if (node.right) {
    edges.push(
      <line
        key={`${node.id}-${node.right.id}`}
        x1={`${node.x}%`}
        y1={`${node.y}%`}
        x2={`${node.right.x}%`}
        y2={`${node.right.y}%`}
        stroke="#cbd5e1"
        strokeWidth="2"
        strokeLinecap="round"
        className="transition-all duration-500 ease-in-out"
      />
    );
    getEdges(node.right, edges);
  }
  return edges;
};

// Recursive helper to collect nodes
const getNodes = (
  node: AVLNode | null, 
  nodes: React.ReactElement[] = [], 
  highlightNodeId: string | null | undefined,
  showHeights: boolean,
  showBF: boolean
) => {
  if (!node) return nodes;

  const isHighlighted = node.id === highlightNodeId;
  const isImbalanced = Math.abs(node.balanceFactor) > 1;

  // Modern Node Styling
  // Default: Indigo gradient
  let bgClass = "bg-gradient-to-br from-indigo-500 to-indigo-600";
  let borderClass = "border-indigo-200";
  let ringClass = ""; // For focus
  let textClass = "text-white";

  if (isHighlighted) {
    // Amber Highlight for active operation
    bgClass = "bg-gradient-to-br from-amber-400 to-amber-500";
    borderClass = "border-white";
    ringClass = "ring-4 ring-amber-200 ring-opacity-50 scale-110";
  } else if (isImbalanced) {
    // Red for imbalance
    bgClass = "bg-gradient-to-br from-rose-500 to-rose-600";
    borderClass = "border-white";
    ringClass = "ring-4 ring-rose-200 ring-opacity-50 animate-pulse";
  } else if (node.balanceFactor !== 0) {
    // Slight indication if BF is non-zero but valid
    bgClass = "bg-gradient-to-br from-indigo-400 to-indigo-500";
  }

  nodes.push(
    <div
      key={node.id}
      className={`absolute w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center font-bold text-sm md:text-base shadow-lg transition-all duration-500 ease-in-out z-10 ${bgClass} ${borderClass} ${textClass} ${ringClass}`}
      style={{
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {node.value}
      
      {/* Annotations */}
      {(showHeights || showBF) && (
        <div className="absolute -bottom-10 flex flex-col items-center gap-0.5 z-20 pointer-events-none">
            {showHeights && (
                <span className="text-[10px] font-mono bg-slate-800 text-slate-100 px-1.5 rounded shadow opacity-90 whitespace-nowrap">
                    H:{node.height}
                </span>
            )}
            {showBF && (
                <span className={`text-[10px] font-mono px-1.5 rounded shadow opacity-90 whitespace-nowrap ${Math.abs(node.balanceFactor) > 0 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'}`}>
                    BF:{node.balanceFactor}
                </span>
            )}
        </div>
      )}
    </div>
  );

  getNodes(node.left, nodes, highlightNodeId, showHeights, showBF);
  getNodes(node.right, nodes, highlightNodeId, showHeights, showBF);

  return nodes;
};

export const TreeCanvas: React.FC<TreeCanvasProps> = ({ root, highlightNodeId, showHeights, showBalanceFactors, label }) => {
  // If no tree, show placeholder
  if (!root && !label) {
     return (
        <div className="w-full h-full flex items-center justify-center text-slate-400 select-none">
            <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                <p>Start by inserting a node</p>
            </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full w-full">
        {label && (
            <div className="text-center py-2 bg-slate-200/50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-widest backdrop-blur-sm">
                {label}
            </div>
        )}
        <div className="relative flex-1 w-full overflow-hidden">
            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ 
                     backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)', 
                     backgroundSize: '40px 40px' 
                 }}>
            </div>

            {root && (
                <>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {getEdges(root)}
                    </svg>
                    {getNodes(root, [], highlightNodeId, showHeights, showBalanceFactors)}
                </>
            )}
        </div>
    </div>
  );
};