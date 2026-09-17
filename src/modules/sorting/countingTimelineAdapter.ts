import type { TimelineFrame } from '../../engine/timeline/types';
import { generateCountingSortSteps, type CountingSortPresetId, type CountingSortStep } from './countingSort';

export type CountingSortTimelineFrame = TimelineFrame<CountingSortStep>;

export function buildCountingSortTimelineFrames(steps: CountingSortStep[]): CountingSortTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildCountingSortTimelineFromPreset(presetId: CountingSortPresetId): CountingSortTimelineFrame[] {
  return buildCountingSortTimelineFrames(generateCountingSortSteps(presetId));
}
