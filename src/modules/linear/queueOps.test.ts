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
    expect(last.rearIndex).toBe(4);
  });

  it('dequeue moves front pointer forward instead of shifting whole buffer', () => {
    const steps = generateQueueSteps([3, 8, 1], { type: 'dequeue' });
    const dequeueStep = steps.find((step) => step.action === 'dequeue');
    const last = steps[steps.length - 1];

    expect(dequeueStep?.dequeuedValue).toBe(3);
    expect(last.queueState).toEqual([8, 1]);
    expect(last.frontIndex).toBe(1);
    expect(last.rearIndex).toBe(3);
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

  it('keeps a full queue visible and unchanged when enqueue is attempted on a full normal queue', () => {
    const fullQueue = Array.from({ length: QUEUE_CAPACITY }, (_, index) => index);
    const steps = generateQueueSteps(fullQueue, { type: 'enqueue', value: 1 });
    const last = steps[steps.length - 1];

    expect(last.action).toBe('completed');
    expect(last.queueState).toEqual(fullQueue);
    expect(last.bufferState.every((value, index) => value === index)).toBe(true);
    expect(last.frontIndex).toBe(0);
    expect(last.rearIndex).toBe(20);
  });

  it('keeps a normal queue blocked for enqueue after the rear pointer reaches the array end', () => {
    const fullQueue = Array.from({ length: QUEUE_CAPACITY }, (_, index) => index);
    const dequeued = generateQueueSteps(fullQueue, { type: 'dequeue' });
    const exhaustedTailState = dequeued[dequeued.length - 1];
    const enqueueAttempt = generateQueueSteps([], { type: 'enqueue', value: 99 }, 'normal', {
      queueState: exhaustedTailState.queueState,
      bufferState: exhaustedTailState.bufferState,
      frontIndex: exhaustedTailState.frontIndex,
      rearIndex: exhaustedTailState.rearIndex,
      size: exhaustedTailState.size,
    });
    const last = enqueueAttempt[enqueueAttempt.length - 1];

    expect(last.action).toBe('completed');
    expect(last.queueState).toEqual(fullQueue.slice(1));
    expect(last.frontIndex).toBe(1);
    expect(last.rearIndex).toBe(20);
  });

  it('keeps one slot empty for circular queue full condition while preserving the visible full state', () => {
    const circularFullQueue = Array.from({ length: QUEUE_CAPACITY - 1 }, (_, index) => index);
    const steps = generateQueueSteps(circularFullQueue, { type: 'enqueue', value: 99 }, 'circular');
    const last = steps[steps.length - 1];

    expect(last.action).toBe('completed');
    expect(last.queueState).toEqual(circularFullQueue);
    expect(last.frontIndex).toBe(0);
    expect(last.rearIndex).toBe(19);
  });

  it('preserves the just-enqueued tail element when dequeuing from a full circular queue snapshot', () => {
    const nearlyFullQueue = Array.from({ length: QUEUE_CAPACITY - 2 }, (_, index) => index);
    const enqueueSteps = generateQueueSteps(nearlyFullQueue, { type: 'enqueue', value: 99 }, 'circular');
    const fullSnapshot = enqueueSteps[enqueueSteps.length - 1];
    const dequeueSteps = generateQueueSteps(fullSnapshot.queueState, { type: 'dequeue' }, 'circular', {
      queueState: fullSnapshot.queueState,
      bufferState: fullSnapshot.bufferState,
      frontIndex: fullSnapshot.frontIndex,
      rearIndex: fullSnapshot.rearIndex,
      size: fullSnapshot.size,
    });
    const last = dequeueSteps[dequeueSteps.length - 1];

    expect(last.queueState.at(-1)).toBe(99);
    expect(last.queueState).toEqual([...Array.from({ length: QUEUE_CAPACITY - 3 }, (_, index) => index + 1), 99]);
    expect(last.bufferState[QUEUE_CAPACITY - 2]).toBe(99);
    expect(last.frontIndex).toBe(1);
    expect(last.rearIndex).toBe(19);
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
