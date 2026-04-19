import type { TimelineFrame } from '../../engine/timeline/types';
import { generateBTreeComparisonSteps, type BTreeComparisonStep } from './btreeComparison';

export type BTreeComparisonTimelineFrame = TimelineFrame<BTreeComparisonStep>;

export function buildBTreeComparisonTimelineFrames(steps: BTreeComparisonStep[]): BTreeComparisonTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildBTreeComparisonTimelineFromInput(seedKeys: readonly number[], target: number): BTreeComparisonTimelineFrame[] {
  return buildBTreeComparisonTimelineFrames(generateBTreeComparisonSteps(seedKeys, target));
}
