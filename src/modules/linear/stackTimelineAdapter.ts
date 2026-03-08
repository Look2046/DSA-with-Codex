import { generateStackSteps, type StackStep, type StackOperation } from './stackOps';
import type { TimelineFrame } from '../../engine/timeline/types';

export type StackTimelineFrame = TimelineFrame<StackStep>;

export function buildStackTimelineFrames(steps: StackStep[]): StackTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildStackTimelineFromInput(inputData: number[], operation: StackOperation): StackTimelineFrame[] {
  const steps = generateStackSteps(inputData, operation);
  return buildStackTimelineFrames(steps);
}
