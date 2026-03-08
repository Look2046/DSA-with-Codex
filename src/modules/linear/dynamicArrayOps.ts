import type { AnimationStep } from '../../types/animation';

export type DynamicArrayOperation = { type: 'append'; value: number };

export type DynamicArrayStep = AnimationStep & {
  arrayState: number[];
  bufferState: Array<number | null>;
  sourceBufferState?: Array<number | null>;
  targetBufferState?: Array<number | null>;
  size: number;
  capacity: number;
  action: 'initial' | 'resize-start' | 'migrate' | 'resize-complete' | 'append' | 'completed';
  indices: number[];
  resizeFrom?: number;
  resizeTo?: number;
  migratedIndex?: number;
  appendedValue?: number;
};

function cloneBuffer(values: Array<number | null>): Array<number | null> {
  return [...values];
}

function cloneArray(values: number[]): number[] {
  return [...values];
}

function validateCapacity(capacity: number): void {
  if (!Number.isInteger(capacity)) {
    throw new RangeError('Dynamic array capacity must be an integer');
  }
  if (capacity < 1) {
    throw new RangeError('Dynamic array capacity must be at least 1');
  }
}

function validateInputRange(input: number[], capacity: number): void {
  if (input.length > capacity) {
    throw new RangeError('Dynamic array input length cannot exceed capacity');
  }
}

function createBuffer(input: number[], capacity: number): Array<number | null> {
  const buffer = Array.from({ length: capacity }, () => null as number | null);
  input.forEach((value, index) => {
    buffer[index] = value;
  });
  return buffer;
}

function occupiedIndices(size: number): number[] {
  return Array.from({ length: size }, (_, index) => index);
}

function snapshot(
  arrayState: number[],
  bufferState: Array<number | null>,
  capacity: number,
  action: DynamicArrayStep['action'],
  codeLines: number[],
  highlights: DynamicArrayStep['highlights'],
  details?: Pick<
    DynamicArrayStep,
    'resizeFrom' | 'resizeTo' | 'migratedIndex' | 'appendedValue' | 'sourceBufferState' | 'targetBufferState'
  >,
): DynamicArrayStep {
  const sourceBufferState = details?.sourceBufferState ? cloneBuffer(details.sourceBufferState) : undefined;
  const targetBufferState = details?.targetBufferState ? cloneBuffer(details.targetBufferState) : undefined;

  return {
    description: '',
    codeLines,
    highlights,
    arrayState: cloneArray(arrayState),
    bufferState: cloneBuffer(bufferState),
    size: arrayState.length,
    capacity,
    action,
    indices: occupiedIndices(arrayState.length),
    ...details,
    sourceBufferState,
    targetBufferState,
  };
}

export function generateDynamicArraySteps(input: number[], capacity: number, operation: DynamicArrayOperation): DynamicArrayStep[] {
  validateCapacity(capacity);
  validateInputRange(input, capacity);

  const arrayState = cloneArray(input);
  let bufferState = createBuffer(input, capacity);
  let currentCapacity = capacity;
  const steps: DynamicArrayStep[] = [];

  steps.push(snapshot(arrayState, bufferState, currentCapacity, 'initial', [1], []));

  if (arrayState.length >= currentCapacity) {
    const previousCapacity = currentCapacity;
    const nextCapacity = currentCapacity * 2;

    // Simulate allocating a brand-new buffer before element migration.
    const sourceValues = cloneArray(arrayState);
    const sourceBuffer = createBuffer(sourceValues, previousCapacity);
    bufferState = Array.from({ length: nextCapacity }, () => null);

    steps.push(
      snapshot(
        arrayState,
        bufferState,
        currentCapacity,
        'resize-start',
        [3],
        occupiedIndices(arrayState.length).map((index) => ({ index, type: 'moving' as const })),
        {
          resizeFrom: previousCapacity,
          resizeTo: nextCapacity,
          sourceBufferState: sourceBuffer,
          targetBufferState: bufferState,
        },
      ),
    );

    for (let index = 0; index < arrayState.length; index += 1) {
      bufferState[index] = sourceValues[index];
      steps.push(
        snapshot(
          arrayState,
          bufferState,
          currentCapacity,
          'migrate',
          [4],
          [{ index, type: 'moving' }],
          {
            resizeFrom: previousCapacity,
            resizeTo: nextCapacity,
            migratedIndex: index,
            sourceBufferState: sourceBuffer,
            targetBufferState: bufferState,
          },
        ),
      );
    }

    currentCapacity = nextCapacity;
    steps.push(
      snapshot(
        arrayState,
        bufferState,
        currentCapacity,
        'resize-complete',
        [5],
        occupiedIndices(arrayState.length).map((index) => ({ index, type: 'default' as const })),
        {
          resizeFrom: previousCapacity,
          resizeTo: currentCapacity,
          sourceBufferState: sourceBuffer,
          targetBufferState: bufferState,
        },
      ),
    );
  }

  arrayState.push(operation.value);
  bufferState[arrayState.length - 1] = operation.value;

  steps.push(
    snapshot(arrayState, bufferState, currentCapacity, 'append', [6], [{ index: arrayState.length - 1, type: 'new-node' }], {
      appendedValue: operation.value,
    }),
  );

  steps.push(
    snapshot(
      arrayState,
      bufferState,
      currentCapacity,
      'completed',
      [7],
      occupiedIndices(arrayState.length).map((index) => ({ index, type: 'default' as const })),
      { appendedValue: operation.value },
    ),
  );

  return steps;
}
