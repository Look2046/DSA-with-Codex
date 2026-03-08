import { describe, expect, it } from 'vitest';
import {
  generateBinaryTreeTraversalSteps,
  type BinaryTreeTraversalMode,
} from './binaryTreeTraversal';

const FIXED_TREE = [1, 2, 3, 4, 5, 6, 7];

const EXPECTED_ORDER: Record<BinaryTreeTraversalMode, number[]> = {
  preorder: [1, 2, 4, 5, 3, 6, 7],
  inorder: [4, 2, 5, 1, 6, 3, 7],
  postorder: [4, 5, 2, 6, 7, 3, 1],
  levelorder: [1, 2, 3, 4, 5, 6, 7],
};

describe('generateBinaryTreeTraversalSteps', () => {
  it('returns deterministic steps for the same input and mode', () => {
    const run1 = generateBinaryTreeTraversalSteps(FIXED_TREE, 'preorder');
    const run2 = generateBinaryTreeTraversalSteps(FIXED_TREE, 'preorder');
    expect(run1).toEqual(run2);
  });

  it('produces expected traversal order for all modes', () => {
    (Object.keys(EXPECTED_ORDER) as BinaryTreeTraversalMode[]).forEach((mode) => {
      const steps = generateBinaryTreeTraversalSteps(FIXED_TREE, mode);
      const final = steps[steps.length - 1];

      expect(final.action).toBe('completed');
      expect(final.outputOrder).toEqual(EXPECTED_ORDER[mode]);
      expect(final.visitedIndices).toHaveLength(FIXED_TREE.length);
    });
  });

  it('contains visit and traversalDone actions on non-empty input', () => {
    const steps = generateBinaryTreeTraversalSteps(FIXED_TREE, 'levelorder');
    expect(steps.some((step) => step.action === 'visit')).toBe(true);
    expect(steps.some((step) => step.action === 'traversalDone')).toBe(true);
  });

  it('preorder includes guide actions for descend/null/backtrack flow', () => {
    const steps = generateBinaryTreeTraversalSteps(FIXED_TREE, 'preorder');

    expect(steps.some((step) => step.action === 'guideStart')).toBe(true);
    expect(steps.some((step) => step.action === 'descendLeft')).toBe(true);
    expect(steps.some((step) => step.action === 'descendRight')).toBe(true);
    expect(steps.some((step) => step.action === 'nullLeft')).toBe(true);
    expect(steps.some((step) => step.action === 'nullRight')).toBe(true);
    expect(steps.some((step) => step.action === 'backtrack')).toBe(true);
    expect(steps.some((step) => step.action === 'backtrackFromNull')).toBe(true);
    expect(steps.some((step) => step.guideEvents.length > 0)).toBe(true);
  });

  it('handles empty input with initial and completed steps', () => {
    const steps = generateBinaryTreeTraversalSteps([], 'inorder');

    expect(steps).toHaveLength(2);
    expect(steps[0].action).toBe('initial');
    expect(steps[1].action).toBe('completed');
    expect(steps[1].outputOrder).toEqual([]);
  });
});
