export type SymmetricMatrixPresetId = 'symmetric-4x4' | 'symmetric-5x5';
export type SymmetricMatrixStorageHalf = 'upper' | 'lower';

export type SymmetricMatrixDefinition = {
  presetId: SymmetricMatrixPresetId;
  size: number;
  values: number[][];
};

const PRESETS: Record<SymmetricMatrixPresetId, SymmetricMatrixDefinition> = {
  'symmetric-4x4': {
    presetId: 'symmetric-4x4',
    size: 4,
    values: [
      [9, 3, 5, 7],
      [3, 8, 4, 6],
      [5, 4, 6, 2],
      [7, 6, 2, 5],
    ],
  },
  'symmetric-5x5': {
    presetId: 'symmetric-5x5',
    size: 5,
    values: [
      [11, 4, 7, 8, 9],
      [4, 10, 3, 6, 2],
      [7, 3, 12, 5, 1],
      [8, 6, 5, 13, 4],
      [9, 2, 1, 4, 14],
    ],
  },
};

export function getSymmetricMatrixPresetIds(): SymmetricMatrixPresetId[] {
  return Object.keys(PRESETS) as SymmetricMatrixPresetId[];
}

export function getSymmetricMatrixPreset(presetId: SymmetricMatrixPresetId): SymmetricMatrixDefinition {
  const preset = PRESETS[presetId];
  return {
    presetId,
    size: preset.size,
    values: preset.values.map((row) => [...row]),
  };
}

export function isValidSymmetricTarget(definition: SymmetricMatrixDefinition, rowIndex: number, colIndex: number): boolean {
  return (
    Number.isInteger(rowIndex) &&
    Number.isInteger(colIndex) &&
    rowIndex >= 0 &&
    colIndex >= 0 &&
    rowIndex < definition.size &&
    colIndex < definition.size
  );
}

export function getStoredCoordinate(
  rowIndex: number,
  colIndex: number,
  half: SymmetricMatrixStorageHalf,
): { row: number; col: number; mirrored: boolean } {
  if (half === 'upper') {
    if (rowIndex <= colIndex) {
      return { row: rowIndex, col: colIndex, mirrored: false };
    }
    return { row: colIndex, col: rowIndex, mirrored: true };
  }

  if (rowIndex >= colIndex) {
    return { row: rowIndex, col: colIndex, mirrored: false };
  }
  return { row: colIndex, col: rowIndex, mirrored: true };
}

export function getCompressedIndex(
  size: number,
  rowIndex: number,
  colIndex: number,
  half: SymmetricMatrixStorageHalf,
): number {
  const stored = getStoredCoordinate(rowIndex, colIndex, half);
  const i = stored.row;
  const j = stored.col;

  if (half === 'upper') {
    return i * size - (i * (i - 1)) / 2 + (j - i);
  }

  return (i * (i + 1)) / 2 + j;
}

export function flattenSymmetricByHalf(
  values: number[][],
  half: SymmetricMatrixStorageHalf,
): Array<{ value: number; row: number; col: number }> {
  const size = values.length;
  const result: Array<{ value: number; row: number; col: number }> = [];

  if (half === 'upper') {
    for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
      for (let colIndex = rowIndex; colIndex < size; colIndex += 1) {
        result.push({
          value: values[rowIndex][colIndex],
          row: rowIndex,
          col: colIndex,
        });
      }
    }
    return result;
  }

  for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
    for (let colIndex = 0; colIndex <= rowIndex; colIndex += 1) {
      result.push({
        value: values[rowIndex][colIndex],
        row: rowIndex,
        col: colIndex,
      });
    }
  }
  return result;
}
