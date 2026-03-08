import type { TimelineFrame } from '../../engine/timeline/types';
import {
  generateBinaryTreeTraversalSteps,
  type BinaryTreeTraversalMode,
  type BinaryTreeTraversalStep,
} from './binaryTreeTraversal';

export type BinaryTreeTraversalTimelineFrame = TimelineFrame<BinaryTreeTraversalStep>;

export function buildBinaryTreeTraversalTimelineFrames(
  steps: BinaryTreeTraversalStep[],
): BinaryTreeTraversalTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildBinaryTreeTraversalTimelineFromInput(
  inputData: number[],
  mode: BinaryTreeTraversalMode,
): BinaryTreeTraversalTimelineFrame[] {
  const steps = generateBinaryTreeTraversalSteps(inputData, mode);
  return buildBinaryTreeTraversalTimelineFrames(steps);
}
