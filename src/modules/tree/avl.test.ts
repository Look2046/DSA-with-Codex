import { describe, expect, it } from 'vitest';
import { generateAvlSteps, type AvlStep } from './avl';

function finalStep(steps: AvlStep[]): AvlStep | undefined;
function finalStep(steps: AvlStep[]): AvlStep | undefined {
  return steps.at(-1);
}

function finalValues(steps: AvlStep[]): number[] {
  return finalStep(steps)?.treeState.map((node) => node.value).sort((left, right) => left - right) ?? [];
}

function finalRootValue(steps: AvlStep[]): number | null {
  const last = finalStep(steps);
  if (!last || last.rootId === null) {
    return null;
  }
  return last.treeState.find((node) => node.id === last.rootId)?.value ?? null;
}

describe('avl step generation', () => {
  it('is deterministic for the same input and target', () => {
    const first = generateAvlSteps([50, 20, 70, 10, 30], 25);
    const second = generateAvlSteps([50, 20, 70, 10, 30], 25);

    expect(first).toEqual(second);
  });

  it('marks duplicate insert without changing node set', () => {
    const steps = generateAvlSteps([50, 20, 70, 10, 30], 30);

    expect(finalStep(steps)?.action).toBe('duplicate');
    expect(finalStep(steps)?.outcome).toBe('duplicate');
    expect(finalValues(steps)).toEqual([10, 20, 30, 50, 70]);
  });

  it('performs LL rotation on insert', () => {
    const steps = generateAvlSteps([30, 20], 10);

    expect(steps.some((step) => step.rotationCase === 'll')).toBe(true);
    expect(steps.some((step) => step.action === 'rotateRight')).toBe(true);
    expect(finalStep(steps)?.action).toBe('rebalanced');
    expect(finalRootValue(steps)).toBe(20);
    expect(finalValues(steps)).toEqual([10, 20, 30]);
  });

  it('performs RR rotation on insert', () => {
    const steps = generateAvlSteps([10, 20], 30);

    expect(steps.some((step) => step.rotationCase === 'rr')).toBe(true);
    expect(steps.some((step) => step.action === 'rotateLeft')).toBe(true);
    expect(finalRootValue(steps)).toBe(20);
    expect(finalValues(steps)).toEqual([10, 20, 30]);
  });

  it('performs LR rotation on insert', () => {
    const steps = generateAvlSteps([30, 10], 20);

    expect(steps.some((step) => step.rotationCase === 'lr')).toBe(true);
    expect(steps.filter((step) => step.action === 'rotateLeft')).toHaveLength(1);
    expect(steps.filter((step) => step.action === 'rotateRight')).toHaveLength(1);
    expect(finalRootValue(steps)).toBe(20);
    expect(finalValues(steps)).toEqual([10, 20, 30]);
  });

  it('performs RL rotation on insert', () => {
    const steps = generateAvlSteps([10, 30], 20);

    expect(steps.some((step) => step.rotationCase === 'rl')).toBe(true);
    expect(steps.filter((step) => step.action === 'rotateRight')).toHaveLength(1);
    expect(steps.filter((step) => step.action === 'rotateLeft')).toHaveLength(1);
    expect(finalRootValue(steps)).toBe(20);
    expect(finalValues(steps)).toEqual([10, 20, 30]);
  });
});
