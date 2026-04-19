import type { AnimationStep } from '../../types/animation';

export type UnionFindPresetId = 'classic' | 'split';

export type UnionFindOperation =
  | { type: 'union'; a: number; b: number }
  | { type: 'find'; a: number };

export type UnionFindPreset = {
  presetId: UnionFindPresetId;
  size: number;
  operations: UnionFindOperation[];
};

export type UnionFindAction = 'initial' | 'operationStart' | 'findPath' | 'compressPath' | 'linkRoots' | 'completed';

export type UnionFindStep = AnimationStep & {
  presetId: UnionFindPresetId;
  size: number;
  operations: UnionFindOperation[];
  parents: number[];
  ranks: number[];
  components: number[][];
  action: UnionFindAction;
  operationIndex: number;
  activeNodes: number[];
  path: number[];
};

const UNION_FIND_PRESETS: Record<UnionFindPresetId, UnionFindPreset> = {
  classic: {
    presetId: 'classic',
    size: 8,
    operations: [
      { type: 'union', a: 0, b: 1 },
      { type: 'union', a: 1, b: 2 },
      { type: 'union', a: 3, b: 4 },
      { type: 'find', a: 2 },
      { type: 'union', a: 2, b: 4 },
      { type: 'union', a: 5, b: 6 },
      { type: 'union', a: 6, b: 7 },
      { type: 'find', a: 7 },
      { type: 'union', a: 4, b: 7 },
      { type: 'find', a: 6 },
    ],
  },
  split: {
    presetId: 'split',
    size: 7,
    operations: [
      { type: 'union', a: 0, b: 2 },
      { type: 'union', a: 1, b: 3 },
      { type: 'union', a: 2, b: 4 },
      { type: 'find', a: 4 },
      { type: 'union', a: 4, b: 6 },
      { type: 'find', a: 6 },
    ],
  },
};

function cloneOperations(operations: UnionFindOperation[]): UnionFindOperation[] {
  return operations.map((operation) => ({ ...operation }));
}

function cloneValues(values: number[]): number[] {
  return [...values];
}

function buildComponents(parents: number[]): number[][] {
  const groups = new Map<number, number[]>();

  const findRoot = (node: number): number => {
    let current = node;
    while (parents[current] !== current) {
      current = parents[current] ?? current;
    }
    return current;
  };

  parents.forEach((_, node) => {
    const root = findRoot(node);
    const group = groups.get(root) ?? [];
    group.push(node);
    groups.set(root, group);
  });

  return [...groups.values()].sort((left, right) => (left[0] ?? 0) - (right[0] ?? 0));
}

function createStep(
  preset: UnionFindPreset,
  parents: number[],
  ranks: number[],
  action: UnionFindAction,
  codeLines: number[],
  operationIndex: number,
  activeNodes: number[],
  path: number[],
): UnionFindStep {
  return {
    description: '',
    codeLines: [...codeLines],
    highlights: [],
    presetId: preset.presetId,
    size: preset.size,
    operations: cloneOperations(preset.operations),
    parents: cloneValues(parents),
    ranks: cloneValues(ranks),
    components: buildComponents(parents),
    action,
    operationIndex,
    activeNodes: [...activeNodes],
    path: [...path],
  };
}

export function getUnionFindPresetIds(): UnionFindPresetId[] {
  return Object.keys(UNION_FIND_PRESETS) as UnionFindPresetId[];
}

export function getUnionFindPreset(presetId: UnionFindPresetId): UnionFindPreset {
  return {
    ...UNION_FIND_PRESETS[presetId],
    operations: cloneOperations(UNION_FIND_PRESETS[presetId].operations),
  };
}

export function generateUnionFindSteps(presetId: UnionFindPresetId): UnionFindStep[] {
  const preset = getUnionFindPreset(presetId);
  const parents = Array.from({ length: preset.size }, (_, index) => index);
  const ranks = Array.from({ length: preset.size }, () => 0);
  const steps: UnionFindStep[] = [];

  steps.push(createStep(preset, parents, ranks, 'initial', [1], -1, [], []));

  function findWithSteps(node: number, operationIndex: number): number {
    const path = [node];
    let current = node;

    while (parents[current] !== current) {
      current = parents[current] ?? current;
      path.push(current);
      steps.push(createStep(preset, parents, ranks, 'findPath', [2], operationIndex, [node, current], path));
    }

    const root = current;
    for (let index = 0; index < path.length - 1; index += 1) {
      const pathNode = path[index];
      if (parents[pathNode] !== root) {
        parents[pathNode] = root;
        steps.push(createStep(preset, parents, ranks, 'compressPath', [3], operationIndex, [pathNode, root], path));
      }
    }

    return root;
  }

  preset.operations.forEach((operation, operationIndex) => {
    const activeNodes = operation.type === 'union' ? [operation.a, operation.b] : [operation.a];
    steps.push(createStep(preset, parents, ranks, 'operationStart', [1], operationIndex, activeNodes, []));

    if (operation.type === 'find') {
      findWithSteps(operation.a, operationIndex);
      return;
    }

    const rootA = findWithSteps(operation.a, operationIndex);
    const rootB = findWithSteps(operation.b, operationIndex);
    if (rootA === rootB) {
      return;
    }

    if ((ranks[rootA] ?? 0) < (ranks[rootB] ?? 0)) {
      parents[rootA] = rootB;
    } else if ((ranks[rootA] ?? 0) > (ranks[rootB] ?? 0)) {
      parents[rootB] = rootA;
    } else {
      parents[rootB] = rootA;
      ranks[rootA] = (ranks[rootA] ?? 0) + 1;
    }

    steps.push(createStep(preset, parents, ranks, 'linkRoots', [4], operationIndex, [rootA, rootB], []));
  });

  steps.push(createStep(preset, parents, ranks, 'completed', [5], preset.operations.length - 1, [], []));
  return steps;
}
