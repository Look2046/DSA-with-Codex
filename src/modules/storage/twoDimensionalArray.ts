import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type TwoDimensionalArrayPresetId = 'matrix-3x4' | 'matrix-4x4';
export type TwoDimensionalArrayStorageOrder = 'row-major' | 'column-major';

export type TwoDimensionalArrayAction =
  | 'initial'
  | 'selectTarget'
  | 'scanRowMajor'
  | 'locateLinearIndex'
  | 'completed';

export type TwoDimensionalArrayCell = {
  row: number;
  col: number;
  value: number;
};

export type TwoDimensionalArrayDefinition = {
  presetId: TwoDimensionalArrayPresetId;
  rowCount: number;
  colCount: number;
  values: number[][];
};

export type TwoDimensionalArrayStep = AnimationStep & {
  action: TwoDimensionalArrayAction;
  matrix: number[][];
  linearValues: number[];
  rowCount: number;
  colCount: number;
  target: TwoDimensionalArrayCell;
  activeMatrixCell: { row: number; col: number } | null;
  activeLinearIndex: number | null;
  scannedLinearIndices: number[];
  completedLinearIndices: number[];
  formulaText: string;
  expansionText: string;
  rowMajorPrefixCount: number;
};

const PRESETS: Record<TwoDimensionalArrayPresetId, TwoDimensionalArrayDefinition> = {
  'matrix-3x4': {
    presetId: 'matrix-3x4',
    rowCount: 3,
    colCount: 4,
    values: [
      [11, 12, 13, 14],
      [21, 22, 23, 24],
      [31, 32, 33, 34],
    ],
  },
  'matrix-4x4': {
    presetId: 'matrix-4x4',
    rowCount: 4,
    colCount: 4,
    values: [
      [5, 8, 11, 14],
      [17, 20, 23, 26],
      [29, 32, 35, 38],
      [41, 44, 47, 50],
    ],
  },
};

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function flattenMatrix(values: number[][]): number[] {
  return values.flatMap((row) => [...row]);
}

export function flattenMatrixByOrder(
  values: number[][],
  order: TwoDimensionalArrayStorageOrder,
): number[] {
  if (order === 'row-major') {
    return flattenMatrix(values);
  }

  const rowCount = values.length;
  const colCount = values[0]?.length ?? 0;
  const result: number[] = [];

  for (let colIndex = 0; colIndex < colCount; colIndex += 1) {
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      const value = values[rowIndex]?.[colIndex];
      if (value !== undefined) {
        result.push(value);
      }
    }
  }

  return result;
}

export function getLinearIndexByOrder(
  row: number,
  col: number,
  rowCount: number,
  colCount: number,
  order: TwoDimensionalArrayStorageOrder,
): number {
  if (order === 'row-major') {
    return row * colCount + col;
  }

  return col * rowCount + row;
}

export function getPrefixCountByOrder(
  row: number,
  col: number,
  rowCount: number,
  colCount: number,
  order: TwoDimensionalArrayStorageOrder,
): number {
  return getLinearIndexByOrder(row, col, rowCount, colCount, order);
}

function createHighlights(
  activeLinearIndex: number | null,
  completedLinearIndices: number[],
  targetLinearIndex: number,
): HighlightEntry[] {
  const highlights: HighlightEntry[] = completedLinearIndices.map((index) => ({
    index,
    type: index === targetLinearIndex ? 'matched' : 'sorted',
  }));

  if (activeLinearIndex !== null && !completedLinearIndices.includes(activeLinearIndex)) {
    highlights.push({
      index: activeLinearIndex,
      type: activeLinearIndex === targetLinearIndex ? 'matched' : 'visiting',
    });
  }

  return highlights;
}

function createStep(
  action: TwoDimensionalArrayAction,
  matrix: number[][],
  target: TwoDimensionalArrayCell,
  activeMatrixCell: { row: number; col: number } | null,
  activeLinearIndex: number | null,
  scannedLinearIndices: number[],
  completedLinearIndices: number[],
  codeLines: number[],
): TwoDimensionalArrayStep {
  const rowCount = matrix.length;
  const colCount = matrix[0]?.length ?? 0;
  const targetLinearIndex = getLinearIndexByOrder(target.row, target.col, rowCount, colCount, 'row-major');
  return {
    description: action,
    codeLines: [...codeLines],
    highlights: cloneHighlights(createHighlights(activeLinearIndex, completedLinearIndices, targetLinearIndex)),
    action,
    matrix: matrix.map((row) => [...row]),
    linearValues: flattenMatrixByOrder(matrix, 'row-major'),
    rowCount,
    colCount,
    target: { ...target },
    activeMatrixCell: activeMatrixCell ? { ...activeMatrixCell } : null,
    activeLinearIndex,
    scannedLinearIndices: [...scannedLinearIndices],
    completedLinearIndices: [...completedLinearIndices],
    formulaText: 'k = i * cols + j',
    expansionText: `k = ${target.row} * ${colCount} + ${target.col} = ${targetLinearIndex}`,
    rowMajorPrefixCount: target.row * colCount,
  };
}

export function getTwoDimensionalArrayPresetIds(): TwoDimensionalArrayPresetId[] {
  return Object.keys(PRESETS) as TwoDimensionalArrayPresetId[];
}

export function getTwoDimensionalArrayPreset(presetId: TwoDimensionalArrayPresetId): TwoDimensionalArrayDefinition {
  const preset = PRESETS[presetId];
  return {
    presetId,
    rowCount: preset.rowCount,
    colCount: preset.colCount,
    values: preset.values.map((row) => [...row]),
  };
}

export function isValidTarget(
  definition: TwoDimensionalArrayDefinition,
  rowIndex: number,
  colIndex: number,
): boolean {
  return (
    Number.isInteger(rowIndex) &&
    Number.isInteger(colIndex) &&
    rowIndex >= 0 &&
    rowIndex < definition.rowCount &&
    colIndex >= 0 &&
    colIndex < definition.colCount
  );
}

export function generateTwoDimensionalArraySteps(
  presetId: TwoDimensionalArrayPresetId,
  rowIndex: number,
  colIndex: number,
): TwoDimensionalArrayStep[] {
  const definition = getTwoDimensionalArrayPreset(presetId);
  const targetValue = definition.values[rowIndex]?.[colIndex];

  if (targetValue === undefined) {
    throw new Error(`Invalid target (${rowIndex}, ${colIndex}) for preset ${presetId}.`);
  }

  const target = {
    row: rowIndex,
    col: colIndex,
    value: targetValue,
  };

  const targetLinearIndex = getLinearIndexByOrder(
    rowIndex,
    colIndex,
    definition.rowCount,
    definition.colCount,
    'row-major',
  );
  const steps: TwoDimensionalArrayStep[] = [];

  steps.push(createStep('initial', definition.values, target, null, null, [], [], [1]));
  steps.push(createStep('selectTarget', definition.values, target, { row: rowIndex, col: colIndex }, null, [], [], [1, 2]));

  const completedLinearIndices: number[] = [];
  for (let index = 0; index <= targetLinearIndex; index += 1) {
    steps.push(
      createStep(
        'scanRowMajor',
        definition.values,
        target,
        { row: Math.floor(index / definition.colCount), col: index % definition.colCount },
        index,
        Array.from({ length: index + 1 }, (_, current) => current),
        [...completedLinearIndices],
        [3],
      ),
    );
    completedLinearIndices.push(index);
  }

  steps.push(
    createStep(
      'locateLinearIndex',
      definition.values,
      target,
      { row: rowIndex, col: colIndex },
      targetLinearIndex,
      Array.from({ length: targetLinearIndex + 1 }, (_, current) => current),
      [...completedLinearIndices],
      [4, 5],
    ),
  );

  steps.push(
    createStep(
      'completed',
      definition.values,
      target,
      { row: rowIndex, col: colIndex },
      targetLinearIndex,
      Array.from({ length: targetLinearIndex + 1 }, (_, current) => current),
      [...completedLinearIndices],
      [6],
    ),
  );

  return steps;
}
