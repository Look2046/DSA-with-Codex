import type { AnimationStep } from '../../types/animation';

export type InsertionSortStep = AnimationStep & {
  arrayState: number[];
  action: 'initial' | 'selectKey' | 'compare' | 'swap' | 'sortedMark' | 'completed';
  indices: number[];
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
  });

  if (n <= 1) {
    steps.push({
      description: '',
      codeLines: [8],
      highlights: arr.map((_, index) => ({ index, type: 'sorted' as const })),
      arrayState: cloneArray(arr),
      action: 'completed',
      indices: [],
    });
    return steps;
  }

  for (let i = 1; i < n; i += 1) {
    let j = i;

    steps.push({
      description: '',
      codeLines: [2],
      highlights: [{ index: i, type: 'comparing' }],
      arrayState: cloneArray(arr),
      action: 'selectKey',
      indices: [i],
    });

    while (j > 0) {
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
      });

      if (arr[j - 1] <= arr[j]) {
        break;
      }

      [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
      steps.push({
        description: '',
        codeLines: [5],
        highlights: [
          { index: j - 1, type: 'swapping' },
          { index: j, type: 'swapping' },
        ],
        arrayState: cloneArray(arr),
        action: 'swap',
        indices: [j - 1, j],
      });

      j -= 1;
    }

    steps.push({
      description: '',
      codeLines: [6],
      highlights: Array.from({ length: i + 1 }, (_, index) => ({ index, type: 'sorted' as const })),
      arrayState: cloneArray(arr),
      action: 'sortedMark',
      indices: [i],
    });
  }

  steps.push({
    description: '',
    codeLines: [7],
    highlights: arr.map((_, index) => ({ index, type: 'sorted' as const })),
    arrayState: cloneArray(arr),
    action: 'completed',
    indices: [],
  });

  return steps;
}
