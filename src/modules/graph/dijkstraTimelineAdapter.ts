import type { TimelineFrame } from '../../engine/timeline/types';
import { generateDijkstraSteps, type DijkstraStep } from './dijkstra';
import type { WeightedGraphPresetId } from './weightedGraph';

export type DijkstraTimelineFrame = TimelineFrame<DijkstraStep>;

export function buildDijkstraTimelineFrames(steps: DijkstraStep[]): DijkstraTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildDijkstraTimelineFromPreset(
  presetId: WeightedGraphPresetId,
  startNodeIndex = 0,
): DijkstraTimelineFrame[] {
  return buildDijkstraTimelineFrames(generateDijkstraSteps(presetId, startNodeIndex));
}
