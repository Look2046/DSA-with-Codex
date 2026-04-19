import { describe, expect, it } from 'vitest';
import { generateBTreeComparisonSteps, type BTreeComparisonStep } from './btreeComparison';

function finalStep(steps: BTreeComparisonStep[]): BTreeComparisonStep | undefined {
  return steps.at(-1);
}

describe('b-tree comparison step generation', () => {
  it('is deterministic for the same seed keys and target', () => {
    const first = generateBTreeComparisonSteps([10, 20, 5, 6, 12, 30], 7);
    const second = generateBTreeComparisonSteps([10, 20, 5, 6, 12, 30], 7);

    expect(first).toEqual(second);
  });

  it('promotes and splits when inserting into a full root leaf', () => {
    const steps = generateBTreeComparisonSteps([10, 20, 30], 40);

    expect(steps.some((step) => step.activeTree === 'btree' && step.action === 'splitLeaf')).toBe(true);
    expect(steps.some((step) => step.activeTree === 'bplus' && step.action === 'splitLeaf')).toBe(true);
    expect(steps.some((step) => step.action === 'promote')).toBe(true);
    expect(finalStep(steps)?.outcome).toBe('inserted');
  });

  it('keeps the b+ leaf chain sorted after insertion', () => {
    const steps = generateBTreeComparisonSteps([10, 20, 5, 6, 12, 30], 7);

    expect(finalStep(steps)?.leafChain).toEqual([5, 6, 7, 10, 12, 20, 30]);
  });

  it('keeps the inserted key visible in both final trees', () => {
    const steps = generateBTreeComparisonSteps([10, 20, 5, 6, 12, 30], 25);
    const last = finalStep(steps);
    const bTreeKeys = (last?.bTreeNodes ?? []).flatMap((node) => node.keys);
    const bPlusKeys = (last?.bPlusNodes ?? []).flatMap((node) => node.keys);

    expect(bTreeKeys).toContain(25);
    expect(bPlusKeys).toContain(25);
  });
});
