import type { TimelineFrame } from '../../engine/timeline/types';
import { generateHeapSortSteps, type HeapSortStep } from './heapSort';

export type HeapSortTimelineFrame = TimelineFrame<HeapSortStep>;

export function buildHeapSortTimelineFrames(steps: HeapSortStep[]): HeapSortTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildHeapSortTimelineFromInput(inputData: number[]): HeapSortTimelineFrame[] {
  return buildHeapSortTimelineFrames(generateHeapSortSteps(inputData));
}
