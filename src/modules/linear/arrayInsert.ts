import type { AnimationStep } from '../../types/animation';

export type ArrayInsertStep = AnimationStep & {
  arrayState: Array<number | null>;
  action: 'initial' | 'expand' | 'shift' | 'prepareInsert' | 'insert' | 'completed';
  indices: number[];
  pendingValue?: number;
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

  const working = cloneArray(input);
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

  visual.push(null);
  steps.push({
    description: '',
    codeLines: [2],
    highlights: [{ index: visual.length - 1, type: 'new-node' }],
    arrayState: cloneVisualArray(visual),
    action: 'expand',
    indices: [visual.length - 1],
  });

  for (let i = visual.length - 1; i > index; i -= 1) {
    visual[i] = visual[i - 1];
    visual[i - 1] = null;
    steps.push({
      description: '',
      codeLines: [3],
      highlights: [
        { index: i - 1, type: 'moving' },
        { index: i, type: 'moving' },
      ],
      arrayState: cloneVisualArray(visual),
      action: 'shift',
      indices: [i - 1, i],
    });
  }

  steps.push({
    description: '',
    codeLines: [4],
    highlights: [{ index, type: 'new-node' }],
    arrayState: cloneVisualArray(visual),
    action: 'prepareInsert',
    indices: [index],
    pendingValue: value,
  });

  visual[index] = value;
  working.splice(index, 0, value);
  steps.push({
    description: '',
    codeLines: [5],
    highlights: [{ index, type: 'new-node' }],
    arrayState: cloneVisualArray(visual),
    action: 'insert',
    indices: [index],
  });

  steps.push({
    description: '',
    codeLines: [6],
    highlights: [],
    arrayState: cloneVisualArray(visual),
    action: 'completed',
    indices: [],
  });

  return steps;
}
