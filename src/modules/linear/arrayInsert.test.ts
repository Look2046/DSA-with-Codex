import { describe, expect, it } from 'vitest';
import { generateArrayInsertSteps } from './arrayInsert';

describe('generateArrayInsertSteps', () => {
  it('returns deterministic steps for same input', () => {
    const run1 = generateArrayInsertSteps([3, 8, 1, 5], 2, 9);
    const run2 = generateArrayInsertSteps([3, 8, 1, 5], 2, 9);

    expect(run1).toEqual(run2);
  });

  it('inserts value at target index in final step', () => {
    const steps = generateArrayInsertSteps([3, 8, 1, 5], 2, 9);
    const last = steps[steps.length - 1];

    expect(last.action).toBe('completed');
    expect(last.arrayState).toEqual([3, 8, 9, 1, 5]);
  });

  it('supports insert at array tail', () => {
    const steps = generateArrayInsertSteps([4, 6], 2, 10);

    expect(steps[steps.length - 1].arrayState).toEqual([4, 6, 10]);
    expect(steps.some((step) => step.action === 'shift')).toBe(false);
  });

  it('throws for out-of-range index', () => {
    expect(() => generateArrayInsertSteps([1, 2, 3], 4, 9)).toThrow(RangeError);
    expect(() => generateArrayInsertSteps([1, 2, 3], -1, 9)).toThrow(RangeError);
  });
});
