import { describe, expect, it } from 'vitest';
import { buildMaxHeapArray } from '../tree/heap';
import { generateHeapSortSteps } from './heapSort';

describe('heapSort', () => {
  it('builds a heap first and finishes with an ascending sorted array', () => {
    const input = [42, 17, 68, 9, 51, 23, 75];
    const steps = generateHeapSortSteps(input);
    const heapBuiltStep = steps.find((step) => step.action === 'heapBuilt');
    const finalStep = steps.at(-1);

    expect(heapBuiltStep?.arrayState).toEqual(buildMaxHeapArray(input));
    expect(finalStep?.arrayState).toEqual([9, 17, 23, 42, 51, 68, 75]);
    expect(finalStep?.heapSize).toBe(0);
    expect(steps.some((step) => step.action === 'extractMax')).toBe(true);
    expect(steps.some((step) => step.phase === 'sort' && step.action === 'swap')).toBe(true);
  });
});
