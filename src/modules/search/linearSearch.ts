import type { AnimationStep } from '../../types/animation';

export type LinearSearchStep = AnimationStep & {
  arrayState: number[];
  action: 'initial' | 'inspect' | 'advance' | 'found' | 'notFound' | 'completed';
  currentIndex: number;
  target: number;
  foundIndex: number;
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

export function generateLinearSearchSteps(input: number[], target: number): LinearSearchStep[] {
  const arr = cloneArray(input);
  const steps: LinearSearchStep[] = [];
  let foundIndex = -1;

  steps.push({
    description: '',
    codeLines: [1],
    highlights: [],
    arrayState: cloneArray(arr),
    action: 'initial',
    currentIndex: 0,
    target,
    foundIndex,
  });

  for (let currentIndex = 0; currentIndex < arr.length; currentIndex += 1) {
    steps.push({
      description: '',
      codeLines: [2],
      highlights: [{ index: currentIndex, type: 'comparing' }],
      arrayState: cloneArray(arr),
      action: 'inspect',
      currentIndex,
      target,
      foundIndex,
    });

    if (arr[currentIndex] === target) {
      foundIndex = currentIndex;
      steps.push({
        description: '',
        codeLines: [3],
        highlights: [{ index: currentIndex, type: 'matched' }],
        arrayState: cloneArray(arr),
        action: 'found',
        currentIndex,
        target,
        foundIndex,
      });
      break;
    }

    steps.push({
      description: '',
      codeLines: [4],
      highlights: [{ index: currentIndex, type: 'visiting' }],
      arrayState: cloneArray(arr),
      action: 'advance',
      currentIndex,
      target,
      foundIndex,
    });
  }

  if (foundIndex === -1) {
    steps.push({
      description: '',
      codeLines: [5],
      highlights: [],
      arrayState: cloneArray(arr),
      action: 'notFound',
      currentIndex: arr.length,
      target,
      foundIndex,
    });
  }

  steps.push({
    description: '',
    codeLines: [6],
    highlights: foundIndex >= 0 ? [{ index: foundIndex, type: 'matched' }] : [],
    arrayState: cloneArray(arr),
    action: 'completed',
    currentIndex: foundIndex >= 0 ? foundIndex : arr.length,
    target,
    foundIndex,
  });

  return steps;
}
