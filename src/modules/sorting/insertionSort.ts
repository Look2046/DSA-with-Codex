import type { AnimationStep } from '../../types/animation';

export type InsertionSortStep = AnimationStep & {
  arrayState: number[];
  action: 'initial' | 'selectKey' | 'compare' | 'lift' | 'shift' | 'insert' | 'sortedMark' | 'completed';
  indices: number[];
  currentValue: number | null;
  holeIndex: number | null;
  keyLifted: boolean;
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

export function generateInsertionSortSteps(input: number[]): InsertionSortStep[] {
  const arr = cloneArray(input);
  const steps: InsertionSortStep[] = [];
  const n = arr.length;

  steps.push({
    description: '',
    codeLines: [1],
    highlights: [],
    arrayState: cloneArray(arr),
    action: 'initial',
    indices: [],
    currentValue: null,
    holeIndex: null,
    keyLifted: false,
  });

  if (n <= 1) {
    steps.push({
      description: '',
      codeLines: [9],
      highlights: arr.map((_, index) => ({ index, type: 'sorted' as const })),
      arrayState: cloneArray(arr),
      action: 'completed',
      indices: [],
      currentValue: null,
      holeIndex: null,
      keyLifted: false,
    });
    return steps;
  }

  for (let i = 1; i < n; i += 1) {
    const currentValue = arr[i];
    let j = i;

    steps.push({
      description: '',
      codeLines: [2, 3],
      highlights: [{ index: i, type: 'comparing' }],
      arrayState: cloneArray(arr),
      action: 'selectKey',
      indices: [i],
      currentValue,
      holeIndex: null,
      keyLifted: false,
    });

    steps.push({
      description: '',
      codeLines: [4],
      highlights: [
        { index: j - 1, type: 'comparing' },
        { index: j, type: 'comparing' },
      ],
      arrayState: cloneArray(arr),
      action: 'compare',
      indices: [j - 1, j],
      currentValue,
      holeIndex: null,
      keyLifted: false,
    });

    if (arr[j - 1] > currentValue) {
      steps.push({
        description: '',
        codeLines: [2, 3, 4],
        highlights: [{ index: j, type: 'new-node' }],
        arrayState: cloneArray(arr),
        action: 'lift',
        indices: [j],
        currentValue,
        holeIndex: j,
        keyLifted: true,
      });

      while (j > 0 && arr[j - 1] > currentValue) {
        const fromIndex = j - 1;
        const toIndex = j;
        arr[j] = arr[j - 1];
        steps.push({
          description: '',
          codeLines: [5, 6],
          highlights: [{ index: toIndex, type: 'moving' }],
          arrayState: cloneArray(arr),
          action: 'shift',
          indices: [fromIndex, toIndex],
          currentValue,
          holeIndex: fromIndex,
          keyLifted: true,
        });

        j -= 1;

        if (j > 0) {
          steps.push({
            description: '',
            codeLines: [4],
            highlights: [
              { index: j - 1, type: 'comparing' },
              { index: j, type: 'comparing' },
            ],
            arrayState: cloneArray(arr),
            action: 'compare',
            indices: [j - 1, j],
            currentValue,
            holeIndex: j,
            keyLifted: true,
          });
        }
      }

      arr[j] = currentValue;
      steps.push({
        description: '',
        codeLines: [7],
        highlights: [{ index: j, type: 'new-node' }],
        arrayState: cloneArray(arr),
        action: 'insert',
        indices: [j],
        currentValue,
        holeIndex: null,
        keyLifted: true,
      });
    }

    steps.push({
      description: '',
      codeLines: [8],
      highlights: Array.from({ length: i + 1 }, (_, index) => ({ index, type: 'sorted' as const })),
      arrayState: cloneArray(arr),
      action: 'sortedMark',
      indices: [i],
      currentValue: null,
      holeIndex: null,
      keyLifted: false,
    });
  }

  steps.push({
    description: '',
    codeLines: [9],
    highlights: arr.map((_, index) => ({ index, type: 'sorted' as const })),
    arrayState: cloneArray(arr),
    action: 'completed',
    indices: [],
    currentValue: null,
    holeIndex: null,
    keyLifted: false,
  });

  return steps;
}
