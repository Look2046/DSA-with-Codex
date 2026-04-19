import type { TimelineFrame } from '../../engine/timeline/types';
import { generateSortingRaceSteps, type SortingRacePresetId, type SortingRaceStep } from './sortingRace';

export type SortingRaceTimelineFrame = TimelineFrame<SortingRaceStep>;

export function buildSortingRaceTimelineFrames(steps: SortingRaceStep[]): SortingRaceTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildSortingRaceTimelineFromPreset(presetId: SortingRacePresetId): SortingRaceTimelineFrame[] {
  return buildSortingRaceTimelineFrames(generateSortingRaceSteps(presetId));
}
