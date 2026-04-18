import type { TimelineFrame } from '../../engine/timeline/types';
import { generatePrimSteps, type PrimStep } from './prim';
import type { WeightedGraphPresetId } from './weightedGraph';

export type PrimTimelineFrame = TimelineFrame<PrimStep>;

export function buildPrimTimelineFrames(steps: PrimStep[]): PrimTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildPrimTimelineFromPreset(presetId: WeightedGraphPresetId): PrimTimelineFrame[] {
  return buildPrimTimelineFrames(generatePrimSteps(presetId));
}
