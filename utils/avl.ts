import { AVLNode, AnimationStep } from '../types';

let idCounter = 0;
const generateId = () => `node-${idCounter++}`;

const deepClone = (node: AVLNode | null): AVLNode | null => {
  if (!node) return null;
  return {
    ...node,
    left: deepClone(node.left),
    right: deepClone(node.right),
  };
};

export const calculateLayout = (root: AVLNode | null): AVLNode | null => {
  if (!root) return null;
  const clone = deepClone(root);
  const nodes: AVLNode[] = [];
  
  const inorder = (node: AVLNode | null) => {
    if (!node) return;
    inorder(node.left);
    nodes.push(node);
    inorder(node.right);
  };
  inorder(clone);

  const spacingY = 15;
  const totalNodes = nodes.length;
  
  nodes.forEach((node, index) => {
    node.x = ((index + 1) / (totalNodes + 1)) * 100;
  });

  const assignDepth = (node: AVLNode | null, depth: number) => {
    if (!node) return;
    node.y = 10 + depth * spacingY;
    assignDepth(node.left, depth + 1);
    assignDepth(node.right, depth + 1);
  };
  assignDepth(clone, 0);

  return clone;
};

class AVLTreeSimulator {
  private steps: AnimationStep[] = [];
  private root: AVLNode | null;
  private currentBaseTree: AVLNode | null = null;

  constructor(initialRoot: AVLNode | null = null) {
    this.root = deepClone(initialRoot);
  }

  private snapshot(description: string, actionType: AnimationStep['actionType'] = 'info', highlightNodeId: string | null = null, comparisonTree: AVLNode | null = null) {
    this.steps.push({
      tree: calculateLayout(this.root),
      comparisonTree: comparisonTree ? calculateLayout(comparisonTree) : undefined,
      baseTree: calculateLayout(this.currentBaseTree),
      description,
      actionType,
      highlightNodeId,
    });
  }

  private getHeight(node: AVLNode | null): number { return node ? node.height : 0; }
  private updateHeight(node: AVLNode) { node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right)); }
  private getBalance(node: AVLNode | null): number { return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0; }

  private rightRotate(y: AVLNode): AVLNode {
    const preRotation = deepClone(this.root);
    const x = y.left!;
    const T2 = x.right;

    this.snapshot(`Unbalanced node ${y.value}. Rotating Right.`, 'rotate', y.id, preRotation);
    x.right = y;
    y.left = T2;
    this.updateHeight(y);
    this.updateHeight(x);
    y.balanceFactor = this.getBalance(y);
    x.balanceFactor = this.getBalance(x);
    this.snapshot(`Right Rotation complete. ${x.value} is now parent of ${y.value}.`, 'rotate', x.id, preRotation);
    return x;
  }

  private leftRotate(x: AVLNode): AVLNode {
    const preRotation = deepClone(this.root);
    const y = x.right!;
    const T2 = y.left;

    this.snapshot(`Unbalanced node ${x.value}. Rotating Left.`, 'rotate', x.id, preRotation);
    y.left = x;
    x.right = T2;
    this.updateHeight(x);
    this.updateHeight(y);
    x.balanceFactor = this.getBalance(x);
    y.balanceFactor = this.getBalance(y);
    this.snapshot(`Left Rotation complete. ${y.value} is now parent of ${x.value}.`, 'rotate', y.id, preRotation);
    return y;
  }

  public insert(value: number) {
    this.steps = [];
    this.currentBaseTree = deepClone(this.root);
    this.snapshot(`Inserting ${value}.`, 'insert');
    this.root = this.insertRecursive(this.root, value);
    this.snapshot(`Tree re-balanced.`, 'info');
    return { steps: this.steps, finalTree: this.root };
  }

  private insertRecursive(node: AVLNode | null, value: number): AVLNode {
    if (!node) {
      const newNode = { id: generateId(), value, height: 1, balanceFactor: 0, left: null, right: null, x: 0, y: 0 };
      if (!this.root) this.root = newNode;
      this.snapshot(`Created leaf ${value}.`, 'insert', newNode.id);
      return newNode;
    }

    this.snapshot(`Checking ${node.value}...`, 'info', node.id);
    if (value < node.value) node.left = this.insertRecursive(node.left, value);
    else if (value > node.value) node.right = this.insertRecursive(node.right, value);
    else return node;

    this.updateHeight(node);
    const balance = this.getBalance(node);
    node.balanceFactor = balance;
    this.snapshot(`Node ${node.value} BF: ${balance}.`, 'check', node.id);

    if (balance > 1 && value < node.left!.value) return this.rightRotate(node);
    if (balance < -1 && value > node.right!.value) return this.leftRotate(node);
    if (balance > 1 && value > node.left!.value) {
      node.left = this.leftRotate(node.left!);
      return this.rightRotate(node);
    }
    if (balance < -1 && value < node.right!.value) {
      node.right = this.rightRotate(node.right!);
      return this.leftRotate(node);
    }
    return node;
  }

  public delete(value: number) {
    this.steps = [];
    this.currentBaseTree = deepClone(this.root);
    this.snapshot(`Deleting ${value}...`, 'delete');
    this.root = this.deleteRecursive(this.root, value);
    this.snapshot(`Finished deleting ${value}.`, 'info');
    return { steps: this.steps, finalTree: this.root };
  }

  private deleteRecursive(node: AVLNode | null, value: number): AVLNode | null {
    if (!node) return null;
    if (value < node.value) node.left = this.deleteRecursive(node.left, value);
    else if (value > node.value) node.right = this.deleteRecursive(node.right, value);
    else {
      if (!node.left || !node.right) return node.left || node.right;
      const temp = this.minNode(node.right);
      node.value = temp.value;
      node.right = this.deleteRecursive(node.right, temp.value);
    }
    this.updateHeight(node);
    const balance = this.getBalance(node);
    node.balanceFactor = balance;
    if (balance > 1 && this.getBalance(node.left) >= 0) return this.rightRotate(node);
    if (balance > 1 && this.getBalance(node.left) < 0) {
      node.left = this.leftRotate(node.left!);
      return this.rightRotate(node);
    }
    if (balance < -1 && this.getBalance(node.right) <= 0) return this.leftRotate(node);
    if (balance < -1 && this.getBalance(node.right) > 0) {
      node.right = this.rightRotate(node.right!);
      return this.leftRotate(node);
    }
    return node;
  }

  private minNode(node: AVLNode): AVLNode {
    let curr = node;
    while (curr.left) curr = curr.left;
    return curr;
  }
}

export const generateAVLTree = (root: AVLNode | null) => new AVLTreeSimulator(root);