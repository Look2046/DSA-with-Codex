export type LowerTriangularMatrixPresetId = 'lower-4x4' | 'lower-5x5';

export type LowerTriangularMatrixDefinition = {
  presetId: LowerTriangularMatrixPresetId;
  size: number;
  values: number[][];
};

export type LowerTriangularStoredInfo =
  | { kind: 'stored'; row: number; col: number; linearIndex: number }
  | { kind: 'constant'; linearIndex: number };

const PRESETS: Record<LowerTriangularMatrixPresetId, LowerTriangularMatrixDefinition> = {
  'lower-4x4': {
    presetId: 'lower-4x4',
    size: 4,
    values: [
      [12, 0, 0, 0],
      [5, 11, 0, 0],
      [7, 6, 10, 0],
      [9, 8, 4, 13],
    ],
  },
  'lower-5x5': {
    presetId: 'lower-5x5',
    size: 5,
    values: [
      [15, 0, 0, 0, 0],
      [4, 14, 0, 0, 0],
      [8, 5, 13, 0, 0],
      [6, 7, 2, 12, 0],
      [9, 3, 11, 10, 16],
    ],
  },
};

export function getLowerTriangularMatrixPresetIds(): LowerTriangularMatrixPresetId[] {
  return Object.keys(PRESETS) as LowerTriangularMatrixPresetId[];
}

export function getLowerTriangularMatrixPreset(presetId: LowerTriangularMatrixPresetId): LowerTriangularMatrixDefinition {
  const preset = PRESETS[presetId];
  return {
    presetId,
    size: preset.size,
    values: preset.values.map((row) => [...row]),
  };
}

export function isValidLowerTriangularTarget(
  definition: LowerTriangularMatrixDefinition,
  rowIndex: number,
  colIndex: number,
): boolean {
  return (
    Number.isInteger(rowIndex) &&
    Number.isInteger(colIndex) &&
    rowIndex >= 0 &&
    colIndex >= 0 &&
    rowIndex < definition.size &&
    colIndex < definition.size
  );
}

export function isLowerStoredCell(rowIndex: number, colIndex: number): boolean {
  return rowIndex >= colIndex;
}

export function getLowerTriangularStoredCount(size: number): number {
  return (size * (size + 1)) / 2;
}

export function getLowerTriangularCompressedIndex(size: number, rowIndex: number, colIndex: number): number {
  if (!isLowerStoredCell(rowIndex, colIndex)) {
    return getLowerTriangularStoredCount(size);
  }

  return (rowIndex * (rowIndex + 1)) / 2 + colIndex;
}

export function getLowerTriangularStoredInfo(size: number, rowIndex: number, colIndex: number): LowerTriangularStoredInfo {
  const linearIndex = getLowerTriangularCompressedIndex(size, rowIndex, colIndex);
  if (!isLowerStoredCell(rowIndex, colIndex)) {
    return { kind: 'constant', linearIndex };
  }

  return {
    kind: 'stored',
    row: rowIndex,
    col: colIndex,
    linearIndex,
  };
}

export function flattenLowerTriangularWithConstant(
  values: number[][],
): Array<{ value: number | string; row: number | null; col: number | null; label: string }> {
  const size = values.length;
  const result: Array<{ value: number | string; row: number | null; col: number | null; label: string }> = [];

  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    for (let colIndex = 0; colIndex <= rowIndex; colIndex += 1) {
      result.push({
        value: values[rowIndex][colIndex],
        row: rowIndex,
        col: colIndex,
        label: `a[${rowIndex}][${colIndex}]`,
      });
    }
  }

  result.push({
    value: 'c',
    row: null,
    col: null,
    label: '上三角常量区',
  });

  return result;
}
