import { STACK_CAPACITY, type StackOperation } from '../../modules/linear/stackOps';
import type { HighlightEntry } from '../../types/animation';

export type StackLaneOutcome = 'ok' | 'overflow' | 'empty';

export type StackComparisonLaneStep = {
  action: 'initial' | 'preparePush' | 'linkPush' | 'push' | 'pop' | 'peek' | 'blocked' | 'completed';
  highlights: HighlightEntry[];
  indices: number[];
  outcome: StackLaneOutcome;
  stackState: number[];
  poppedValue?: number;
  peekValue?: number;
  incomingValue?: number;
  incomingNextIndex?: number;
};

export type StackComparisonStep = {
  action: 'initial' | 'preparePush' | 'linkPush' | 'push' | 'pop' | 'peek' | 'overflow' | 'completed';
  codeLines: number[];
  sequential: StackComparisonLaneStep;
  linked: StackComparisonLaneStep;
};

export type StackComparisonResult = {
  steps: StackComparisonStep[];
  completedSequential: number[];
  completedLinked: number[];
  diverged: boolean;
};

type LaneApplyResult = {
  finalStack: number[];
  step: StackComparisonLaneStep;
};

function cloneStack(values: number[]): number[] {
  return [...values];
}

function getTopIndices(values: number[]): number[] {
  return values.length > 0 ? [values.length - 1] : [];
}

function getDefaultHighlights(values: number[]): HighlightEntry[] {
  return values.map((_, index) => ({ index, type: 'default' as const }));
}

function getLaneStateOutcome(values: number[], capacity: number | null): StackLaneOutcome {
  if (values.length === 0) {
    return 'empty';
  }

  if (capacity !== null && values.length >= capacity) {
    return 'overflow';
  }

  return 'ok';
}

function createInitialLaneStep(values: number[], capacity: number | null): StackComparisonLaneStep {
  return {
    action: 'initial',
    highlights: [],
    indices: getTopIndices(values),
    outcome: getLaneStateOutcome(values, capacity),
    stackState: cloneStack(values),
  };
}

function createCompletedLaneStep(values: number[], capacity: number | null): StackComparisonLaneStep {
  return {
    action: 'completed',
    highlights: getDefaultHighlights(values),
    indices: getTopIndices(values),
    outcome: getLaneStateOutcome(values, capacity),
    stackState: cloneStack(values),
  };
}

function createPrepareSequentialPushStep(
  values: number[],
  capacity: number,
  action: 'preparePush' | 'linkPush',
): StackComparisonLaneStep {
  if (values.length >= capacity) {
    return {
      action,
      highlights: values.length > 0 ? [{ index: values.length - 1, type: 'moving' }] : [],
      indices: getTopIndices(values),
      outcome: getLaneStateOutcome(values, capacity),
      stackState: cloneStack(values),
    };
  }

  return {
    action,
    highlights: [{ index: values.length, type: 'comparing' }],
    indices: [values.length],
    outcome: getLaneStateOutcome(values, capacity),
    stackState: cloneStack(values),
    incomingValue: undefined,
  };
}

function createPrepareLinkedPushStep(
  values: number[],
  value: number,
  action: 'preparePush' | 'linkPush',
): StackComparisonLaneStep {
  return {
    action,
    highlights: values.length > 0 ? [{ index: values.length - 1, type: 'moving' }] : [],
    indices: getTopIndices(values),
    outcome: getLaneStateOutcome(values, null),
    stackState: cloneStack(values),
    incomingValue: value,
    incomingNextIndex: action === 'linkPush' && values.length > 0 ? values.length - 1 : undefined,
  };
}

function applyPush(values: number[], value: number, capacity: number | null): LaneApplyResult {
  if (capacity !== null && values.length >= capacity) {
    return {
      finalStack: cloneStack(values),
      step: {
        action: 'blocked',
        highlights: values.length > 0 ? [{ index: values.length - 1, type: 'moving' }] : [],
        indices: getTopIndices(values),
        outcome: 'overflow',
        stackState: cloneStack(values),
      },
    };
  }

  const nextStack = [...values, value];
  return {
    finalStack: nextStack,
    step: {
      action: 'push',
      highlights: [{ index: nextStack.length - 1, type: 'new-node' }],
      indices: [nextStack.length - 1],
      outcome: getLaneStateOutcome(nextStack, capacity),
      stackState: cloneStack(nextStack),
      peekValue: value,
    },
  };
}

function applyPop(values: number[], capacity: number | null): LaneApplyResult {
  if (values.length === 0) {
    return {
      finalStack: [],
      step: {
        action: 'blocked',
        highlights: [],
        indices: [],
        outcome: getLaneStateOutcome([], capacity),
        stackState: [],
      },
    };
  }

  const poppedValue = values[values.length - 1];
  const nextStack = values.slice(0, -1);
  return {
    finalStack: nextStack,
    step: {
      action: 'pop',
      highlights: nextStack.length > 0 ? [{ index: nextStack.length - 1, type: 'moving' }] : [],
      indices: getTopIndices(nextStack),
      outcome: getLaneStateOutcome(nextStack, capacity),
      stackState: cloneStack(nextStack),
      poppedValue,
    },
  };
}

function applyPeek(values: number[], capacity: number | null): LaneApplyResult {
  if (values.length === 0) {
    return {
      finalStack: [],
      step: {
        action: 'blocked',
        highlights: [],
        indices: [],
        outcome: getLaneStateOutcome([], capacity),
        stackState: [],
      },
    };
  }

  const peekValue = values[values.length - 1];
  return {
    finalStack: cloneStack(values),
    step: {
      action: 'peek',
      highlights: [{ index: values.length - 1, type: 'matched' }],
      indices: [values.length - 1],
      outcome: getLaneStateOutcome(values, capacity),
      stackState: cloneStack(values),
      peekValue,
    },
  };
}

function applyLaneOperation(values: number[], operation: StackOperation, capacity: number | null): LaneApplyResult {
  if (operation.type === 'push') {
    return applyPush(values, operation.value, capacity);
  }
  if (operation.type === 'pop') {
    return applyPop(values, capacity);
  }
  return applyPeek(values, capacity);
}

function getOperationCodeLines(operation: StackOperation, hasOverflow: boolean): number[] {
  if (operation.type === 'push') {
    return hasOverflow ? [2, 5] : [2, 5];
  }
  if (operation.type === 'pop') {
    return [6];
  }
  return [7];
}

function getCompletedCodeLines(operation: StackOperation): number[] {
  if (operation.type === 'push') {
    return [5];
  }
  if (operation.type === 'pop') {
    return [6];
  }
  return [7];
}

export function buildStackComparisonSteps(
  sequentialStack: number[],
  linkedStack: number[],
  operation: StackOperation,
): StackComparisonResult {
  const seqInitial = createInitialLaneStep(sequentialStack, STACK_CAPACITY);
  const linkedInitial = createInitialLaneStep(linkedStack, null);
  const steps: StackComparisonStep[] = [
    {
      action: 'initial',
      codeLines: [1],
      sequential: seqInitial,
      linked: linkedInitial,
    },
  ];

  if (operation.type === 'push') {
    steps.push({
      action: 'preparePush',
      codeLines: [2, 3],
      sequential: createPrepareSequentialPushStep(sequentialStack, STACK_CAPACITY, 'preparePush'),
      linked: createPrepareLinkedPushStep(linkedStack, operation.value, 'preparePush'),
    });

    steps.push({
      action: 'linkPush',
      codeLines: [2, 4],
      sequential: createPrepareSequentialPushStep(sequentialStack, STACK_CAPACITY, 'linkPush'),
      linked: createPrepareLinkedPushStep(linkedStack, operation.value, 'linkPush'),
    });
  }

  const sequentialResult = applyLaneOperation(sequentialStack, operation, STACK_CAPACITY);
  const linkedResult = applyLaneOperation(linkedStack, operation, null);
  const hasOverflow = operation.type === 'push' && sequentialResult.step.outcome === 'overflow';

  steps.push({
    action: hasOverflow ? 'overflow' : operation.type,
    codeLines: getOperationCodeLines(operation, hasOverflow),
    sequential: sequentialResult.step,
    linked: linkedResult.step,
  });

  steps.push({
    action: 'completed',
    codeLines: getCompletedCodeLines(operation),
    sequential: createCompletedLaneStep(sequentialResult.finalStack, STACK_CAPACITY),
    linked: createCompletedLaneStep(linkedResult.finalStack, null),
  });

  return {
    steps,
    completedSequential: sequentialResult.finalStack,
    completedLinked: linkedResult.finalStack,
    diverged:
      sequentialResult.finalStack.length !== linkedResult.finalStack.length ||
      sequentialResult.finalStack.some((value, index) => linkedResult.finalStack[index] !== value),
  };
}
