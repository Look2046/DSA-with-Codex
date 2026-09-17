import type { TimelineFrame } from '../../engine/timeline/types';
import { generateGreedySteps, type GreedyPresetId, type GreedyStep } from './greedy';

export type GreedyTimelineFrame = TimelineFrame<GreedyStep>;

export function buildGreedyTimelineFrames(steps: GreedyStep[]): GreedyTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildGreedyTimelineFromPreset(presetId: GreedyPresetId): GreedyTimelineFrame[] {
  return buildGreedyTimelineFrames(generateGreedySteps(presetId));
}
