import type { AnimationStep } from '../../types/animation';

export type BubbleSortStep = AnimationStep & {
  arrayState: number[];
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

export function generateBubbleSortSteps(input: number[]): BubbleSortStep[] {
  const arr = cloneArray(input);
  const steps: BubbleSortStep[] = [];
  const n = arr.length;

  steps.push({
    description: 'initial state',
    codeLines: [1],
    highlights: [],
    arrayState: cloneArray(arr),
  });

  for (let i = 0; i < n - 1; i += 1) {
    let swapped = false;

    for (let j = 0; j < n - i - 1; j += 1) {
      steps.push({
        description: `compare index ${j} and ${j + 1}`,
        codeLines: [4],
        highlights: [
          { index: j, type: 'comparing' },
          { index: j + 1, type: 'comparing' },
        ],
        arrayState: cloneArray(arr),
      });

      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;

        steps.push({
          description: `swap index ${j} and ${j + 1}`,
          codeLines: [5],
          highlights: [
            { index: j, type: 'swapping' },
            { index: j + 1, type: 'swapping' },
          ],
          arrayState: cloneArray(arr),
        });
      }
    }

    steps.push({
      description: `index ${n - i - 1} sorted`,
      codeLines: [7],
      highlights: [{ index: n - i - 1, type: 'sorted' }],
      arrayState: cloneArray(arr),
    });

    if (!swapped) {
      break;
    }
  }

  const sortedHighlights = arr.map((_, idx) => ({ index: idx, type: 'sorted' as const }));
  steps.push({
    description: 'sorting completed',
    codeLines: [8],
    highlights: sortedHighlights,
    arrayState: cloneArray(arr),
  });

  return steps;
}
