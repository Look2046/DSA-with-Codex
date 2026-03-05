import { describe, expect, it } from 'vitest';
import { generateQueueSteps, QUEUE_CAPACITY } from './queueOps';

describe('generateQueueSteps', () => {
  it('returns deterministic steps for the same enqueue input', () => {
    const run1 = generateQueueSteps([3, 8, 1], { type: 'enqueue', value: 9 });
    const run2 = generateQueueSteps([3, 8, 1], { type: 'enqueue', value: 9 });
    expect(run1).toEqual(run2);
  });

  it('applies enqueue and keeps expected final queue state', () => {
    const steps = generateQueueSteps([3, 8, 1], { type: 'enqueue', value: 9 });
    const last = steps[steps.length - 1];
    expect(last.action).toBe('completed');
    expect(last.queueState).toEqual([3, 8, 1, 9]);
  });

  it('applies dequeue and reports dequeued value', () => {
    const steps = generateQueueSteps([3, 8, 1], { type: 'dequeue' });
    const dequeueStep = steps.find((step) => step.action === 'dequeue');
    const last = steps[steps.length - 1];
    expect(dequeueStep?.dequeuedValue).toBe(3);
    expect(last.queueState).toEqual([8, 1]);
  });

  it('applies front without changing queue', () => {
    const steps = generateQueueSteps([3, 8, 1], { type: 'front' });
    const frontStep = steps.find((step) => step.action === 'front');
    const last = steps[steps.length - 1];
    expect(frontStep?.frontValue).toBe(3);
    expect(last.queueState).toEqual([3, 8, 1]);
  });

  it('throws on invalid operations', () => {
    expect(() =>
      generateQueueSteps(
        Array.from({ length: QUEUE_CAPACITY }, (_, index) => index),
        { type: 'enqueue', value: 1 },
      ),
    ).toThrow();
  });

  it('keeps empty queue state for dequeue/front on empty input', () => {
    const dequeueSteps = generateQueueSteps([], { type: 'dequeue' });
    const frontSteps = generateQueueSteps([], { type: 'front' });

    expect(dequeueSteps[dequeueSteps.length - 1]?.queueState).toEqual([]);
    expect(dequeueSteps[dequeueSteps.length - 1]?.action).toBe('completed');
    expect(frontSteps[frontSteps.length - 1]?.queueState).toEqual([]);
    expect(frontSteps[frontSteps.length - 1]?.action).toBe('completed');
  });
});
