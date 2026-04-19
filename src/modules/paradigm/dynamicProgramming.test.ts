import { describe, expect, it } from 'vitest';
import { generateDynamicProgrammingSteps } from './dynamicProgramming';

describe('dynamicProgramming', () => {
  it('fills the knapsack table and reconstructs the chosen items', () => {
    const steps = generateDynamicProgrammingSteps('classic');
    const finalStep = steps.at(-1);

    expect(finalStep?.maxValue).toBe(23);
    expect(finalStep?.selectedItemIndices).toEqual([0, 1, 3]);
    expect(steps.some((step) => step.action === 'traceChoice')).toBe(true);
  });
});
