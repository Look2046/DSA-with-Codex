import { describe, expect, it } from 'vitest';
import { generateBacktrackingSteps } from './backtracking';

describe('backtracking', () => {
  it('enumerates 4-queen solutions with explicit conflict and backtrack states', () => {
    const steps = generateBacktrackingSteps('n4');
    const finalStep = steps.at(-1);

    expect(finalStep?.solutionCount).toBe(2);
    expect(steps.some((step) => step.action === 'conflict')).toBe(true);
    expect(steps.some((step) => step.action === 'backtrack')).toBe(true);
  });
});
