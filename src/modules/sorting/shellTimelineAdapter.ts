import type { TimelineFrame } from '../../engine/timeline/types';
import { generateShellSortSteps, type ShellSortStep } from './shellSort';

export type ShellSortTimelineFrame = TimelineFrame<ShellSortStep>;

export function buildShellSortTimelineFrames(steps: ShellSortStep[]): ShellSortTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildShellSortTimelineFromInput(inputData: number[]): ShellSortTimelineFrame[] {
  const steps = generateShellSortSteps(inputData);
  return buildShellSortTimelineFrames(steps);
}
