import { generateSelectionSortSteps, type SelectionSortStep } from './selectionSort';
import type { TimelineFrame } from '../../engine/timeline/types';

export type SelectionSortTimelineFrame = TimelineFrame<SelectionSortStep>;

export function buildSelectionSortTimelineFrames(steps: SelectionSortStep[]): SelectionSortTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildSelectionSortTimelineFromInput(inputData: number[]): SelectionSortTimelineFrame[] {
  const steps = generateSelectionSortSteps(inputData);
  return buildSelectionSortTimelineFrames(steps);
}
