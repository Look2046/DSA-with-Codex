import { describe, expect, it } from 'vitest';
import { generateCountingSortSteps } from './countingSort';

describe('countingSort', () => {
  it('counts, accumulates, and places values into a sorted output array', () => {
    const steps = generateCountingSortSteps('classic');
    const finalStep = steps.at(-1);
    const accumulateSteps = steps.filter((step) => step.action === 'accumulate');

    expect(accumulateSteps.length).toBeGreaterThan(0);
    expect(finalStep?.outputArray).toEqual([1, 2, 2, 3, 3, 4, 8]);
    expect(finalStep?.placedCount).toBe(7);
  });
});
