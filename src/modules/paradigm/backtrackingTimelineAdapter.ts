import type { TimelineFrame } from '../../engine/timeline/types';
import { generateBacktrackingSteps, type BacktrackingPresetId, type BacktrackingStep } from './backtracking';

export type BacktrackingTimelineFrame = TimelineFrame<BacktrackingStep>;

export function buildBacktrackingTimelineFrames(steps: BacktrackingStep[]): BacktrackingTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildBacktrackingTimelineFromPreset(presetId: BacktrackingPresetId): BacktrackingTimelineFrame[] {
  return buildBacktrackingTimelineFrames(generateBacktrackingSteps(presetId));
}
