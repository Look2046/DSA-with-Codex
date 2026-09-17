import type { AnimationStep } from '../../types/animation';

export type ShellSortStep = AnimationStep & {
  arrayState: number[];
  action: 'initial' | 'gapChange' | 'selectCurrent' | 'lift' | 'compare' | 'shift' | 'insert' | 'groupMark' | 'completed';
  indices: number[];
  gap: number;
  currentValue: number | null;
  holeIndex: number | null;
  keyLifted: boolean;
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

function buildGapSequenceIndices(gap: number, endIndex: number): number[] {
  const remainder = endIndex % gap;
  const indices: number[] = [];
  for (let index = remainder; index <= endIndex; index += gap) {
    indices.push(index);
  }
  return indices;
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
      gap: 0,
      currentValue: null,
      holeIndex: null,
      keyLifted: false,
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
      keyLifted: false,
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
        holeIndex: null,
        keyLifted: false,
      });

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
        holeIndex: null,
        keyLifted: false,
      });

      if (arr[j - gap] > currentValue) {
        steps.push({
          description: '',
          codeLines: [4, 5],
          highlights: [{ index: j, type: 'new-node' }],
          arrayState: cloneArray(arr),
          action: 'lift',
          indices: [j],
          gap,
          currentValue,
          holeIndex: j,
          keyLifted: true,
        });

        while (j >= gap && arr[j - gap] > currentValue) {
          const fromIndex = j - gap;
          const toIndex = j;
          arr[j] = arr[j - gap];
          steps.push({
            description: '',
            codeLines: [6],
            highlights: [{ index: toIndex, type: 'moving' }],
            arrayState: cloneArray(arr),
            action: 'shift',
            indices: [fromIndex, toIndex],
            gap,
            currentValue,
            holeIndex: fromIndex,
            keyLifted: true,
          });

          j -= gap;

          if (j >= gap) {
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
          gap,
          currentValue,
          holeIndex: null,
          keyLifted: true,
        });
      }

      const sequenceIndices = buildGapSequenceIndices(gap, i);
      steps.push({
        description: '',
        codeLines: [8],
        highlights: sequenceIndices.map((index) => ({ index, type: 'sorted' as const })),
        arrayState: cloneArray(arr),
        action: 'groupMark',
        indices: sequenceIndices,
        gap,
        currentValue: null,
        holeIndex: null,
        keyLifted: false,
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
    keyLifted: false,
  });

  return steps;
}
