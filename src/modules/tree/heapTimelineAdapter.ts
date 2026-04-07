import type { TimelineFrame } from '../../engine/timeline/types';
import { generateHeapSteps, type HeapOperation, type HeapStep } from './heap';

export type HeapTimelineFrame = TimelineFrame<HeapStep>;

export function buildHeapTimelineFrames(steps: HeapStep[]): HeapTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildHeapTimelineFromInput(
  inputData: number[],
  operation: HeapOperation,
  target: number | null = null,
): HeapTimelineFrame[] {
  return buildHeapTimelineFrames(generateHeapSteps(inputData, operation, target));
}
