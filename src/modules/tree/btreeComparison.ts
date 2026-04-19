import type { AnimationStep, HighlightEntry } from '../../types/animation';

const MAX_KEYS = 3;

export type MultiwayNodeSnapshot = {
  id: number;
  keys: number[];
  children: number[];
  leaf: boolean;
  nextLeaf: number | null;
  depth: number;
};

export type BTreeComparisonStep = AnimationStep & {
  bTreeNodes: MultiwayNodeSnapshot[];
  bTreeRootId: number | null;
  bPlusNodes: MultiwayNodeSnapshot[];
  bPlusRootId: number | null;
  action: 'initial' | 'descend' | 'insertLeaf' | 'splitLeaf' | 'splitInternal' | 'promote' | 'linkLeaves' | 'completed';
  activeTree: 'btree' | 'bplus' | 'both';
  target: number;
  activeNodeIds: {
    btree: number | null;
    bplus: number | null;
  };
  bTreePathIds: number[];
  bPlusPathIds: number[];
  bTreeHighlights: HighlightEntry[];
  bPlusHighlights: HighlightEntry[];
  promotedKey: number | null;
  leafChain: number[];
  outcome: 'ongoing' | 'inserted';
};

type MutableNode = {
  id: number;
  keys: number[];
  children: number[];
  parent: number | null;
  leaf: boolean;
  nextLeaf: number | null;
};

type MutableTree = {
  rootId: number | null;
  nextId: number;
  nodes: Map<number, MutableNode>;
};

type SplitResult = {
  promotedKey: number;
  rightNodeId: number;
};

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function cloneNode(node: MutableNode): MutableNode {
  return {
    id: node.id,
    keys: [...node.keys],
    children: [...node.children],
    parent: node.parent,
    leaf: node.leaf,
    nextLeaf: node.nextLeaf,
  };
}

function createEmptyTree(): MutableTree {
  return {
    rootId: null,
    nextId: 0,
    nodes: new Map<number, MutableNode>(),
  };
}

function createNode(tree: MutableTree, options: Omit<MutableNode, 'id'>): number {
  const node: MutableNode = {
    id: tree.nextId,
    ...options,
  };
  tree.nodes.set(node.id, node);
  tree.nextId += 1;
  return node.id;
}

function getNode(tree: MutableTree, nodeId: number): MutableNode {
  const node = tree.nodes.get(nodeId);
  if (!node) {
    throw new Error(`Missing multiway node ${nodeId}.`);
  }
  return node;
}

function findChildIndex(keys: number[], target: number): number {
  let index = 0;
  while (index < keys.length && target > keys[index]) {
    index += 1;
  }
  return index;
}

function findBPlusChildIndex(keys: number[], target: number): number {
  let index = 0;
  while (index < keys.length && target >= keys[index]) {
    index += 1;
  }
  return index;
}

function sortedInsert(values: number[], target: number): number[] {
  const next = [...values, target];
  next.sort((left, right) => left - right);
  return next;
}

function buildPathToNode(tree: MutableTree, nodeId: number | null): number[] {
  if (nodeId === null) {
    return [];
  }

  const path: number[] = [];
  let currentId: number | null = nodeId;
  while (currentId !== null) {
    path.push(currentId);
    currentId = getNode(tree, currentId).parent;
  }
  return path.reverse();
}

function snapshotTree(tree: MutableTree): { nodes: MultiwayNodeSnapshot[]; rootId: number | null } {
  const depthCache = new Map<number, number>();

  const getDepth = (nodeId: number): number => {
    const cached = depthCache.get(nodeId);
    if (cached !== undefined) {
      return cached;
    }

    const node = getNode(tree, nodeId);
    const depth = node.parent === null ? 0 : getDepth(node.parent) + 1;
    depthCache.set(nodeId, depth);
    return depth;
  };

  return {
    rootId: tree.rootId,
    nodes: [...tree.nodes.values()]
      .sort((left, right) => left.id - right.id)
      .map((node) => ({
        id: node.id,
        keys: [...node.keys],
        children: [...node.children],
        leaf: node.leaf,
        nextLeaf: node.nextLeaf,
        depth: getDepth(node.id),
      })),
  };
}

function getBPlusLeafChain(tree: MutableTree): number[] {
  if (tree.rootId === null) {
    return [];
  }

  let currentId: number | null = tree.rootId;
  while (!getNode(tree, currentId).leaf) {
    currentId = getNode(tree, currentId).children[0] ?? currentId;
  }

  const values: number[] = [];
  while (currentId !== null) {
    const node = getNode(tree, currentId);
    values.push(...node.keys);
    currentId = node.nextLeaf;
  }
  return values;
}

function createPathHighlights(pathIds: number[], activeId: number | null, promotedId: number | null = null): HighlightEntry[] {
  const highlights: HighlightEntry[] = pathIds
    .filter((nodeId) => nodeId !== activeId && nodeId !== promotedId)
    .map((nodeId) => ({ index: nodeId, type: 'visiting' as const }));

  if (activeId !== null) {
    highlights.push({ index: activeId, type: 'comparing' });
  }
  if (promotedId !== null) {
    highlights.push({ index: promotedId, type: 'matched' });
  }

  return highlights;
}

function createStep(
  bTree: MutableTree,
  bPlusTree: MutableTree,
  action: BTreeComparisonStep['action'],
  codeLines: number[],
  activeTree: BTreeComparisonStep['activeTree'],
  target: number,
  activeNodeIds: BTreeComparisonStep['activeNodeIds'],
  bTreePathIds: number[],
  bPlusPathIds: number[],
  bTreeHighlights: HighlightEntry[],
  bPlusHighlights: HighlightEntry[],
  promotedKey: number | null,
  outcome: BTreeComparisonStep['outcome'],
): BTreeComparisonStep {
  const bTreeSnapshot = snapshotTree(bTree);
  const bPlusSnapshot = snapshotTree(bPlusTree);

  return {
    description: '',
    codeLines,
    highlights: [],
    bTreeNodes: bTreeSnapshot.nodes,
    bTreeRootId: bTreeSnapshot.rootId,
    bPlusNodes: bPlusSnapshot.nodes,
    bPlusRootId: bPlusSnapshot.rootId,
    action,
    activeTree,
    target,
    activeNodeIds: { ...activeNodeIds },
    bTreePathIds: [...bTreePathIds],
    bPlusPathIds: [...bPlusPathIds],
    bTreeHighlights: cloneHighlights(bTreeHighlights),
    bPlusHighlights: cloneHighlights(bPlusHighlights),
    promotedKey,
    leafChain: getBPlusLeafChain(bPlusTree),
    outcome,
  };
}

function createRootIfNeeded(tree: MutableTree): number {
  if (tree.rootId !== null) {
    return tree.rootId;
  }
  const rootId = createNode(tree, {
    keys: [],
    children: [],
    parent: null,
    leaf: true,
    nextLeaf: null,
  });
  tree.rootId = rootId;
  return rootId;
}

function splitBTreeNode(tree: MutableTree, nodeId: number): SplitResult {
  const node = getNode(tree, nodeId);
  const rightNode = cloneNode(node);
  const midIndex = Math.floor(node.keys.length / 2);
  const promotedKey = node.keys[midIndex] ?? 0;

  node.keys = node.keys.slice(0, midIndex);
  rightNode.keys = rightNode.keys.slice(midIndex + 1);
  rightNode.id = tree.nextId;
  rightNode.parent = node.parent;

  if (node.leaf) {
    rightNode.children = [];
  } else {
    rightNode.children = node.children.slice(midIndex + 1);
    node.children = node.children.slice(0, midIndex + 1);
    rightNode.children.forEach((childId) => {
      getNode(tree, childId).parent = rightNode.id;
    });
  }

  tree.nodes.set(rightNode.id, rightNode);
  tree.nextId += 1;
  return {
    promotedKey,
    rightNodeId: rightNode.id,
  };
}

function splitBPlusLeaf(tree: MutableTree, nodeId: number): SplitResult {
  const node = getNode(tree, nodeId);
  const splitIndex = Math.ceil(node.keys.length / 2);
  const rightKeys = node.keys.slice(splitIndex);
  node.keys = node.keys.slice(0, splitIndex);

  const rightNodeId = createNode(tree, {
    keys: rightKeys,
    children: [],
    parent: node.parent,
    leaf: true,
    nextLeaf: node.nextLeaf,
  });

  node.nextLeaf = rightNodeId;
  return {
    promotedKey: rightKeys[0] ?? 0,
    rightNodeId,
  };
}

function splitBPlusInternal(tree: MutableTree, nodeId: number): SplitResult {
  const node = getNode(tree, nodeId);
  const splitIndex = Math.floor(node.keys.length / 2);
  const promotedKey = node.keys[splitIndex] ?? 0;
  const rightKeys = node.keys.slice(splitIndex + 1);
  const rightChildren = node.children.slice(splitIndex + 1);

  node.keys = node.keys.slice(0, splitIndex);
  node.children = node.children.slice(0, splitIndex + 1);

  const rightNodeId = createNode(tree, {
    keys: rightKeys,
    children: rightChildren,
    parent: node.parent,
    leaf: false,
    nextLeaf: null,
  });

  rightChildren.forEach((childId) => {
    getNode(tree, childId).parent = rightNodeId;
  });

  return {
    promotedKey,
    rightNodeId,
  };
}

function insertIntoBTreeSilent(tree: MutableTree, target: number): void {
  const rootId = createRootIfNeeded(tree);

  const insertIntoNode = (nodeId: number): SplitResult | null => {
    const node = getNode(tree, nodeId);

    if (node.leaf) {
      if (!node.keys.includes(target)) {
        node.keys = sortedInsert(node.keys, target);
      }
      if (node.keys.length <= MAX_KEYS) {
        return null;
      }
      return splitBTreeNode(tree, nodeId);
    }

    const childIndex = findChildIndex(node.keys, target);
    const childId = node.children[childIndex];
    const splitResult = insertIntoNode(childId);
    if (!splitResult) {
      return null;
    }

    node.keys.splice(childIndex, 0, splitResult.promotedKey);
    node.children.splice(childIndex + 1, 0, splitResult.rightNodeId);
    getNode(tree, splitResult.rightNodeId).parent = node.id;

    if (node.keys.length <= MAX_KEYS) {
      return null;
    }
    return splitBTreeNode(tree, nodeId);
  };

  const rootSplit = insertIntoNode(rootId);
  if (!rootSplit) {
    return;
  }

  const newRootId = createNode(tree, {
    keys: [rootSplit.promotedKey],
    children: [rootId, rootSplit.rightNodeId],
    parent: null,
    leaf: false,
    nextLeaf: null,
  });
  getNode(tree, rootId).parent = newRootId;
  getNode(tree, rootSplit.rightNodeId).parent = newRootId;
  tree.rootId = newRootId;
}

function insertIntoBPlusSilent(tree: MutableTree, target: number): void {
  const rootId = createRootIfNeeded(tree);

  const insertIntoNode = (nodeId: number): SplitResult | null => {
    const node = getNode(tree, nodeId);

    if (node.leaf) {
      if (!node.keys.includes(target)) {
        node.keys = sortedInsert(node.keys, target);
      }
      if (node.keys.length <= MAX_KEYS) {
        return null;
      }
      return splitBPlusLeaf(tree, nodeId);
    }

    const childIndex = findBPlusChildIndex(node.keys, target);
    const childId = node.children[childIndex];
    const splitResult = insertIntoNode(childId);
    if (!splitResult) {
      return null;
    }

    node.keys.splice(childIndex, 0, splitResult.promotedKey);
    node.children.splice(childIndex + 1, 0, splitResult.rightNodeId);
    getNode(tree, splitResult.rightNodeId).parent = node.id;

    if (node.keys.length <= MAX_KEYS) {
      return null;
    }
    return splitBPlusInternal(tree, nodeId);
  };

  const rootSplit = insertIntoNode(rootId);
  if (!rootSplit) {
    return;
  }

  const newRootId = createNode(tree, {
    keys: [rootSplit.promotedKey],
    children: [rootId, rootSplit.rightNodeId],
    parent: null,
    leaf: false,
    nextLeaf: null,
  });
  getNode(tree, rootId).parent = newRootId;
  getNode(tree, rootSplit.rightNodeId).parent = newRootId;
  tree.rootId = newRootId;
}

function buildTreesFromSeeds(seedKeys: readonly number[]): { bTree: MutableTree; bPlusTree: MutableTree } {
  const bTree = createEmptyTree();
  const bPlusTree = createEmptyTree();
  seedKeys.forEach((key) => {
    insertIntoBTreeSilent(bTree, key);
    insertIntoBPlusSilent(bPlusTree, key);
  });
  return { bTree, bPlusTree };
}

export function generateBTreeComparisonSteps(seedKeysInput: readonly number[], target: number): BTreeComparisonStep[] {
  const seedKeys = [...seedKeysInput].sort((left, right) => left - right);
  const { bTree, bPlusTree } = buildTreesFromSeeds(seedKeys);
  const steps: BTreeComparisonStep[] = [];

  steps.push(
    createStep(
      bTree,
      bPlusTree,
      'initial',
      [1],
      'both',
      target,
      { btree: bTree.rootId, bplus: bPlusTree.rootId },
      bTree.rootId === null ? [] : [bTree.rootId],
      bPlusTree.rootId === null ? [] : [bPlusTree.rootId],
      bTree.rootId === null ? [] : [{ index: bTree.rootId, type: 'visiting' }],
      bPlusTree.rootId === null ? [] : [{ index: bPlusTree.rootId, type: 'visiting' }],
      null,
      'ongoing',
    ),
  );

  const logStep = (
    action: BTreeComparisonStep['action'],
    codeLines: number[],
    activeTree: BTreeComparisonStep['activeTree'],
    activeNodeIds: BTreeComparisonStep['activeNodeIds'],
    bTreePathIds: number[],
    bPlusPathIds: number[],
    bTreeHighlights: HighlightEntry[],
    bPlusHighlights: HighlightEntry[],
    promotedKey: number | null = null,
    outcome: BTreeComparisonStep['outcome'] = 'ongoing',
  ) => {
    steps.push(
      createStep(
        bTree,
        bPlusTree,
        action,
        codeLines,
        activeTree,
        target,
        activeNodeIds,
        bTreePathIds,
        bPlusPathIds,
        bTreeHighlights,
        bPlusHighlights,
        promotedKey,
        outcome,
      ),
    );
  };

  const insertIntoBTree = (nodeId: number): SplitResult | null => {
    const node = getNode(bTree, nodeId);
    const pathIds = buildPathToNode(bTree, nodeId);
    logStep(
      'descend',
      [2],
      'btree',
      { btree: nodeId, bplus: null },
      pathIds,
      [],
      createPathHighlights(pathIds, nodeId),
      [],
    );

    if (node.leaf) {
      node.keys = sortedInsert(node.keys, target);
      logStep(
        'insertLeaf',
        [4],
        'btree',
        { btree: nodeId, bplus: null },
        pathIds,
        [],
        [{ index: nodeId, type: 'new-node' }],
        [],
      );

      if (node.keys.length <= MAX_KEYS) {
        return null;
      }

      const splitResult = splitBTreeNode(bTree, nodeId);
      logStep(
        node.leaf ? 'splitLeaf' : 'splitInternal',
        [5],
        'btree',
        { btree: nodeId, bplus: null },
        pathIds,
        [],
        createPathHighlights(pathIds, nodeId, splitResult.rightNodeId),
        [],
        splitResult.promotedKey,
      );
      return splitResult;
    }

    const childIndex = findChildIndex(node.keys, target);
    const childId = node.children[childIndex];
    const splitResult = insertIntoBTree(childId);
    if (!splitResult) {
      return null;
    }

    node.keys.splice(childIndex, 0, splitResult.promotedKey);
    node.children.splice(childIndex + 1, 0, splitResult.rightNodeId);
    getNode(bTree, splitResult.rightNodeId).parent = node.id;

    logStep(
      'promote',
      [6],
      'btree',
      { btree: nodeId, bplus: null },
      pathIds,
      [],
      createPathHighlights(pathIds, nodeId, splitResult.rightNodeId),
      [],
      splitResult.promotedKey,
    );

    if (node.keys.length <= MAX_KEYS) {
      return null;
    }

    const internalSplit = splitBTreeNode(bTree, nodeId);
    logStep(
      'splitInternal',
      [7],
      'btree',
      { btree: nodeId, bplus: null },
      pathIds,
      [],
      createPathHighlights(pathIds, nodeId, internalSplit.rightNodeId),
      [],
      internalSplit.promotedKey,
    );
    return internalSplit;
  };

  const bTreeRootId = createRootIfNeeded(bTree);
  const bTreeRootSplit = insertIntoBTree(bTreeRootId);
  if (bTreeRootSplit) {
    const newRootId = createNode(bTree, {
      keys: [bTreeRootSplit.promotedKey],
      children: [bTreeRootId, bTreeRootSplit.rightNodeId],
      parent: null,
      leaf: false,
      nextLeaf: null,
    });
    getNode(bTree, bTreeRootId).parent = newRootId;
    getNode(bTree, bTreeRootSplit.rightNodeId).parent = newRootId;
    bTree.rootId = newRootId;

    logStep(
      'promote',
      [8],
      'btree',
      { btree: newRootId, bplus: null },
      [newRootId],
      [],
      [{ index: newRootId, type: 'matched' }],
      [],
      bTreeRootSplit.promotedKey,
    );
  }

  const insertIntoBPlus = (nodeId: number): SplitResult | null => {
    const node = getNode(bPlusTree, nodeId);
    const pathIds = buildPathToNode(bPlusTree, nodeId);
    logStep(
      'descend',
      [2],
      'bplus',
      { btree: null, bplus: nodeId },
      [],
      pathIds,
      [],
      createPathHighlights(pathIds, nodeId),
    );

    if (node.leaf) {
      node.keys = sortedInsert(node.keys, target);
      logStep(
        'insertLeaf',
        [4],
        'bplus',
        { btree: null, bplus: nodeId },
        [],
        pathIds,
        [],
        [{ index: nodeId, type: 'new-node' }],
      );

      if (node.keys.length <= MAX_KEYS) {
        return null;
      }

      const splitResult = splitBPlusLeaf(bPlusTree, nodeId);
      logStep(
        'splitLeaf',
        [5],
        'bplus',
        { btree: null, bplus: nodeId },
        [],
        pathIds,
        [],
        createPathHighlights(pathIds, nodeId, splitResult.rightNodeId),
        splitResult.promotedKey,
      );
      logStep(
        'linkLeaves',
        [6],
        'bplus',
        { btree: null, bplus: splitResult.rightNodeId },
        [],
        buildPathToNode(bPlusTree, splitResult.rightNodeId),
        [],
        [{ index: splitResult.rightNodeId, type: 'matched' }],
        splitResult.promotedKey,
      );
      return splitResult;
    }

    const childIndex = findBPlusChildIndex(node.keys, target);
    const childId = node.children[childIndex];
    const splitResult = insertIntoBPlus(childId);
    if (!splitResult) {
      return null;
    }

    node.keys.splice(childIndex, 0, splitResult.promotedKey);
    node.children.splice(childIndex + 1, 0, splitResult.rightNodeId);
    getNode(bPlusTree, splitResult.rightNodeId).parent = node.id;

    logStep(
      'promote',
      [7],
      'bplus',
      { btree: null, bplus: nodeId },
      [],
      pathIds,
      [],
      createPathHighlights(pathIds, nodeId, splitResult.rightNodeId),
      splitResult.promotedKey,
    );

    if (node.keys.length <= MAX_KEYS) {
      return null;
    }

    const internalSplit = splitBPlusInternal(bPlusTree, nodeId);
    logStep(
      'splitInternal',
      [8],
      'bplus',
      { btree: null, bplus: nodeId },
      [],
      pathIds,
      [],
      createPathHighlights(pathIds, nodeId, internalSplit.rightNodeId),
      internalSplit.promotedKey,
    );
    return internalSplit;
  };

  const bPlusRootId = createRootIfNeeded(bPlusTree);
  const bPlusRootSplit = insertIntoBPlus(bPlusRootId);
  if (bPlusRootSplit) {
    const newRootId = createNode(bPlusTree, {
      keys: [bPlusRootSplit.promotedKey],
      children: [bPlusRootId, bPlusRootSplit.rightNodeId],
      parent: null,
      leaf: false,
      nextLeaf: null,
    });
    getNode(bPlusTree, bPlusRootId).parent = newRootId;
    getNode(bPlusTree, bPlusRootSplit.rightNodeId).parent = newRootId;
    bPlusTree.rootId = newRootId;

    logStep(
      'promote',
      [8],
      'bplus',
      { btree: null, bplus: newRootId },
      [],
      [newRootId],
      [],
      [{ index: newRootId, type: 'matched' }],
      bPlusRootSplit.promotedKey,
    );
  }

  logStep(
    'completed',
    [9],
    'both',
    { btree: bTree.rootId, bplus: bPlusTree.rootId },
    bTree.rootId === null ? [] : [bTree.rootId],
    bPlusTree.rootId === null ? [] : [bPlusTree.rootId],
    bTree.rootId === null ? [] : [{ index: bTree.rootId, type: 'matched' }],
    bPlusTree.rootId === null ? [] : [{ index: bPlusTree.rootId, type: 'matched' }],
    null,
    'inserted',
  );

  return steps;
}
