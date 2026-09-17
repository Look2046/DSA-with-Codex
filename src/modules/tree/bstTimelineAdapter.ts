import type { TimelineFrame } from '../../engine/timeline/types';
import { generateBstSteps, type BstOperation, type BstStep } from './bst';

export type BstTimelineFrame = TimelineFrame<BstStep>;

export function buildBstTimelineFrames(steps: BstStep[]): BstTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildBstTimelineFromInput(inputData: number[], operation: BstOperation, target: number): BstTimelineFrame[] {
  return buildBstTimelineFrames(generateBstSteps(inputData, operation, target));
}
