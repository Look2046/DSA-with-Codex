import type { TimelineFrame } from '../../engine/timeline/types';
import { generateBucketSortSteps, type BucketSortPresetId, type BucketSortStep } from './bucketSort';

export type BucketSortTimelineFrame = TimelineFrame<BucketSortStep>;

export function buildBucketSortTimelineFrames(steps: BucketSortStep[]): BucketSortTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildBucketSortTimelineFromPreset(presetId: BucketSortPresetId): BucketSortTimelineFrame[] {
  return buildBucketSortTimelineFrames(generateBucketSortSteps(presetId));
}
