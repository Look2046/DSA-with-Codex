import { generateBubbleSortSteps, type BubbleSortStep } from './bubbleSort';
import type { TimelineFrame } from '../../engine/timeline/types';

export type BubbleSortTimelineFrame = TimelineFrame<BubbleSortStep>;

export function buildBubbleSortTimelineFrames(steps: BubbleSortStep[]): BubbleSortTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildBubbleSortTimelineFromInput(inputData: number[]): BubbleSortTimelineFrame[] {
  const steps = generateBubbleSortSteps(inputData);
  return buildBubbleSortTimelineFrames(steps);
}

