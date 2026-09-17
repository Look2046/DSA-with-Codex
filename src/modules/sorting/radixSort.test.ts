import { describe, expect, it } from 'vitest';
import { generateRadixSortSteps } from './radixSort';

describe('radixSort', () => {
  it('sorts numbers by collecting digit buckets pass by pass', () => {
    const steps = generateRadixSortSteps('classic');
    const passCompleteSteps = steps.filter((step) => step.action === 'passComplete');
    const finalStep = steps.at(-1);

    expect(passCompleteSteps).toHaveLength(3);
    expect(finalStep?.arrayState).toEqual([2, 24, 45, 66, 75, 90, 170, 802]);
    expect(finalStep?.collectedCount).toBe(8);
  });
});
