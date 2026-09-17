import { generateDynamicArraySteps, type DynamicArrayOperation, type DynamicArrayStep } from './dynamicArrayOps';
import type { TimelineFrame } from '../../engine/timeline/types';

export type DynamicArrayTimelineFrame = TimelineFrame<DynamicArrayStep>;

export function buildDynamicArrayTimelineFrames(steps: DynamicArrayStep[]): DynamicArrayTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildDynamicArrayTimelineFromInput(
  inputData: number[],
  capacity: number,
  operation: DynamicArrayOperation,
): DynamicArrayTimelineFrame[] {
  const steps = generateDynamicArraySteps(inputData, capacity, operation);
  return buildDynamicArrayTimelineFrames(steps);
}
