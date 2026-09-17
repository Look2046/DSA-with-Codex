import type { TimelineFrame } from '../../engine/timeline/types';
import { generateKmpSteps, type KmpPresetId, type KmpStep } from './kmp';

export type KmpTimelineFrame = TimelineFrame<KmpStep>;

export function buildKmpTimelineFrames(steps: KmpStep[]): KmpTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildKmpTimelineFromPreset(presetId: KmpPresetId): KmpTimelineFrame[] {
  return buildKmpTimelineFrames(generateKmpSteps(presetId));
}
