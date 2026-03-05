import type { AnimationStep } from '../../types/animation';

export const QUEUE_CAPACITY = 20;

export type QueueOperation = { type: 'enqueue'; value: number } | { type: 'dequeue' } | { type: 'front' };

export type QueueStep = AnimationStep & {
  queueState: number[];
  action: 'initial' | 'enqueue' | 'dequeue' | 'front' | 'completed';
  indices: number[];
  dequeuedValue?: number;
  frontValue?: number;
};

function cloneQueue(values: number[]): number[] {
  return [...values];
}

function assertQueueRange(values: number[]): void {
  if (values.length < 0 || values.length > QUEUE_CAPACITY) {
    throw new RangeError(`Queue length must be within [0, ${QUEUE_CAPACITY}]`);
  }
}

export function generateQueueSteps(input: number[], operation: QueueOperation): QueueStep[] {
  assertQueueRange(input);

  const queue = cloneQueue(input);
  const steps: QueueStep[] = [];

  steps.push({
    description: '',
    codeLines: [1],
    highlights: [],
    queueState: cloneQueue(queue),
    action: 'initial',
    indices: queue.length > 0 ? [0, queue.length - 1] : [],
  });

  if (operation.type === 'enqueue') {
    if (queue.length >= QUEUE_CAPACITY) {
      throw new RangeError('Enqueue operation on full queue');
    }
    queue.push(operation.value);
    steps.push({
      description: '',
      codeLines: [3],
      highlights: [{ index: queue.length - 1, type: 'new-node' }],
      queueState: cloneQueue(queue),
      action: 'enqueue',
      indices: [0, queue.length - 1],
      frontValue: queue[0],
    });
  } else if (operation.type === 'dequeue') {
    if (queue.length === 0) {
      steps.push({
        description: '',
        codeLines: [6],
        highlights: [],
        queueState: cloneQueue(queue),
        action: 'completed',
        indices: [],
      });
      return steps;
    }
    const dequeuedValue = queue[0];
    queue.shift();
    steps.push({
      description: '',
      codeLines: [4],
      highlights: queue.length > 0 ? [{ index: 0, type: 'moving' }] : [],
      queueState: cloneQueue(queue),
      action: 'dequeue',
      indices: queue.length > 0 ? [0, queue.length - 1] : [],
      dequeuedValue,
      frontValue: queue[0],
    });
  } else {
    if (queue.length === 0) {
      steps.push({
        description: '',
        codeLines: [6],
        highlights: [],
        queueState: cloneQueue(queue),
        action: 'completed',
        indices: [],
      });
      return steps;
    }
    const frontValue = queue[0];
    steps.push({
      description: '',
      codeLines: [5],
      highlights: [{ index: 0, type: 'matched' }],
      queueState: cloneQueue(queue),
      action: 'front',
      indices: [0, queue.length - 1],
      frontValue,
    });
  }

  steps.push({
    description: '',
    codeLines: [6],
    highlights: queue.map((_, index) => ({ index, type: 'default' as const })),
    queueState: cloneQueue(queue),
    action: 'completed',
    indices: queue.length > 0 ? [0, queue.length - 1] : [],
    frontValue: queue[0],
  });

  return steps;
}
