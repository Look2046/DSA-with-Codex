import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type HeapOperation = 'build' | 'insert' | 'extractRoot';
export type HeapOutcome = 'ongoing' | 'heapBuilt' | 'inserted' | 'extracted';

export type HeapStep = AnimationStep & {
  arrayState: number[];
  action: 'initial' | 'heapify' | 'append' | 'extractRoot' | 'compare' | 'swap' | 'removeLast' | 'completed';
  operation: HeapOperation;
  activeIndex: number | null;
  compareIndex: number | null;
  selectedIndex: number | null;
  pathIndices: number[];
  target: number | null;
  extractedValue: number | null;
  outcome: HeapOutcome;
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function parentIndex(index: number): number | null {
  if (index <= 0) {
    return null;
  }
  return Math.floor((index - 1) / 2);
}

function leftChildIndex(index: number): number {
  return index * 2 + 1;
}

function rightChildIndex(index: number): number {
  return index * 2 + 2;
}

function pathToIndex(index: number | null): number[] {
  if (index === null) {
    return [];
  }

  const path: number[] = [];
  let currentIndex: number | null = index;

  while (currentIndex !== null) {
    path.push(currentIndex);
    currentIndex = parentIndex(currentIndex);
  }

  return path.reverse();
}

function extendPath(path: number[], index: number | null): number[] {
  if (index === null || path.includes(index)) {
    return path;
  }
  return [...path, index];
}

function createPathHighlights(
  pathIndices: number[],
  activeIndex: number | null,
  compareIndex: number | null,
): HighlightEntry[] {
  const highlights: HighlightEntry[] = pathIndices
    .filter((index) => index !== activeIndex && index !== compareIndex)
    .map((index) => ({ index, type: 'visiting' as const }));

  if (activeIndex !== null) {
    highlights.push({ index: activeIndex, type: 'comparing' });
  }

  if (compareIndex !== null) {
    highlights.push({ index: compareIndex, type: 'comparing' });
  }

  return highlights;
}

function createStep(
  arrayState: number[],
  operation: HeapOperation,
  action: HeapStep['action'],
  codeLines: number[],
  highlights: HighlightEntry[],
  activeIndex: number | null,
  compareIndex: number | null,
  selectedIndex: number | null,
  pathIndices: number[],
  target: number | null,
  extractedValue: number | null,
  outcome: HeapOutcome,
): HeapStep {
  return {
    description: '',
    codeLines,
    highlights: cloneHighlights(highlights),
    arrayState: cloneArray(arrayState),
    action,
    operation,
    activeIndex,
    compareIndex,
    selectedIndex,
    pathIndices: [...pathIndices],
    target,
    extractedValue,
    outcome,
  };
}

function swapValues(arrayState: number[], leftIndex: number, rightIndex: number): void {
  [arrayState[leftIndex], arrayState[rightIndex]] = [arrayState[rightIndex], arrayState[leftIndex]];
}

function siftDownSilent(arrayState: number[], startIndex: number): void {
  let currentIndex = startIndex;

  while (true) {
    const leftIndex = leftChildIndex(currentIndex);
    if (leftIndex >= arrayState.length) {
      return;
    }

    const rightIndex = rightChildIndex(currentIndex);
    const nextIndex =
      rightIndex < arrayState.length && arrayState[rightIndex] > arrayState[leftIndex] ? rightIndex : leftIndex;

    if (arrayState[currentIndex] >= arrayState[nextIndex]) {
      return;
    }

    swapValues(arrayState, currentIndex, nextIndex);
    currentIndex = nextIndex;
  }
}

export function buildMaxHeapArray(values: number[]): number[] {
  const heap = cloneArray(values);

  for (let index = Math.floor(heap.length / 2) - 1; index >= 0; index -= 1) {
    siftDownSilent(heap, index);
  }

  return heap;
}

function runBuildOperation(steps: HeapStep[], arrayState: number[]): void {
  for (let startIndex = Math.floor(arrayState.length / 2) - 1; startIndex >= 0; startIndex -= 1) {
    const heapifyPath = pathToIndex(startIndex);
    steps.push(
      createStep(
        arrayState,
        'build',
        'heapify',
        [2],
        [{ index: startIndex, type: 'visiting' }],
        startIndex,
        null,
        null,
        heapifyPath,
        null,
        null,
        'ongoing',
      ),
    );

    let currentIndex = startIndex;

    while (true) {
      const leftIndex = leftChildIndex(currentIndex);
      if (leftIndex >= arrayState.length) {
        break;
      }

      const rightIndex = rightChildIndex(currentIndex);
      const largerChildIndex =
        rightIndex < arrayState.length && arrayState[rightIndex] > arrayState[leftIndex] ? rightIndex : leftIndex;
      const comparePath = extendPath(pathToIndex(currentIndex), largerChildIndex);

      steps.push(
        createStep(
          arrayState,
          'build',
          'compare',
          [3, 4],
          createPathHighlights(comparePath, currentIndex, largerChildIndex),
          currentIndex,
          largerChildIndex,
          largerChildIndex,
          comparePath,
          null,
          null,
          'ongoing',
        ),
      );

      if (arrayState[currentIndex] >= arrayState[largerChildIndex]) {
        break;
      }

      swapValues(arrayState, currentIndex, largerChildIndex);
      const swappedPath = pathToIndex(largerChildIndex);

      steps.push(
        createStep(
          arrayState,
          'build',
          'swap',
          [5],
          [
            { index: currentIndex, type: 'swapping' },
            { index: largerChildIndex, type: 'swapping' },
          ],
          largerChildIndex,
          currentIndex,
          largerChildIndex,
          swappedPath,
          null,
          null,
          'ongoing',
        ),
      );

      currentIndex = largerChildIndex;
    }
  }

  steps.push(
    createStep(
      arrayState,
      'build',
      'completed',
      [6],
      arrayState.length > 0 ? [{ index: 0, type: 'matched' }] : [],
      arrayState.length > 0 ? 0 : null,
      null,
      null,
      arrayState.length > 0 ? [0] : [],
      null,
      null,
      'heapBuilt',
    ),
  );
}

function runInsertOperation(steps: HeapStep[], arrayState: number[], target: number): void {
  arrayState.push(target);
  let currentIndex = arrayState.length - 1;

  steps.push(
    createStep(
      arrayState,
      'insert',
      'append',
      [2],
      [{ index: currentIndex, type: 'new-node' }],
      currentIndex,
      null,
      currentIndex,
      pathToIndex(currentIndex),
      target,
      null,
      'ongoing',
    ),
  );

  while (currentIndex > 0) {
    const currentParentIndex = parentIndex(currentIndex);
    if (currentParentIndex === null) {
      break;
    }

    const comparePath = pathToIndex(currentIndex);

    steps.push(
      createStep(
        arrayState,
        'insert',
        'compare',
        [3],
        createPathHighlights(comparePath, currentIndex, currentParentIndex),
        currentIndex,
        currentParentIndex,
        null,
        comparePath,
        target,
        null,
        'ongoing',
      ),
    );

    if (arrayState[currentIndex] <= arrayState[currentParentIndex]) {
      break;
    }

    swapValues(arrayState, currentIndex, currentParentIndex);
    const swappedPath = pathToIndex(currentParentIndex);

    steps.push(
      createStep(
        arrayState,
        'insert',
        'swap',
        [4],
        [
          { index: currentIndex, type: 'swapping' },
          { index: currentParentIndex, type: 'swapping' },
        ],
        currentParentIndex,
        currentIndex,
        null,
        swappedPath,
        target,
        null,
        'ongoing',
      ),
    );

    currentIndex = currentParentIndex;
  }

  steps.push(
    createStep(
      arrayState,
      'insert',
      'completed',
      [5],
      arrayState.length > 0 ? [{ index: currentIndex, type: 'matched' }] : [],
      currentIndex,
      null,
      null,
      pathToIndex(currentIndex),
      target,
      null,
      'inserted',
    ),
  );
}

function runExtractRootOperation(steps: HeapStep[], arrayState: number[]): void {
  if (arrayState.length === 0) {
    steps.push(
      createStep(arrayState, 'extractRoot', 'completed', [7], [], null, null, null, [], null, null, 'extracted'),
    );
    return;
  }

  const extractedValue = arrayState[0] ?? null;

  steps.push(
    createStep(
      arrayState,
      'extractRoot',
      'extractRoot',
      [2],
      [{ index: 0, type: 'matched' }],
      0,
      null,
      0,
      [0],
      null,
      extractedValue,
      'ongoing',
    ),
  );

  if (arrayState.length === 1) {
    arrayState.pop();
    steps.push(
      createStep(
        arrayState,
        'extractRoot',
        'removeLast',
        [4],
        [],
        null,
        null,
        null,
        [],
        null,
        extractedValue,
        'ongoing',
      ),
    );
    steps.push(
      createStep(
        arrayState,
        'extractRoot',
        'completed',
        [7],
        [],
        null,
        null,
        null,
        [],
        null,
        extractedValue,
        'extracted',
      ),
    );
    return;
  }

  const lastIndex = arrayState.length - 1;
  swapValues(arrayState, 0, lastIndex);

  steps.push(
    createStep(
      arrayState,
      'extractRoot',
      'swap',
      [3],
      [
        { index: 0, type: 'swapping' },
        { index: lastIndex, type: 'swapping' },
      ],
      0,
      lastIndex,
      lastIndex,
      [0, lastIndex],
      null,
      extractedValue,
      'ongoing',
    ),
  );

  arrayState.pop();

  steps.push(
    createStep(
      arrayState,
      'extractRoot',
      'removeLast',
      [4],
      arrayState.length > 0 ? [{ index: 0, type: 'visiting' }] : [],
      arrayState.length > 0 ? 0 : null,
      null,
      null,
      arrayState.length > 0 ? [0] : [],
      null,
      extractedValue,
      'ongoing',
    ),
  );

  let currentIndex = 0;

  while (true) {
    const leftIndex = leftChildIndex(currentIndex);
    if (leftIndex >= arrayState.length) {
      break;
    }

    const rightIndex = rightChildIndex(currentIndex);
    const largerChildIndex =
      rightIndex < arrayState.length && arrayState[rightIndex] > arrayState[leftIndex] ? rightIndex : leftIndex;
    const comparePath = extendPath(pathToIndex(currentIndex), largerChildIndex);

    steps.push(
      createStep(
        arrayState,
        'extractRoot',
        'compare',
        [5],
        createPathHighlights(comparePath, currentIndex, largerChildIndex),
        currentIndex,
        largerChildIndex,
        largerChildIndex,
        comparePath,
        null,
        extractedValue,
        'ongoing',
      ),
    );

    if (arrayState[currentIndex] >= arrayState[largerChildIndex]) {
      break;
    }

    swapValues(arrayState, currentIndex, largerChildIndex);
    const swappedPath = pathToIndex(largerChildIndex);

    steps.push(
      createStep(
        arrayState,
        'extractRoot',
        'swap',
        [6],
        [
          { index: currentIndex, type: 'swapping' },
          { index: largerChildIndex, type: 'swapping' },
        ],
        largerChildIndex,
        currentIndex,
        largerChildIndex,
        swappedPath,
        null,
        extractedValue,
        'ongoing',
      ),
    );

    currentIndex = largerChildIndex;
  }

  steps.push(
    createStep(
      arrayState,
      'extractRoot',
      'completed',
      [7],
      arrayState.length > 0 ? [{ index: 0, type: 'matched' }] : [],
      arrayState.length > 0 ? 0 : null,
      null,
      null,
      arrayState.length > 0 ? [0] : [],
      null,
      extractedValue,
      'extracted',
    ),
  );
}

export function generateHeapSteps(
  inputData: number[],
  operation: HeapOperation,
  target: number | null = null,
): HeapStep[] {
  const steps: HeapStep[] = [];
  const arrayState = operation === 'build' ? cloneArray(inputData) : buildMaxHeapArray(inputData);

  steps.push(
    createStep(
      arrayState,
      operation,
      'initial',
      [1],
      arrayState.length > 0 ? [{ index: 0, type: 'visiting' }] : [],
      arrayState.length > 0 ? 0 : null,
      null,
      null,
      arrayState.length > 0 ? [0] : [],
      target,
      null,
      'ongoing',
    ),
  );

  if (operation === 'build') {
    runBuildOperation(steps, arrayState);
    return steps;
  }

  if (operation === 'insert') {
    runInsertOperation(steps, arrayState, target ?? 0);
    return steps;
  }

  runExtractRootOperation(steps, arrayState);
  return steps;
}
