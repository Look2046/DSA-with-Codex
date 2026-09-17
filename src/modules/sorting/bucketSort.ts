import type { AnimationStep } from '../../types/animation';

export type BucketSortPresetId = 'classic' | 'clustered';

export type BucketSortPreset = {
  presetId: BucketSortPresetId;
  values: number[];
  bucketCount: number;
  bucketSize: number;
};

export type BucketSortAction = 'initial' | 'scatter' | 'sortBucket' | 'mergeBack' | 'completed';
export type BucketSortPhase = 'scatter' | 'sort' | 'merge' | 'completed';

export type BucketSortStep = AnimationStep & {
  presetId: BucketSortPresetId;
  values: number[];
  buckets: number[][];
  outputArray: number[];
  action: BucketSortAction;
  phase: BucketSortPhase;
  bucketCount: number;
  bucketSize: number;
  activeValue: number | null;
  activeBucket: number | null;
  activeOutputIndex: number | null;
  sortedBucketIndices: number[];
  mergedCount: number;
};

const BUCKET_SORT_PRESETS: Record<BucketSortPresetId, BucketSortPreset> = {
  classic: {
    presetId: 'classic',
    values: [29, 25, 3, 49, 9, 37, 21, 43],
    bucketCount: 5,
    bucketSize: 10,
  },
  clustered: {
    presetId: 'clustered',
    values: [42, 32, 33, 52, 37, 47, 51, 68],
    bucketCount: 5,
    bucketSize: 20,
  },
};

function cloneValues(values: number[]): number[] {
  return [...values];
}

function cloneBuckets(buckets: number[][]): number[][] {
  return buckets.map((bucket) => [...bucket]);
}

function resolveBucketIndex(value: number, bucketCount: number, bucketSize: number): number {
  return Math.min(Math.floor(value / bucketSize), bucketCount - 1);
}

function createStep(
  preset: BucketSortPreset,
  buckets: number[][],
  outputArray: number[],
  action: BucketSortAction,
  phase: BucketSortPhase,
  codeLines: number[],
  activeValue: number | null,
  activeBucket: number | null,
  activeOutputIndex: number | null,
  sortedBucketIndices: number[],
  mergedCount: number,
): BucketSortStep {
  return {
    description: '',
    codeLines: [...codeLines],
    highlights: [],
    presetId: preset.presetId,
    values: cloneValues(preset.values),
    buckets: cloneBuckets(buckets),
    outputArray: cloneValues(outputArray),
    action,
    phase,
    bucketCount: preset.bucketCount,
    bucketSize: preset.bucketSize,
    activeValue,
    activeBucket,
    activeOutputIndex,
    sortedBucketIndices: [...sortedBucketIndices],
    mergedCount,
  };
}

export function getBucketSortPresetIds(): BucketSortPresetId[] {
  return Object.keys(BUCKET_SORT_PRESETS) as BucketSortPresetId[];
}

export function getBucketSortPreset(presetId: BucketSortPresetId): BucketSortPreset {
  return {
    ...BUCKET_SORT_PRESETS[presetId],
    values: cloneValues(BUCKET_SORT_PRESETS[presetId].values),
  };
}

export function generateBucketSortSteps(presetId: BucketSortPresetId): BucketSortStep[] {
  const preset = getBucketSortPreset(presetId);
  const buckets = Array.from({ length: preset.bucketCount }, () => [] as number[]);
  const outputArray: number[] = [];
  const sortedBucketIndices: number[] = [];
  const steps: BucketSortStep[] = [];

  steps.push(createStep(preset, buckets, outputArray, 'initial', 'scatter', [1], null, null, null, sortedBucketIndices, 0));

  preset.values.forEach((value) => {
    const bucketIndex = resolveBucketIndex(value, preset.bucketCount, preset.bucketSize);
    buckets[bucketIndex]?.push(value);

    steps.push(
      createStep(preset, buckets, outputArray, 'scatter', 'scatter', [2], value, bucketIndex, null, sortedBucketIndices, 0),
    );
  });

  buckets.forEach((bucket, bucketIndex) => {
    if (bucket.length === 0) {
      return;
    }

    const sortedBucket = [...bucket].sort((left, right) => left - right);
    buckets[bucketIndex] = sortedBucket;
    sortedBucketIndices.push(bucketIndex);

    steps.push(
      createStep(
        preset,
        buckets,
        outputArray,
        'sortBucket',
        'sort',
        [3],
        sortedBucket[0] ?? null,
        bucketIndex,
        null,
        sortedBucketIndices,
        0,
      ),
    );
  });

  buckets.forEach((bucket, bucketIndex) => {
    bucket.forEach((value) => {
      outputArray.push(value);
      steps.push(
        createStep(
          preset,
          buckets,
          outputArray,
          'mergeBack',
          'merge',
          [4],
          value,
          bucketIndex,
          outputArray.length - 1,
          sortedBucketIndices,
          outputArray.length,
        ),
      );
    });
  });

  steps.push(
    createStep(
      preset,
      buckets,
      outputArray,
      'completed',
      'completed',
      [5],
      null,
      null,
      null,
      sortedBucketIndices,
      outputArray.length,
    ),
  );

  return steps;
}
