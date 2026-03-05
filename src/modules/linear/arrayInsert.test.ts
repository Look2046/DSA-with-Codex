import { describe, expect, it } from 'vitest';
import { ARRAY_CAPACITY, generateArrayInsertSteps } from './arrayInsert';

function usedValues(step: ReturnType<typeof generateArrayInsertSteps>[number]): number[] {
  return step.arrayState.slice(0, step.logicalLength).filter((value): value is number => value !== null);
}

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
    expect(usedValues(last)).toEqual([3, 8, 9, 1, 5]);
    expect(last.arrayState).toHaveLength(ARRAY_CAPACITY);
  });

  it('moves values right and inserts directly after target slot is found', () => {
    const steps = generateArrayInsertSteps([3, 8, 1, 5], 1, 9);
    const shiftSteps = steps.filter((step) => step.action === 'shift');
    const insertIndex = steps.findIndex((step) => step.action === 'insert');

    expect(shiftSteps.length).toBeGreaterThan(0);
    expect(shiftSteps[0].arrayState.includes(null)).toBe(true);
    expect(insertIndex).toBeGreaterThan(0);
    expect(steps[insertIndex - 1]?.action).toBe('shift');
  });

  it('supports insert at array tail', () => {
    const steps = generateArrayInsertSteps([4, 6], 2, 10);

    expect(usedValues(steps[steps.length - 1])).toEqual([4, 6, 10]);
    expect(steps.some((step) => step.action === 'shift')).toBe(false);
  });

  it('throws for out-of-range index', () => {
    expect(() => generateArrayInsertSteps([1, 2, 3], 4, 9)).toThrow(RangeError);
    expect(() => generateArrayInsertSteps([1, 2, 3], -1, 9)).toThrow(RangeError);
  });

  it('throws when array already reaches capacity', () => {
    const full = Array.from({ length: ARRAY_CAPACITY }, (_, index) => index);
    expect(() => generateArrayInsertSteps(full, 0, 9)).toThrow(RangeError);
  });
});
