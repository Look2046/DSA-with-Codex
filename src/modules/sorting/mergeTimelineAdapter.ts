import type { TimelineFrame } from '../../engine/timeline/types';
import { generateMergeSortBottomUpSteps, generateMergeSortSteps, type MergeSortStep } from './mergeSort';

export type MergeSortTimelineFrame = TimelineFrame<MergeSortStep>;
export type MergeSortImplementation = 'topDown' | 'bottomUp';

export function buildMergeSortTimelineFrames(steps: MergeSortStep[]): MergeSortTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildMergeSortTimelineFromInput(
  inputData: number[],
  implementation: MergeSortImplementation = 'topDown',
): MergeSortTimelineFrame[] {
  const steps = implementation === 'bottomUp' ? generateMergeSortBottomUpSteps(inputData) : generateMergeSortSteps(inputData);
  return buildMergeSortTimelineFrames(steps);
}
