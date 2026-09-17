export type GeneralizedListOperationMode = 'head-only' | 'tail-only' | 'mixed';

export type GeneralizedListGeneratorConfig = {
  atomTypeCount: number;
  maxWidth: number;
  maxDepth: number;
  operationMode: GeneralizedListOperationMode;
  operationDepth: number;
};

export type GeneralizedListAtomNode = {
  kind: 'atom';
  value: string;
};

export type GeneralizedListListNode = {
  kind: 'list';
  items: GeneralizedListNode[];
};

export type GeneralizedListNode = GeneralizedListAtomNode | GeneralizedListListNode;

export type GeneralizedListOperation = 'head' | 'tail';

export type GeneralizedListGeneratedProblem = {
  config: GeneralizedListGeneratorConfig;
  list: GeneralizedListListNode;
  operations: GeneralizedListOperation[];
  expressionText: string;
  displayExpressionText: string;
  steps: GeneralizedListSolveStep[];
};

export type GeneralizedListSolveStep = {
  depth: number;
  expressionBefore: string;
  displayExpressionBefore: string;
  focusExpression: string;
  displayFocusExpression: string;
  resultExpression: string;
  expressionAfter: string;
  displayExpressionAfter: string;
  needsSubstitutionDisplay: boolean;
  operation: GeneralizedListOperation;
  explanationTarget: string;
};

export const GENERALIZED_LIST_DEFAULT_CONFIG: GeneralizedListGeneratorConfig = {
  atomTypeCount: 2,
  maxWidth: 3,
  maxDepth: 2,
  operationMode: 'mixed',
  operationDepth: 2,
};

export const GENERALIZED_LIST_LIMITS = {
  atomTypeCount: { min: 1, max: 4 },
  maxWidth: { min: 1, max: 5 },
  maxDepth: { min: 1, max: 4 },
  operationDepth: { min: 1, max: 4 },
} as const;

type RandomFn = () => number;

type OperationExpr =
  | { kind: 'list-ref' }
  | { kind: 'literal'; value: GeneralizedListNode }
  | { kind: 'op'; op: GeneralizedListOperation; input: OperationExpr };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function sanitizeGeneralizedListConfig(
  config: GeneralizedListGeneratorConfig,
): GeneralizedListGeneratorConfig {
  return {
    atomTypeCount: clamp(
      Math.trunc(config.atomTypeCount),
      GENERALIZED_LIST_LIMITS.atomTypeCount.min,
      GENERALIZED_LIST_LIMITS.atomTypeCount.max,
    ),
    maxWidth: clamp(
      Math.trunc(config.maxWidth),
      GENERALIZED_LIST_LIMITS.maxWidth.min,
      GENERALIZED_LIST_LIMITS.maxWidth.max,
    ),
    maxDepth: clamp(
      Math.trunc(config.maxDepth),
      GENERALIZED_LIST_LIMITS.maxDepth.min,
      GENERALIZED_LIST_LIMITS.maxDepth.max,
    ),
    operationMode: config.operationMode,
    operationDepth: clamp(
      Math.trunc(config.operationDepth),
      GENERALIZED_LIST_LIMITS.operationDepth.min,
      GENERALIZED_LIST_LIMITS.operationDepth.max,
    ),
  };
}

function cloneNode(node: GeneralizedListNode): GeneralizedListNode {
  if (node.kind === 'atom') {
    return { ...node };
  }

  return {
    kind: 'list',
    items: node.items.map((item) => cloneNode(item)),
  };
}

function cloneListNode(node: GeneralizedListListNode): GeneralizedListListNode {
  return cloneNode(node) as GeneralizedListListNode;
}

function isNonEmptyList(node: GeneralizedListNode): node is GeneralizedListListNode {
  return node.kind === 'list' && node.items.length > 0;
}

function createAtomPool(count: number): string[] {
  return Array.from({ length: count }, (_, index) => String.fromCharCode(97 + index));
}

function randomInt(random: RandomFn, maxExclusive: number): number {
  return Math.floor(random() * maxExclusive);
}

function randomChoice<T>(random: RandomFn, values: T[]): T {
  return values[randomInt(random, values.length)];
}

function generateRandomNode(
  random: RandomFn,
  atomPool: string[],
  maxWidth: number,
  depthRemaining: number,
  forceNonEmptyList: boolean,
): GeneralizedListNode {
  if (!forceNonEmptyList && (depthRemaining <= 0 || random() < 0.42)) {
    return {
      kind: 'atom',
      value: randomChoice(random, atomPool),
    };
  }

  const localWidthCap = 1 + randomInt(random, maxWidth);
  const itemCount = 1 + randomInt(random, localWidthCap);
  const items: GeneralizedListNode[] = [];

  for (let index = 0; index < itemCount; index += 1) {
    const mustNest = depthRemaining > 0 && index === 0 && forceNonEmptyList && random() < 0.55;
    const childWidthCap = Math.max(1, 1 + randomInt(random, maxWidth));
    items.push(
      generateRandomNode(
        random,
        atomPool,
        childWidthCap,
        Math.max(0, depthRemaining - 1),
        mustNest,
      ),
    );
  }

  return {
    kind: 'list',
    items,
  };
}

export function stringifyGeneralizedList(node: GeneralizedListNode): string {
  if (node.kind === 'atom') {
    return node.value;
  }

  return `(${node.items.map((item) => stringifyGeneralizedList(item)).join(',')})`;
}

function stringifyOperationExpr(expr: OperationExpr): string {
  return stringifyOperationExprWithList(expr);
}

function stringifyOperationExprWithList(
  expr: OperationExpr,
  listText = 'L',
): string {
  if (expr.kind === 'list-ref') {
    return listText;
  }

  if (expr.kind === 'literal') {
    return stringifyGeneralizedList(expr.value);
  }

  return `${expr.op}(${stringifyOperationExprWithList(expr.input, listText)})`;
}

function evaluateOperation(
  operation: GeneralizedListOperation,
  input: GeneralizedListNode,
): GeneralizedListNode {
  if (!isNonEmptyList(input)) {
    throw new Error('Cannot apply head/tail to an atom or empty list.');
  }

  if (operation === 'head') {
    return cloneNode(input.items[0]);
  }

  return {
    kind: 'list',
    items: input.items.slice(1).map((item) => cloneNode(item)),
  };
}

function getExpressionDepth(expr: OperationExpr): number {
  if (expr.kind !== 'op') {
    return 0;
  }
  return 1 + getExpressionDepth(expr.input);
}

function getListValueForExpr(expr: OperationExpr, list: GeneralizedListListNode): GeneralizedListNode {
  if (expr.kind === 'list-ref') {
    return cloneListNode(list);
  }

  if (expr.kind === 'literal') {
    return cloneNode(expr.value);
  }

  return evaluateOperation(expr.op, getListValueForExpr(expr.input, list));
}

function buildSolveSteps(
  rootExpr: OperationExpr,
  list: GeneralizedListListNode,
): GeneralizedListSolveStep[] {
  const steps: GeneralizedListSolveStep[] = [];

  function getDeepestOperation(expr: OperationExpr): OperationExpr & { kind: 'op' } {
    let current = expr;
    while (current.kind === 'op' && current.input.kind === 'op') {
      current = current.input;
    }
    if (current.kind !== 'op') {
      throw new Error('Expected an operation expression.');
    }
    return current;
  }

  function replaceDeepestOperation(
    expr: OperationExpr,
    replacement: OperationExpr,
  ): OperationExpr {
    if (expr.kind !== 'op') {
      return expr;
    }

    if (expr.input.kind !== 'op') {
      return replacement;
    }

    return {
      kind: 'op',
      op: expr.op,
      input: replaceDeepestOperation(expr.input, replacement),
    };
  }

  let currentExpr = rootExpr;

  while (currentExpr.kind === 'op') {
    const deepestExpr = getDeepestOperation(currentExpr);
    const focusExpression = stringifyOperationExpr(deepestExpr);
    const targetValue = getListValueForExpr(deepestExpr.input, list);
    const resultValue = evaluateOperation(deepestExpr.op, targetValue);
    const resultExpression = stringifyGeneralizedList(resultValue);
    const expressionBefore = stringifyOperationExpr(currentExpr);
    const reducedExpr: OperationExpr = { kind: 'literal', value: resultValue };
    const expressionAfter = replaceDeepestOperation(currentExpr, reducedExpr);

    steps.push({
      depth: getExpressionDepth(deepestExpr),
      expressionBefore,
      displayExpressionBefore: stringifyOperationExprWithList(
        currentExpr,
        stringifyGeneralizedList(list),
      ),
      focusExpression,
      displayFocusExpression: stringifyOperationExprWithList(
        deepestExpr,
        stringifyGeneralizedList(list),
      ),
      resultExpression,
      expressionAfter: stringifyOperationExpr(expressionAfter),
      displayExpressionAfter: stringifyOperationExprWithList(
        expressionAfter,
        stringifyGeneralizedList(list),
      ),
      needsSubstitutionDisplay:
        stringifyOperationExpr(deepestExpr) !== expressionBefore ||
        resultExpression !== stringifyOperationExpr(expressionAfter),
      operation: deepestExpr.op,
      explanationTarget: stringifyGeneralizedList(targetValue),
    });

    currentExpr = expressionAfter;
  }

  return steps;
}

function getAllowedOperations(
  node: GeneralizedListNode,
  remainingStepsAfterThis: number,
  mode: GeneralizedListOperationMode,
): GeneralizedListOperation[] {
  if (!isNonEmptyList(node)) {
    return [];
  }

  const allowed: GeneralizedListOperation[] = [];
  const modes =
    mode === 'mixed'
      ? (['head', 'tail'] as GeneralizedListOperation[])
      : mode === 'head-only'
        ? (['head'] as GeneralizedListOperation[])
        : (['tail'] as GeneralizedListOperation[]);

  for (const operation of modes) {
    const result = evaluateOperation(operation, node);
    if (remainingStepsAfterThis > 0 && !isNonEmptyList(result)) {
      continue;
    }
    allowed.push(operation);
  }

  return allowed;
}

function tryGenerateOperations(
  random: RandomFn,
  list: GeneralizedListListNode,
  operationDepth: number,
  mode: GeneralizedListOperationMode,
): GeneralizedListOperation[] | null {
  const operations: GeneralizedListOperation[] = [];
  let current: GeneralizedListNode = cloneListNode(list);

  for (let index = 0; index < operationDepth; index += 1) {
    const remaining = operationDepth - index - 1;
    const allowed = getAllowedOperations(current, remaining, mode);
    if (allowed.length === 0) {
      return null;
    }

    const operation = randomChoice(random, allowed);
    operations.push(operation);
    current = evaluateOperation(operation, current);
  }

  return operations;
}

function buildOperationExpression(operations: GeneralizedListOperation[]): OperationExpr {
  return operations.reduce<OperationExpr>(
    (current, operation) => ({
      kind: 'op',
      op: operation,
      input: current,
    }),
    { kind: 'list-ref' },
  );
}

export function createSeededRandom(seed: number): RandomFn {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function generateGeneralizedListProblem(
  inputConfig: GeneralizedListGeneratorConfig,
  random: RandomFn = Math.random,
): GeneralizedListGeneratedProblem {
  const config = sanitizeGeneralizedListConfig(inputConfig);
  const atomPool = createAtomPool(config.atomTypeCount);

  for (let attempt = 0; attempt < 240; attempt += 1) {
    const candidate = generateRandomNode(
      random,
      atomPool,
      config.maxWidth,
      config.maxDepth,
      true,
    );

    if (!isNonEmptyList(candidate)) {
      continue;
    }

    const operations = tryGenerateOperations(
      random,
      candidate,
      config.operationDepth,
      config.operationMode,
    );

    if (!operations) {
      continue;
    }

    const rootExpr = buildOperationExpression(operations);
    return {
      config,
      list: candidate,
      operations,
      expressionText: stringifyOperationExpr(rootExpr),
      displayExpressionText: stringifyOperationExprWithList(
        rootExpr,
        stringifyGeneralizedList(candidate),
      ),
      steps: buildSolveSteps(rootExpr, candidate),
    };
  }

  throw new Error('Failed to generate a valid generalized-list problem within the current limits.');
}
