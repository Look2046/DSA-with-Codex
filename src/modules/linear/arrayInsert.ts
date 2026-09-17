import type { AnimationStep } from '../../types/animation';

export type ArrayInsertStep = AnimationStep & {
  arrayState: Array<number | null>;
  logicalLength: number;
  action: 'initial' | 'shift' | 'insert' | 'visit' | 'completed';
  indices: number[];
};

export const ARRAY_CAPACITY = 20;

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
  while (visual.length < ARRAY_CAPACITY) {
    visual.push(null);
  }
  const steps: ArrayInsertStep[] = [];

  steps.push({
    description: '',
    codeLines: [1],
    highlights: [],
    arrayState: cloneVisualArray(visual),
    logicalLength: input.length,
    action: 'initial',
    indices: [],
  });

  if (input.length >= ARRAY_CAPACITY) {
    steps.push({
      description: '',
      codeLines: [4],
      highlights: visual
        .map((cellValue, cellIndex) => (cellValue === null ? null : { index: cellIndex, type: 'default' as const }))
        .filter((item): item is { index: number; type: 'default' } => item !== null),
      arrayState: cloneVisualArray(visual),
      logicalLength: input.length,
      action: 'completed',
      indices: [],
    });
    return steps;
  }

  for (let i = input.length - 1; i >= index; i -= 1) {
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
      logicalLength: input.length,
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
    logicalLength: input.length + 1,
    action: 'insert',
    indices: [index],
  });

  steps.push({
    description: '',
    codeLines: [4],
    highlights: [],
    arrayState: cloneVisualArray(visual),
    logicalLength: input.length + 1,
    action: 'completed',
    indices: [],
  });

  return steps;
}

export function generateArrayDeleteSteps(input: number[], index: number): ArrayInsertStep[] {
  const visual: Array<number | null> = cloneArray(input);
  while (visual.length < ARRAY_CAPACITY) {
    visual.push(null);
  }
  const steps: ArrayInsertStep[] = [];

  steps.push({
    description: '',
    codeLines: [1],
    highlights: [],
    arrayState: cloneVisualArray(visual),
    logicalLength: input.length,
    action: 'initial',
    indices: [],
  });

  if (input.length === 0) {
    steps.push({
      description: '',
      codeLines: [4],
      highlights: [],
      arrayState: cloneVisualArray(visual),
      logicalLength: 0,
      action: 'completed',
      indices: [],
    });
    return steps;
  }

  if (!Number.isInteger(index) || index < 0 || index >= input.length) {
    throw new RangeError(`Delete index out of range: ${index}`);
  }

  steps.push({
    description: '',
    codeLines: [2],
    highlights: [{ index, type: 'visiting' }],
    arrayState: cloneVisualArray(visual),
    logicalLength: input.length,
    action: 'visit',
    indices: [index],
  });

  for (let i = index; i < input.length - 1; i += 1) {
    visual[i] = visual[i + 1];
    visual[i + 1] = null;
    steps.push({
      description: '',
      codeLines: [3],
      highlights: [
        { index: i, type: 'moving' },
        { index: i + 1, type: 'moving' },
      ],
      arrayState: cloneVisualArray(visual),
      logicalLength: input.length,
      action: 'shift',
      indices: [i + 1, i],
    });
  }

  visual[input.length - 1] = null;
  steps.push({
    description: '',
    codeLines: [3],
    highlights: [],
    arrayState: cloneVisualArray(visual),
    logicalLength: input.length - 1,
    action: 'completed',
    indices: [],
  });

  return steps;
}
