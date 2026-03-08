import { describe, expect, it } from 'vitest';
import { generateMergeSortBottomUpSteps, generateMergeSortSteps } from './mergeSort';

describe('generateMergeSortSteps', () => {
  it('returns deterministic steps for the same input', () => {
    const input = [8, 3, 7, 4, 9, 2];
    const run1 = generateMergeSortSteps(input);
    const run2 = generateMergeSortSteps(input);
    expect(run1).toEqual(run2);
  });

  it('sorts output array state in final step', () => {
    const steps = generateMergeSortSteps([9, 3, 7, 1, 2]);
    const last = steps[steps.length - 1];
    expect(last.arrayState).toEqual([1, 2, 3, 7, 9]);
    expect(last.action).toBe('completed');
  });

  it('sorts output array state in final step for bottom-up implementation', () => {
    const steps = generateMergeSortBottomUpSteps([9, 3, 7, 1, 2]);
    const last = steps[steps.length - 1];
    expect(last.arrayState).toEqual([1, 2, 3, 7, 9]);
    expect(last.action).toBe('completed');
  });

  it('emits split/compare/take/write steps', () => {
    const steps = generateMergeSortSteps([9, 3, 7, 1, 2]);

    expect(steps.some((step) => step.action === 'split')).toBe(true);
    expect(steps.some((step) => step.action === 'compare')).toBe(true);
    expect(steps.some((step) => step.action === 'takeLeft')).toBe(true);
    expect(steps.some((step) => step.action === 'takeRight')).toBe(true);
    expect(steps.some((step) => step.action === 'writeBack')).toBe(true);
    expect(steps.some((step) => step.action === 'rangeMerged')).toBe(true);
  });

  it('keeps duplicate values sorted correctly', () => {
    const steps = generateMergeSortSteps([4, 1, 4, 2, 4]);
    const last = steps[steps.length - 1];

    expect(last.arrayState).toEqual([1, 2, 4, 4, 4]);
    expect(last.action).toBe('completed');
  });

  it('handles single-element arrays', () => {
    const steps = generateMergeSortSteps([42]);
    expect(steps[0].arrayState).toEqual([42]);
    expect(steps[steps.length - 1].arrayState).toEqual([42]);
    expect(steps[steps.length - 1].action).toBe('completed');
  });

  it('returns deterministic steps for the same input in bottom-up mode', () => {
    const input = [8, 3, 7, 4, 9, 2];
    const run1 = generateMergeSortBottomUpSteps(input);
    const run2 = generateMergeSortBottomUpSteps(input);
    expect(run1).toEqual(run2);
  });

  it('keeps top-down and bottom-up final outputs identical', () => {
    const input = [6, 4, 1, 9, 2, 7, 3, 8, 5];
    const topDown = generateMergeSortSteps(input);
    const bottomUp = generateMergeSortBottomUpSteps(input);
    expect(topDown.at(-1)?.arrayState).toEqual(bottomUp.at(-1)?.arrayState);
  });
});
