import { describe, expect, it } from 'vitest';
import { generateDynamicArraySteps } from './dynamicArrayOps';

describe('generateDynamicArraySteps', () => {
  it('returns deterministic steps for same append input', () => {
    const run1 = generateDynamicArraySteps([3, 8], 4, { type: 'append', value: 9 });
    const run2 = generateDynamicArraySteps([3, 8], 4, { type: 'append', value: 9 });
    expect(run1).toEqual(run2);
  });

  it('appends without resize when spare capacity exists', () => {
    const steps = generateDynamicArraySteps([3, 8], 4, { type: 'append', value: 9 });
    const actions = steps.map((step) => step.action);
    const last = steps[steps.length - 1];

    expect(actions).toEqual(['initial', 'append', 'completed']);
    expect(last.arrayState).toEqual([3, 8, 9]);
    expect(last.capacity).toBe(4);
  });

  it('resizes and migrates before append on boundary', () => {
    const steps = generateDynamicArraySteps([3, 8], 2, { type: 'append', value: 9 });
    const actions = steps.map((step) => step.action);
    const resizeStartStep = steps.find((step) => step.action === 'resize-start');
    const migrateSteps = steps.filter((step) => step.action === 'migrate');
    const appendStep = steps.find((step) => step.action === 'append');
    const last = steps[steps.length - 1];

    expect(actions).toEqual(['initial', 'resize-start', 'migrate', 'migrate', 'resize-complete', 'append', 'completed']);
    expect(resizeStartStep?.bufferState.slice(0, 3)).toEqual([null, null, null]);
    expect(resizeStartStep?.targetBufferState?.slice(0, 3)).toEqual([null, null, null]);
    expect(migrateSteps[0]?.bufferState.slice(0, 3)).toEqual([3, null, null]);
    expect(migrateSteps[0]?.targetBufferState?.slice(0, 3)).toEqual([3, null, null]);
    expect(migrateSteps[1]?.bufferState.slice(0, 3)).toEqual([3, 8, null]);
    expect(migrateSteps[1]?.targetBufferState?.slice(0, 3)).toEqual([3, 8, null]);
    expect(appendStep?.highlights).toEqual([{ index: 2, type: 'new-node' }]);
    expect(last.arrayState).toEqual([3, 8, 9]);
    expect(last.capacity).toBe(4);
  });

  it('throws when capacity is invalid or input exceeds capacity', () => {
    expect(() => generateDynamicArraySteps([1], 0, { type: 'append', value: 2 })).toThrow();
    expect(() => generateDynamicArraySteps([1, 2, 3], 2, { type: 'append', value: 9 })).toThrow();
  });

  it('allows growth beyond previous fixed limits by doubling capacity', () => {
    const full = Array.from({ length: 20 }, (_, index) => index);
    const steps = generateDynamicArraySteps(full, 20, { type: 'append', value: 99 });
    const last = steps[steps.length - 1];
    expect(last.capacity).toBe(40);
    expect(last.arrayState).toHaveLength(21);
  });
});
