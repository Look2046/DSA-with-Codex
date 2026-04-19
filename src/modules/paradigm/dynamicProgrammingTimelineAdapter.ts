import type { TimelineFrame } from '../../engine/timeline/types';
import {
  generateDynamicProgrammingSteps,
  type DynamicProgrammingPresetId,
  type DynamicProgrammingStep,
} from './dynamicProgramming';

export type DynamicProgrammingTimelineFrame = TimelineFrame<DynamicProgrammingStep>;

export function buildDynamicProgrammingTimelineFrames(
  steps: DynamicProgrammingStep[],
): DynamicProgrammingTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildDynamicProgrammingTimelineFromPreset(
  presetId: DynamicProgrammingPresetId,
): DynamicProgrammingTimelineFrame[] {
  return buildDynamicProgrammingTimelineFrames(generateDynamicProgrammingSteps(presetId));
}
