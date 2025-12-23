export interface AVLNode {
  id: string;
  value: number;
  height: number;
  balanceFactor: number;
  left: AVLNode | null;
  right: AVLNode | null;
  // Visual properties calculated during layout
  x: number;
  y: number;
  highlight?: 'insert' | 'delete' | 'rotate' | 'imbalance' | 'check' | 'none';
}

export interface AnimationStep {
  tree: AVLNode | null;
  comparisonTree?: AVLNode | null; // The specific state before a rotation
  baseTree?: AVLNode | null; // The state before the entire operation started
  description: string;
  highlightNodeId?: string | null;
  highlightEdgeIds?: string[];
  actionType: 'insert' | 'delete' | 'balance' | 'rotate' | 'info' | 'check' | 'imbalance';
}

export interface HistoryEntry {
  tree: AVLNode | null;
  label: string;
  stepIndex: number; // The index in the steps array where this state ended
}

export interface AppState {
  tree: AVLNode | null;
  steps: AnimationStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; // ms per step
  showHeights: boolean;
  showBalanceFactors: boolean;
}