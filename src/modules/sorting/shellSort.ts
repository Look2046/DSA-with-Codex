import type { AnimationStep } from '../../types/animation';

export type ShellSortStep = AnimationStep & {
  arrayState: number[];
  action: 'initial' | 'gapChange' | 'selectCurrent' | 'compare' | 'shift' | 'insert' | 'completed';
  indices: number[];
  gap: number;
  currentValue: number | null;
  holeIndex: number | null;
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

export function generateShellSortSteps(input: number[]): ShellSortStep[] {
  const arr = cloneArray(input);
  const steps: ShellSortStep[] = [];
  const n = arr.length;

  steps.push({
    description: '',
    codeLines: [1],
    highlights: [],
    arrayState: cloneArray(arr),
    action: 'initial',
    indices: [],
    gap: n <= 1 ? 0 : Math.floor(n / 2),
    currentValue: null,
    holeIndex: null,
  });

  if (n <= 1) {
    steps.push({
      description: '',
      codeLines: [9],
      highlights: arr.map((_, index) => ({ index, type: 'sorted' as const })),
      arrayState: cloneArray(arr),
      action: 'completed',
      indices: [],
      gap: 0,
      currentValue: null,
      holeIndex: null,
    });
    return steps;
  }

  let gap = Math.floor(n / 2);

  while (gap > 0) {
    steps.push({
      description: '',
      codeLines: [2],
      highlights: [],
      arrayState: cloneArray(arr),
      action: 'gapChange',
      indices: [],
      gap,
      currentValue: null,
      holeIndex: null,
    });

    for (let i = gap; i < n; i += 1) {
      const currentValue = arr[i];
      let j = i;

      steps.push({
        description: '',
        codeLines: [3, 4],
        highlights: [{ index: i, type: 'comparing' }],
        arrayState: cloneArray(arr),
        action: 'selectCurrent',
        indices: [i],
        gap,
        currentValue,
        holeIndex: i,
      });

      while (j >= gap) {
        steps.push({
          description: '',
          codeLines: [5],
          highlights: [
            { index: j - gap, type: 'comparing' },
            { index: j, type: 'comparing' },
          ],
          arrayState: cloneArray(arr),
          action: 'compare',
          indices: [j - gap, j],
          gap,
          currentValue,
          holeIndex: j,
        });

        if (arr[j - gap] <= currentValue) {
          break;
        }

        arr[j] = arr[j - gap];
        steps.push({
          description: '',
          codeLines: [6],
          highlights: [
            { index: j - gap, type: 'moving' },
            { index: j, type: 'new-node' },
          ],
          arrayState: cloneArray(arr),
          action: 'shift',
          indices: [j - gap, j],
          gap,
          currentValue,
          holeIndex: j - gap,
        });

        j -= gap;
      }

      arr[j] = currentValue;
      steps.push({
        description: '',
        codeLines: [7],
        highlights: [{ index: j, type: 'new-node' }],
        arrayState: cloneArray(arr),
        action: 'insert',
        indices: [j],
        gap,
        currentValue,
        holeIndex: null,
      });
    }

    gap = Math.floor(gap / 2);
  }

  steps.push({
    description: '',
    codeLines: [9],
    highlights: arr.map((_, index) => ({ index, type: 'sorted' as const })),
    arrayState: cloneArray(arr),
    action: 'completed',
    indices: [],
    gap: 0,
    currentValue: null,
    holeIndex: null,
  });

  return steps;
}
