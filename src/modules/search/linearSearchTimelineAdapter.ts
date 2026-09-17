import { generateLinearSearchSteps, type LinearSearchStep } from './linearSearch';
import type { TimelineFrame } from '../../engine/timeline/types';

export type LinearSearchTimelineFrame = TimelineFrame<LinearSearchStep>;

export function buildLinearSearchTimelineFrames(steps: LinearSearchStep[]): LinearSearchTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildLinearSearchTimelineFromInput(inputData: number[], target: number): LinearSearchTimelineFrame[] {
  const steps = generateLinearSearchSteps(inputData, target);
  return buildLinearSearchTimelineFrames(steps);
}
