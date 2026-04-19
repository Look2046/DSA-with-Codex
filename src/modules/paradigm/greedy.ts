import type { AnimationStep } from '../../types/animation';

export type GreedyPresetId = 'classic' | 'compact';

export type GreedyActivity = {
  id: string;
  start: number;
  end: number;
};

export type GreedyPreset = {
  presetId: GreedyPresetId;
  activities: GreedyActivity[];
};

export type GreedyAction = 'initial' | 'sort' | 'inspect' | 'select' | 'skip' | 'completed';

export type GreedyStep = AnimationStep & {
  presetId: GreedyPresetId;
  activities: GreedyActivity[];
  sortedActivities: GreedyActivity[];
  action: GreedyAction;
  activeIndex: number | null;
  selectedIds: string[];
  inspectedIds: string[];
  lastEnd: number;
};

const GREEDY_PRESETS: Record<GreedyPresetId, GreedyPreset> = {
  classic: {
    presetId: 'classic',
    activities: [
      { id: 'A', start: 1, end: 4 },
      { id: 'B', start: 3, end: 5 },
      { id: 'C', start: 0, end: 6 },
      { id: 'D', start: 5, end: 7 },
      { id: 'E', start: 8, end: 9 },
      { id: 'F', start: 5, end: 9 },
      { id: 'G', start: 8, end: 11 },
      { id: 'H', start: 2, end: 14 },
      { id: 'I', start: 12, end: 16 },
    ],
  },
  compact: {
    presetId: 'compact',
    activities: [
      { id: 'J', start: 0, end: 2 },
      { id: 'K', start: 1, end: 3 },
      { id: 'L', start: 3, end: 4 },
      { id: 'M', start: 4, end: 7 },
      { id: 'N', start: 6, end: 9 },
    ],
  },
};

function cloneActivities(activities: GreedyActivity[]): GreedyActivity[] {
  return activities.map((activity) => ({ ...activity }));
}

function createStep(
  preset: GreedyPreset,
  sortedActivities: GreedyActivity[],
  action: GreedyAction,
  codeLines: number[],
  activeIndex: number | null,
  selectedIds: string[],
  inspectedIds: string[],
  lastEnd: number,
): GreedyStep {
  return {
    description: '',
    codeLines: [...codeLines],
    highlights: [],
    presetId: preset.presetId,
    activities: cloneActivities(preset.activities),
    sortedActivities: cloneActivities(sortedActivities),
    action,
    activeIndex,
    selectedIds: [...selectedIds],
    inspectedIds: [...inspectedIds],
    lastEnd,
  };
}

export function getGreedyPresetIds(): GreedyPresetId[] {
  return Object.keys(GREEDY_PRESETS) as GreedyPresetId[];
}

export function getGreedyPreset(presetId: GreedyPresetId): GreedyPreset {
  return {
    ...GREEDY_PRESETS[presetId],
    activities: cloneActivities(GREEDY_PRESETS[presetId].activities),
  };
}

export function generateGreedySteps(presetId: GreedyPresetId): GreedyStep[] {
  const preset = getGreedyPreset(presetId);
  const sortedActivities = cloneActivities(preset.activities).sort(
    (left, right) => left.end - right.end || left.start - right.start,
  );
  const steps: GreedyStep[] = [];
  const selectedIds: string[] = [];
  const inspectedIds: string[] = [];
  let lastEnd = Number.NEGATIVE_INFINITY;

  steps.push(createStep(preset, sortedActivities, 'initial', [1], null, selectedIds, inspectedIds, lastEnd));
  steps.push(createStep(preset, sortedActivities, 'sort', [2], null, selectedIds, inspectedIds, lastEnd));

  sortedActivities.forEach((activity, index) => {
    inspectedIds.push(activity.id);
    steps.push(createStep(preset, sortedActivities, 'inspect', [3], index, selectedIds, inspectedIds, lastEnd));

    if (activity.start >= lastEnd) {
      selectedIds.push(activity.id);
      lastEnd = activity.end;
      steps.push(createStep(preset, sortedActivities, 'select', [4], index, selectedIds, inspectedIds, lastEnd));
    } else {
      steps.push(createStep(preset, sortedActivities, 'skip', [5], index, selectedIds, inspectedIds, lastEnd));
    }
  });

  steps.push(createStep(preset, sortedActivities, 'completed', [6], null, selectedIds, inspectedIds, lastEnd));
  return steps;
}
