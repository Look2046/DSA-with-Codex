import { describe, expect, it } from 'vitest';
import {
  generateBinaryTreeTraversalSteps,
  type BinaryTreeTraversalMode,
} from './binaryTreeTraversal';

const FIXED_TREE = [1, 2, 3, 4, 5, 6, 7];
const SPARSE_TREE = [1, 2, 3, null, 5, null, 7];

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

  it('inorder includes guide actions and visits nodes on the second encounter', () => {
    const steps = generateBinaryTreeTraversalSteps(FIXED_TREE, 'inorder');
    const firstVisit = steps.find((step) => step.action === 'visit');

    expect(steps.some((step) => step.action === 'guideStart')).toBe(true);
    expect(steps.some((step) => step.action === 'descendLeft')).toBe(true);
    expect(steps.some((step) => step.action === 'descendRight')).toBe(true);
    expect(steps.some((step) => step.action === 'nullLeft')).toBe(true);
    expect(steps.some((step) => step.action === 'nullRight')).toBe(true);
    expect(steps.some((step) => step.action === 'backtrack')).toBe(true);
    expect(steps.some((step) => step.action === 'backtrackFromNull')).toBe(true);
    expect(steps.some((step) => step.guideEvents.length > 0)).toBe(true);
    expect(firstVisit?.currentIndex).toBe(3);
    expect(firstVisit?.outputOrder).toEqual([4]);

    const firstVisitEvent =
      firstVisit?.activeGuideEventIndex === null || firstVisit?.activeGuideEventIndex === undefined
        ? null
        : firstVisit.guideEvents[firstVisit.activeGuideEventIndex];
    expect(firstVisitEvent).toEqual({ type: 'fromNull', toIndex: 3, side: 'L' });
  });

  it('inorder reuses the same canonical guide route as preorder', () => {
    const preorder = generateBinaryTreeTraversalSteps(FIXED_TREE, 'preorder');
    const inorder = generateBinaryTreeTraversalSteps(FIXED_TREE, 'inorder');

    expect(inorder.at(-1)?.guideEvents).toEqual(preorder.at(-1)?.guideEvents);
  });

  it('handles empty input with initial and completed steps', () => {
    const steps = generateBinaryTreeTraversalSteps([], 'inorder');

    expect(steps).toHaveLength(2);
    expect(steps[0].action).toBe('initial');
    expect(steps[1].action).toBe('completed');
    expect(steps[1].outputOrder).toEqual([]);
  });

  it('supports sparse trees represented by level-order arrays with null gaps', () => {
    const preorder = generateBinaryTreeTraversalSteps(SPARSE_TREE, 'preorder');
    const inorder = generateBinaryTreeTraversalSteps(SPARSE_TREE, 'inorder');
    const postorder = generateBinaryTreeTraversalSteps(SPARSE_TREE, 'postorder');
    const levelorder = generateBinaryTreeTraversalSteps(SPARSE_TREE, 'levelorder');

    expect(preorder.at(-1)?.outputOrder).toEqual([1, 2, 5, 3, 7]);
    expect(inorder.at(-1)?.outputOrder).toEqual([2, 5, 1, 3, 7]);
    expect(postorder.at(-1)?.outputOrder).toEqual([5, 2, 7, 3, 1]);
    expect(levelorder.at(-1)?.outputOrder).toEqual([1, 2, 3, 5, 7]);
  });
});
