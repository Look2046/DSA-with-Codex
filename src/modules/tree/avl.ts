import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type AvlRotationCase = 'none' | 'll' | 'lr' | 'rr' | 'rl';
export type AvlOutcome = 'ongoing' | 'inserted' | 'duplicate' | 'rebalanced';

export type AvlNodeSnapshot = {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  parent: number | null;
  height: number;
  balance: number;
};

export type AvlStep = AnimationStep & {
  treeState: AvlNodeSnapshot[];
  rootId: number | null;
  action:
    | 'initial'
    | 'visit'
    | 'duplicate'
    | 'inserted'
    | 'rebalanceCheck'
    | 'imbalance'
    | 'rotateLeft'
    | 'rotateRight'
    | 'rebalanced'
    | 'completed';
  target: number;
  currentId: number | null;
  insertedId: number | null;
  imbalanceId: number | null;
  pathIds: number[];
  rotationCase: AvlRotationCase;
  outcome: AvlOutcome;
};

type MutableNode = {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  parent: number | null;
  height: number;
};

type MutableTree = {
  rootId: number | null;
  nodes: Map<number, MutableNode>;
  nextId: number;
};

function createEmptyTree(): MutableTree {
  return {
    rootId: null,
    nodes: new Map<number, MutableNode>(),
    nextId: 0,
  };
}

function clonePath(pathIds: number[]): number[] {
  return [...pathIds];
}

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function getNode(tree: MutableTree, nodeId: number | null): MutableNode | null {
  if (nodeId === null) {
    return null;
  }
  return tree.nodes.get(nodeId) ?? null;
}

function getHeight(tree: MutableTree, nodeId: number | null): number {
  return getNode(tree, nodeId)?.height ?? 0;
}

function getBalance(tree: MutableTree, nodeId: number | null): number {
  const node = getNode(tree, nodeId);
  if (!node) {
    return 0;
  }
  return getHeight(tree, node.left) - getHeight(tree, node.right);
}

function updateHeight(tree: MutableTree, nodeId: number | null): void {
  const node = getNode(tree, nodeId);
  if (!node) {
    return;
  }
  node.height = Math.max(getHeight(tree, node.left), getHeight(tree, node.right)) + 1;
}

function refreshHeights(tree: MutableTree): number {
  const walk = (nodeId: number | null): number => {
    const node = getNode(tree, nodeId);
    if (!node) {
      return 0;
    }
    const leftHeight = walk(node.left);
    const rightHeight = walk(node.right);
    node.height = Math.max(leftHeight, rightHeight) + 1;
    return node.height;
  };

  return walk(tree.rootId);
}

function snapshotTree(tree: MutableTree): AvlNodeSnapshot[] {
  refreshHeights(tree);
  return [...tree.nodes.values()]
    .sort((left, right) => left.id - right.id)
    .map((node) => ({
      id: node.id,
      value: node.value,
      left: node.left,
      right: node.right,
      parent: node.parent,
      height: node.height,
      balance: getBalance(tree, node.id),
    }));
}

function createStep(
  tree: MutableTree,
  action: AvlStep['action'],
  codeLines: number[],
  highlights: HighlightEntry[],
  target: number,
  currentId: number | null,
  insertedId: number | null,
  imbalanceId: number | null,
  pathIds: number[],
  rotationCase: AvlRotationCase,
  outcome: AvlOutcome,
): AvlStep {
  return {
    description: '',
    codeLines,
    highlights: cloneHighlights(highlights),
    treeState: snapshotTree(tree),
    rootId: tree.rootId,
    action,
    target,
    currentId,
    insertedId,
    imbalanceId,
    pathIds: clonePath(pathIds),
    rotationCase,
    outcome,
  };
}

function attachNode(tree: MutableTree, parentId: number | null, value: number, toLeft: boolean): number {
  const nextNode: MutableNode = {
    id: tree.nextId,
    value,
    left: null,
    right: null,
    parent: parentId,
    height: 1,
  };

  tree.nodes.set(nextNode.id, nextNode);
  tree.nextId += 1;

  if (parentId === null) {
    tree.rootId = nextNode.id;
    return nextNode.id;
  }

  const parentNode = getNode(tree, parentId);
  if (!parentNode) {
    throw new Error('Invalid parent while attaching AVL node.');
  }

  if (toLeft) {
    parentNode.left = nextNode.id;
  } else {
    parentNode.right = nextNode.id;
  }

  return nextNode.id;
}

function replaceParentChild(tree: MutableTree, parentId: number | null, fromId: number, toId: number | null): void {
  if (parentId === null) {
    tree.rootId = toId;
    const nextRoot = getNode(tree, toId);
    if (nextRoot) {
      nextRoot.parent = null;
    }
    return;
  }

  const parent = getNode(tree, parentId);
  if (!parent) {
    throw new Error('Invalid parent while replacing AVL child.');
  }

  if (parent.left === fromId) {
    parent.left = toId;
  } else if (parent.right === fromId) {
    parent.right = toId;
  }

  const child = getNode(tree, toId);
  if (child) {
    child.parent = parent.id;
  }
}

function rotateLeft(tree: MutableTree, nodeId: number): number {
  const pivot = getNode(tree, nodeId);
  if (!pivot || pivot.right === null) {
    throw new Error('AVL rotateLeft requires a right child.');
  }

  const rightChild = getNode(tree, pivot.right);
  if (!rightChild) {
    throw new Error('AVL rotateLeft missing right child node.');
  }

  const transferId = rightChild.left;
  replaceParentChild(tree, pivot.parent, pivot.id, rightChild.id);

  rightChild.left = pivot.id;
  pivot.parent = rightChild.id;
  pivot.right = transferId;

  const transferNode = getNode(tree, transferId);
  if (transferNode) {
    transferNode.parent = pivot.id;
  }

  updateHeight(tree, pivot.id);
  updateHeight(tree, rightChild.id);
  return rightChild.id;
}

function rotateRight(tree: MutableTree, nodeId: number): number {
  const pivot = getNode(tree, nodeId);
  if (!pivot || pivot.left === null) {
    throw new Error('AVL rotateRight requires a left child.');
  }

  const leftChild = getNode(tree, pivot.left);
  if (!leftChild) {
    throw new Error('AVL rotateRight missing left child node.');
  }

  const transferId = leftChild.right;
  replaceParentChild(tree, pivot.parent, pivot.id, leftChild.id);

  leftChild.right = pivot.id;
  pivot.parent = leftChild.id;
  pivot.left = transferId;

  const transferNode = getNode(tree, transferId);
  if (transferNode) {
    transferNode.parent = pivot.id;
  }

  updateHeight(tree, pivot.id);
  updateHeight(tree, leftChild.id);
  return leftChild.id;
}

function resolveRotationCase(tree: MutableTree, nodeId: number, insertedValue: number): AvlRotationCase {
  const node = getNode(tree, nodeId);
  if (!node) {
    return 'none';
  }

  const balance = getBalance(tree, nodeId);
  if (balance > 1) {
    const leftChild = getNode(tree, node.left);
    if (!leftChild) {
      return 'none';
    }
    return insertedValue < leftChild.value ? 'll' : 'lr';
  }

  if (balance < -1) {
    const rightChild = getNode(tree, node.right);
    if (!rightChild) {
      return 'none';
    }
    return insertedValue > rightChild.value ? 'rr' : 'rl';
  }

  return 'none';
}

function pathToNode(tree: MutableTree, nodeId: number | null): number[] {
  if (nodeId === null) {
    return [];
  }

  const path: number[] = [];
  let currentId: number | null = nodeId;
  while (currentId !== null) {
    path.push(currentId);
    currentId = getNode(tree, currentId)?.parent ?? null;
  }
  return path.reverse();
}

function appendVisitStep(steps: AvlStep[], tree: MutableTree, target: number, currentId: number, pathIds: number[]): void {
  const highlights: HighlightEntry[] = pathIds
    .filter((nodeId) => nodeId !== currentId)
    .map((nodeId) => ({ index: nodeId, type: 'visiting' as const }));
  highlights.push({ index: currentId, type: 'comparing' });

  steps.push(createStep(tree, 'visit', [4], highlights, target, currentId, null, null, pathIds, 'none', 'ongoing'));
}

function insertSeedValue(tree: MutableTree, value: number): void {
  if (tree.rootId === null) {
    attachNode(tree, null, value, true);
    return;
  }

  let currentId: number | null = tree.rootId;
  let parentId: number | null = null;
  let toLeft = false;

  while (currentId !== null) {
    const currentNode = getNode(tree, currentId);
    if (!currentNode) {
      break;
    }

    parentId = currentNode.id;

    if (value === currentNode.value) {
      return;
    }

    if (value < currentNode.value) {
      toLeft = true;
      currentId = currentNode.left;
    } else {
      toLeft = false;
      currentId = currentNode.right;
    }
  }

  const insertedId = attachNode(tree, parentId, value, toLeft);
  let ancestorId = getNode(tree, insertedId)?.parent ?? null;

  while (ancestorId !== null) {
    updateHeight(tree, ancestorId);
    const rotationCase = resolveRotationCase(tree, ancestorId, value);

    if (rotationCase === 'll') {
      ancestorId = rotateRight(tree, ancestorId);
    } else if (rotationCase === 'rr') {
      ancestorId = rotateLeft(tree, ancestorId);
    } else if (rotationCase === 'lr') {
      const ancestor = getNode(tree, ancestorId);
      if (!ancestor || ancestor.left === null) {
        break;
      }
      rotateLeft(tree, ancestor.left);
      ancestorId = rotateRight(tree, ancestorId);
    } else if (rotationCase === 'rl') {
      const ancestor = getNode(tree, ancestorId);
      if (!ancestor || ancestor.right === null) {
        break;
      }
      rotateRight(tree, ancestor.right);
      ancestorId = rotateLeft(tree, ancestorId);
    }

    ancestorId = getNode(tree, ancestorId)?.parent ?? null;
  }

  refreshHeights(tree);
}

function buildTreeFromInput(input: number[]): MutableTree {
  const tree = createEmptyTree();
  input.forEach((value) => insertSeedValue(tree, value));
  refreshHeights(tree);
  return tree;
}

export function generateAvlSteps(input: number[], target: number): AvlStep[] {
  const tree = buildTreeFromInput(input);
  const steps: AvlStep[] = [];

  steps.push(createStep(tree, 'initial', [1], [], target, null, null, null, [], 'none', 'ongoing'));

  if (tree.rootId === null) {
    const insertedId = attachNode(tree, null, target, true);
    steps.push(
      createStep(
        tree,
        'inserted',
        [6],
        [{ index: insertedId, type: 'new-node' }],
        target,
        insertedId,
        insertedId,
        null,
        [insertedId],
        'none',
        'inserted',
      ),
    );
    steps.push(
      createStep(
        tree,
        'completed',
        [11],
        [{ index: insertedId, type: 'new-node' }],
        target,
        insertedId,
        insertedId,
        null,
        [insertedId],
        'none',
        'inserted',
      ),
    );
    return steps;
  }

  const pathIds: number[] = [];
  let currentId: number | null = tree.rootId;
  let parentId: number | null = null;
  let toLeft = false;

  while (currentId !== null) {
    const currentNode = getNode(tree, currentId);
    if (!currentNode) {
      break;
    }

    pathIds.push(currentNode.id);
    appendVisitStep(steps, tree, target, currentNode.id, pathIds);

    if (target === currentNode.value) {
      steps.push(
        createStep(
          tree,
          'duplicate',
          [5],
          [{ index: currentNode.id, type: 'matched' }],
          target,
          currentNode.id,
          null,
          null,
          pathIds,
          'none',
          'duplicate',
        ),
      );
      return steps;
    }

    parentId = currentNode.id;
    if (target < currentNode.value) {
      toLeft = true;
      currentId = currentNode.left;
    } else {
      toLeft = false;
      currentId = currentNode.right;
    }
  }

  const insertedId = attachNode(tree, parentId, target, toLeft);
  const insertedPath = pathToNode(tree, insertedId);
  steps.push(
    createStep(
      tree,
      'inserted',
      [6],
      [{ index: insertedId, type: 'new-node' }],
      target,
      insertedId,
      insertedId,
      null,
      insertedPath,
      'none',
      'ongoing',
    ),
  );

  let ancestorId = getNode(tree, insertedId)?.parent ?? null;
  while (ancestorId !== null) {
    updateHeight(tree, ancestorId);
    const currentPath = pathToNode(tree, ancestorId);
    const balance = getBalance(tree, ancestorId);
    const highlights: HighlightEntry[] = [
      { index: ancestorId, type: 'comparing' },
      { index: insertedId, type: 'new-node' },
    ];

    steps.push(
      createStep(
        tree,
        'rebalanceCheck',
        [7],
        highlights,
        target,
        ancestorId,
        insertedId,
        null,
        currentPath,
        'none',
        'ongoing',
      ),
    );

    if (Math.abs(balance) > 1) {
      const rotationCase = resolveRotationCase(tree, ancestorId, target);
      steps.push(
        createStep(
          tree,
          'imbalance',
          [8],
          [
            { index: ancestorId, type: 'matched' },
            { index: insertedId, type: 'new-node' },
          ],
          target,
          ancestorId,
          insertedId,
          ancestorId,
          currentPath,
          rotationCase,
          'ongoing',
        ),
      );

      let rebalancedRootId = ancestorId;

      if (rotationCase === 'll') {
        rebalancedRootId = rotateRight(tree, ancestorId);
        steps.push(
          createStep(
            tree,
            'rotateRight',
            [9],
            [
              { index: rebalancedRootId, type: 'matched' },
              { index: insertedId, type: 'new-node' },
            ],
            target,
            rebalancedRootId,
            insertedId,
            ancestorId,
            pathToNode(tree, rebalancedRootId),
            rotationCase,
            'ongoing',
          ),
        );
      } else if (rotationCase === 'rr') {
        rebalancedRootId = rotateLeft(tree, ancestorId);
        steps.push(
          createStep(
            tree,
            'rotateLeft',
            [9],
            [
              { index: rebalancedRootId, type: 'matched' },
              { index: insertedId, type: 'new-node' },
            ],
            target,
            rebalancedRootId,
            insertedId,
            ancestorId,
            pathToNode(tree, rebalancedRootId),
            rotationCase,
            'ongoing',
          ),
        );
      } else if (rotationCase === 'lr') {
        const ancestor = getNode(tree, ancestorId);
        if (!ancestor || ancestor.left === null) {
          throw new Error('AVL LR rotation requires a left child.');
        }
        const middleId = rotateLeft(tree, ancestor.left);
        steps.push(
          createStep(
            tree,
            'rotateLeft',
            [9],
            [
              { index: middleId, type: 'visiting' },
              { index: insertedId, type: 'new-node' },
            ],
            target,
            middleId,
            insertedId,
            ancestorId,
            pathToNode(tree, middleId),
            rotationCase,
            'ongoing',
          ),
        );

        rebalancedRootId = rotateRight(tree, ancestorId);
        steps.push(
          createStep(
            tree,
            'rotateRight',
            [9],
            [
              { index: rebalancedRootId, type: 'matched' },
              { index: insertedId, type: 'new-node' },
            ],
            target,
            rebalancedRootId,
            insertedId,
            ancestorId,
            pathToNode(tree, rebalancedRootId),
            rotationCase,
            'ongoing',
          ),
        );
      } else if (rotationCase === 'rl') {
        const ancestor = getNode(tree, ancestorId);
        if (!ancestor || ancestor.right === null) {
          throw new Error('AVL RL rotation requires a right child.');
        }
        const middleId = rotateRight(tree, ancestor.right);
        steps.push(
          createStep(
            tree,
            'rotateRight',
            [9],
            [
              { index: middleId, type: 'visiting' },
              { index: insertedId, type: 'new-node' },
            ],
            target,
            middleId,
            insertedId,
            ancestorId,
            pathToNode(tree, middleId),
            rotationCase,
            'ongoing',
          ),
        );

        rebalancedRootId = rotateLeft(tree, ancestorId);
        steps.push(
          createStep(
            tree,
            'rotateLeft',
            [9],
            [
              { index: rebalancedRootId, type: 'matched' },
              { index: insertedId, type: 'new-node' },
            ],
            target,
            rebalancedRootId,
            insertedId,
            ancestorId,
            pathToNode(tree, rebalancedRootId),
            rotationCase,
            'ongoing',
          ),
        );
      }

      steps.push(
        createStep(
          tree,
          'rebalanced',
          [10],
          [
            { index: rebalancedRootId, type: 'matched' },
            { index: insertedId, type: 'new-node' },
          ],
          target,
          rebalancedRootId,
          insertedId,
          ancestorId,
          pathToNode(tree, insertedId),
          rotationCase,
          'rebalanced',
        ),
      );
      return steps;
    }

    ancestorId = getNode(tree, ancestorId)?.parent ?? null;
  }

  steps.push(
    createStep(
      tree,
      'completed',
      [11],
      [{ index: insertedId, type: 'new-node' }],
      target,
      insertedId,
      insertedId,
      null,
      pathToNode(tree, insertedId),
      'none',
      'inserted',
    ),
  );

  return steps;
}
