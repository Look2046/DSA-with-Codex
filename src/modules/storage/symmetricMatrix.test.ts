import { describe, expect, it } from 'vitest';
import {
  flattenSymmetricByHalf,
  getCompressedIndex,
  getStoredCoordinate,
  getSymmetricMatrixPreset,
  isValidSymmetricTarget,
} from './symmetricMatrix';

describe('symmetricMatrix', () => {
  it('maps upper-half storage using mirrored coordinates when needed', () => {
    const preset = getSymmetricMatrixPreset('symmetric-4x4');

    expect(getStoredCoordinate(3, 1, 'upper')).toEqual({ row: 1, col: 3, mirrored: true });
    expect(getCompressedIndex(preset.size, 3, 1, 'upper')).toBe(6);
  });

  it('maps lower-half storage using mirrored coordinates when needed', () => {
    const preset = getSymmetricMatrixPreset('symmetric-4x4');

    expect(getStoredCoordinate(1, 3, 'lower')).toEqual({ row: 3, col: 1, mirrored: true });
    expect(getCompressedIndex(preset.size, 1, 3, 'lower')).toBe(7);
  });

  it('flattens upper and lower halves in the expected order', () => {
    const preset = getSymmetricMatrixPreset('symmetric-4x4');

    expect(flattenSymmetricByHalf(preset.values, 'upper').map((item) => item.value)).toEqual([9, 3, 5, 7, 8, 4, 6, 6, 2, 5]);
    expect(flattenSymmetricByHalf(preset.values, 'lower').map((item) => item.value)).toEqual([9, 3, 8, 5, 4, 6, 7, 6, 2, 5]);
  });

  it('validates target coordinates against matrix size', () => {
    const preset = getSymmetricMatrixPreset('symmetric-5x5');

    expect(isValidSymmetricTarget(preset, 4, 4)).toBe(true);
    expect(isValidSymmetricTarget(preset, 5, 1)).toBe(false);
    expect(isValidSymmetricTarget(preset, 2, -1)).toBe(false);
  });
});
