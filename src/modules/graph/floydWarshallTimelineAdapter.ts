import type { TimelineFrame } from '../../engine/timeline/types';
import { generateFloydWarshallSteps, type FloydWarshallStep } from './floydWarshall';
import type { WeightedGraphPresetId } from './weightedGraph';

export type FloydWarshallTimelineFrame = TimelineFrame<FloydWarshallStep>;

export function buildFloydWarshallTimelineFrames(
  steps: FloydWarshallStep[],
): FloydWarshallTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildFloydWarshallTimelineFromPreset(
  presetId: WeightedGraphPresetId,
): FloydWarshallTimelineFrame[] {
  return buildFloydWarshallTimelineFrames(generateFloydWarshallSteps(presetId));
}
