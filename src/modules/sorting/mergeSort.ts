import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type MergeSortStep = AnimationStep & {
  arrayState: number[];
  bufferState: Array<number | null>;
  action: 'initial' | 'split' | 'compare' | 'takeLeft' | 'takeRight' | 'writeBack' | 'rangeMerged' | 'completed';
  indices: number[];
  left: number | null;
  mid: number | null;
  right: number | null;
  i: number | null;
  j: number | null;
  k: number | null;
  sourceIndex: number | null;
  targetIndex: number | null;
};

type MergeStepMeta = Pick<MergeSortStep, 'left' | 'mid' | 'right' | 'i' | 'j' | 'k' | 'sourceIndex' | 'targetIndex'>;

function cloneArray(values: number[]): number[] {
  return [...values];
}

function cloneBuffer(values: Array<number | null>): Array<number | null> {
  return [...values];
}

function createStep(
  action: MergeSortStep['action'],
  arrayState: number[],
  bufferState: Array<number | null>,
  codeLines: number[],
  highlights: HighlightEntry[],
  indices: number[],
  meta: MergeStepMeta,
): MergeSortStep {
  return {
    description: '',
    codeLines,
    highlights,
    arrayState: cloneArray(arrayState),
    bufferState: cloneBuffer(bufferState),
    action,
    indices,
    ...meta,
  };
}

function pushInitialStep(
  steps: MergeSortStep[],
  arr: number[],
  n: number,
  createEmptyBuffer: () => Array<number | null>,
) {
  steps.push(
    createStep('initial', arr, createEmptyBuffer(), [1], [], [], {
      left: n > 0 ? 0 : null,
      mid: n > 0 ? Math.floor((n - 1) / 2) : null,
      right: n > 0 ? n - 1 : null,
      i: null,
      j: null,
      k: null,
      sourceIndex: null,
      targetIndex: null,
    }),
  );
}

function pushCompletedStep(
  steps: MergeSortStep[],
  arr: number[],
  createEmptyBuffer: () => Array<number | null>,
) {
  steps.push(
    createStep(
      'completed',
      arr,
      createEmptyBuffer(),
      [10],
      arr.map((_, index) => ({ index, type: 'sorted' as const })),
      [],
      {
        left: null,
        mid: null,
        right: null,
        i: null,
        j: null,
        k: null,
        sourceIndex: null,
        targetIndex: null,
      },
    ),
  );
}

function mergeRange(
  steps: MergeSortStep[],
  arr: number[],
  left: number,
  mid: number,
  right: number,
  createEmptyBuffer: () => Array<number | null>,
) {
  const buffer = createEmptyBuffer();
  const tempValues: number[] = [];
  let i = left;
  let j = mid + 1;
  let k = left;

  while (i <= mid && j <= right) {
    steps.push(
      createStep(
        'compare',
        arr,
        buffer,
        [4],
        [
          { index: i, type: 'comparing' },
          { index: j, type: 'comparing' },
        ],
        [i, j],
        {
          left,
          mid,
          right,
          i,
          j,
          k,
          sourceIndex: null,
          targetIndex: null,
        },
      ),
    );

    if (arr[i] <= arr[j]) {
      const sourceIndex = i;
      const targetIndex = k;
      const value = arr[i];
      buffer[targetIndex] = value;
      tempValues.push(value);

      steps.push(
        createStep(
          'takeLeft',
          arr,
          buffer,
          [5],
          [
            { index: sourceIndex, type: 'moving' },
            { index: targetIndex, type: 'moving' },
          ],
          [sourceIndex, targetIndex],
          {
            left,
            mid,
            right,
            i,
            j,
            k,
            sourceIndex,
            targetIndex,
          },
        ),
      );

      i += 1;
      k += 1;
    } else {
      const sourceIndex = j;
      const targetIndex = k;
      const value = arr[j];
      buffer[targetIndex] = value;
      tempValues.push(value);

      steps.push(
        createStep(
          'takeRight',
          arr,
          buffer,
          [6],
          [
            { index: sourceIndex, type: 'moving' },
            { index: targetIndex, type: 'moving' },
          ],
          [sourceIndex, targetIndex],
          {
            left,
            mid,
            right,
            i,
            j,
            k,
            sourceIndex,
            targetIndex,
          },
        ),
      );

      j += 1;
      k += 1;
    }
  }

  while (i <= mid) {
    const sourceIndex = i;
    const targetIndex = k;
    const value = arr[i];
    buffer[targetIndex] = value;
    tempValues.push(value);

    steps.push(
      createStep(
        'takeLeft',
        arr,
        buffer,
        [7],
        [
          { index: sourceIndex, type: 'moving' },
          { index: targetIndex, type: 'moving' },
        ],
        [sourceIndex, targetIndex],
        {
          left,
          mid,
          right,
          i,
          j,
          k,
          sourceIndex,
          targetIndex,
        },
      ),
    );

    i += 1;
    k += 1;
  }

  while (j <= right) {
    const sourceIndex = j;
    const targetIndex = k;
    const value = arr[j];
    buffer[targetIndex] = value;
    tempValues.push(value);

    steps.push(
      createStep(
        'takeRight',
        arr,
        buffer,
        [8],
        [
          { index: sourceIndex, type: 'moving' },
          { index: targetIndex, type: 'moving' },
        ],
        [sourceIndex, targetIndex],
        {
          left,
          mid,
          right,
          i,
          j,
          k,
          sourceIndex,
          targetIndex,
        },
      ),
    );

    j += 1;
    k += 1;
  }

  for (let offset = 0; offset < tempValues.length; offset += 1) {
    const targetIndex = left + offset;
    arr[targetIndex] = tempValues[offset];
  }

  steps.push(
    createStep(
      'writeBack',
      arr,
      buffer,
      [9],
      tempValues.map((_, offset) => ({ index: left + offset, type: 'moving' as const })),
      [left, right],
      {
        left,
        mid,
        right,
        i: null,
        j: null,
        k: null,
        sourceIndex: null,
        targetIndex: null,
      },
    ),
  );

  steps.push(
    createStep('rangeMerged', arr, createEmptyBuffer(), [9], [], [left, right], {
      left,
      mid,
      right,
      i: null,
      j: null,
      k: null,
      sourceIndex: null,
      targetIndex: null,
    }),
  );
}

export function generateMergeSortSteps(input: number[]): MergeSortStep[] {
  const arr = cloneArray(input);
  const n = arr.length;
  const steps: MergeSortStep[] = [];
  const createEmptyBuffer = () => Array.from({ length: n }, () => null as number | null);

  pushInitialStep(steps, arr, n, createEmptyBuffer);

  if (n <= 1) {
    pushCompletedStep(steps, arr, createEmptyBuffer);
    return steps;
  }

  const sortRange = (left: number, right: number) => {
    if (left >= right) {
      return;
    }

    const mid = Math.floor((left + right) / 2);
    steps.push(
      createStep('split', arr, createEmptyBuffer(), [1, 2, 3], [], [left, mid, right], {
        left,
        mid,
        right,
        i: null,
        j: null,
        k: null,
        sourceIndex: null,
        targetIndex: null,
      }),
    );

    sortRange(left, mid);
    sortRange(mid + 1, right);
    mergeRange(steps, arr, left, mid, right, createEmptyBuffer);
  };

  sortRange(0, n - 1);
  pushCompletedStep(steps, arr, createEmptyBuffer);
  return steps;
}

export function generateMergeSortBottomUpSteps(input: number[]): MergeSortStep[] {
  const arr = cloneArray(input);
  const n = arr.length;
  const steps: MergeSortStep[] = [];
  const createEmptyBuffer = () => Array.from({ length: n }, () => null as number | null);

  pushInitialStep(steps, arr, n, createEmptyBuffer);

  if (n <= 1) {
    pushCompletedStep(steps, arr, createEmptyBuffer);
    return steps;
  }

  for (let width = 1; width < n; width *= 2) {
    const blockSize = width * 2;
    for (let left = 0; left < n; left += blockSize) {
      const mid = Math.min(left + width - 1, n - 1);
      const right = Math.min(left + blockSize - 1, n - 1);

      if (mid >= right) {
        continue;
      }

      steps.push(
        createStep('split', arr, createEmptyBuffer(), [2, 3], [], [left, mid, right], {
          left,
          mid,
          right,
          i: null,
          j: null,
          k: null,
          sourceIndex: null,
          targetIndex: null,
        }),
      );

      mergeRange(steps, arr, left, mid, right, createEmptyBuffer);
    }
  }

  pushCompletedStep(steps, arr, createEmptyBuffer);
  return steps;
}
