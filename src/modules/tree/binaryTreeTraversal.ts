import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type BinaryTreeTraversalMode = 'preorder' | 'inorder' | 'postorder' | 'levelorder';

export type BinaryTreeTraversalStep = AnimationStep & {
  treeState: number[];
  action: 'initial' | 'visit' | 'traversalDone' | 'completed';
  mode: BinaryTreeTraversalMode;
  currentIndex: number | null;
  currentValue: number | null;
  visitedIndices: number[];
  outputOrder: number[];
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

function createStep(
  action: BinaryTreeTraversalStep['action'],
  treeState: number[],
  mode: BinaryTreeTraversalMode,
  codeLines: number[],
  highlights: HighlightEntry[],
  currentIndex: number | null,
  currentValue: number | null,
  visitedIndices: number[],
  outputOrder: number[],
): BinaryTreeTraversalStep {
  return {
    description: '',
    codeLines,
    highlights,
    treeState: cloneArray(treeState),
    action,
    mode,
    currentIndex,
    currentValue,
    visitedIndices: cloneArray(visitedIndices),
    outputOrder: cloneArray(outputOrder),
  };
}

function collectPreorderIndices(length: number): number[] {
  const order: number[] = [];

  const traverse = (index: number) => {
    if (index >= length) {
      return;
    }
    order.push(index);
    traverse(index * 2 + 1);
    traverse(index * 2 + 2);
  };

  traverse(0);
  return order;
}

function collectInorderIndices(length: number): number[] {
  const order: number[] = [];

  const traverse = (index: number) => {
    if (index >= length) {
      return;
    }
    traverse(index * 2 + 1);
    order.push(index);
    traverse(index * 2 + 2);
  };

  traverse(0);
  return order;
}

function collectPostorderIndices(length: number): number[] {
  const order: number[] = [];

  const traverse = (index: number) => {
    if (index >= length) {
      return;
    }
    traverse(index * 2 + 1);
    traverse(index * 2 + 2);
    order.push(index);
  };

  traverse(0);
  return order;
}

function collectLevelorderIndices(length: number): number[] {
  if (length === 0) {
    return [];
  }

  const order: number[] = [];
  const queue: number[] = [0];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || current >= length) {
      continue;
    }

    order.push(current);

    const left = current * 2 + 1;
    const right = current * 2 + 2;

    if (left < length) {
      queue.push(left);
    }
    if (right < length) {
      queue.push(right);
    }
  }

  return order;
}

function collectTraversalIndices(length: number, mode: BinaryTreeTraversalMode): number[] {
  if (mode === 'preorder') {
    return collectPreorderIndices(length);
  }
  if (mode === 'inorder') {
    return collectInorderIndices(length);
  }
  if (mode === 'postorder') {
    return collectPostorderIndices(length);
  }
  return collectLevelorderIndices(length);
}

function getVisitCodeLines(mode: BinaryTreeTraversalMode): number[] {
  if (mode === 'preorder') {
    return [4];
  }
  if (mode === 'inorder') {
    return [5];
  }
  if (mode === 'postorder') {
    return [6];
  }
  return [7];
}

export function generateBinaryTreeTraversalSteps(input: number[], mode: BinaryTreeTraversalMode): BinaryTreeTraversalStep[] {
  const tree = cloneArray(input);
  const steps: BinaryTreeTraversalStep[] = [];

  steps.push(createStep('initial', tree, mode, [1, 2], [], null, null, [], []));

  if (tree.length === 0) {
    steps.push(createStep('completed', tree, mode, [9], [], null, null, [], []));
    return steps;
  }

  const visitedIndices: number[] = [];
  const outputOrder: number[] = [];
  const traversalIndices = collectTraversalIndices(tree.length, mode);

  traversalIndices.forEach((index) => {
    const value = tree[index];
    visitedIndices.push(index);
    outputOrder.push(value);

    steps.push(
      createStep(
        'visit',
        tree,
        mode,
        getVisitCodeLines(mode),
        [{ index, type: 'visiting' }],
        index,
        value,
        visitedIndices,
        outputOrder,
      ),
    );
  });

  const doneHighlights = visitedIndices.map((index) => ({ index, type: 'matched' as const }));
  steps.push(createStep('traversalDone', tree, mode, [8], doneHighlights, null, null, visitedIndices, outputOrder));
  steps.push(createStep('completed', tree, mode, [9], doneHighlights, null, null, visitedIndices, outputOrder));

  return steps;
}
