import type { AnimationStep } from '../../types/animation';

export type BubbleSortStep = AnimationStep & {
  arrayState: number[];
  action: 'initial' | 'compare' | 'swap' | 'sortedMark' | 'completed';
  indices: number[];
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

export function generateBubbleSortSteps(input: number[]): BubbleSortStep[] {
  const arr = cloneArray(input);
  const steps: BubbleSortStep[] = [];
  const n = arr.length;

  steps.push({
    description: '',
    codeLines: [1],
    highlights: [],
    arrayState: cloneArray(arr),
    action: 'initial',
    indices: [],
  });

  for (let i = 0; i < n - 1; i += 1) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j += 1) {
      steps.push({
        description: '',
        codeLines: [4],
        highlights: [
          { index: j, type: 'comparing' },
          { index: j + 1, type: 'comparing' },
        ],
        arrayState: cloneArray(arr),
        action: 'compare',
        indices: [j, j + 1],
      });

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;

        steps.push({
          description: '',
          codeLines: [5],
          highlights: [
            { index: j, type: 'swapping' },
            { index: j + 1, type: 'swapping' },
          ],
          arrayState: cloneArray(arr),
          action: 'swap',
          indices: [j, j + 1],
        });
      }
    }

    steps.push({
      description: '',
      codeLines: [7],
      highlights: [{ index: n - i - 1, type: 'sorted' }],
      arrayState: cloneArray(arr),
      action: 'sortedMark',
      indices: [n - i - 1],
    });

    if (!swapped) {
      break;
    }
  }

  const sortedHighlights = arr.map((_, idx) => ({ index: idx, type: 'sorted' as const }));
  steps.push({
    description: '',
    codeLines: [8],
    highlights: sortedHighlights,
    arrayState: cloneArray(arr),
    action: 'completed',
    indices: [],
  });

  return steps;
}
