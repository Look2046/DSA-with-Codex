import type { TimelineFrame } from '../../engine/timeline/types';
import { generateBellmanFordSteps, type BellmanFordStep } from './bellmanFord';
import type { WeightedGraphPresetId } from './weightedGraph';

export type BellmanFordTimelineFrame = TimelineFrame<BellmanFordStep>;

export function buildBellmanFordTimelineFrames(steps: BellmanFordStep[]): BellmanFordTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildBellmanFordTimelineFromPreset(
  presetId: WeightedGraphPresetId,
  startNodeIndex = 0,
): BellmanFordTimelineFrame[] {
  return buildBellmanFordTimelineFrames(generateBellmanFordSteps(presetId, startNodeIndex));
}
