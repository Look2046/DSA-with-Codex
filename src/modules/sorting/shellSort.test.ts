import { describe, expect, it } from 'vitest';
import { generateShellSortSteps } from './shellSort';

describe('generateShellSortSteps', () => {
  it('returns deterministic steps for the same input', () => {
    const input = [23, 12, 1, 8, 34, 54, 2, 3];
    const run1 = generateShellSortSteps(input);
    const run2 = generateShellSortSteps(input);
    expect(run1).toEqual(run2);
  });

  it('sorts output array state in final step', () => {
    const input = [9, 3, 7, 1, 2];
    const steps = generateShellSortSteps(input);
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.arrayState).toEqual([1, 2, 3, 7, 9]);
    expect(last.action).toBe('completed');
  });

  it('emits gap-change and shift steps for gap-based insertion passes', () => {
    const steps = generateShellSortSteps([23, 12, 1, 8, 34, 54, 2, 3]);
    const gapChanges = steps.filter((step) => step.action === 'gapChange').map((step) => step.gap);

    expect(gapChanges).toEqual([4, 2, 1]);
    expect(steps.some((step) => step.action === 'shift')).toBe(true);
    expect(steps.some((step) => step.action === 'insert')).toBe(true);
  });

  it('handles single-element arrays', () => {
    const steps = generateShellSortSteps([42]);
    expect(steps[0].arrayState).toEqual([42]);
    expect(steps[steps.length - 1].arrayState).toEqual([42]);
    expect(steps[steps.length - 1].action).toBe('completed');
  });
});
