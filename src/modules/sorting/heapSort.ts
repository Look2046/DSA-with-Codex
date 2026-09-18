import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type HeapSortAction =
  | 'initial'
  | 'heapifyStart'
  | 'compare'
  | 'swap'
  | 'heapBuilt'
  | 'extractMax'
  | 'sortedLock'
  | 'completed';
export type HeapSortPhase = 'build' | 'sort' | 'completed';

export type HeapSortStep = AnimationStep & {
  arrayState: number[];
  action: HeapSortAction;
  phase: HeapSortPhase;
  heapSize: number;
  indices: number[];
  pathIndices: number[];
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

function pathToIndex(index: number): number[] {
  const path: number[] = [];
  let currentIndex: number | null = index;

  while (currentIndex !== null) {
    path.push(currentIndex);
    currentIndex = parentIndex(currentIndex);
  }

  return path.reverse();
}

function createPathHighlights(
  pathIndices: number[],
  indices: number[],
  type: 'comparing' | 'swapping',
): HighlightEntry[] {
  const activeSet = new Set(indices);
  const highlights: HighlightEntry[] = pathIndices
    .filter((index) => !activeSet.has(index))
    .map((index) => ({ index, type: 'visiting' as const }));

  indices.forEach((index) => {
    highlights.push({ index, type });
  });

  return highlights;
}

function createStep(
  arrayState: number[],
  action: HeapSortAction,
  phase: HeapSortPhase,
  heapSize: number,
  codeLines: number[],
  highlights: HighlightEntry[],
  indices: number[],
  pathIndices: number[],
): HeapSortStep {
  return {
    description: '',
    codeLines: [...codeLines],
    highlights: cloneHighlights(highlights),
    arrayState: cloneArray(arrayState),
    action,
    phase,
    heapSize,
    indices: [...indices],
    pathIndices: [...pathIndices],
  };
}

function swapValues(arrayState: number[], leftIndex: number, rightIndex: number): void {
  [arrayState[leftIndex], arrayState[rightIndex]] = [arrayState[rightIndex], arrayState[leftIndex]];
}

export function generateHeapSortSteps(input: number[]): HeapSortStep[] {
  const arrayState = cloneArray(input);
  const steps: HeapSortStep[] = [];
  const total = arrayState.length;

  steps.push(createStep(arrayState, 'initial', 'build', total, [1], [], [], []));

  if (total <= 1) {
    steps.push(
      createStep(
        arrayState,
        'completed',
        'completed',
        0,
        [11],
        arrayState.map((_, index) => ({ index, type: 'sorted' as const })),
        [],
        [],
      ),
    );
    return steps;
  }

  for (let startIndex = Math.floor(total / 2) - 1; startIndex >= 0; startIndex -= 1) {
    let currentIndex = startIndex;
    steps.push(
      createStep(
        arrayState,
        'heapifyStart',
        'build',
        total,
        [2, 3],
        [{ index: currentIndex, type: 'comparing' }],
        [currentIndex],
        pathToIndex(currentIndex),
      ),
    );

    while (true) {
      const leftIndex = leftChildIndex(currentIndex);
      if (leftIndex >= total) {
        break;
      }

      const rightIndex = rightChildIndex(currentIndex);
      const largerChildIndex =
        rightIndex < total && arrayState[rightIndex] > arrayState[leftIndex] ? rightIndex : leftIndex;
      const comparePath = pathToIndex(largerChildIndex);

      steps.push(
        createStep(
          arrayState,
          'compare',
          'build',
          total,
          [4],
          createPathHighlights(comparePath, [currentIndex, largerChildIndex], 'comparing'),
          [currentIndex, largerChildIndex],
          comparePath,
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
          'swap',
          'build',
          total,
          [5],
          createPathHighlights(swappedPath, [currentIndex, largerChildIndex], 'swapping'),
          [currentIndex, largerChildIndex],
          swappedPath,
        ),
      );

      currentIndex = largerChildIndex;
    }
  }

  steps.push(createStep(arrayState, 'heapBuilt', 'build', total, [6], [{ index: 0, type: 'comparing' }], [0], [0]));

  for (let endIndex = total - 1; endIndex > 0; endIndex -= 1) {
    // Extract the max: swap the heap root (index 0) with the last element of
    // the current unsorted region (index endIndex). The max now sits at the
    // boundary and will be locked into the sorted suffix on the next beat.
    swapValues(arrayState, 0, endIndex);

    // Beat 1 — extractMax: animate the swap between the root and the last
    // heap node. Both nodes are still part of the heap (heapSize = endIndex + 1)
    // so the swap is fully visible in the tree — no separate "sorted sequence".
    steps.push(
      createStep(
        arrayState,
        'extractMax',
        'sort',
        endIndex + 1,
        [7, 8],
        [
          { index: 0, type: 'swapping' },
          { index: endIndex, type: 'swapping' },
        ],
        [0, endIndex],
        [],
      ),
    );

    // Beat 2 — sortedLock: the heap shrinks by one. The node formerly at the
    // end of the region leaves the tree and is rendered in the sorted suffix,
    // so the unsorted region visibly shrinks.
    steps.push(
      createStep(
        arrayState,
        'sortedLock',
        'sort',
        endIndex,
        [8],
        [
          { index: endIndex, type: 'sorted' },
          { index: 0, type: 'comparing' },
        ],
        [endIndex, 0],
        [],
      ),
    );

    let currentIndex = 0;

    while (true) {
      const leftIndex = leftChildIndex(currentIndex);
      if (leftIndex >= endIndex) {
        break;
      }

      const rightIndex = rightChildIndex(currentIndex);
      const largerChildIndex =
        rightIndex < endIndex && arrayState[rightIndex] > arrayState[leftIndex] ? rightIndex : leftIndex;
      const comparePath = pathToIndex(largerChildIndex);

      steps.push(
        createStep(
          arrayState,
          'compare',
          'sort',
          endIndex,
          [9],
          createPathHighlights(comparePath, [currentIndex, largerChildIndex], 'comparing'),
          [currentIndex, largerChildIndex],
          comparePath,
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
          'swap',
          'sort',
          endIndex,
          [10],
          createPathHighlights(swappedPath, [currentIndex, largerChildIndex], 'swapping'),
          [currentIndex, largerChildIndex],
          swappedPath,
        ),
      );

      currentIndex = largerChildIndex;
    }
  }

  steps.push(
    createStep(
      arrayState,
      'completed',
      'completed',
      0,
      [11],
      arrayState.map((_, index) => ({ index, type: 'sorted' as const })),
      [],
      [],
    ),
  );

  return steps;
}
