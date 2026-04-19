import type { AnimationStep } from '../../types/animation';

export type DivideConquerPresetId = 'classic' | 'mixed';

export type DivideConquerPreset = {
  presetId: DivideConquerPresetId;
  values: number[];
};

export type DivideConquerAction = 'initial' | 'split' | 'baseCase' | 'combine' | 'completed';

export type DivideConquerResolution = {
  start: number;
  end: number;
  maxIndex: number;
  maxValue: number;
};

export type DivideConquerStep = AnimationStep & {
  presetId: DivideConquerPresetId;
  values: number[];
  action: DivideConquerAction;
  activeRange: [number, number] | null;
  leftRange: [number, number] | null;
  rightRange: [number, number] | null;
  stack: Array<[number, number]>;
  resolved: DivideConquerResolution[];
  currentBest: DivideConquerResolution | null;
};

const DIVIDE_CONQUER_PRESETS: Record<DivideConquerPresetId, DivideConquerPreset> = {
  classic: {
    presetId: 'classic',
    values: [8, 3, 11, 5, 9, 2, 14, 6],
  },
  mixed: {
    presetId: 'mixed',
    values: [4, 12, 7, 18, 1, 16, 9, 10],
  },
};

function cloneValues(values: number[]): number[] {
  return [...values];
}

function cloneRange(range: [number, number] | null): [number, number] | null {
  return range ? [range[0], range[1]] : null;
}

function cloneStack(stack: Array<[number, number]>): Array<[number, number]> {
  return stack.map((range) => [range[0], range[1]]);
}

function cloneResolved(resolved: DivideConquerResolution[]): DivideConquerResolution[] {
  return resolved.map((entry) => ({ ...entry }));
}

function createStep(
  preset: DivideConquerPreset,
  action: DivideConquerAction,
  codeLines: number[],
  activeRange: [number, number] | null,
  leftRange: [number, number] | null,
  rightRange: [number, number] | null,
  stack: Array<[number, number]>,
  resolved: DivideConquerResolution[],
  currentBest: DivideConquerResolution | null,
): DivideConquerStep {
  return {
    description: '',
    codeLines: [...codeLines],
    highlights: [],
    presetId: preset.presetId,
    values: cloneValues(preset.values),
    action,
    activeRange: cloneRange(activeRange),
    leftRange: cloneRange(leftRange),
    rightRange: cloneRange(rightRange),
    stack: cloneStack(stack),
    resolved: cloneResolved(resolved),
    currentBest: currentBest ? { ...currentBest } : null,
  };
}

export function getDivideConquerPresetIds(): DivideConquerPresetId[] {
  return Object.keys(DIVIDE_CONQUER_PRESETS) as DivideConquerPresetId[];
}

export function getDivideConquerPreset(presetId: DivideConquerPresetId): DivideConquerPreset {
  return {
    ...DIVIDE_CONQUER_PRESETS[presetId],
    values: cloneValues(DIVIDE_CONQUER_PRESETS[presetId].values),
  };
}

export function generateDivideConquerSteps(presetId: DivideConquerPresetId): DivideConquerStep[] {
  const preset = getDivideConquerPreset(presetId);
  const steps: DivideConquerStep[] = [];
  const resolved: DivideConquerResolution[] = [];

  steps.push(createStep(preset, 'initial', [1], [0, preset.values.length - 1], null, null, [], resolved, null));

  function solve(start: number, end: number, parentStack: Array<[number, number]>): DivideConquerResolution {
    const currentStack = [...parentStack, [start, end] as [number, number]];

    if (start === end) {
      const base = {
        start,
        end,
        maxIndex: start,
        maxValue: preset.values[start] ?? Number.NEGATIVE_INFINITY,
      };
      resolved.push(base);
      steps.push(createStep(preset, 'baseCase', [3], [start, end], null, null, currentStack, resolved, base));
      return base;
    }

    const mid = Math.floor((start + end) / 2);
    const leftRange: [number, number] = [start, mid];
    const rightRange: [number, number] = [mid + 1, end];
    steps.push(createStep(preset, 'split', [2], [start, end], leftRange, rightRange, currentStack, resolved, null));

    const left = solve(start, mid, currentStack);
    const right = solve(mid + 1, end, currentStack);
    const best = left.maxValue >= right.maxValue ? left : right;
    const combined = {
      start,
      end,
      maxIndex: best.maxIndex,
      maxValue: best.maxValue,
    };

    resolved.push(combined);
    steps.push(createStep(preset, 'combine', [4], [start, end], leftRange, rightRange, currentStack, resolved, combined));
    return combined;
  }

  const best = solve(0, preset.values.length - 1, []);
  steps.push(createStep(preset, 'completed', [5], [0, preset.values.length - 1], null, null, [], resolved, best));

  return steps;
}
