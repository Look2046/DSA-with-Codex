import { generateBinarySearchSteps, type BinarySearchStep } from './binarySearch';
import type { TimelineFrame } from '../../engine/timeline/types';

export type BinarySearchTimelineFrame = TimelineFrame<BinarySearchStep>;

export function buildBinarySearchTimelineFrames(steps: BinarySearchStep[]): BinarySearchTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildBinarySearchTimelineFromInput(inputData: number[], target: number): BinarySearchTimelineFrame[] {
  const steps = generateBinarySearchSteps(inputData, target);
  return buildBinarySearchTimelineFrames(steps);
}
