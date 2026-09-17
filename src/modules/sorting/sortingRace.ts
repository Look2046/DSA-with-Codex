import type { AnimationStep } from '../../types/animation';
import { generateBubbleSortSteps } from './bubbleSort';
import { generateInsertionSortSteps } from './insertionSort';
import { generateQuickSortSteps } from './quickSort';
import { generateSelectionSortSteps } from './selectionSort';

export type SortingRacePresetId = 'classic' | 'nearlySorted';
export type SortingRaceAlgorithmId = 'bubble' | 'selection' | 'insertion' | 'quick';

export type SortingRacePreset = {
  presetId: SortingRacePresetId;
  values: number[];
};

export type SortingRaceLane = {
  id: SortingRaceAlgorithmId;
  currentFrame: number;
  totalFrames: number;
  arrayState: number[];
  completed: boolean;
  finishFrame: number;
  progress: number;
};

export type SortingRaceStep = AnimationStep & {
  presetId: SortingRacePresetId;
  dataset: number[];
  lanes: SortingRaceLane[];
  ranking: SortingRaceAlgorithmId[];
  leaderIds: SortingRaceAlgorithmId[];
  tick: number;
  totalTicks: number;
  action: 'initial' | 'tick' | 'completed';
};

const SORTING_RACE_PRESETS: Record<SortingRacePresetId, SortingRacePreset> = {
  classic: {
    presetId: 'classic',
    values: [42, 17, 68, 9, 51, 23, 75],
  },
  nearlySorted: {
    presetId: 'nearlySorted',
    values: [10, 20, 30, 25, 40, 50, 45, 60],
  },
};

function cloneValues(values: number[]): number[] {
  return [...values];
}

type ArrayStep = {
  arrayState: number[];
};

function createLaneSteps(values: number[]): Record<SortingRaceAlgorithmId, ArrayStep[]> {
  return {
    bubble: generateBubbleSortSteps(values),
    selection: generateSelectionSortSteps(values),
    insertion: generateInsertionSortSteps(values),
    quick: generateQuickSortSteps(values),
  };
}

function buildLaneSnapshot(
  algorithmId: SortingRaceAlgorithmId,
  steps: ArrayStep[],
  tick: number,
): SortingRaceLane {
  const finishFrame = Math.max(steps.length - 1, 0);
  const currentFrame = Math.min(tick, finishFrame);
  const totalFrames = Math.max(steps.length, 1);
  const progress = totalFrames <= 1 ? 1 : currentFrame / (totalFrames - 1);

  return {
    id: algorithmId,
    currentFrame,
    totalFrames,
    arrayState: cloneValues(steps[currentFrame]?.arrayState ?? []),
    completed: currentFrame >= finishFrame,
    finishFrame,
    progress,
  };
}

function rankLanes(lanes: SortingRaceLane[]): SortingRaceAlgorithmId[] {
  return [...lanes]
    .sort((left, right) => {
      if (right.progress !== left.progress) {
        return right.progress - left.progress;
      }
      if (left.finishFrame !== right.finishFrame) {
        return left.finishFrame - right.finishFrame;
      }
      return left.id.localeCompare(right.id);
    })
    .map((lane) => lane.id);
}

function createStep(
  preset: SortingRacePreset,
  laneSteps: Record<SortingRaceAlgorithmId, ArrayStep[]>,
  tick: number,
  totalTicks: number,
  action: SortingRaceStep['action'],
): SortingRaceStep {
  const lanes = (Object.keys(laneSteps) as SortingRaceAlgorithmId[]).map((algorithmId) =>
    buildLaneSnapshot(algorithmId, laneSteps[algorithmId], tick),
  );
  const ranking = rankLanes(lanes);
  const leaderProgress = lanes.find((lane) => lane.id === ranking[0])?.progress ?? 0;
  const leaderIds = lanes.filter((lane) => lane.progress === leaderProgress).map((lane) => lane.id);

  return {
    description: '',
    codeLines: action === 'completed' ? [4] : action === 'initial' ? [1] : [2, 3],
    highlights: [],
    presetId: preset.presetId,
    dataset: cloneValues(preset.values),
    lanes,
    ranking,
    leaderIds,
    tick,
    totalTicks,
    action,
  };
}

export function getSortingRacePresetIds(): SortingRacePresetId[] {
  return Object.keys(SORTING_RACE_PRESETS) as SortingRacePresetId[];
}

export function getSortingRacePreset(presetId: SortingRacePresetId): SortingRacePreset {
  return {
    ...SORTING_RACE_PRESETS[presetId],
    values: cloneValues(SORTING_RACE_PRESETS[presetId].values),
  };
}

export function generateSortingRaceSteps(presetId: SortingRacePresetId): SortingRaceStep[] {
  const preset = getSortingRacePreset(presetId);
  const laneSteps = createLaneSteps(preset.values);
  const totalTicks = Math.max(
    ...Object.values(laneSteps).map((steps) => Math.max(steps.length - 1, 0)),
    0,
  );
  const steps: SortingRaceStep[] = [];

  steps.push(createStep(preset, laneSteps, 0, totalTicks, 'initial'));

  for (let tick = 1; tick <= totalTicks; tick += 1) {
    steps.push(createStep(preset, laneSteps, tick, totalTicks, 'tick'));
  }

  steps.push(createStep(preset, laneSteps, totalTicks, totalTicks, 'completed'));
  return steps;
}
