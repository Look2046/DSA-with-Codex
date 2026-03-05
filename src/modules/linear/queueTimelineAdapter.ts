import { generateQueueSteps, type QueueMode, type QueueOperation, type QueueStep } from './queueOps';
import type { TimelineFrame } from '../../engine/timeline/types';

export type QueueTimelineFrame = TimelineFrame<QueueStep>;

export function buildQueueTimelineFrames(steps: QueueStep[]): QueueTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildQueueTimelineFromInput(
  inputData: number[],
  operation: QueueOperation,
  mode: QueueMode = 'normal',
): QueueTimelineFrame[] {
  const steps = generateQueueSteps(inputData, operation, mode);
  return buildQueueTimelineFrames(steps);
}
