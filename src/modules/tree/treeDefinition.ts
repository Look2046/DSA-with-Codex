export type TreeDefinitionKind = 'general' | 'binary' | 'complete' | 'full';

export type TreeDefinitionNode = {
  index: number;
  id: string;
  x: number;
  y: number;
  parent: number | null;
  children: number[];
};

export type TreeDefinitionEdge = {
  id: string;
  from: number;
  to: number;
};

export type TreeDefinitionSample = {
  kind: TreeDefinitionKind;
  rootIndex: number;
  nodes: TreeDefinitionNode[];
  edges: TreeDefinitionEdge[];
};

function createEdgeId(from: number, to: number) {
  return `${from}-${to}`;
}

function createSampleFromParents(kind: TreeDefinitionKind, parents: Array<number | null>): TreeDefinitionSample {
  const levelMap = new Map<number, number[]>();
  const childrenByParent = parents.map(() => [] as number[]);

  parents.forEach((parent, index) => {
    if (parent !== null) {
      childrenByParent[parent]?.push(index);
    }
  });

  const getDepth = (index: number): number => {
    const parent = parents[index];
    return parent === null ? 0 : getDepth(parent) + 1;
  };

  parents.forEach((_, index) => {
    const depth = getDepth(index);
    const levelNodes = levelMap.get(depth) ?? [];
    levelNodes.push(index);
    levelMap.set(depth, levelNodes);
  });

  const maxDepth = Math.max(...Array.from(levelMap.keys()));
  const nodes: TreeDefinitionNode[] = parents.map((parent, index) => {
    const depth = getDepth(index);
    const levelNodes = levelMap.get(depth) ?? [index];
    const levelIndex = levelNodes.indexOf(index);
    const x = ((levelIndex + 1) / (levelNodes.length + 1)) * 82 + 9;
    const y = maxDepth === 0 ? 50 : 14 + (depth / maxDepth) * 70;

    return {
      index,
      id: String.fromCharCode(65 + index),
      x,
      y,
      parent,
      children: childrenByParent[index] ?? [],
    };
  });

  return {
    kind,
    rootIndex: 0,
    nodes,
    edges: parents
      .map((parent, index) => (parent === null ? null : { id: createEdgeId(parent, index), from: parent, to: index }))
      .filter((edge): edge is TreeDefinitionEdge => edge !== null),
  };
}

function createSeededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) {
    value += 2147483646;
  }

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function createGeneralTreeSample(): TreeDefinitionSample {
  const nodes: TreeDefinitionNode[] = [
    { index: 0, id: 'A', x: 50, y: 14, parent: null, children: [1, 2, 3] },
    { index: 1, id: 'B', x: 24, y: 40, parent: 0, children: [4, 5] },
    { index: 2, id: 'C', x: 50, y: 40, parent: 0, children: [] },
    { index: 3, id: 'D', x: 76, y: 40, parent: 0, children: [6] },
    { index: 4, id: 'E', x: 14, y: 72, parent: 1, children: [] },
    { index: 5, id: 'F', x: 34, y: 72, parent: 1, children: [] },
    { index: 6, id: 'G', x: 76, y: 72, parent: 3, children: [] },
  ];

  return {
    kind: 'general',
    rootIndex: 0,
    nodes,
    edges: [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 4],
      [1, 5],
      [3, 6],
    ].map(([from, to]) => ({ id: createEdgeId(from, to), from, to })),
  };
}

function createRandomGeneralTreeSample(seed = 1): TreeDefinitionSample {
  const random = createSeededRandom(seed);
  const nodeCount = 7 + Math.floor(random() * 4);
  const parents: Array<number | null> = [null];
  const childCounts = [0];

  for (let index = 1; index < nodeCount; index += 1) {
    const candidates = parents
      .map((_, candidateIndex) => candidateIndex)
      .filter((candidateIndex) => childCounts[candidateIndex] < 3);
    const parent = candidates[Math.floor(random() * candidates.length)] ?? 0;
    parents.push(parent);
    childCounts[parent] += 1;
    childCounts.push(0);
  }

  return createSampleFromParents('general', parents);
}

function createBinaryTreeSample(): TreeDefinitionSample {
  const nodes: TreeDefinitionNode[] = [
    { index: 0, id: 'A', x: 50, y: 14, parent: null, children: [1, 2] },
    { index: 1, id: 'B', x: 30, y: 38, parent: 0, children: [3, 4] },
    { index: 2, id: 'C', x: 70, y: 38, parent: 0, children: [5] },
    { index: 3, id: 'D', x: 18, y: 64, parent: 1, children: [] },
    { index: 4, id: 'E', x: 42, y: 64, parent: 1, children: [6] },
    { index: 5, id: 'F', x: 62, y: 64, parent: 2, children: [] },
    { index: 6, id: 'G', x: 50, y: 84, parent: 4, children: [] },
  ];

  return {
    kind: 'binary',
    rootIndex: 0,
    nodes,
    edges: [
      [0, 1],
      [0, 2],
      [1, 3],
      [1, 4],
      [2, 5],
      [4, 6],
    ].map(([from, to]) => ({ id: createEdgeId(from, to), from, to })),
  };
}

function createCompleteBinaryTreeSample(): TreeDefinitionSample {
  return createSampleFromParents('complete', [null, 0, 0, 1, 1, 2, 2, 3, 3]);
}

function createFullBinaryTreeSample(): TreeDefinitionSample {
  return createSampleFromParents('full', [null, 0, 0, 1, 1, 2, 2]);
}

export function createTreeDefinitionSample(kind: TreeDefinitionKind, seed = 1) {
  switch (kind) {
    case 'general':
      return seed > 1 ? createRandomGeneralTreeSample(seed) : createGeneralTreeSample();
    case 'binary':
      return createBinaryTreeSample();
    case 'complete':
      return createCompleteBinaryTreeSample();
    case 'full':
      return createFullBinaryTreeSample();
    default:
      return createGeneralTreeSample();
  }
}

export function getNodeDepth(sample: TreeDefinitionSample, nodeIndex: number) {
  let depth = 0;
  let current = sample.nodes[nodeIndex];
  while (current?.parent !== null) {
    depth += 1;
    current = sample.nodes[current.parent];
  }
  return depth;
}

export function getNodeLevel(sample: TreeDefinitionSample, nodeIndex: number) {
  return getNodeDepth(sample, nodeIndex) + 1;
}

export function getTreeHeight(sample: TreeDefinitionSample) {
  return sample.nodes.reduce((maxHeight, node) => Math.max(maxHeight, getNodeLevel(sample, node.index)), 0);
}

export function getLeafCount(sample: TreeDefinitionSample) {
  return sample.nodes.filter((node) => node.children.length === 0).length;
}

export function getNodeDegree(sample: TreeDefinitionSample, nodeIndex: number) {
  return sample.nodes[nodeIndex]?.children.length ?? 0;
}

export function getParentIndex(sample: TreeDefinitionSample, nodeIndex: number) {
  return sample.nodes[nodeIndex]?.parent ?? null;
}

export function getChildIndexes(sample: TreeDefinitionSample, nodeIndex: number) {
  return [...(sample.nodes[nodeIndex]?.children ?? [])];
}

export function getSiblingIndexes(sample: TreeDefinitionSample, nodeIndex: number) {
  const parentIndex = getParentIndex(sample, nodeIndex);
  if (parentIndex === null) {
    return [];
  }

  return getChildIndexes(sample, parentIndex).filter((childIndex) => childIndex !== nodeIndex);
}

export function getNodeRole(sample: TreeDefinitionSample, nodeIndex: number) {
  const node = sample.nodes[nodeIndex];
  if (!node) {
    return 'unknown';
  }
  if (node.parent === null) {
    return 'root';
  }
  if (node.children.length === 0) {
    return 'leaf';
  }
  return 'internal';
}
