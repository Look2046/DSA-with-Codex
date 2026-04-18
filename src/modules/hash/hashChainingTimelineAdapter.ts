import type { TimelineFrame } from '../../engine/timeline/types';
import {
  generateHashChainingSteps,
  type HashChainingOperationId,
  type HashChainingStep,
} from './hashChaining';

export type HashChainingTimelineFrame = TimelineFrame<HashChainingStep>;

export function buildHashChainingTimelineFrames(
  steps: HashChainingStep[],
): HashChainingTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildHashChainingTimelineFromOperation(
  operation: HashChainingOperationId,
): HashChainingTimelineFrame[] {
  return buildHashChainingTimelineFrames(generateHashChainingSteps(operation));
}
