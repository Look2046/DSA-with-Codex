import { describe, expect, it } from 'vitest';
import { generateBstSteps, type BstStep } from './bst';

const BASE_INPUT = [50, 30, 70, 20, 40, 60, 80, 65];

function nodeValueMap(step: BstStep): Map<number, number> {
  return new Map(step.treeState.map((node) => [node.id, node.value]));
}

function collectVisitValues(steps: BstStep[]): number[] {
  const values: number[] = [];

  steps.forEach((step) => {
    if (step.action !== 'visit' || step.currentId === null) {
      return;
    }

    const value = nodeValueMap(step).get(step.currentId);
    if (typeof value === 'number') {
      values.push(value);
    }
  });

  return values;
}

function finalValues(steps: BstStep[]): number[] {
  const finalStep = steps.at(-1);
  if (!finalStep) {
    return [];
  }
  return finalStep.treeState.map((node) => node.value).sort((left, right) => left - right);
}

describe('bst step generation', () => {
  it('is deterministic for same input and operation', () => {
    const first = generateBstSteps(BASE_INPUT, 'searchPath', 65);
    const second = generateBstSteps(BASE_INPUT, 'searchPath', 65);

    expect(first).toEqual(second);
  });

  it('records search path and found state for existing value', () => {
    const steps = generateBstSteps(BASE_INPUT, 'searchPath', 65);

    expect(collectVisitValues(steps)).toEqual([50, 70, 60, 65]);
    expect(steps.some((step) => step.action === 'found')).toBe(true);
    expect(steps.at(-1)?.action).toBe('found');
    expect(steps.at(-1)?.outcome).toBe('found');
  });

  it('ends immediately on not-found without trailing empty frames', () => {
    const steps = generateBstSteps(BASE_INPUT, 'searchPath', 999);

    expect(collectVisitValues(steps)).toEqual([50, 70, 80]);
    expect(steps.at(-1)?.action).toBe('notFound');
    expect(steps.at(-1)?.outcome).toBe('notFound');
    expect(steps.map((step) => step.action)).not.toContain('operationDone');
    expect(steps.map((step) => step.action)).not.toContain('completed');
  });

  it('inserts new value into bst when target does not exist', () => {
    const steps = generateBstSteps(BASE_INPUT, 'insert', 35);

    expect(steps.some((step) => step.action === 'inserted')).toBe(true);
    expect(steps.at(-1)?.action).toBe('inserted');
    expect(finalValues(steps)).toContain(35);
    expect(steps.at(-1)?.outcome).toBe('inserted');
  });

  it('marks duplicate insert without changing node set', () => {
    const steps = generateBstSteps(BASE_INPUT, 'insert', 40);

    expect(steps.some((step) => step.action === 'duplicate')).toBe(true);
    expect(steps.at(-1)?.action).toBe('duplicate');
    expect(finalValues(steps)).toEqual([...BASE_INPUT].sort((left, right) => left - right));
    expect(steps.at(-1)?.outcome).toBe('duplicate');
  });

  it('deletes leaf and one-child nodes with explicit delete cases', () => {
    const leafSteps = generateBstSteps(BASE_INPUT, 'delete', 20);
    expect(leafSteps.some((step) => step.deleteCase === 'leaf')).toBe(true);
    expect(finalValues(leafSteps)).not.toContain(20);

    const oneChildSteps = generateBstSteps(BASE_INPUT, 'delete', 60);
    expect(oneChildSteps.some((step) => step.deleteCase === 'oneChild')).toBe(true);
    expect(finalValues(oneChildSteps)).not.toContain(60);
    expect(finalValues(oneChildSteps)).toContain(65);
  });

  it('deletes two-children node via successor replacement', () => {
    const steps = generateBstSteps(BASE_INPUT, 'delete', 50);

    expect(steps.some((step) => step.deleteCase === 'twoChildren')).toBe(true);
    expect(steps.some((step) => step.action === 'successor')).toBe(true);
    expect(steps.at(-1)?.action).toBe('deleted');
    expect(finalValues(steps)).not.toContain(50);
    expect(finalValues(steps)).toContain(60);
    expect(steps.at(-1)?.outcome).toBe('deleted');
  });
});
