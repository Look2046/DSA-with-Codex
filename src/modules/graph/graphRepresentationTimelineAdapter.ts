import type { TimelineFrame } from '../../engine/timeline/types';
import { generateGraphRepresentationSteps, type GraphPresetId, type GraphRepresentationStep } from './graphRepresentation';

export type GraphRepresentationTimelineFrame = TimelineFrame<GraphRepresentationStep>;

export function buildGraphRepresentationTimelineFrames(
  steps: GraphRepresentationStep[],
): GraphRepresentationTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildGraphRepresentationTimelineFromPreset(
  presetId: GraphPresetId,
): GraphRepresentationTimelineFrame[] {
  return buildGraphRepresentationTimelineFrames(generateGraphRepresentationSteps(presetId));
}
