import type { AnimationStep } from '../../types/animation';

export type ArrayInsertStep = AnimationStep & {
  arrayState: number[];
  action: 'initial' | 'shift' | 'insert' | 'completed';
  indices: number[];
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

export function generateArrayInsertSteps(input: number[], index: number, value: number): ArrayInsertStep[] {
  if (!Number.isInteger(index) || index < 0 || index > input.length) {
    throw new RangeError(`Insert index out of range: ${index}`);
  }

  const working = cloneArray(input);
  const steps: ArrayInsertStep[] = [];

  steps.push({
    description: '',
    codeLines: [1],
    highlights: [],
    arrayState: cloneArray(working),
    action: 'initial',
    indices: [],
  });

  working.push(value);
  for (let i = working.length - 1; i > index; i -= 1) {
    working[i] = working[i - 1];
    steps.push({
      description: '',
      codeLines: [3],
      highlights: [
        { index: i - 1, type: 'moving' },
        { index: i, type: 'moving' },
      ],
      arrayState: cloneArray(working),
      action: 'shift',
      indices: [i - 1, i],
    });
  }

  working[index] = value;
  steps.push({
    description: '',
    codeLines: [4],
    highlights: [{ index, type: 'new-node' }],
    arrayState: cloneArray(working),
    action: 'insert',
    indices: [index],
  });

  steps.push({
    description: '',
    codeLines: [5],
    highlights: [],
    arrayState: cloneArray(working),
    action: 'completed',
    indices: [],
  });

  return steps;
}
