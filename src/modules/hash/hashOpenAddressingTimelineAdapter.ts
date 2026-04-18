import type { TimelineFrame } from '../../engine/timeline/types';
import {
  generateHashOpenAddressingSteps,
  type HashOpenAddressingOperationId,
  type HashOpenAddressingStep,
} from './hashOpenAddressing';

export type HashOpenAddressingTimelineFrame = TimelineFrame<HashOpenAddressingStep>;

export function buildHashOpenAddressingTimelineFrames(
  steps: HashOpenAddressingStep[],
): HashOpenAddressingTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildHashOpenAddressingTimelineFromOperation(
  operation: HashOpenAddressingOperationId,
): HashOpenAddressingTimelineFrame[] {
  return buildHashOpenAddressingTimelineFrames(generateHashOpenAddressingSteps(operation));
}
