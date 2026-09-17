import type { AnimationStep } from '../../types/animation';

export type DynamicProgrammingPresetId = 'classic' | 'compact';

export type DynamicProgrammingItem = {
  id: string;
  weight: number;
  value: number;
};

export type DynamicProgrammingPreset = {
  presetId: DynamicProgrammingPresetId;
  items: DynamicProgrammingItem[];
  capacity: number;
};

export type DynamicProgrammingAction = 'initial' | 'inspectCell' | 'writeCell' | 'traceChoice' | 'completed';

export type DynamicProgrammingStep = AnimationStep & {
  presetId: DynamicProgrammingPresetId;
  items: DynamicProgrammingItem[];
  capacity: number;
  table: number[][];
  action: DynamicProgrammingAction;
  row: number | null;
  col: number | null;
  skipValue: number | null;
  takeValue: number | null;
  chosen: boolean | null;
  selectedItemIndices: number[];
  maxValue: number;
};

const DYNAMIC_PROGRAMMING_PRESETS: Record<DynamicProgrammingPresetId, DynamicProgrammingPreset> = {
  classic: {
    presetId: 'classic',
    items: [
      { id: 'A', weight: 2, value: 6 },
      { id: 'B', weight: 2, value: 10 },
      { id: 'C', weight: 3, value: 12 },
      { id: 'D', weight: 1, value: 7 },
    ],
    capacity: 5,
  },
  compact: {
    presetId: 'compact',
    items: [
      { id: 'P', weight: 1, value: 4 },
      { id: 'Q', weight: 3, value: 9 },
      { id: 'R', weight: 4, value: 10 },
    ],
    capacity: 4,
  },
};

function cloneItems(items: DynamicProgrammingItem[]): DynamicProgrammingItem[] {
  return items.map((item) => ({ ...item }));
}

function cloneTable(table: number[][]): number[][] {
  return table.map((row) => [...row]);
}

function createStep(
  preset: DynamicProgrammingPreset,
  table: number[][],
  action: DynamicProgrammingAction,
  codeLines: number[],
  row: number | null,
  col: number | null,
  skipValue: number | null,
  takeValue: number | null,
  chosen: boolean | null,
  selectedItemIndices: number[],
): DynamicProgrammingStep {
  return {
    description: '',
    codeLines: [...codeLines],
    highlights: [],
    presetId: preset.presetId,
    items: cloneItems(preset.items),
    capacity: preset.capacity,
    table: cloneTable(table),
    action,
    row,
    col,
    skipValue,
    takeValue,
    chosen,
    selectedItemIndices: [...selectedItemIndices],
    maxValue: table[preset.items.length]?.[preset.capacity] ?? 0,
  };
}

export function getDynamicProgrammingPresetIds(): DynamicProgrammingPresetId[] {
  return Object.keys(DYNAMIC_PROGRAMMING_PRESETS) as DynamicProgrammingPresetId[];
}

export function getDynamicProgrammingPreset(presetId: DynamicProgrammingPresetId): DynamicProgrammingPreset {
  return {
    ...DYNAMIC_PROGRAMMING_PRESETS[presetId],
    items: cloneItems(DYNAMIC_PROGRAMMING_PRESETS[presetId].items),
  };
}

export function generateDynamicProgrammingSteps(presetId: DynamicProgrammingPresetId): DynamicProgrammingStep[] {
  const preset = getDynamicProgrammingPreset(presetId);
  const table = Array.from({ length: preset.items.length + 1 }, () =>
    Array.from({ length: preset.capacity + 1 }, () => 0),
  );
  const steps: DynamicProgrammingStep[] = [];
  const selectedItemIndices: number[] = [];

  steps.push(createStep(preset, table, 'initial', [1], null, null, null, null, null, selectedItemIndices));

  for (let row = 1; row <= preset.items.length; row += 1) {
    const item = preset.items[row - 1];
    if (!item) {
      continue;
    }

    for (let col = 0; col <= preset.capacity; col += 1) {
      const skipValue = table[row - 1]?.[col] ?? 0;
      const takeValue =
        col >= item.weight ? (table[row - 1]?.[col - item.weight] ?? 0) + item.value : null;

      steps.push(createStep(preset, table, 'inspectCell', [2], row, col, skipValue, takeValue, null, selectedItemIndices));

      const chosen = takeValue !== null && takeValue > skipValue;
      table[row][col] = chosen ? takeValue ?? skipValue : skipValue;
      steps.push(createStep(preset, table, 'writeCell', [3], row, col, skipValue, takeValue, chosen, selectedItemIndices));
    }
  }

  let row = preset.items.length;
  let col = preset.capacity;
  while (row > 0) {
    const item = preset.items[row - 1];
    if (!item) {
      break;
    }

    const chosen = table[row][col] !== table[row - 1]?.[col];
    if (chosen) {
      selectedItemIndices.unshift(row - 1);
      col -= item.weight;
    }

    steps.push(createStep(preset, table, 'traceChoice', [4], row, Math.max(col, 0), null, null, chosen, selectedItemIndices));
    row -= 1;
  }

  steps.push(createStep(preset, table, 'completed', [5], null, null, null, null, null, selectedItemIndices));
  return steps;
}
