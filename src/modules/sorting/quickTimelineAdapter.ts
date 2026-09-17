import type { TimelineFrame } from '../../engine/timeline/types';
import { generateQuickSortSteps, type QuickSortStep } from './quickSort';

export type QuickSortTimelineFrame = TimelineFrame<QuickSortStep>;

export function buildQuickSortTimelineFrames(steps: QuickSortStep[]): QuickSortTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildQuickSortTimelineFromInput(inputData: number[]): QuickSortTimelineFrame[] {
  const steps = generateQuickSortSteps(inputData);
  return buildQuickSortTimelineFrames(steps);
}
