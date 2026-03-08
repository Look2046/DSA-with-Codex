import type { AnimationStep } from '../../types/animation';

export type BinarySearchStep = AnimationStep & {
  arrayState: number[];
  action: 'initial' | 'inspect' | 'moveLow' | 'moveHigh' | 'found' | 'notFound' | 'completed';
  indices: number[];
  low: number;
  high: number;
  mid: number;
  target: number;
  foundIndex: number;
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

export function generateBinarySearchSteps(input: number[], target: number): BinarySearchStep[] {
  const arr = cloneArray(input);
  const steps: BinarySearchStep[] = [];

  let low = 0;
  let high = arr.length - 1;
  let foundIndex = -1;

  steps.push({
    description: '',
    codeLines: [1],
    highlights: [],
    arrayState: cloneArray(arr),
    action: 'initial',
    indices: [],
    low,
    high,
    mid: -1,
    target,
    foundIndex,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    const inspectHighlights = [
      { index: low, type: 'visiting' as const },
      { index: high, type: 'visiting' as const },
      { index: mid, type: 'comparing' as const },
    ];

    steps.push({
      description: '',
      codeLines: [3],
      highlights: inspectHighlights,
      arrayState: cloneArray(arr),
      action: 'inspect',
      indices: [low, mid, high],
      low,
      high,
      mid,
      target,
      foundIndex,
    });

    if (arr[mid] === target) {
      foundIndex = mid;
      steps.push({
        description: '',
        codeLines: [4],
        highlights: [{ index: mid, type: 'matched' }],
        arrayState: cloneArray(arr),
        action: 'found',
        indices: [mid],
        low,
        high,
        mid,
        target,
        foundIndex,
      });
      break;
    }

    if (arr[mid] < target) {
      low = mid + 1;
      steps.push({
        description: '',
        codeLines: [5],
        highlights: [{ index: mid, type: 'comparing' }],
        arrayState: cloneArray(arr),
        action: 'moveLow',
        indices: [low],
        low,
        high,
        mid,
        target,
        foundIndex,
      });
      continue;
    }

    high = mid - 1;
    steps.push({
      description: '',
      codeLines: [6],
      highlights: [{ index: mid, type: 'comparing' }],
      arrayState: cloneArray(arr),
      action: 'moveHigh',
      indices: [high],
      low,
      high,
      mid,
      target,
      foundIndex,
    });
  }

  if (foundIndex === -1) {
    steps.push({
      description: '',
      codeLines: [7],
      highlights: [],
      arrayState: cloneArray(arr),
      action: 'notFound',
      indices: [],
      low,
      high,
      mid: -1,
      target,
      foundIndex,
    });
  }

  steps.push({
    description: '',
    codeLines: [8],
    highlights: foundIndex >= 0 ? [{ index: foundIndex, type: 'matched' }] : [],
    arrayState: cloneArray(arr),
    action: 'completed',
    indices: foundIndex >= 0 ? [foundIndex] : [],
    low,
    high,
    mid: foundIndex,
    target,
    foundIndex,
  });

  return steps;
}
