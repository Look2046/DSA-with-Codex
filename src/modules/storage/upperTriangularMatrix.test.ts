import { describe, expect, it } from 'vitest';
import {
  flattenUpperTriangularWithZero,
  getUpperTriangularCompressedIndex,
  getUpperTriangularMatrixPreset,
  getUpperTriangularStoredCount,
  getUpperTriangularStoredInfo,
  isUpperStoredCell,
  isValidUpperTriangularTarget,
} from './upperTriangularMatrix';

describe('upperTriangularMatrix', () => {
  it('validates target bounds', () => {
    const preset = getUpperTriangularMatrixPreset('upper-4x4');
    expect(isValidUpperTriangularTarget(preset, 0, 0)).toBe(true);
    expect(isValidUpperTriangularTarget(preset, 3, 3)).toBe(true);
    expect(isValidUpperTriangularTarget(preset, 4, 0)).toBe(false);
    expect(isValidUpperTriangularTarget(preset, 1, -1)).toBe(false);
  });

  it('maps stored upper-half cells to compressed indices', () => {
    expect(getUpperTriangularCompressedIndex(4, 0, 0)).toBe(0);
    expect(getUpperTriangularCompressedIndex(4, 0, 3)).toBe(3);
    expect(getUpperTriangularCompressedIndex(4, 1, 1)).toBe(4);
    expect(getUpperTriangularCompressedIndex(4, 2, 3)).toBe(8);
    expect(getUpperTriangularCompressedIndex(4, 3, 3)).toBe(9);
  });

  it('maps strict lower-half cells to the shared zero slot', () => {
    const zeroIndex = getUpperTriangularStoredCount(4);
    expect(isUpperStoredCell(3, 1)).toBe(false);
    expect(getUpperTriangularCompressedIndex(4, 3, 1)).toBe(zeroIndex);
    expect(getUpperTriangularStoredInfo(4, 2, 0)).toEqual({ kind: 'constant', linearIndex: zeroIndex });
  });

  it('flattens the upper triangle in row order and appends one constant slot', () => {
    const preset = getUpperTriangularMatrixPreset('upper-4x4');
    const flattened = flattenUpperTriangularWithZero(preset.values);
    expect(flattened).toHaveLength(11);
    expect(flattened[0]).toEqual({ value: 12, row: 0, col: 0, label: 'a[0][0]' });
    expect(flattened[4]).toEqual({ value: 11, row: 1, col: 1, label: 'a[1][1]' });
    expect(flattened[10]).toEqual({ value: 'c', row: null, col: null, label: '下三角常量区' });
  });
});
