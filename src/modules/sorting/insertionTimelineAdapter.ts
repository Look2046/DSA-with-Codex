import { generateInsertionSortSteps, type InsertionSortStep } from './insertionSort';
import type { TimelineFrame } from '../../engine/timeline/types';

export type InsertionSortTimelineFrame = TimelineFrame<InsertionSortStep>;

export function buildInsertionSortTimelineFrames(steps: InsertionSortStep[]): InsertionSortTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildInsertionSortTimelineFromInput(inputData: number[]): InsertionSortTimelineFrame[] {
  const steps = generateInsertionSortSteps(inputData);
  return buildInsertionSortTimelineFrames(steps);
}
