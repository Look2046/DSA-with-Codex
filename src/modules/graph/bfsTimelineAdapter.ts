import type { TimelineFrame } from '../../engine/timeline/types';
import { generateBfsSteps, type BfsStep } from './bfs';
import type { GraphPresetId } from './graphRepresentation';

export type BfsTimelineFrame = TimelineFrame<BfsStep>;

export function buildBfsTimelineFrames(steps: BfsStep[]): BfsTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildBfsTimelineFromPreset(presetId: GraphPresetId, startNodeIndex = 0): BfsTimelineFrame[] {
  return buildBfsTimelineFrames(generateBfsSteps(presetId, startNodeIndex));
}
