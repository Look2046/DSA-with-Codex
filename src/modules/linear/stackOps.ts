import type { AnimationStep } from '../../types/animation';

export const STACK_CAPACITY = 20;

export type StackOperation = { type: 'push'; value: number } | { type: 'pop' } | { type: 'peek' };

export type StackStep = AnimationStep & {
  stackState: number[];
  action: 'initial' | 'push' | 'pop' | 'peek' | 'completed';
  indices: number[];
  poppedValue?: number;
  peekValue?: number;
};

function cloneStack(values: number[]): number[] {
  return [...values];
}

function assertStackRange(values: number[]): void {
  if (values.length < 0 || values.length > STACK_CAPACITY) {
    throw new RangeError(`Stack length must be within [0, ${STACK_CAPACITY}]`);
  }
}

export function generateStackSteps(input: number[], operation: StackOperation): StackStep[] {
  assertStackRange(input);

  const stack = cloneStack(input);
  const steps: StackStep[] = [];

  steps.push({
    description: '',
    codeLines: [1],
    highlights: [],
    stackState: cloneStack(stack),
    action: 'initial',
    indices: stack.length > 0 ? [stack.length - 1] : [],
  });

  if (operation.type === 'push') {
    if (stack.length >= STACK_CAPACITY) {
      throw new RangeError('Push operation on full stack');
    }
    stack.push(operation.value);
    steps.push({
      description: '',
      codeLines: [3],
      highlights: [{ index: stack.length - 1, type: 'new-node' }],
      stackState: cloneStack(stack),
      action: 'push',
      indices: [stack.length - 1],
    });
  } else if (operation.type === 'pop') {
    if (stack.length === 0) {
      throw new RangeError('Pop operation on empty stack');
    }
    const poppedValue = stack[stack.length - 1];
    stack.pop();
    steps.push({
      description: '',
      codeLines: [4],
      highlights: stack.length > 0 ? [{ index: stack.length - 1, type: 'moving' }] : [],
      stackState: cloneStack(stack),
      action: 'pop',
      indices: stack.length > 0 ? [stack.length - 1] : [],
      poppedValue,
    });
  } else {
    if (stack.length === 0) {
      throw new RangeError('Peek operation on empty stack');
    }
    const peekValue = stack[stack.length - 1];
    steps.push({
      description: '',
      codeLines: [5],
      highlights: [{ index: stack.length - 1, type: 'matched' }],
      stackState: cloneStack(stack),
      action: 'peek',
      indices: [stack.length - 1],
      peekValue,
    });
  }

  steps.push({
    description: '',
    codeLines: [6],
    highlights: stack.map((_, index) => ({ index, type: 'default' as const })),
    stackState: cloneStack(stack),
    action: 'completed',
    indices: stack.length > 0 ? [stack.length - 1] : [],
  });

  return steps;
}
