import type { TimelineFrame } from '../../engine/timeline/types';
import { generateTopologicalSortSteps, type TopologicalSortPresetId, type TopologicalSortStep } from './topologicalSort';

export type TopologicalSortTimelineFrame = TimelineFrame<TopologicalSortStep>;

export function buildTopologicalSortTimelineFrames(steps: TopologicalSortStep[]): TopologicalSortTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildTopologicalSortTimelineFromPreset(
  presetId: TopologicalSortPresetId,
): TopologicalSortTimelineFrame[] {
  return buildTopologicalSortTimelineFrames(generateTopologicalSortSteps(presetId));
}
