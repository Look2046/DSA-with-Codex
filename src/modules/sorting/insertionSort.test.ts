import { describe, expect, it } from 'vitest';
import { generateInsertionSortSteps } from './insertionSort';

describe('generateInsertionSortSteps', () => {
  it('returns deterministic steps for the same input', () => {
    const input = [5, 1, 4, 2, 8];
    const run1 = generateInsertionSortSteps(input);
    const run2 = generateInsertionSortSteps(input);
    expect(run1).toEqual(run2);
  });

  it('sorts output array state in final step', () => {
    const input = [9, 3, 7, 1, 2];
    const steps = generateInsertionSortSteps(input);
    expect(steps.length).toBeGreaterThan(0);
    const last = steps[steps.length - 1];
    expect(last.arrayState).toEqual([1, 2, 3, 7, 9]);
    expect(last.action).toBe('completed');
  });

  it('handles already-sorted arrays with valid step sequence', () => {
    const input = [1, 2, 3, 4];
    const steps = generateInsertionSortSteps(input);
    expect(steps[0].arrayState).toEqual([1, 2, 3, 4]);
    expect(steps[steps.length - 1].arrayState).toEqual([1, 2, 3, 4]);
    expect(steps.some((step) => step.action === 'compare')).toBe(true);
  });

  it('uses temp-lift/shift/insert steps for unsorted input', () => {
    const steps = generateInsertionSortSteps([5, 1, 4]);
    expect(steps.some((step) => step.action === 'lift')).toBe(true);
    expect(steps.some((step) => step.action === 'shift')).toBe(true);
    expect(steps.some((step) => step.action === 'insert')).toBe(true);
  });

  it('handles single-element arrays', () => {
    const steps = generateInsertionSortSteps([42]);
    expect(steps[0].arrayState).toEqual([42]);
    expect(steps[steps.length - 1].arrayState).toEqual([42]);
    expect(steps[steps.length - 1].action).toBe('completed');
  });
});
