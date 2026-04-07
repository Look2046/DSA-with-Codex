import type { TimelineFrame } from '../../engine/timeline/types';
import { generateDfsSteps, type DfsStep } from './dfs';
import type { GraphPresetId } from './graphRepresentation';

export type DfsTimelineFrame = TimelineFrame<DfsStep>;

export function buildDfsTimelineFrames(steps: DfsStep[]): DfsTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildDfsTimelineFromPreset(presetId: GraphPresetId, startNodeIndex = 0): DfsTimelineFrame[] {
  return buildDfsTimelineFrames(generateDfsSteps(presetId, startNodeIndex));
}
