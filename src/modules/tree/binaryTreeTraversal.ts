import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type BinaryTreeTraversalMode = 'preorder' | 'inorder' | 'postorder' | 'levelorder';

export type BinaryTreeGuideMoveSide = 'L' | 'R' | 'UP';

export type BinaryTreeGuideEvent =
  | { type: 'start'; toIndex: number }
  | { type: 'move'; fromIndex: number; toIndex: number; side: BinaryTreeGuideMoveSide }
  | { type: 'toNull'; fromIndex: number; side: 'L' | 'R' }
  | { type: 'fromNull'; toIndex: number; side: 'L' | 'R' };

export type BinaryTreeGuideNullHint = {
  parentIndex: number;
  side: 'L' | 'R';
};

export type BinaryTreeTraversalStep = AnimationStep & {
  treeState: number[];
  action:
    | 'initial'
    | 'guideStart'
    | 'visit'
    | 'descendLeft'
    | 'descendRight'
    | 'nullLeft'
    | 'nullRight'
    | 'backtrack'
    | 'backtrackFromNull'
    | 'traversalDone'
    | 'completed';
  mode: BinaryTreeTraversalMode;
  currentIndex: number | null;
  currentValue: number | null;
  visitedIndices: number[];
  outputOrder: number[];
  guideEvents: BinaryTreeGuideEvent[];
  activeGuideEventIndex: number | null;
  guideRoleD: number | null;
  guideRoleL: number | null;
  guideRoleR: number | null;
  guideNull: BinaryTreeGuideNullHint | null;
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

function cloneGuideEvents(events: BinaryTreeGuideEvent[]): BinaryTreeGuideEvent[] {
  return events.map((event) => ({ ...event }));
}

type CreateTraversalStepConfig = {
  action: BinaryTreeTraversalStep['action'];
  treeState: number[];
  mode: BinaryTreeTraversalMode;
  codeLines: number[];
  highlights: HighlightEntry[];
  currentIndex: number | null;
  currentValue: number | null;
  visitedIndices: number[];
  outputOrder: number[];
  guideEvents?: BinaryTreeGuideEvent[];
  activeGuideEventIndex?: number | null;
  guideRoleD?: number | null;
  guideRoleL?: number | null;
  guideRoleR?: number | null;
  guideNull?: BinaryTreeGuideNullHint | null;
};

function createStep(config: CreateTraversalStepConfig): BinaryTreeTraversalStep {
  return {
    description: '',
    codeLines: cloneArray(config.codeLines),
    highlights: config.highlights.map((item) => ({ ...item })),
    treeState: cloneArray(config.treeState),
    action: config.action,
    mode: config.mode,
    currentIndex: config.currentIndex,
    currentValue: config.currentValue,
    visitedIndices: cloneArray(config.visitedIndices),
    outputOrder: cloneArray(config.outputOrder),
    guideEvents: cloneGuideEvents(config.guideEvents ?? []),
    activeGuideEventIndex: config.activeGuideEventIndex ?? null,
    guideRoleD: config.guideRoleD ?? null,
    guideRoleL: config.guideRoleL ?? null,
    guideRoleR: config.guideRoleR ?? null,
    guideNull: config.guideNull ? { ...config.guideNull } : null,
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

function generateSimpleTraversalSteps(tree: number[], mode: BinaryTreeTraversalMode): BinaryTreeTraversalStep[] {
  const steps: BinaryTreeTraversalStep[] = [];

  steps.push(
    createStep({
      action: 'initial',
      treeState: tree,
      mode,
      codeLines: [1, 2],
      highlights: [],
      currentIndex: null,
      currentValue: null,
      visitedIndices: [],
      outputOrder: [],
    }),
  );

  if (tree.length === 0) {
    steps.push(
      createStep({
        action: 'completed',
        treeState: tree,
        mode,
        codeLines: [9],
        highlights: [],
        currentIndex: null,
        currentValue: null,
        visitedIndices: [],
        outputOrder: [],
      }),
    );
    return steps;
  }

  const visitedIndices: number[] = [];
  const outputOrder: number[] = [];
  const traversalIndices = collectTraversalIndices(tree.length, mode);

  traversalIndices.forEach((index) => {
    const value = tree[index];
    const leftIndex = index * 2 + 1;
    const rightIndex = index * 2 + 2;

    visitedIndices.push(index);
    outputOrder.push(value);

    steps.push(
      createStep({
        action: 'visit',
        treeState: tree,
        mode,
        codeLines: getVisitCodeLines(mode),
        highlights: [{ index, type: 'visiting' }],
        currentIndex: index,
        currentValue: value,
        visitedIndices,
        outputOrder,
        guideRoleD: index,
        guideRoleL: leftIndex < tree.length ? leftIndex : null,
        guideRoleR: rightIndex < tree.length ? rightIndex : null,
      }),
    );
  });

  const doneHighlights = visitedIndices.map((index) => ({ index, type: 'matched' as const }));

  steps.push(
    createStep({
      action: 'traversalDone',
      treeState: tree,
      mode,
      codeLines: [8],
      highlights: doneHighlights,
      currentIndex: null,
      currentValue: null,
      visitedIndices,
      outputOrder,
    }),
  );
  steps.push(
    createStep({
      action: 'completed',
      treeState: tree,
      mode,
      codeLines: [9],
      highlights: doneHighlights,
      currentIndex: null,
      currentValue: null,
      visitedIndices,
      outputOrder,
    }),
  );

  return steps;
}

function generatePreorderGuideSteps(tree: number[]): BinaryTreeTraversalStep[] {
  const mode: BinaryTreeTraversalMode = 'preorder';
  const steps: BinaryTreeTraversalStep[] = [];
  const visitedIndices: number[] = [];
  const outputOrder: number[] = [];
  const guideEvents: BinaryTreeGuideEvent[] = [];

  const pushStep = (config: Omit<CreateTraversalStepConfig, 'treeState' | 'mode' | 'visitedIndices' | 'outputOrder'>) => {
    steps.push(
      createStep({
        ...config,
        treeState: tree,
        mode,
        visitedIndices,
        outputOrder,
        guideEvents,
      }),
    );
  };

  const pushGuideEvent = (event: BinaryTreeGuideEvent): number => {
    guideEvents.push(event);
    return guideEvents.length - 1;
  };

  pushStep({
    action: 'initial',
    codeLines: [1, 2],
    highlights: [],
    currentIndex: null,
    currentValue: null,
  });

  if (tree.length === 0) {
    pushStep({
      action: 'completed',
      codeLines: [9],
      highlights: [],
      currentIndex: null,
      currentValue: null,
    });
    return steps;
  }

  const traverse = (index: number, parentIndex: number | null, entrySide: 'L' | 'R' | 'ROOT') => {
    if (index >= tree.length) {
      return;
    }

    const value = tree[index];
    const leftIndex = index * 2 + 1;
    const rightIndex = index * 2 + 2;

    if (parentIndex === null) {
      const eventIndex = pushGuideEvent({ type: 'start', toIndex: index });
      visitedIndices.push(index);
      outputOrder.push(value);
      pushStep({
        action: 'guideStart',
        codeLines: [3],
        highlights: [{ index, type: 'visiting' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: eventIndex,
        guideRoleD: index,
        guideRoleL: leftIndex < tree.length ? leftIndex : null,
        guideRoleR: rightIndex < tree.length ? rightIndex : null,
      });
    } else {
      const moveSide: BinaryTreeGuideMoveSide = entrySide === 'L' ? 'L' : 'R';
      const eventIndex = pushGuideEvent({
        type: 'move',
        fromIndex: parentIndex,
        toIndex: index,
        side: moveSide,
      });
      visitedIndices.push(index);
      outputOrder.push(value);
      pushStep({
        action: entrySide === 'L' ? 'descendLeft' : 'descendRight',
        codeLines: [3],
        highlights: [
          { index: parentIndex, type: 'visiting' },
          { index, type: 'visiting' },
        ],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: eventIndex,
        guideRoleD: index,
        guideRoleL: leftIndex < tree.length ? leftIndex : null,
        guideRoleR: rightIndex < tree.length ? rightIndex : null,
      });
    }

    if (leftIndex < tree.length) {
      traverse(leftIndex, index, 'L');
      const eventIndex = pushGuideEvent({ type: 'move', fromIndex: leftIndex, toIndex: index, side: 'UP' });
      pushStep({
        action: 'backtrack',
        codeLines: [4],
        highlights: [
          { index: leftIndex, type: 'visiting' },
          { index, type: 'comparing' },
        ],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: eventIndex,
        guideRoleD: index,
        guideRoleL: leftIndex,
        guideRoleR: rightIndex < tree.length ? rightIndex : null,
      });
    } else {
      const toNullEventIndex = pushGuideEvent({ type: 'toNull', fromIndex: index, side: 'L' });
      pushStep({
        action: 'nullLeft',
        codeLines: [4],
        highlights: [{ index, type: 'comparing' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: toNullEventIndex,
        guideRoleD: index,
        guideRoleL: null,
        guideRoleR: rightIndex < tree.length ? rightIndex : null,
        guideNull: { parentIndex: index, side: 'L' },
      });

      const fromNullEventIndex = pushGuideEvent({ type: 'fromNull', toIndex: index, side: 'L' });
      pushStep({
        action: 'backtrackFromNull',
        codeLines: [4],
        highlights: [{ index, type: 'comparing' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: fromNullEventIndex,
        guideRoleD: index,
        guideRoleL: null,
        guideRoleR: rightIndex < tree.length ? rightIndex : null,
        guideNull: { parentIndex: index, side: 'L' },
      });
    }

    if (rightIndex < tree.length) {
      traverse(rightIndex, index, 'R');
      const eventIndex = pushGuideEvent({ type: 'move', fromIndex: rightIndex, toIndex: index, side: 'UP' });
      pushStep({
        action: 'backtrack',
        codeLines: [4],
        highlights: [
          { index: rightIndex, type: 'visiting' },
          { index, type: 'comparing' },
        ],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: eventIndex,
        guideRoleD: index,
        guideRoleL: leftIndex < tree.length ? leftIndex : null,
        guideRoleR: rightIndex,
      });
    } else {
      const toNullEventIndex = pushGuideEvent({ type: 'toNull', fromIndex: index, side: 'R' });
      pushStep({
        action: 'nullRight',
        codeLines: [4],
        highlights: [{ index, type: 'comparing' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: toNullEventIndex,
        guideRoleD: index,
        guideRoleL: leftIndex < tree.length ? leftIndex : null,
        guideRoleR: null,
        guideNull: { parentIndex: index, side: 'R' },
      });

      const fromNullEventIndex = pushGuideEvent({ type: 'fromNull', toIndex: index, side: 'R' });
      pushStep({
        action: 'backtrackFromNull',
        codeLines: [4],
        highlights: [{ index, type: 'comparing' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: fromNullEventIndex,
        guideRoleD: index,
        guideRoleL: leftIndex < tree.length ? leftIndex : null,
        guideRoleR: null,
        guideNull: { parentIndex: index, side: 'R' },
      });
    }
  };

  traverse(0, null, 'ROOT');

  const doneHighlights = visitedIndices.map((index) => ({ index, type: 'matched' as const }));

  pushStep({
    action: 'traversalDone',
    codeLines: [8],
    highlights: doneHighlights,
    currentIndex: null,
    currentValue: null,
  });

  pushStep({
    action: 'completed',
    codeLines: [9],
    highlights: doneHighlights,
    currentIndex: null,
    currentValue: null,
  });

  return steps;
}

export function generateBinaryTreeTraversalSteps(input: number[], mode: BinaryTreeTraversalMode): BinaryTreeTraversalStep[] {
  const tree = cloneArray(input);

  if (mode === 'preorder') {
    return generatePreorderGuideSteps(tree);
  }

  return generateSimpleTraversalSteps(tree, mode);
}
