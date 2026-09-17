import { describe, expect, it } from 'vitest';
import {
  createChainingBuckets,
  generateHashChainingSteps,
  getHashTableIndex,
} from './hashChaining';

describe('hashChaining', () => {
  it('maps keys into deterministic chained buckets', () => {
    expect(getHashTableIndex(12, 5)).toBe(2);
    expect(getHashTableIndex(17, 5)).toBe(2);
    expect(getHashTableIndex(5, 5)).toBe(0);
    expect(createChainingBuckets([12, 17, 22, 5], 5)).toEqual([[5], [], [12, 17, 22], [], []]);
  });

  it('builds a deterministic insert walkthrough with collision chaining', () => {
    const steps = generateHashChainingSteps('insert');

    expect(steps[0]?.action).toBe('initial');
    expect(steps.some((step) => step.action === 'collision')).toBe(true);
    expect(steps.at(-1)?.action).toBe('completed');
    expect(steps.at(-1)?.outcome).toBe('completed');
    expect(steps.at(-1)?.buckets).toEqual([[5], [], [12, 17, 22], [], []]);
  });

  it('searches and deletes through the chain in a predictable order', () => {
    const searchSteps = generateHashChainingSteps('search');
    const deleteSteps = generateHashChainingSteps('delete');

    expect(searchSteps.some((step) => step.action === 'scan' && step.activeKey === 12)).toBe(true);
    expect(searchSteps.some((step) => step.action === 'found' && step.activeKey === 22)).toBe(true);
    expect(deleteSteps.some((step) => step.action === 'remove' && step.activeKey === 17)).toBe(true);
    expect(deleteSteps.at(-1)?.buckets).toEqual([[5], [], [12, 22], [], []]);
  });
});
