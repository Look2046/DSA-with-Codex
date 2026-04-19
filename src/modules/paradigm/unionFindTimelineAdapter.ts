import type { TimelineFrame } from '../../engine/timeline/types';
import { generateUnionFindSteps, type UnionFindPresetId, type UnionFindStep } from './unionFind';

export type UnionFindTimelineFrame = TimelineFrame<UnionFindStep>;

export function buildUnionFindTimelineFrames(steps: UnionFindStep[]): UnionFindTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildUnionFindTimelineFromPreset(presetId: UnionFindPresetId): UnionFindTimelineFrame[] {
  return buildUnionFindTimelineFrames(generateUnionFindSteps(presetId));
}
