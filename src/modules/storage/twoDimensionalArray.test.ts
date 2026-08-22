import { describe, expect, it } from 'vitest';
import {
  flattenMatrixByOrder,
  generateTwoDimensionalArraySteps,
  getLinearIndexByOrder,
  getTwoDimensionalArrayPreset,
  isValidTarget,
} from './twoDimensionalArray';

describe('twoDimensionalArray', () => {
  it('maps the selected matrix cell to the expected row-major linear index', () => {
    const steps = generateTwoDimensionalArraySteps('matrix-3x4', 1, 2);
    const completedStep = steps[steps.length - 1];

    expect(completedStep.target.value).toBe(23);
    expect(completedStep.activeLinearIndex).toBe(6);
    expect(completedStep.expansionText).toBe('k = 1 * 4 + 2 = 6');
    expect(completedStep.linearValues[6]).toBe(23);
  });

  it('scans each row-major prefix position before resolving the target location', () => {
    const steps = generateTwoDimensionalArraySteps('matrix-4x4', 2, 1);
    const scanSteps = steps.filter((step) => step.action === 'scanRowMajor');

    expect(scanSteps).toHaveLength(10);
    expect(scanSteps[0]?.activeLinearIndex).toBe(0);
    expect(scanSteps[9]?.activeLinearIndex).toBe(9);
    expect(scanSteps[9]?.activeMatrixCell).toEqual({ row: 2, col: 1 });
  });

  it('validates target coordinates against the preset shape', () => {
    const preset = getTwoDimensionalArrayPreset('matrix-3x4');

    expect(isValidTarget(preset, 2, 3)).toBe(true);
    expect(isValidTarget(preset, 3, 0)).toBe(false);
    expect(isValidTarget(preset, 1, 4)).toBe(false);
  });

  it('supports column-major flattening and index mapping', () => {
    const preset = getTwoDimensionalArrayPreset('matrix-3x4');

    expect(flattenMatrixByOrder(preset.values, 'column-major')).toEqual([11, 21, 31, 12, 22, 32, 13, 23, 33, 14, 24, 34]);
    expect(getLinearIndexByOrder(1, 2, preset.rowCount, preset.colCount, 'column-major')).toBe(7);
    expect(getLinearIndexByOrder(1, 2, preset.rowCount, preset.colCount, 'row-major')).toBe(6);
  });
});
