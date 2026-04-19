import { describe, expect, it } from 'vitest';
import { generateGreedySteps } from './greedy';

describe('greedy', () => {
  it('selects non-overlapping activities by earliest finishing time', () => {
    const steps = generateGreedySteps('classic');
    const finalStep = steps.at(-1);

    expect(finalStep?.selectedIds).toEqual(['A', 'D', 'E', 'I']);
    expect(steps.some((step) => step.action === 'skip')).toBe(true);
  });
});
