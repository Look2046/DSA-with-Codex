import type { AnimationStep } from '../../types/animation';

export type RadixSortPresetId = 'classic' | 'clustered';

export type RadixSortPreset = {
  presetId: RadixSortPresetId;
  values: number[];
};

export type RadixSortAction = 'initial' | 'distribute' | 'collect' | 'passComplete' | 'completed';

export type RadixSortStep = AnimationStep & {
  presetId: RadixSortPresetId;
  arrayState: number[];
  buckets: number[][];
  outputArray: number[];
  action: RadixSortAction;
  place: number;
  passIndex: number;
  activeInputIndex: number | null;
  activeValue: number | null;
  activeBucket: number | null;
  digit: number | null;
  collectedCount: number;
  maxDigits: number;
};

const RADIX_SORT_PRESETS: Record<RadixSortPresetId, RadixSortPreset> = {
  classic: {
    presetId: 'classic',
    values: [170, 45, 75, 90, 802, 24, 2, 66],
  },
  clustered: {
    presetId: 'clustered',
    values: [329, 457, 657, 839, 436, 720, 355],
  },
};

function cloneValues(values: number[]): number[] {
  return [...values];
}

function cloneBuckets(buckets: number[][]): number[][] {
  return buckets.map((bucket) => [...bucket]);
}

function getDigit(value: number, place: number): number {
  return Math.floor(value / place) % 10;
}

function getMaxDigits(values: number[]): number {
  const maxValue = Math.max(...values, 0);
  return String(maxValue).length;
}

function createStep(
  preset: RadixSortPreset,
  arrayState: number[],
  buckets: number[][],
  outputArray: number[],
  action: RadixSortAction,
  codeLines: number[],
  place: number,
  passIndex: number,
  activeInputIndex: number | null,
  activeValue: number | null,
  activeBucket: number | null,
  digit: number | null,
  collectedCount: number,
): RadixSortStep {
  return {
    description: '',
    codeLines: [...codeLines],
    highlights: [],
    presetId: preset.presetId,
    arrayState: cloneValues(arrayState),
    buckets: cloneBuckets(buckets),
    outputArray: cloneValues(outputArray),
    action,
    place,
    passIndex,
    activeInputIndex,
    activeValue,
    activeBucket,
    digit,
    collectedCount,
    maxDigits: getMaxDigits(preset.values),
  };
}

export function getRadixSortPresetIds(): RadixSortPresetId[] {
  return Object.keys(RADIX_SORT_PRESETS) as RadixSortPresetId[];
}

export function getRadixSortPreset(presetId: RadixSortPresetId): RadixSortPreset {
  return {
    ...RADIX_SORT_PRESETS[presetId],
    values: cloneValues(RADIX_SORT_PRESETS[presetId].values),
  };
}

export function generateRadixSortSteps(presetId: RadixSortPresetId): RadixSortStep[] {
  const preset = getRadixSortPreset(presetId);
  let arrayState = cloneValues(preset.values);
  const steps: RadixSortStep[] = [];
  const maxDigits = getMaxDigits(arrayState);

  steps.push(createStep(preset, arrayState, Array.from({ length: 10 }, () => []), [], 'initial', [1], 1, 1, null, null, null, null, 0));

  for (let passIndex = 1, place = 1; passIndex <= maxDigits; passIndex += 1, place *= 10) {
    const buckets = Array.from({ length: 10 }, () => [] as number[]);
    const collected: number[] = [];

    arrayState.forEach((value, inputIndex) => {
      const digit = getDigit(value, place);
      buckets[digit]?.push(value);

      steps.push(
        createStep(preset, arrayState, buckets, collected, 'distribute', [2], place, passIndex, inputIndex, value, digit, digit, 0),
      );
    });

    buckets.forEach((bucket, bucketIndex) => {
      bucket.forEach((value) => {
        collected.push(value);
        steps.push(
          createStep(
            preset,
            arrayState,
            buckets,
            collected,
            'collect',
            [3],
            place,
            passIndex,
            null,
            value,
            bucketIndex,
            getDigit(value, place),
            collected.length,
          ),
        );
      });
    });

    arrayState = cloneValues(collected);
    steps.push(
      createStep(
        preset,
        arrayState,
        Array.from({ length: 10 }, () => []),
        collected,
        'passComplete',
        [4],
        place,
        passIndex,
        null,
        null,
        null,
        null,
        collected.length,
      ),
    );
  }

  steps.push(
    createStep(
      preset,
      arrayState,
      Array.from({ length: 10 }, () => []),
      arrayState,
      'completed',
      [5],
      Math.pow(10, Math.max(maxDigits - 1, 0)),
      maxDigits,
      null,
      null,
      null,
      null,
      arrayState.length,
    ),
  );

  return steps;
}
