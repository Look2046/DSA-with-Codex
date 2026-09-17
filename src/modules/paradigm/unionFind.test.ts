import { describe, expect, it } from 'vitest';
import { generateUnionFindSteps } from './unionFind';

describe('unionFind', () => {
  it('merges components and applies path compression across find operations', () => {
    const steps = generateUnionFindSteps('classic');
    const finalStep = steps.at(-1);

    expect(finalStep?.components).toEqual([[0, 1, 2, 3, 4, 5, 6, 7]]);
    expect(steps.some((step) => step.action === 'compressPath')).toBe(true);
    expect(steps.some((step) => step.action === 'linkRoots')).toBe(true);
  });
});
