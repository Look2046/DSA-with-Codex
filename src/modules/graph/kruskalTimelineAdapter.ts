import type { TimelineFrame } from '../../engine/timeline/types';
import { generateKruskalSteps, type KruskalStep } from './kruskal';
import type { WeightedGraphPresetId } from './weightedGraph';

export type KruskalTimelineFrame = TimelineFrame<KruskalStep>;

export function buildKruskalTimelineFrames(steps: KruskalStep[]): KruskalTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildKruskalTimelineFromPreset(presetId: WeightedGraphPresetId): KruskalTimelineFrame[] {
  return buildKruskalTimelineFrames(generateKruskalSteps(presetId));
}
