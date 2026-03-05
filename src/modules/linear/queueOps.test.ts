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
    expect(last.frontIndex).toBe(0);
    expect(last.rearIndex).toBe(3);
  });

  it('dequeue moves front pointer forward instead of shifting whole buffer', () => {
    const steps = generateQueueSteps([3, 8, 1], { type: 'dequeue' });
    const dequeueStep = steps.find((step) => step.action === 'dequeue');
    const last = steps[steps.length - 1];

    expect(dequeueStep?.dequeuedValue).toBe(3);
    expect(last.queueState).toEqual([8, 1]);
    expect(last.frontIndex).toBe(1);
    expect(last.rearIndex).toBe(2);
    expect(last.bufferState[1]).toBe(8);
    expect(last.bufferState[2]).toBe(1);
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

  it('keeps one slot empty for circular queue full condition', () => {
    expect(() =>
      generateQueueSteps(
        Array.from({ length: QUEUE_CAPACITY - 1 }, (_, index) => index),
        { type: 'enqueue', value: 99 },
        'circular',
      ),
    ).toThrow();
  });

  it('keeps empty queue state for dequeue/front on empty input', () => {
    const dequeueSteps = generateQueueSteps([], { type: 'dequeue' });
    const frontSteps = generateQueueSteps([], { type: 'front' });

    expect(dequeueSteps[dequeueSteps.length - 1]?.queueState).toEqual([]);
    expect(dequeueSteps[dequeueSteps.length - 1]?.action).toBe('completed');
    expect(dequeueSteps[dequeueSteps.length - 1]?.frontIndex).toBe(0);
    expect(dequeueSteps[dequeueSteps.length - 1]?.rearIndex).toBe(0);
    expect(frontSteps[frontSteps.length - 1]?.queueState).toEqual([]);
    expect(frontSteps[frontSteps.length - 1]?.action).toBe('completed');
    expect(frontSteps[frontSteps.length - 1]?.frontIndex).toBe(0);
    expect(frontSteps[frontSteps.length - 1]?.rearIndex).toBe(0);
  });

  it('keeps front/rear on same empty slot after dequeue-to-empty', () => {
    const steps = generateQueueSteps([3], { type: 'dequeue' });
    const last = steps[steps.length - 1];
    expect(last.queueState).toEqual([]);
    expect(last.frontIndex).toBe(1);
    expect(last.rearIndex).toBe(1);
  });
});
