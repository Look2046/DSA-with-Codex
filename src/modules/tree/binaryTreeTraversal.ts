import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type BinaryTreeTraversalMode = 'preorder' | 'inorder' | 'postorder' | 'levelorder';
export type BinaryTreeInputValue = number | null;

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
  treeState: BinaryTreeInputValue[];
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

function cloneArray<T>(values: T[]): T[] {
  return [...values];
}

function cloneGuideEvents(events: BinaryTreeGuideEvent[]): BinaryTreeGuideEvent[] {
  return events.map((event) => ({ ...event }));
}

type CreateTraversalStepConfig = {
  action: BinaryTreeTraversalStep['action'];
  treeState: BinaryTreeInputValue[];
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

function hasRealNode(tree: BinaryTreeInputValue[], index: number): boolean {
  return index >= 0 && index < tree.length && tree[index] !== null;
}

function getNodeValue(tree: BinaryTreeInputValue[], index: number): number {
  const value = tree[index];
  if (value === null || value === undefined) {
    throw new Error(`Missing tree node at index ${index}`);
  }
  return value;
}

function collectPreorderIndices(tree: BinaryTreeInputValue[]): number[] {
  const order: number[] = [];

  const traverse = (index: number) => {
    if (!hasRealNode(tree, index)) {
      return;
    }
    order.push(index);
    traverse(index * 2 + 1);
    traverse(index * 2 + 2);
  };

  traverse(0);
  return order;
}

function collectInorderIndices(tree: BinaryTreeInputValue[]): number[] {
  const order: number[] = [];

  const traverse = (index: number) => {
    if (!hasRealNode(tree, index)) {
      return;
    }
    traverse(index * 2 + 1);
    order.push(index);
    traverse(index * 2 + 2);
  };

  traverse(0);
  return order;
}

function collectPostorderIndices(tree: BinaryTreeInputValue[]): number[] {
  const order: number[] = [];

  const traverse = (index: number) => {
    if (!hasRealNode(tree, index)) {
      return;
    }
    traverse(index * 2 + 1);
    traverse(index * 2 + 2);
    order.push(index);
  };

  traverse(0);
  return order;
}

function collectLevelorderIndices(tree: BinaryTreeInputValue[]): number[] {
  if (!hasRealNode(tree, 0)) {
    return [];
  }

  const order: number[] = [];
  const queue: number[] = [0];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || !hasRealNode(tree, current)) {
      continue;
    }

    order.push(current);

    const left = current * 2 + 1;
    const right = current * 2 + 2;

    if (hasRealNode(tree, left)) {
      queue.push(left);
    }
    if (hasRealNode(tree, right)) {
      queue.push(right);
    }
  }

  return order;
}

function collectTraversalIndices(tree: BinaryTreeInputValue[], mode: BinaryTreeTraversalMode): number[] {
  if (mode === 'preorder') {
    return collectPreorderIndices(tree);
  }
  if (mode === 'inorder') {
    return collectInorderIndices(tree);
  }
  if (mode === 'postorder') {
    return collectPostorderIndices(tree);
  }
  return collectLevelorderIndices(tree);
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

function generateSimpleTraversalSteps(tree: BinaryTreeInputValue[], mode: BinaryTreeTraversalMode): BinaryTreeTraversalStep[] {
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

  if (!hasRealNode(tree, 0)) {
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
  const traversalIndices = collectTraversalIndices(tree, mode);

  traversalIndices.forEach((index) => {
    const value = getNodeValue(tree, index);
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
        guideRoleL: hasRealNode(tree, leftIndex) ? leftIndex : null,
        guideRoleR: hasRealNode(tree, rightIndex) ? rightIndex : null,
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

function generatePreorderGuideSteps(tree: BinaryTreeInputValue[]): BinaryTreeTraversalStep[] {
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

  if (!hasRealNode(tree, 0)) {
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
    if (!hasRealNode(tree, index)) {
      return;
    }

    const value = getNodeValue(tree, index);
    const leftIndex = index * 2 + 1;
    const rightIndex = index * 2 + 2;
    const hasLeftChild = hasRealNode(tree, leftIndex);
    const hasRightChild = hasRealNode(tree, rightIndex);

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
        guideRoleL: hasLeftChild ? leftIndex : null,
        guideRoleR: hasRightChild ? rightIndex : null,
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
        guideRoleL: hasLeftChild ? leftIndex : null,
        guideRoleR: hasRightChild ? rightIndex : null,
      });
    }

    if (hasLeftChild) {
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
        guideRoleR: hasRightChild ? rightIndex : null,
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
        guideRoleR: hasRightChild ? rightIndex : null,
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
        guideRoleR: hasRightChild ? rightIndex : null,
        guideNull: { parentIndex: index, side: 'L' },
      });
    }

    if (hasRightChild) {
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
        guideRoleL: hasLeftChild ? leftIndex : null,
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
        guideRoleL: hasLeftChild ? leftIndex : null,
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
        guideRoleL: hasLeftChild ? leftIndex : null,
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

function generateInorderGuideSteps(tree: BinaryTreeInputValue[]): BinaryTreeTraversalStep[] {
  const mode: BinaryTreeTraversalMode = 'inorder';
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

  if (!hasRealNode(tree, 0)) {
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
    if (!hasRealNode(tree, index)) {
      return;
    }

    const value = getNodeValue(tree, index);
    const leftIndex = index * 2 + 1;
    const rightIndex = index * 2 + 2;
    const hasLeftChild = hasRealNode(tree, leftIndex);
    const hasRightChild = hasRealNode(tree, rightIndex);

    if (parentIndex === null) {
      const eventIndex = pushGuideEvent({ type: 'start', toIndex: index });
      pushStep({
        action: 'guideStart',
        codeLines: [5],
        highlights: [{ index, type: 'visiting' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: eventIndex,
        guideRoleD: index,
        guideRoleL: hasLeftChild ? leftIndex : null,
        guideRoleR: hasRightChild ? rightIndex : null,
      });
    } else {
      const moveSide: BinaryTreeGuideMoveSide = entrySide === 'L' ? 'L' : 'R';
      const eventIndex = pushGuideEvent({
        type: 'move',
        fromIndex: parentIndex,
        toIndex: index,
        side: moveSide,
      });
      pushStep({
        action: entrySide === 'L' ? 'descendLeft' : 'descendRight',
        codeLines: [5],
        highlights: [
          { index: parentIndex, type: 'visiting' },
          { index, type: 'visiting' },
        ],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: eventIndex,
        guideRoleD: index,
        guideRoleL: hasLeftChild ? leftIndex : null,
        guideRoleR: hasRightChild ? rightIndex : null,
      });
    }

    if (hasLeftChild) {
      traverse(leftIndex, index, 'L');
      const eventIndex = pushGuideEvent({ type: 'move', fromIndex: leftIndex, toIndex: index, side: 'UP' });
      visitedIndices.push(index);
      outputOrder.push(value);
      pushStep({
        action: 'visit',
        codeLines: [5],
        highlights: [
          { index: leftIndex, type: 'visiting' },
          { index, type: 'visiting' },
        ],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: eventIndex,
        guideRoleD: index,
        guideRoleL: leftIndex,
        guideRoleR: hasRightChild ? rightIndex : null,
      });
    } else {
      const toNullEventIndex = pushGuideEvent({ type: 'toNull', fromIndex: index, side: 'L' });
      pushStep({
        action: 'nullLeft',
        codeLines: [5],
        highlights: [{ index, type: 'comparing' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: toNullEventIndex,
        guideRoleD: index,
        guideRoleL: null,
        guideRoleR: hasRightChild ? rightIndex : null,
        guideNull: { parentIndex: index, side: 'L' },
      });

      const fromNullEventIndex = pushGuideEvent({ type: 'fromNull', toIndex: index, side: 'L' });
      visitedIndices.push(index);
      outputOrder.push(value);
      pushStep({
        action: 'visit',
        codeLines: [5],
        highlights: [{ index, type: 'visiting' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: fromNullEventIndex,
        guideRoleD: index,
        guideRoleL: null,
        guideRoleR: hasRightChild ? rightIndex : null,
        guideNull: { parentIndex: index, side: 'L' },
      });
    }

    if (hasRightChild) {
      traverse(rightIndex, index, 'R');
      const eventIndex = pushGuideEvent({ type: 'move', fromIndex: rightIndex, toIndex: index, side: 'UP' });
      pushStep({
        action: 'backtrack',
        codeLines: [5],
        highlights: [
          { index: rightIndex, type: 'visiting' },
          { index, type: 'comparing' },
        ],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: eventIndex,
        guideRoleD: index,
        guideRoleL: hasLeftChild ? leftIndex : null,
        guideRoleR: rightIndex,
      });
    } else {
      const toNullEventIndex = pushGuideEvent({ type: 'toNull', fromIndex: index, side: 'R' });
      pushStep({
        action: 'nullRight',
        codeLines: [5],
        highlights: [{ index, type: 'comparing' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: toNullEventIndex,
        guideRoleD: index,
        guideRoleL: hasLeftChild ? leftIndex : null,
        guideRoleR: null,
        guideNull: { parentIndex: index, side: 'R' },
      });

      const fromNullEventIndex = pushGuideEvent({ type: 'fromNull', toIndex: index, side: 'R' });
      pushStep({
        action: 'backtrackFromNull',
        codeLines: [5],
        highlights: [{ index, type: 'comparing' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: fromNullEventIndex,
        guideRoleD: index,
        guideRoleL: hasLeftChild ? leftIndex : null,
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

function generatePostorderGuideSteps(tree: BinaryTreeInputValue[]): BinaryTreeTraversalStep[] {
  const mode: BinaryTreeTraversalMode = 'postorder';
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

  if (!hasRealNode(tree, 0)) {
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
    if (!hasRealNode(tree, index)) {
      return;
    }

    const value = getNodeValue(tree, index);
    const leftIndex = index * 2 + 1;
    const rightIndex = index * 2 + 2;
    const hasLeftChild = hasRealNode(tree, leftIndex);
    const hasRightChild = hasRealNode(tree, rightIndex);

    if (parentIndex === null) {
      const eventIndex = pushGuideEvent({ type: 'start', toIndex: index });
      pushStep({
        action: 'guideStart',
        codeLines: [6],
        highlights: [{ index, type: 'visiting' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: eventIndex,
        guideRoleD: index,
        guideRoleL: hasLeftChild ? leftIndex : null,
        guideRoleR: hasRightChild ? rightIndex : null,
      });
    } else {
      const moveSide: BinaryTreeGuideMoveSide = entrySide === 'L' ? 'L' : 'R';
      const eventIndex = pushGuideEvent({
        type: 'move',
        fromIndex: parentIndex,
        toIndex: index,
        side: moveSide,
      });
      pushStep({
        action: entrySide === 'L' ? 'descendLeft' : 'descendRight',
        codeLines: [6],
        highlights: [
          { index: parentIndex, type: 'visiting' },
          { index, type: 'visiting' },
        ],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: eventIndex,
        guideRoleD: index,
        guideRoleL: hasLeftChild ? leftIndex : null,
        guideRoleR: hasRightChild ? rightIndex : null,
      });
    }

    if (hasLeftChild) {
      traverse(leftIndex, index, 'L');
      const eventIndex = pushGuideEvent({ type: 'move', fromIndex: leftIndex, toIndex: index, side: 'UP' });
      pushStep({
        action: 'backtrack',
        codeLines: [6],
        highlights: [
          { index: leftIndex, type: 'visiting' },
          { index, type: 'comparing' },
        ],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: eventIndex,
        guideRoleD: index,
        guideRoleL: leftIndex,
        guideRoleR: hasRightChild ? rightIndex : null,
      });
    } else {
      const toNullEventIndex = pushGuideEvent({ type: 'toNull', fromIndex: index, side: 'L' });
      pushStep({
        action: 'nullLeft',
        codeLines: [6],
        highlights: [{ index, type: 'comparing' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: toNullEventIndex,
        guideRoleD: index,
        guideRoleL: null,
        guideRoleR: hasRightChild ? rightIndex : null,
        guideNull: { parentIndex: index, side: 'L' },
      });

      const fromNullEventIndex = pushGuideEvent({ type: 'fromNull', toIndex: index, side: 'L' });
      pushStep({
        action: 'backtrackFromNull',
        codeLines: [6],
        highlights: [{ index, type: 'comparing' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: fromNullEventIndex,
        guideRoleD: index,
        guideRoleL: null,
        guideRoleR: hasRightChild ? rightIndex : null,
        guideNull: { parentIndex: index, side: 'L' },
      });
    }

    if (hasRightChild) {
      traverse(rightIndex, index, 'R');
      const eventIndex = pushGuideEvent({ type: 'move', fromIndex: rightIndex, toIndex: index, side: 'UP' });
      visitedIndices.push(index);
      outputOrder.push(value);
      pushStep({
        action: 'visit',
        codeLines: [6],
        highlights: [
          { index: rightIndex, type: 'visiting' },
          { index, type: 'visiting' },
        ],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: eventIndex,
        guideRoleD: index,
        guideRoleL: hasLeftChild ? leftIndex : null,
        guideRoleR: rightIndex,
      });
    } else {
      const toNullEventIndex = pushGuideEvent({ type: 'toNull', fromIndex: index, side: 'R' });
      pushStep({
        action: 'nullRight',
        codeLines: [6],
        highlights: [{ index, type: 'comparing' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: toNullEventIndex,
        guideRoleD: index,
        guideRoleL: hasLeftChild ? leftIndex : null,
        guideRoleR: null,
        guideNull: { parentIndex: index, side: 'R' },
      });

      const fromNullEventIndex = pushGuideEvent({ type: 'fromNull', toIndex: index, side: 'R' });
      visitedIndices.push(index);
      outputOrder.push(value);
      pushStep({
        action: 'visit',
        codeLines: [6],
        highlights: [{ index, type: 'visiting' }],
        currentIndex: index,
        currentValue: value,
        activeGuideEventIndex: fromNullEventIndex,
        guideRoleD: index,
        guideRoleL: hasLeftChild ? leftIndex : null,
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

export function generateBinaryTreeTraversalSteps(input: BinaryTreeInputValue[], mode: BinaryTreeTraversalMode): BinaryTreeTraversalStep[] {
  const tree = cloneArray(input);

  if (mode === 'preorder') {
    return generatePreorderGuideSteps(tree);
  }

  if (mode === 'inorder') {
    return generateInorderGuideSteps(tree);
  }

  if (mode === 'postorder') {
    return generatePostorderGuideSteps(tree);
  }

  return generateSimpleTraversalSteps(tree, mode);
}
