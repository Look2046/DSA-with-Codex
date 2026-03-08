import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type QuickSortStep = AnimationStep & {
  arrayState: number[];
  action:
    | 'initial'
    | 'partitionStart'
    | 'pivotLift'
    | 'scanRight'
    | 'fillLeft'
    | 'scanLeft'
    | 'fillRight'
    | 'pivotPlace'
    | 'rangeSorted'
    | 'completed';
  indices: number[];
  low: number | null;
  high: number | null;
  pivotIndex: number | null;
  pivotValue: number | null;
  i: number | null;
  j: number | null;
  holeIndex: number | null;
  pivotLifted: boolean;
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

function createStep(
  action: QuickSortStep['action'],
  arrayState: number[],
  codeLines: number[],
  highlights: HighlightEntry[],
  indices: number[],
  meta: Pick<QuickSortStep, 'low' | 'high' | 'pivotIndex' | 'pivotValue' | 'i' | 'j' | 'holeIndex' | 'pivotLifted'>,
): QuickSortStep {
  return {
    description: '',
    codeLines,
    highlights,
    arrayState: cloneArray(arrayState),
    action,
    indices,
    ...meta,
  };
}

export function generateQuickSortSteps(input: number[]): QuickSortStep[] {
  const arr = cloneArray(input);
  const steps: QuickSortStep[] = [];
  const n = arr.length;
  const sortedIndices = new Set<number>();

  steps.push(
    createStep('initial', arr, [1], [], [], {
      low: n > 0 ? 0 : null,
      high: n > 0 ? n - 1 : null,
      pivotIndex: null,
      pivotValue: null,
      i: null,
      j: null,
      holeIndex: null,
      pivotLifted: false,
    }),
  );

  if (n <= 1) {
    steps.push(
      createStep(
        'completed',
        arr,
        [9],
        arr.map((_, index) => ({ index, type: 'sorted' as const })),
        [],
        {
          low: null,
          high: null,
          pivotIndex: null,
          pivotValue: null,
          i: null,
          j: null,
          holeIndex: null,
          pivotLifted: false,
        },
      ),
    );
    return steps;
  }

  const sortRange = (low: number, high: number) => {
    if (low > high) {
      return;
    }

    if (low === high) {
      if (!sortedIndices.has(low)) {
        sortedIndices.add(low);
        steps.push(
          createStep('rangeSorted', arr, [2], [{ index: low, type: 'sorted' }], [low], {
            low,
            high,
            pivotIndex: low,
            pivotValue: arr[low],
            i: low,
            j: high,
            holeIndex: null,
            pivotLifted: false,
          }),
        );
      }
      return;
    }

    steps.push(
      createStep('partitionStart', arr, [1, 2], [], [low, high], {
        low,
        high,
        pivotIndex: low,
        pivotValue: arr[low],
        i: low,
        j: high,
        holeIndex: low,
        pivotLifted: false,
      }),
    );

    const pivotValue = arr[low];
    let left = low;
    let right = high;

    steps.push(
      createStep('pivotLift', arr, [3], [{ index: low, type: 'comparing' }], [low], {
        low,
        high,
        pivotIndex: null,
        pivotValue,
        i: left,
        j: right,
        holeIndex: low,
        pivotLifted: true,
      }),
    );

    while (left < right) {
      while (left < right && arr[right] >= pivotValue) {
        steps.push(
          createStep('scanRight', arr, [4], [{ index: right, type: 'comparing' }], [right], {
            low,
            high,
            pivotIndex: null,
            pivotValue,
            i: left,
            j: right,
            holeIndex: left,
            pivotLifted: true,
          }),
        );
        right -= 1;
      }

      if (left < right) {
        const sourceIndex = right;
        const targetIndex = left;
        arr[targetIndex] = arr[sourceIndex];
        steps.push(
          createStep(
            'fillLeft',
            arr,
            [5],
            [
              { index: sourceIndex, type: 'moving' },
              { index: targetIndex, type: 'moving' },
            ],
            [sourceIndex, targetIndex],
            {
              low,
              high,
              pivotIndex: null,
              pivotValue,
              i: left,
              j: right,
              holeIndex: sourceIndex,
              pivotLifted: true,
            },
          ),
        );
        left += 1;
      }

      while (left < right && arr[left] <= pivotValue) {
        steps.push(
          createStep('scanLeft', arr, [6], [{ index: left, type: 'comparing' }], [left], {
            low,
            high,
            pivotIndex: null,
            pivotValue,
            i: left,
            j: right,
            holeIndex: right,
            pivotLifted: true,
          }),
        );
        left += 1;
      }

      if (left < right) {
        const sourceIndex = left;
        const targetIndex = right;
        arr[targetIndex] = arr[sourceIndex];
        steps.push(
          createStep(
            'fillRight',
            arr,
            [7],
            [
              { index: sourceIndex, type: 'moving' },
              { index: targetIndex, type: 'moving' },
            ],
            [sourceIndex, targetIndex],
            {
              low,
              high,
              pivotIndex: null,
              pivotValue,
              i: left,
              j: right,
              holeIndex: sourceIndex,
              pivotLifted: true,
            },
          ),
        );
        right -= 1;
      }
    }

    const pivotTarget = left;
    arr[pivotTarget] = pivotValue;
    steps.push(
      createStep('pivotPlace', arr, [8], [{ index: pivotTarget, type: 'moving' }], [pivotTarget], {
        low,
        high,
        pivotIndex: pivotTarget,
        pivotValue,
        i: left,
        j: right,
        holeIndex: null,
        pivotLifted: false,
      }),
    );

    sortedIndices.add(pivotTarget);
    steps.push(
      createStep('rangeSorted', arr, [8], [{ index: pivotTarget, type: 'sorted' }], [pivotTarget], {
        low,
        high,
        pivotIndex: pivotTarget,
        pivotValue,
        i: left,
        j: right,
        holeIndex: null,
        pivotLifted: false,
      }),
    );

    sortRange(low, pivotTarget - 1);
    sortRange(pivotTarget + 1, high);
  };

  sortRange(0, n - 1);

  steps.push(
    createStep(
      'completed',
      arr,
      [9],
      arr.map((_, index) => ({ index, type: 'sorted' as const })),
      [],
      {
        low: null,
        high: null,
        pivotIndex: null,
        pivotValue: null,
        i: null,
        j: null,
        holeIndex: null,
        pivotLifted: false,
      },
    ),
  );

  return steps;
}
