import { describe, expect, it } from 'vitest';
import {
  buildSparseMatrixRowChains,
  getSparseMatrixLinkedNodeInfo,
  getSparseMatrixLinkedPreset,
  isValidSparseMatrixLinkedTarget,
} from './sparseMatrixLinked';

describe('sparseMatrixLinked', () => {
  it('validates row/column bounds', () => {
    const preset = getSparseMatrixLinkedPreset('sparse-5x6');
    expect(isValidSparseMatrixLinkedTarget(preset, 0, 0)).toBe(true);
    expect(isValidSparseMatrixLinkedTarget(preset, 4, 5)).toBe(true);
    expect(isValidSparseMatrixLinkedTarget(preset, 5, 0)).toBe(false);
    expect(isValidSparseMatrixLinkedTarget(preset, 0, 6)).toBe(false);
  });

  it('builds one singly linked chain per row', () => {
    const preset = getSparseMatrixLinkedPreset('sparse-5x6');
    const chains = buildSparseMatrixRowChains(preset.values);
    expect(chains).toHaveLength(5);
    expect(chains[0]).toEqual({
      row: 0,
      nodes: [{ row: 0, col: 2, value: 7 }],
    });
    expect(chains[1]).toEqual({
      row: 1,
      nodes: [
        { row: 1, col: 0, value: 5 },
        { row: 1, col: 5, value: 9 },
      ],
    });
    expect(chains[2].nodes[0]).toEqual({ row: 2, col: 3, value: 4 });
  });

  it('returns next-node information for a stored cell', () => {
    const preset = getSparseMatrixLinkedPreset('sparse-5x6');
    expect(getSparseMatrixLinkedNodeInfo(preset.values, 1, 0)).toEqual({
      kind: 'stored',
      row: 1,
      col: 0,
      value: 5,
      rowNodeIndex: 0,
      next: { row: 1, col: 5, value: 9 },
    });
    expect(getSparseMatrixLinkedNodeInfo(preset.values, 1, 5)).toEqual({
      kind: 'stored',
      row: 1,
      col: 5,
      value: 9,
      rowNodeIndex: 1,
      next: null,
    });
  });

  it('reports zero cells as not entering the linked structure', () => {
    const preset = getSparseMatrixLinkedPreset('sparse-6x6');
    expect(getSparseMatrixLinkedNodeInfo(preset.values, 0, 0)).toEqual({
      kind: 'zero',
      row: 0,
      col: 0,
    });
  });
});
