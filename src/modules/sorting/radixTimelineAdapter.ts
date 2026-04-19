import type { TimelineFrame } from '../../engine/timeline/types';
import { generateRadixSortSteps, type RadixSortPresetId, type RadixSortStep } from './radixSort';

export type RadixSortTimelineFrame = TimelineFrame<RadixSortStep>;

export function buildRadixSortTimelineFrames(steps: RadixSortStep[]): RadixSortTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildRadixSortTimelineFromPreset(presetId: RadixSortPresetId): RadixSortTimelineFrame[] {
  return buildRadixSortTimelineFrames(generateRadixSortSteps(presetId));
}
