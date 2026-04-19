import type { TimelineFrame } from '../../engine/timeline/types';
import { generateRabinKarpSteps, type RabinKarpPresetId, type RabinKarpStep } from './rabinKarp';

export type RabinKarpTimelineFrame = TimelineFrame<RabinKarpStep>;

export function buildRabinKarpTimelineFrames(steps: RabinKarpStep[]): RabinKarpTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildRabinKarpTimelineFromPreset(presetId: RabinKarpPresetId): RabinKarpTimelineFrame[] {
  return buildRabinKarpTimelineFrames(generateRabinKarpSteps(presetId));
}
