import type { TimelineFrame } from '../../engine/timeline/types';
import { generateAvlSteps, type AvlStep } from './avl';

export type AvlTimelineFrame = TimelineFrame<AvlStep>;

export function buildAvlTimelineFrames(steps: AvlStep[]): AvlTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildAvlTimelineFromInput(inputData: number[], target: number): AvlTimelineFrame[] {
  return buildAvlTimelineFrames(generateAvlSteps(inputData, target));
}
