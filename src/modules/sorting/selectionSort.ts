import type { AnimationStep } from '../../types/animation';

export type SelectionSortStep = AnimationStep & {
  arrayState: number[];
  action: 'initial' | 'selectCandidate' | 'compare' | 'newMin' | 'swap' | 'sortedMark' | 'completed';
  indices: number[];
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

export function generateSelectionSortSteps(input: number[]): SelectionSortStep[] {
  const arr = cloneArray(input);
  const steps: SelectionSortStep[] = [];
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
      codeLines: [9],
      highlights: arr.map((_, index) => ({ index, type: 'sorted' as const })),
      arrayState: cloneArray(arr),
      action: 'completed',
      indices: [],
    });
    return steps;
  }

  for (let i = 0; i < n - 1; i += 1) {
    let minIndex = i;
    steps.push({
      description: '',
      codeLines: [2],
      highlights: [{ index: minIndex, type: 'comparing' }],
      arrayState: cloneArray(arr),
      action: 'selectCandidate',
      indices: [minIndex],
    });

    for (let j = i + 1; j < n; j += 1) {
      steps.push({
        description: '',
        codeLines: [4],
        highlights: [
          { index: j, type: 'comparing' },
          { index: minIndex, type: 'comparing' },
        ],
        arrayState: cloneArray(arr),
        action: 'compare',
        indices: [j, minIndex],
      });

      if (arr[j] < arr[minIndex]) {
        minIndex = j;
        steps.push({
          description: '',
          codeLines: [5],
          highlights: [{ index: minIndex, type: 'comparing' }],
          arrayState: cloneArray(arr),
          action: 'newMin',
          indices: [minIndex],
        });
      }
    }

    if (minIndex !== i) {
      [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
      steps.push({
        description: '',
        codeLines: [7],
        highlights: [
          { index: i, type: 'swapping' },
          { index: minIndex, type: 'swapping' },
        ],
        arrayState: cloneArray(arr),
        action: 'swap',
        indices: [i, minIndex],
      });
    }

    steps.push({
      description: '',
      codeLines: [8],
      highlights: [{ index: i, type: 'sorted' }],
      arrayState: cloneArray(arr),
      action: 'sortedMark',
      indices: [i],
    });
  }

  const sortedHighlights = arr.map((_, index) => ({ index, type: 'sorted' as const }));
  steps.push({
    description: '',
    codeLines: [9],
    highlights: sortedHighlights,
    arrayState: cloneArray(arr),
    action: 'completed',
    indices: [],
  });

  return steps;
}
