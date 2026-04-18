import { describe, expect, it } from 'vitest';
import { generateKmpSteps } from './kmp';

describe('kmp', () => {
  it('builds the prefix table and finds the classic match deterministically', () => {
    const steps = generateKmpSteps('classic');
    const prefixCompleteStep = steps.find((step) => step.action === 'prefixComplete');
    const finalStep = steps.at(-1);

    expect(prefixCompleteStep?.lps).toEqual([0, 0, 1, 2, 0, 1, 2, 3, 4]);
    expect(finalStep?.matches).toEqual([10]);
    expect(steps.some((step) => step.action === 'prefixFallback')).toBe(true);
    expect(steps.some((step) => step.action === 'searchFallback')).toBe(true);
    expect(steps.some((step) => step.action === 'matchFound')).toBe(true);
  });
});
