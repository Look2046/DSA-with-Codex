import { describe, expect, it } from 'vitest';
import { generateQuickSortSteps } from './quickSort';

describe('generateQuickSortSteps', () => {
  it('returns deterministic steps for the same input', () => {
    const input = [8, 3, 7, 4, 9, 2];
    const run1 = generateQuickSortSteps(input);
    const run2 = generateQuickSortSteps(input);
    expect(run1).toEqual(run2);
  });

  it('sorts output array state in final step', () => {
    const steps = generateQuickSortSteps([9, 3, 7, 1, 2]);
    const last = steps[steps.length - 1];
    expect(last.arrayState).toEqual([1, 2, 3, 7, 9]);
    expect(last.action).toBe('completed');
  });

  it('emits dual-pointer partition actions including left/right fill and pivot place', () => {
    const steps = generateQuickSortSteps([4, 7, 1, 6, 3, 5, 2]);

    expect(steps.some((step) => step.action === 'partitionStart')).toBe(true);
    expect(steps.some((step) => step.action === 'pivotLift')).toBe(true);
    expect(steps.some((step) => step.action === 'scanRight')).toBe(true);
    expect(steps.some((step) => step.action === 'scanLeft')).toBe(true);
    expect(steps.some((step) => step.action === 'fillLeft')).toBe(true);
    expect(steps.some((step) => step.action === 'fillRight')).toBe(true);
    expect(steps.some((step) => step.action === 'pivotPlace')).toBe(true);
    expect(steps.some((step) => step.action === 'rangeSorted')).toBe(true);
  });

  it('keeps duplicate values sorted correctly', () => {
    const steps = generateQuickSortSteps([4, 1, 4, 2, 4]);
    const last = steps[steps.length - 1];

    expect(last.arrayState).toEqual([1, 2, 4, 4, 4]);
    expect(last.action).toBe('completed');
  });

  it('handles single-element arrays', () => {
    const steps = generateQuickSortSteps([42]);
    expect(steps[0].arrayState).toEqual([42]);
    expect(steps[steps.length - 1].arrayState).toEqual([42]);
    expect(steps[steps.length - 1].action).toBe('completed');
  });
});
