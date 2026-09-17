import { describe, expect, it } from 'vitest';
import {
  createOpenAddressingSlots,
  generateHashOpenAddressingSteps,
  getOpenAddressingIndex,
} from './hashOpenAddressing';

describe('hashOpenAddressing', () => {
  it('places colliding keys through linear probing deterministically', () => {
    expect(getOpenAddressingIndex(10, 7)).toBe(3);
    expect(getOpenAddressingIndex(17, 7)).toBe(3);
    expect(createOpenAddressingSlots([10, 17, 24, 31], 7)).toEqual([null, null, null, 10, 17, 24, 31]);
  });

  it('builds a deterministic insert walkthrough with explicit probe steps', () => {
    const steps = generateHashOpenAddressingSteps('insert');

    expect(steps[0]?.action).toBe('initial');
    expect(steps.some((step) => step.action === 'collision')).toBe(true);
    expect(steps.some((step) => step.action === 'probe')).toBe(true);
    expect(steps.at(-1)?.slots).toEqual([null, null, null, 10, 17, 24, 31]);
    expect(steps.at(-1)?.outcome).toBe('completed');
  });

  it('searches and deletes through a predictable probe sequence', () => {
    const searchSteps = generateHashOpenAddressingSteps('search');
    const deleteSteps = generateHashOpenAddressingSteps('delete');

    expect(searchSteps.some((step) => step.action === 'scan' && step.activeKey === 10)).toBe(true);
    expect(searchSteps.some((step) => step.action === 'found' && step.activeIndex === 5)).toBe(true);
    expect(deleteSteps.some((step) => step.action === 'remove' && step.activeIndex === 4)).toBe(true);
    expect(deleteSteps.at(-1)?.tombstoneIndices).toEqual([4]);
  });
});
