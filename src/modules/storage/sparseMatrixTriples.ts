export type SparseMatrixTriplesPresetId = 'sparse-5x6' | 'sparse-6x6';

export type SparseMatrixTriplesDefinition = {
  presetId: SparseMatrixTriplesPresetId;
  rowCount: number;
  colCount: number;
  values: number[][];
};

export type SparseMatrixTriple = {
  row: number;
  col: number;
  value: number;
};

const PRESETS: Record<SparseMatrixTriplesPresetId, SparseMatrixTriplesDefinition> = {
  'sparse-5x6': {
    presetId: 'sparse-5x6',
    rowCount: 5,
    colCount: 6,
    values: [
      [0, 0, 7, 0, 0, 0],
      [5, 0, 0, 0, 0, 9],
      [0, 0, 0, 4, 0, 0],
      [0, 8, 0, 0, 0, 0],
      [0, 0, 0, 0, 6, 3],
    ],
  },
  'sparse-6x6': {
    presetId: 'sparse-6x6',
    rowCount: 6,
    colCount: 6,
    values: [
      [0, 0, 0, 11, 0, 0],
      [2, 0, 0, 0, 0, 0],
      [0, 0, 5, 0, 0, 0],
      [0, 7, 0, 0, 0, 13],
      [0, 0, 0, 0, 3, 0],
      [0, 0, 9, 0, 0, 1],
    ],
  },
};

export function getSparseMatrixTriplesPresetIds(): SparseMatrixTriplesPresetId[] {
  return Object.keys(PRESETS) as SparseMatrixTriplesPresetId[];
}

export function getSparseMatrixTriplesPreset(
  presetId: SparseMatrixTriplesPresetId,
): SparseMatrixTriplesDefinition {
  const preset = PRESETS[presetId];
  return {
    presetId,
    rowCount: preset.rowCount,
    colCount: preset.colCount,
    values: preset.values.map((row) => [...row]),
  };
}

export function isValidSparseMatrixTarget(
  definition: SparseMatrixTriplesDefinition,
  rowIndex: number,
  colIndex: number,
): boolean {
  return (
    Number.isInteger(rowIndex) &&
    Number.isInteger(colIndex) &&
    rowIndex >= 0 &&
    colIndex >= 0 &&
    rowIndex < definition.rowCount &&
    colIndex < definition.colCount
  );
}

export function flattenSparseMatrixTriples(values: number[][]): SparseMatrixTriple[] {
  const result: SparseMatrixTriple[] = [];

  for (let rowIndex = 0; rowIndex < values.length; rowIndex += 1) {
    for (let colIndex = 0; colIndex < (values[rowIndex]?.length ?? 0); colIndex += 1) {
      const value = values[rowIndex][colIndex];
      if (value !== 0) {
        result.push({
          row: rowIndex,
          col: colIndex,
          value,
        });
      }
    }
  }

  return result;
}

export function getSparseMatrixNonZeroCount(values: number[][]): number {
  return flattenSparseMatrixTriples(values).length;
}

export function getSparseMatrixTripleIndex(
  values: number[][],
  rowIndex: number,
  colIndex: number,
): number {
  const triples = flattenSparseMatrixTriples(values);
  return triples.findIndex((item) => item.row === rowIndex && item.col === colIndex);
}
