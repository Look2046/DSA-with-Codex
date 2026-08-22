import {
  getSparseMatrixTriplesPreset,
  getSparseMatrixTriplesPresetIds,
  isValidSparseMatrixTarget,
  type SparseMatrixTriple,
  type SparseMatrixTriplesDefinition,
  type SparseMatrixTriplesPresetId,
} from './sparseMatrixTriples';

export type SparseMatrixLinkedPresetId = SparseMatrixTriplesPresetId;

export type SparseMatrixRowChain = {
  row: number;
  nodes: SparseMatrixTriple[];
};

export type SparseMatrixLinkedNodeInfo =
  | {
      kind: 'stored';
      row: number;
      col: number;
      value: number;
      rowNodeIndex: number;
      next: { row: number; col: number; value: number } | null;
    }
  | {
      kind: 'zero';
      row: number;
      col: number;
    };

export function getSparseMatrixLinkedPresetIds(): SparseMatrixLinkedPresetId[] {
  return getSparseMatrixTriplesPresetIds();
}

export function getSparseMatrixLinkedPreset(
  presetId: SparseMatrixLinkedPresetId,
): SparseMatrixTriplesDefinition {
  return getSparseMatrixTriplesPreset(presetId);
}

export function isValidSparseMatrixLinkedTarget(
  definition: SparseMatrixTriplesDefinition,
  rowIndex: number,
  colIndex: number,
): boolean {
  return isValidSparseMatrixTarget(definition, rowIndex, colIndex);
}

export function buildSparseMatrixRowChains(values: number[][]): SparseMatrixRowChain[] {
  return values.map((row, rowIndex) => ({
    row: rowIndex,
    nodes: row
      .map((value, colIndex) => ({ value, colIndex }))
      .filter((item) => item.value !== 0)
      .map((item) => ({
        row: rowIndex,
        col: item.colIndex,
        value: item.value,
      })),
  }));
}

export function getSparseMatrixLinkedNodeInfo(
  values: number[][],
  rowIndex: number,
  colIndex: number,
): SparseMatrixLinkedNodeInfo {
  const value = values[rowIndex]?.[colIndex] ?? 0;

  if (value === 0) {
    return {
      kind: 'zero',
      row: rowIndex,
      col: colIndex,
    };
  }

  const rowNodes = buildSparseMatrixRowChains(values)[rowIndex]?.nodes ?? [];
  const rowNodeIndex = rowNodes.findIndex((node) => node.col === colIndex);
  const nextNode = rowNodes[rowNodeIndex + 1] ?? null;

  return {
    kind: 'stored',
    row: rowIndex,
    col: colIndex,
    value,
    rowNodeIndex,
    next: nextNode
      ? {
          row: nextNode.row,
          col: nextNode.col,
          value: nextNode.value,
        }
      : null,
  };
}
