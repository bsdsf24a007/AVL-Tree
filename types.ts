export interface AVLNode {
  id: string;
  value: number;
  height: number;
  balanceFactor: number;
  left: AVLNode | null;
  right: AVLNode | null;
  x: number;
  y: number;
  highlight?: 'insert' | 'delete' | 'rotate' | 'imbalance' | 'check' | 'none';
}

export interface AnimationStep {
  tree: AVLNode | null;
  comparisonTree?: AVLNode | null;
  baseTree?: AVLNode | null;
  description: string;
  highlightNodeId?: string | null;
  actionType: 'insert' | 'delete' | 'balance' | 'rotate' | 'info' | 'check' | 'imbalance';
}

export interface HistoryEntry {
  tree: AVLNode | null;
  label: string;
  stepStartIndex: number;
}

export interface AppState {
  tree: AVLNode | null;
  steps: AnimationStep[];
  currentStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  showHeights: boolean;
  showBalanceFactors: boolean;
}