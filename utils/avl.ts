import { AVLNode, AnimationStep } from '../types';

// Helper to generate unique IDs
let idCounter = 0;
const generateId = () => `node-${idCounter++}`;

// --- Layout Logic ---

/**
 * Calculates X and Y coordinates for all nodes in the tree.
 * Uses an inorder traversal to determine X position (rank), ensuring no overlap.
 */
const calculateLayout = (root: AVLNode | null): AVLNode | null => {
  if (!root) return null;

  const clone = deepClone(root);
  const nodes: AVLNode[] = [];
  
  // 1. Flatten to inorder to assign X ranks
  const inorder = (node: AVLNode | null) => {
    if (!node) return;
    inorder(node.left);
    nodes.push(node);
    inorder(node.right);
  };
  inorder(clone);

  // 2. Assign coordinates
  // Use a relative system 0-100%
  const spacingY = 12; // Vertical spacing
  
  // Calculate width partitioning
  const totalNodes = nodes.length;
  // If we have few nodes, spread them out more. If many, pack tighter.
  // We use the index in inorder traversal to position X.
  // X = (index + 1) * (100 / (total + 1))
  
  nodes.forEach((node, index) => {
    node.x = ((index + 1) / (totalNodes + 1)) * 100;
  });

  // Assign Y based on depth
  const assignDepth = (node: AVLNode | null, depth: number) => {
    if (!node) return;
    node.y = 8 + depth * spacingY;
    assignDepth(node.left, depth + 1);
    assignDepth(node.right, depth + 1);
  };
  assignDepth(clone, 0);

  return clone;
};

const deepClone = (node: AVLNode | null): AVLNode | null => {
  if (!node) return null;
  return {
    ...node,
    left: deepClone(node.left),
    right: deepClone(node.right),
  };
};

// --- AVL Logic with Step Recording ---

class AVLTreeSimulator {
  private steps: AnimationStep[] = [];
  private root: AVLNode | null;
  private currentBaseTree: AVLNode | null = null; // Stores state at start of operation

  constructor(initialRoot: AVLNode | null = null) {
    this.root = initialRoot ? deepClone(initialRoot) : null;
  }

  // Helper to record a snapshot
  private snapshot(
    description: string, 
    actionType: AnimationStep['actionType'] = 'info', 
    highlightNodeId: string | null = null,
    comparisonTree: AVLNode | null = null
  ) {
    const layoutTree = calculateLayout(this.root);
    // If a comparison tree is provided (for rotation specific view), layout that too
    const layoutComparison = comparisonTree ? calculateLayout(comparisonTree) : undefined;
    // Layout the base tree (start of operation state)
    const layoutBase = this.currentBaseTree ? calculateLayout(this.currentBaseTree) : undefined;

    this.steps.push({
      tree: layoutTree,
      comparisonTree: layoutComparison,
      baseTree: layoutBase,
      description,
      actionType,
      highlightNodeId,
    });
  }

  private getHeight(node: AVLNode | null): number {
    return node ? node.height : 0;
  }

  private updateHeight(node: AVLNode) {
    node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  private getBalance(node: AVLNode | null): number {
    return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
  }

  private rightRotate(y: AVLNode): AVLNode {
    // Capture state BEFORE rotation for comparison
    const preRotationTree = deepClone(this.root);

    const x = y.left!;
    const T2 = x.right;

    this.snapshot(
      `Performing Right Rotation on Node ${y.value}. Node ${x.value} will move up.`, 
      'rotate', 
      y.id,
      preRotationTree
    );

    // Perform rotation
    x.right = y;
    y.left = T2;

    // Update heights
    this.updateHeight(y);
    this.updateHeight(x);

    // Update BFs for visualization
    y.balanceFactor = this.getBalance(y);
    x.balanceFactor = this.getBalance(x);

    this.snapshot(
      `Right Rotation complete. ${x.value} is now the parent of ${y.value}.`, 
      'rotate', 
      x.id,
      preRotationTree // Still show the 'before' state for context
    );

    return x;
  }

  private leftRotate(x: AVLNode): AVLNode {
    // Capture state BEFORE rotation for comparison
    const preRotationTree = deepClone(this.root);

    const y = x.right!;
    const T2 = y.left;

    this.snapshot(
      `Performing Left Rotation on Node ${x.value}. Node ${y.value} will move up.`, 
      'rotate', 
      x.id,
      preRotationTree
    );

    // Perform rotation
    y.left = x;
    x.right = T2;

    // Update heights
    this.updateHeight(x);
    this.updateHeight(y);

    // Update BFs
    x.balanceFactor = this.getBalance(x);
    y.balanceFactor = this.getBalance(y);

    this.snapshot(
      `Left Rotation complete. ${y.value} is now the parent of ${x.value}.`, 
      'rotate', 
      y.id,
      preRotationTree
    );

    return y;
  }

  public insert(value: number) {
    this.steps = []; // Clear previous steps for this operation
    
    // Set base tree for "Always Show Unmodified" feature
    this.currentBaseTree = deepClone(this.root);

    this.snapshot(`Starting insertion of ${value}.`, 'insert');
    
    this.root = this.insertRecursive(this.root, value);
    
    // Final layout
    this.snapshot(`Insertion of ${value} complete. Tree is balanced.`, 'info');
    return { steps: this.steps, finalTree: this.root };
  }

  private insertRecursive(node: AVLNode | null, value: number): AVLNode {
    // 1. Perform normal BST insertion
    if (!node) {
      const newNode: AVLNode = {
        id: generateId(),
        value,
        height: 1,
        balanceFactor: 0,
        left: null,
        right: null,
        x: 0, y: 0,
        highlight: 'insert',
      };
      // We must attach this temporarily to root to snapshot it properly if it's the first node
      if (!this.root) this.root = newNode; 
      
      this.snapshot(`Inserted new node ${value}.`, 'insert', newNode.id);
      return newNode;
    }

    // Highlight the path
    this.snapshot(`Comparing ${value} with ${node.value}.`, 'info', node.id);

    if (value < node.value) {
        node.left = this.insertRecursive(node.left, value);
    } else if (value > node.value) {
        node.right = this.insertRecursive(node.right, value);
    } else {
        this.snapshot(`Value ${value} already exists.`, 'info', node.id);
        return node;
    }

    // 2. Update height of this ancestor node
    this.updateHeight(node);
    
    // 3. Get the balance factor
    const balance = this.getBalance(node);
    node.balanceFactor = balance;

    this.snapshot(`Calculated Height: ${node.height}, Balance Factor: ${balance} for Node ${node.value}.`, 'check', node.id);

    // 4. If this node becomes unbalanced, then there are 4 cases

    // Left Left Case
    if (balance > 1 && value < node.left!.value) {
        this.snapshot(`Imbalance detected at Node ${node.value} (BF: ${balance}). Left-Left Case. Needs Right Rotation.`, 'imbalance', node.id);
        return this.rightRotate(node);
    }

    // Right Right Case
    if (balance < -1 && value > node.right!.value) {
        this.snapshot(`Imbalance detected at Node ${node.value} (BF: ${balance}). Right-Right Case. Needs Left Rotation.`, 'imbalance', node.id);
        return this.leftRotate(node);
    }

    // Left Right Case
    if (balance > 1 && value > node.left!.value) {
        this.snapshot(`Imbalance detected at Node ${node.value} (BF: ${balance}). Left-Right Case.`, 'imbalance', node.id);
        
        // Special snapshot for the double rotation prep
        const preDoubleTree = deepClone(this.root);
        this.snapshot(`Step 1 of LR: Left Rotate on left child ${node.left!.value}.`, 'rotate', node.left!.id, preDoubleTree);

        node.left = this.leftRotate(node.left!);
        
        this.snapshot(`Step 2 of LR: Now Right Rotate on pivot ${node.value}.`, 'imbalance', node.id);
        return this.rightRotate(node);
    }

    // Right Left Case
    if (balance < -1 && value < node.right!.value) {
        this.snapshot(`Imbalance detected at Node ${node.value} (BF: ${balance}). Right-Left Case.`, 'imbalance', node.id);
        
        const preDoubleTree = deepClone(this.root);
        this.snapshot(`Step 1 of RL: Right Rotate on right child ${node.right!.value}.`, 'rotate', node.right!.id, preDoubleTree);

        node.right = this.rightRotate(node.right!);
        
        this.snapshot(`Step 2 of RL: Now Left Rotate on pivot ${node.value}.`, 'imbalance', node.id);
        return this.leftRotate(node);
    }

    return node;
  }

  public delete(value: number) {
    this.steps = [];
    
    // Set base tree for "Always Show Unmodified" feature
    this.currentBaseTree = deepClone(this.root);

    this.snapshot(`Starting deletion of ${value}.`, 'delete');
    
    const exists = this.find(this.root, value);
    if (!exists) {
        this.snapshot(`Node ${value} not found in the tree.`, 'info');
        return { steps: this.steps, finalTree: this.root };
    }

    this.root = this.deleteRecursive(this.root, value);
    this.snapshot(`Deletion of ${value} complete.`, 'info');
    return { steps: this.steps, finalTree: this.root };
  }

  private find(node: AVLNode | null, value: number): boolean {
    if(!node) return false;
    if(node.value === value) return true;
    return value < node.value ? this.find(node.left, value) : this.find(node.right, value);
  }

  private deleteRecursive(node: AVLNode | null, value: number): AVLNode | null {
    if (!node) return node;

    if (value < node.value) {
      node.left = this.deleteRecursive(node.left, value);
    } else if (value > node.value) {
      node.right = this.deleteRecursive(node.right, value);
    } else {
      // Node found
      // Node with only one child or no child
      if (!node.left || !node.right) {
        const temp = node.left ? node.left : node.right;
        if (!temp) {
          // No child case
          this.snapshot(`Leaf node ${value} removed.`, 'delete', node.id);
          return null;
        } else {
          // One child case
          this.snapshot(`Node ${value} replaced by child ${temp.value}.`, 'delete', node.id);
          return temp;
        }
      } else {
        // Node with two children
        const temp = this.minValueNode(node.right);
        const originalValue = node.value;
        node.value = temp.value; 
        
        this.snapshot(`Copied successor value ${temp.value} to node ${originalValue}. Deleting duplicate successor from right subtree.`, 'delete', node.id);
        
        node.right = this.deleteRecursive(node.right, temp.value);
      }
    }

    if (!node) return node;

    // Update Height
    this.updateHeight(node);
    const balance = this.getBalance(node);
    node.balanceFactor = balance;
    this.snapshot(`Checking balance of ${node.value} (BF: ${balance}).`, 'check', node.id);

    // Balance the tree
    // Left Left
    if (balance > 1 && this.getBalance(node.left) >= 0) {
      return this.rightRotate(node);
    }

    // Left Right
    if (balance > 1 && this.getBalance(node.left) < 0) {
      node.left = this.leftRotate(node.left!);
      return this.rightRotate(node);
    }

    // Right Right
    if (balance < -1 && this.getBalance(node.right) <= 0) {
      return this.leftRotate(node);
    }

    // Right Left
    if (balance < -1 && this.getBalance(node.right) > 0) {
      node.right = this.rightRotate(node.right!);
      return this.leftRotate(node);
    }

    return node;
  }

  private minValueNode(node: AVLNode): AVLNode {
    let current = node;
    while (current.left) {
      current = current.left;
    }
    return current;
  }
}

export const generateAVLTree = (initialRoot: AVLNode | null) => new AVLTreeSimulator(initialRoot);