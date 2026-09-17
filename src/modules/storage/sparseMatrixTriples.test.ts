import { describe, expect, it } from 'vitest';
import {
  flattenSparseMatrixTriples,
  getSparseMatrixNonZeroCount,
  getSparseMatrixTripleIndex,
  getSparseMatrixTriplesPreset,
  isValidSparseMatrixTarget,
} from './sparseMatrixTriples';

describe('sparseMatrixTriples', () => {
  it('validates sparse matrix target bounds', () => {
    const preset = getSparseMatrixTriplesPreset('sparse-5x6');
    expect(isValidSparseMatrixTarget(preset, 0, 0)).toBe(true);
    expect(isValidSparseMatrixTarget(preset, 4, 5)).toBe(true);
    expect(isValidSparseMatrixTarget(preset, 5, 0)).toBe(false);
    expect(isValidSparseMatrixTarget(preset, 0, 6)).toBe(false);
  });

  it('flattens only non-zero cells into row-major triples', () => {
    const preset = getSparseMatrixTriplesPreset('sparse-5x6');
    const triples = flattenSparseMatrixTriples(preset.values);
    expect(triples).toHaveLength(7);
    expect(triples[0]).toEqual({ row: 0, col: 2, value: 7 });
    expect(triples[3]).toEqual({ row: 2, col: 3, value: 4 });
    expect(triples[6]).toEqual({ row: 4, col: 5, value: 3 });
  });

  it('finds the triple index for stored cells and skips zeros', () => {
    const preset = getSparseMatrixTriplesPreset('sparse-6x6');
    expect(getSparseMatrixTripleIndex(preset.values, 0, 3)).toBe(0);
    expect(getSparseMatrixTripleIndex(preset.values, 3, 5)).toBe(4);
    expect(getSparseMatrixTripleIndex(preset.values, 5, 5)).toBe(7);
    expect(getSparseMatrixTripleIndex(preset.values, 1, 1)).toBe(-1);
  });

  it('counts non-zero elements correctly', () => {
    const preset = getSparseMatrixTriplesPreset('sparse-6x6');
    expect(getSparseMatrixNonZeroCount(preset.values)).toBe(8);
  });
});
