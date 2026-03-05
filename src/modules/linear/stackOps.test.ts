import { describe, expect, it } from 'vitest';
import { generateStackSteps, STACK_CAPACITY } from './stackOps';

describe('generateStackSteps', () => {
  it('returns deterministic steps for the same push input', () => {
    const run1 = generateStackSteps([3, 8, 1], { type: 'push', value: 9 });
    const run2 = generateStackSteps([3, 8, 1], { type: 'push', value: 9 });
    expect(run1).toEqual(run2);
  });

  it('applies push and keeps expected final stack state', () => {
    const steps = generateStackSteps([3, 8, 1], { type: 'push', value: 9 });
    const last = steps[steps.length - 1];
    expect(last.action).toBe('completed');
    expect(last.stackState).toEqual([3, 8, 1, 9]);
  });

  it('applies pop and reports popped value', () => {
    const steps = generateStackSteps([3, 8, 1], { type: 'pop' });
    const popStep = steps.find((step) => step.action === 'pop');
    const last = steps[steps.length - 1];
    expect(popStep?.poppedValue).toBe(1);
    expect(last.stackState).toEqual([3, 8]);
  });

  it('applies peek without changing stack', () => {
    const steps = generateStackSteps([3, 8, 1], { type: 'peek' });
    const peekStep = steps.find((step) => step.action === 'peek');
    const last = steps[steps.length - 1];
    expect(peekStep?.peekValue).toBe(1);
    expect(last.stackState).toEqual([3, 8, 1]);
  });

  it('throws on invalid operations', () => {
    expect(() => generateStackSteps([], { type: 'pop' })).toThrow();
    expect(() => generateStackSteps([], { type: 'peek' })).toThrow();
    expect(() =>
      generateStackSteps(
        Array.from({ length: STACK_CAPACITY }, (_, index) => index),
        { type: 'push', value: 1 },
      ),
    ).toThrow();
  });
});
