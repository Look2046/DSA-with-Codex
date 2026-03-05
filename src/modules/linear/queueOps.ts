import type { AnimationStep } from '../../types/animation';

export const QUEUE_CAPACITY = 20;
export const QUEUE_CIRCULAR_MAX_SIZE = QUEUE_CAPACITY - 1;
export type QueueMode = 'normal' | 'circular';

export type QueueOperation = { type: 'enqueue'; value: number } | { type: 'dequeue' } | { type: 'front' };

export type QueueStep = AnimationStep & {
  queueState: number[];
  bufferState: Array<number | null>;
  frontIndex: number;
  rearIndex: number;
  size: number;
  action: 'initial' | 'enqueue' | 'dequeue' | 'front' | 'completed';
  indices: number[];
  dequeuedValue?: number;
  enqueuedValue?: number;
  frontValue?: number;
};

export type QueueRuntimeSnapshot = {
  queueState: number[];
  bufferState: Array<number | null>;
  frontIndex: number;
  rearIndex: number;
  size: number;
};

type QueueRuntime = {
  queueState: number[];
  bufferState: Array<number | null>;
  frontIndex: number;
  rearIndex: number;
  size: number;
};

function assertQueueRange(values: number[]): void {
  if (values.length < 0 || values.length > QUEUE_CAPACITY) {
    throw new RangeError(`Queue length must be within [0, ${QUEUE_CAPACITY}]`);
  }
}

function getQueueMaxSize(mode: QueueMode): number {
  return mode === 'circular' ? QUEUE_CIRCULAR_MAX_SIZE : QUEUE_CAPACITY;
}

function createRuntime(input: number[]): QueueRuntime {
  const bufferState: Array<number | null> = Array.from({ length: QUEUE_CAPACITY }, () => null);
  input.forEach((value, index) => {
    bufferState[index] = value;
  });

  return {
    queueState: [...input],
    bufferState,
    frontIndex: input.length > 0 ? 0 : 0,
    rearIndex: input.length > 0 ? input.length - 1 : 0,
    size: input.length,
  };
}

function createRuntimeFromSnapshot(snapshot: QueueRuntimeSnapshot): QueueRuntime {
  if (snapshot.bufferState.length !== QUEUE_CAPACITY) {
    throw new RangeError(`Queue buffer length must be ${QUEUE_CAPACITY}`);
  }
  if (snapshot.size < 0 || snapshot.size > QUEUE_CAPACITY) {
    throw new RangeError(`Queue size must be within [0, ${QUEUE_CAPACITY}]`);
  }
  return {
    queueState: [...snapshot.queueState],
    bufferState: [...snapshot.bufferState],
    frontIndex: snapshot.frontIndex,
    rearIndex: snapshot.rearIndex,
    size: snapshot.size,
  };
}

function occupiedIndices(runtime: QueueRuntime): number[] {
  if (runtime.size === 0) {
    return [];
  }

  const indices: number[] = [];
  for (let offset = 0; offset < runtime.size; offset += 1) {
    indices.push((runtime.frontIndex + offset) % QUEUE_CAPACITY);
  }
  return indices;
}

function frontRearIndices(runtime: QueueRuntime): number[] {
  if (runtime.frontIndex === runtime.rearIndex) {
    return [runtime.frontIndex];
  }
  return [runtime.frontIndex, runtime.rearIndex];
}

function snapshot(
  runtime: QueueRuntime,
  action: QueueStep['action'],
  codeLines: number[],
  highlights: QueueStep['highlights'],
  details?: Pick<QueueStep, 'dequeuedValue' | 'frontValue' | 'enqueuedValue'>,
): QueueStep {
  return {
    description: '',
    codeLines,
    highlights,
    queueState: [...runtime.queueState],
    bufferState: [...runtime.bufferState],
    frontIndex: runtime.frontIndex,
    rearIndex: runtime.rearIndex,
    size: runtime.size,
    action,
    indices: frontRearIndices(runtime),
    ...details,
  };
}

export function generateQueueSteps(
  input: number[],
  operation: QueueOperation,
  mode: QueueMode = 'normal',
  runtimeSeed?: QueueRuntimeSnapshot,
): QueueStep[] {
  assertQueueRange(input);

  const runtime = runtimeSeed ? createRuntimeFromSnapshot(runtimeSeed) : createRuntime(input);
  const steps: QueueStep[] = [];
  const maxSize = getQueueMaxSize(mode);
  if (runtime.size > maxSize) {
    throw new RangeError(mode === 'circular' ? 'Circular queue keeps one slot empty' : 'Queue input exceeds capacity');
  }

  steps.push(snapshot(runtime, 'initial', [1], []));

  if (operation.type === 'enqueue') {
    if (runtime.size >= maxSize) {
      throw new RangeError(mode === 'circular' ? 'Enqueue operation on full circular queue' : 'Enqueue operation on full queue');
    }

    const nextRear = runtime.size === 0 ? runtime.rearIndex : (runtime.rearIndex + 1) % QUEUE_CAPACITY;
    runtime.bufferState[nextRear] = operation.value;
    runtime.rearIndex = nextRear;
    if (runtime.size === 0) {
      runtime.frontIndex = nextRear;
    }
    runtime.size += 1;
    runtime.queueState.push(operation.value);

    steps.push(
      snapshot(runtime, 'enqueue', [3], [{ index: nextRear, type: 'new-node' }], {
        enqueuedValue: operation.value,
        frontValue: runtime.queueState[0],
      }),
    );
  } else if (operation.type === 'dequeue') {
    if (runtime.size === 0) {
      steps.push(snapshot(runtime, 'completed', [6], []));
      return steps;
    }

    const removedIndex = runtime.frontIndex;
    const dequeuedValue = runtime.bufferState[removedIndex] ?? runtime.queueState[0];
    runtime.bufferState[removedIndex] = null;
    runtime.queueState.shift();
    runtime.size -= 1;

    if (runtime.size === 0) {
      runtime.frontIndex = (removedIndex + 1) % QUEUE_CAPACITY;
      runtime.rearIndex = runtime.frontIndex;
    } else {
      runtime.frontIndex = (removedIndex + 1) % QUEUE_CAPACITY;
    }

    const dequeueHighlights = runtime.size > 0 ? [{ index: runtime.frontIndex, type: 'moving' as const }] : [];
    steps.push(
      snapshot(runtime, 'dequeue', [4], dequeueHighlights, {
        dequeuedValue,
        frontValue: runtime.queueState[0],
      }),
    );
  } else {
    if (runtime.size === 0) {
      steps.push(snapshot(runtime, 'completed', [6], []));
      return steps;
    }

    const frontValue = runtime.bufferState[runtime.frontIndex] ?? runtime.queueState[0];
    steps.push(
      snapshot(runtime, 'front', [5], [{ index: runtime.frontIndex, type: 'matched' }], {
        frontValue,
      }),
    );
  }

  steps.push(
    snapshot(
      runtime,
      'completed',
      [6],
      occupiedIndices(runtime).map((index) => ({ index, type: 'default' as const })),
      { frontValue: runtime.queueState[0] },
    ),
  );

  return steps;
}
