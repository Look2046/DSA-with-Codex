import type { TimelineFrame } from '../../engine/timeline/types';
import {
  generateTwoDimensionalArraySteps,
  type TwoDimensionalArrayPresetId,
  type TwoDimensionalArrayStep,
} from './twoDimensionalArray';

export type TwoDimensionalArrayTimelineFrame = TimelineFrame<TwoDimensionalArrayStep>;

export function buildTwoDimensionalArrayTimelineFrames(
  steps: TwoDimensionalArrayStep[],
): TwoDimensionalArrayTimelineFrame[] {
  return steps.map((step, index) => ({
    index,
    payload: step,
    logicalStepIndex: index,
  }));
}

export function buildTwoDimensionalArrayTimelineFromPreset(
  presetId: TwoDimensionalArrayPresetId,
  rowIndex: number,
  colIndex: number,
): TwoDimensionalArrayTimelineFrame[] {
  return buildTwoDimensionalArrayTimelineFrames(generateTwoDimensionalArraySteps(presetId, rowIndex, colIndex));
}
