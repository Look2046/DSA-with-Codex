import type { AnimationStep } from '../../types/animation';

export type ArrayInsertStep = AnimationStep & {
  arrayState: Array<number | null>;
  action: 'initial' | 'shift' | 'insert' | 'completed';
  indices: number[];
};

function cloneArray(values: number[]): number[] {
  return [...values];
}

function cloneVisualArray(values: Array<number | null>): Array<number | null> {
  return [...values];
}

export function generateArrayInsertSteps(input: number[], index: number, value: number): ArrayInsertStep[] {
  if (!Number.isInteger(index) || index < 0 || index > input.length) {
    throw new RangeError(`Insert index out of range: ${index}`);
  }

  const visual: Array<number | null> = cloneArray(input);
  const steps: ArrayInsertStep[] = [];

  steps.push({
    description: '',
    codeLines: [1],
    highlights: [],
    arrayState: cloneVisualArray(visual),
    action: 'initial',
    indices: [],
  });

  for (let i = visual.length - 1; i >= index; i -= 1) {
    visual[i + 1] = visual[i];
    visual[i] = null;
    steps.push({
      description: '',
      codeLines: [2],
      highlights: [
        { index: i, type: 'moving' },
        { index: i + 1, type: 'moving' },
      ],
      arrayState: cloneVisualArray(visual),
      action: 'shift',
      indices: [i, i + 1],
    });
  }

  visual[index] = value;
  steps.push({
    description: '',
    codeLines: [3],
    highlights: [{ index, type: 'new-node' }],
    arrayState: cloneVisualArray(visual),
    action: 'insert',
    indices: [index],
  });

  steps.push({
    description: '',
    codeLines: [4],
    highlights: [],
    arrayState: cloneVisualArray(visual),
    action: 'completed',
    indices: [],
  });

  return steps;
}
