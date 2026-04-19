import type { TimelineFrame } from '../../engine/timeline/types';
import { generateDivideConquerSteps, type DivideConquerPresetId, type DivideConquerStep } from './divideConquer';

export type DivideConquerTimelineFrame = TimelineFrame<DivideConquerStep>;

export function buildDivideConquerTimelineFrames(steps: DivideConquerStep[]): DivideConquerTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildDivideConquerTimelineFromPreset(presetId: DivideConquerPresetId): DivideConquerTimelineFrame[] {
  return buildDivideConquerTimelineFrames(generateDivideConquerSteps(presetId));
}
