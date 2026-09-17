import type { AnimationStep } from '../../types/animation';

export type CountingSortPresetId = 'classic' | 'dense';

export type CountingSortPreset = {
  presetId: CountingSortPresetId;
  values: number[];
  minValue: number;
  maxValue: number;
};

export type CountingSortAction = 'initial' | 'count' | 'accumulate' | 'place' | 'completed';
export type CountingSortPhase = 'count' | 'prefix' | 'place' | 'completed';

export type CountingSortStep = AnimationStep & {
  presetId: CountingSortPresetId;
  values: number[];
  countArray: number[];
  outputArray: Array<number | null>;
  rangeValues: number[];
  action: CountingSortAction;
  phase: CountingSortPhase;
  activeInputIndex: number | null;
  activeCountIndex: number | null;
  activeOutputIndex: number | null;
  activeValue: number | null;
  processedInputCount: number;
  placedCount: number;
};

const COUNTING_SORT_PRESETS: Record<CountingSortPresetId, CountingSortPreset> = {
  classic: {
    presetId: 'classic',
    values: [4, 2, 2, 8, 3, 3, 1],
    minValue: 1,
    maxValue: 8,
  },
  dense: {
    presetId: 'dense',
    values: [5, 0, 3, 5, 2, 1, 4, 1],
    minValue: 0,
    maxValue: 5,
  },
};

function cloneValues(values: number[]): number[] {
  return [...values];
}

function cloneOutput(values: Array<number | null>): Array<number | null> {
  return [...values];
}

function buildRangeValues(minValue: number, maxValue: number): number[] {
  return Array.from({ length: maxValue - minValue + 1 }, (_, index) => minValue + index);
}

function createStep(
  preset: CountingSortPreset,
  countArray: number[],
  outputArray: Array<number | null>,
  action: CountingSortAction,
  phase: CountingSortPhase,
  codeLines: number[],
  activeInputIndex: number | null,
  activeCountIndex: number | null,
  activeOutputIndex: number | null,
  activeValue: number | null,
  processedInputCount: number,
  placedCount: number,
): CountingSortStep {
  return {
    description: '',
    codeLines: [...codeLines],
    highlights: [],
    presetId: preset.presetId,
    values: cloneValues(preset.values),
    countArray: cloneValues(countArray),
    outputArray: cloneOutput(outputArray),
    rangeValues: buildRangeValues(preset.minValue, preset.maxValue),
    action,
    phase,
    activeInputIndex,
    activeCountIndex,
    activeOutputIndex,
    activeValue,
    processedInputCount,
    placedCount,
  };
}

export function getCountingSortPresetIds(): CountingSortPresetId[] {
  return Object.keys(COUNTING_SORT_PRESETS) as CountingSortPresetId[];
}

export function getCountingSortPreset(presetId: CountingSortPresetId): CountingSortPreset {
  return {
    ...COUNTING_SORT_PRESETS[presetId],
    values: cloneValues(COUNTING_SORT_PRESETS[presetId].values),
  };
}

export function generateCountingSortSteps(presetId: CountingSortPresetId): CountingSortStep[] {
  const preset = getCountingSortPreset(presetId);
  const countArray = Array.from({ length: preset.maxValue - preset.minValue + 1 }, () => 0);
  const outputArray = Array.from({ length: preset.values.length }, () => null as number | null);
  const steps: CountingSortStep[] = [];

  steps.push(
    createStep(
      preset,
      countArray,
      outputArray,
      'initial',
      'count',
      [1],
      null,
      null,
      null,
      null,
      0,
      0,
    ),
  );

  preset.values.forEach((value, inputIndex) => {
    const countIndex = value - preset.minValue;
    countArray[countIndex] = (countArray[countIndex] ?? 0) + 1;

    steps.push(
      createStep(
        preset,
        countArray,
        outputArray,
        'count',
        'count',
        [2],
        inputIndex,
        countIndex,
        null,
        value,
        inputIndex + 1,
        0,
      ),
    );
  });

  for (let index = 1; index < countArray.length; index += 1) {
    countArray[index] = (countArray[index] ?? 0) + (countArray[index - 1] ?? 0);
    steps.push(
      createStep(
        preset,
        countArray,
        outputArray,
        'accumulate',
        'prefix',
        [3],
        null,
        index,
        null,
        preset.minValue + index,
        preset.values.length,
        0,
      ),
    );
  }

  for (let inputIndex = preset.values.length - 1; inputIndex >= 0; inputIndex -= 1) {
    const value = preset.values[inputIndex] ?? 0;
    const countIndex = value - preset.minValue;
    const outputIndex = (countArray[countIndex] ?? 1) - 1;
    countArray[countIndex] = outputIndex;
    outputArray[outputIndex] = value;

    steps.push(
      createStep(
        preset,
        countArray,
        outputArray,
        'place',
        'place',
        [4],
        inputIndex,
        countIndex,
        outputIndex,
        value,
        preset.values.length,
        preset.values.length - inputIndex,
      ),
    );
  }

  steps.push(
    createStep(
      preset,
      countArray,
      outputArray,
      'completed',
      'completed',
      [5],
      null,
      null,
      null,
      null,
      preset.values.length,
      preset.values.length,
    ),
  );

  return steps;
}
