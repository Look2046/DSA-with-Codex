import { describe, expect, it } from 'vitest';
import {
  flattenLowerTriangularWithConstant,
  getLowerTriangularCompressedIndex,
  getLowerTriangularMatrixPreset,
  getLowerTriangularStoredCount,
  getLowerTriangularStoredInfo,
  isLowerStoredCell,
  isValidLowerTriangularTarget,
} from './lowerTriangularMatrix';

describe('lowerTriangularMatrix', () => {
  it('validates target bounds', () => {
    const preset = getLowerTriangularMatrixPreset('lower-4x4');
    expect(isValidLowerTriangularTarget(preset, 0, 0)).toBe(true);
    expect(isValidLowerTriangularTarget(preset, 3, 3)).toBe(true);
    expect(isValidLowerTriangularTarget(preset, 4, 0)).toBe(false);
    expect(isValidLowerTriangularTarget(preset, -1, 1)).toBe(false);
  });

  it('maps stored lower-half cells to compressed indices', () => {
    expect(getLowerTriangularCompressedIndex(4, 0, 0)).toBe(0);
    expect(getLowerTriangularCompressedIndex(4, 1, 0)).toBe(1);
    expect(getLowerTriangularCompressedIndex(4, 2, 2)).toBe(5);
    expect(getLowerTriangularCompressedIndex(4, 3, 1)).toBe(7);
    expect(getLowerTriangularCompressedIndex(4, 3, 3)).toBe(9);
  });

  it('maps strict upper-half cells to the shared constant slot', () => {
    const constantIndex = getLowerTriangularStoredCount(4);
    expect(isLowerStoredCell(1, 3)).toBe(false);
    expect(getLowerTriangularCompressedIndex(4, 1, 3)).toBe(constantIndex);
    expect(getLowerTriangularStoredInfo(4, 0, 2)).toEqual({ kind: 'constant', linearIndex: constantIndex });
  });

  it('flattens the lower triangle in row order and appends one constant slot', () => {
    const preset = getLowerTriangularMatrixPreset('lower-4x4');
    const flattened = flattenLowerTriangularWithConstant(preset.values);
    expect(flattened).toHaveLength(11);
    expect(flattened[0]).toEqual({ value: 12, row: 0, col: 0, label: 'a[0][0]' });
    expect(flattened[5]).toEqual({ value: 10, row: 2, col: 2, label: 'a[2][2]' });
    expect(flattened[10]).toEqual({ value: 'c', row: null, col: null, label: '上三角常量区' });
  });
});
