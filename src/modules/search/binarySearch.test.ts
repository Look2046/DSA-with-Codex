import { describe, expect, it } from 'vitest';
import { generateBinarySearchSteps } from './binarySearch';

describe('generateBinarySearchSteps', () => {
  it('returns deterministic steps for the same input', () => {
    const input = [1, 3, 5, 7, 9, 11];
    const run1 = generateBinarySearchSteps(input, 7);
    const run2 = generateBinarySearchSteps(input, 7);
    expect(run1).toEqual(run2);
  });

  it('produces found result when target exists', () => {
    const steps = generateBinarySearchSteps([1, 3, 5, 7, 9], 7);
    const foundStep = steps.find((step) => step.action === 'found');
    const last = steps[steps.length - 1];

    expect(foundStep?.foundIndex).toBe(3);
    expect(last.action).toBe('completed');
    expect(last.foundIndex).toBe(3);
  });

  it('produces not-found result when target is absent', () => {
    const steps = generateBinarySearchSteps([1, 3, 5, 7, 9], 4);
    expect(steps.some((step) => step.action === 'notFound')).toBe(true);
    expect(steps[steps.length - 1].foundIndex).toBe(-1);
  });

  it('handles empty array input', () => {
    const steps = generateBinarySearchSteps([], 1);
    expect(steps[0].action).toBe('initial');
    expect(steps[steps.length - 1].action).toBe('completed');
    expect(steps[steps.length - 1].foundIndex).toBe(-1);
  });
});
