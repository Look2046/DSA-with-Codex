import { describe, expect, it } from 'vitest';
import { generateDivideConquerSteps } from './divideConquer';

describe('divideConquer', () => {
  it('finds the maximum value by splitting and combining subranges', () => {
    const steps = generateDivideConquerSteps('classic');
    const finalStep = steps.at(-1);

    expect(finalStep?.currentBest?.maxValue).toBe(14);
    expect(finalStep?.currentBest?.maxIndex).toBe(6);
    expect(steps.some((step) => step.action === 'combine')).toBe(true);
  });
});
