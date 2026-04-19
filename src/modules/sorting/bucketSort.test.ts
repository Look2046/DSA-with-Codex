import { describe, expect, it } from 'vitest';
import { generateBucketSortSteps } from './bucketSort';

describe('bucketSort', () => {
  it('distributes values into buckets, sorts each bucket, and merges them back in order', () => {
    const steps = generateBucketSortSteps('classic');
    const finalStep = steps.at(-1);
    const sortBucketSteps = steps.filter((step) => step.action === 'sortBucket');

    expect(sortBucketSteps.length).toBeGreaterThan(0);
    expect(finalStep?.outputArray).toEqual([3, 9, 21, 25, 29, 37, 43, 49]);
    expect(finalStep?.mergedCount).toBe(8);
  });
});
