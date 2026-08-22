export type UpperTriangularMatrixPresetId = 'upper-4x4' | 'upper-5x5';

export type UpperTriangularMatrixDefinition = {
  presetId: UpperTriangularMatrixPresetId;
  size: number;
  values: number[][];
};

export type UpperTriangularStoredInfo =
  | { kind: 'stored'; row: number; col: number; linearIndex: number }
  | { kind: 'constant'; linearIndex: number };

const PRESETS: Record<UpperTriangularMatrixPresetId, UpperTriangularMatrixDefinition> = {
  'upper-4x4': {
    presetId: 'upper-4x4',
    size: 4,
    values: [
      [12, 5, 7, 9],
      [0, 11, 6, 8],
      [0, 0, 10, 4],
      [0, 0, 0, 13],
    ],
  },
  'upper-5x5': {
    presetId: 'upper-5x5',
    size: 5,
    values: [
      [15, 4, 8, 6, 9],
      [0, 14, 5, 7, 3],
      [0, 0, 13, 2, 11],
      [0, 0, 0, 12, 10],
      [0, 0, 0, 0, 16],
    ],
  },
};

export function getUpperTriangularMatrixPresetIds(): UpperTriangularMatrixPresetId[] {
  return Object.keys(PRESETS) as UpperTriangularMatrixPresetId[];
}

export function getUpperTriangularMatrixPreset(presetId: UpperTriangularMatrixPresetId): UpperTriangularMatrixDefinition {
  const preset = PRESETS[presetId];
  return {
    presetId,
    size: preset.size,
    values: preset.values.map((row) => [...row]),
  };
}

export function isValidUpperTriangularTarget(
  definition: UpperTriangularMatrixDefinition,
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

export function isUpperStoredCell(rowIndex: number, colIndex: number): boolean {
  return rowIndex <= colIndex;
}

export function getUpperTriangularStoredCount(size: number): number {
  return (size * (size + 1)) / 2;
}

export function getUpperTriangularCompressedIndex(size: number, rowIndex: number, colIndex: number): number {
  if (!isUpperStoredCell(rowIndex, colIndex)) {
    return getUpperTriangularStoredCount(size);
  }

  return rowIndex * size - (rowIndex * (rowIndex - 1)) / 2 + (colIndex - rowIndex);
}

export function getUpperTriangularStoredInfo(size: number, rowIndex: number, colIndex: number): UpperTriangularStoredInfo {
  const linearIndex = getUpperTriangularCompressedIndex(size, rowIndex, colIndex);
  if (!isUpperStoredCell(rowIndex, colIndex)) {
    return { kind: 'constant', linearIndex };
  }

  return {
    kind: 'stored',
    row: rowIndex,
    col: colIndex,
    linearIndex,
  };
}

export function flattenUpperTriangularWithZero(
  values: number[][],
): Array<{ value: number | string; row: number | null; col: number | null; label: string }> {
  const size = values.length;
  const result: Array<{ value: number | string; row: number | null; col: number | null; label: string }> = [];

  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    for (let colIndex = rowIndex; colIndex < size; colIndex += 1) {
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
    label: '下三角常量区',
  });

  return result;
}
