import { describe, expect, it } from 'vitest';
import { generateLinearSearchSteps } from './linearSearch';

describe('generateLinearSearchSteps', () => {
  it('returns deterministic steps for the same input', () => {
    const input = [4, 1, 7, 3, 7];
    const run1 = generateLinearSearchSteps(input, 7);
    const run2 = generateLinearSearchSteps(input, 7);
    expect(run1).toEqual(run2);
  });

  it('stops at the first matched index', () => {
    const steps = generateLinearSearchSteps([9, 3, 3, 5], 3);
    const foundStep = steps.find((step) => step.action === 'found');
    const last = steps[steps.length - 1];

    expect(foundStep?.foundIndex).toBe(1);
    expect(last.action).toBe('completed');
    expect(last.foundIndex).toBe(1);
  });

  it('produces not-found result when target is absent', () => {
    const steps = generateLinearSearchSteps([2, 4, 6], 9);
    expect(steps.some((step) => step.action === 'notFound')).toBe(true);
    expect(steps[steps.length - 1].foundIndex).toBe(-1);
  });

  it('handles empty array input', () => {
    const steps = generateLinearSearchSteps([], 1);
    expect(steps[0].action).toBe('initial');
    expect(steps[steps.length - 1].action).toBe('completed');
    expect(steps[steps.length - 1].foundIndex).toBe(-1);
  });
});
