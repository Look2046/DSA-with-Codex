import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type BstOperation = 'searchPath' | 'insert' | 'delete';
export type BstDeleteCase = 'none' | 'leaf' | 'oneChild' | 'twoChildren';
export type BstOutcome = 'ongoing' | 'found' | 'inserted' | 'deleted' | 'notFound' | 'duplicate';

export type BstNodeSnapshot = {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  parent: number | null;
};

export type BstStep = AnimationStep & {
  treeState: BstNodeSnapshot[];
  rootId: number | null;
  action:
    | 'initial'
    | 'visit'
    | 'found'
    | 'notFound'
    | 'inserted'
    | 'duplicate'
    | 'deleteCase'
    | 'successor'
    | 'deleted'
    | 'operationDone'
    | 'completed';
  operation: BstOperation;
  target: number;
  currentId: number | null;
  compareResult: -1 | 0 | 1 | null;
  pathIds: number[];
  deleteCase: BstDeleteCase;
  successorId: number | null;
  outcome: BstOutcome;
};

type MutableNode = {
  id: number;
  value: number;
  left: number | null;
  right: number | null;
  parent: number | null;
};

type MutableTree = {
  rootId: number | null;
  nodes: Map<number, MutableNode>;
  nextId: number;
};

function createEmptyTree(): MutableTree {
  return {
    rootId: null,
    nodes: new Map<number, MutableNode>(),
    nextId: 0,
  };
}

function clonePath(pathIds: number[]): number[] {
  return [...pathIds];
}

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function snapshotTree(nodes: Map<number, MutableNode>): BstNodeSnapshot[] {
  return [...nodes.values()]
    .sort((left, right) => left.id - right.id)
    .map((node) => ({
      id: node.id,
      value: node.value,
      left: node.left,
      right: node.right,
      parent: node.parent,
    }));
}

function createStep(
  tree: MutableTree,
  operation: BstOperation,
  target: number,
  action: BstStep['action'],
  codeLines: number[],
  highlights: HighlightEntry[],
  currentId: number | null,
  compareResult: -1 | 0 | 1 | null,
  pathIds: number[],
  deleteCase: BstDeleteCase,
  successorId: number | null,
  outcome: BstOutcome,
): BstStep {
  return {
    description: '',
    codeLines,
    highlights: cloneHighlights(highlights),
    treeState: snapshotTree(tree.nodes),
    rootId: tree.rootId,
    action,
    operation,
    target,
    currentId,
    compareResult,
    pathIds: clonePath(pathIds),
    deleteCase,
    successorId,
    outcome,
  };
}

function getNode(tree: MutableTree, nodeId: number | null): MutableNode | null {
  if (nodeId === null) {
    return null;
  }
  return tree.nodes.get(nodeId) ?? null;
}

function appendVisitStep(
  steps: BstStep[],
  tree: MutableTree,
  operation: BstOperation,
  target: number,
  pathIds: number[],
  currentId: number,
  compareResult: -1 | 0 | 1,
  codeLine: number,
): void {
  const highlights: HighlightEntry[] = pathIds
    .filter((nodeId) => nodeId !== currentId)
    .map((nodeId) => ({ index: nodeId, type: 'visiting' as const }));
  highlights.push({ index: currentId, type: 'comparing' });

  steps.push(
    createStep(
      tree,
      operation,
      target,
      'visit',
      [codeLine],
      highlights,
      currentId,
      compareResult,
      pathIds,
      'none',
      null,
      'ongoing',
    ),
  );
}

function attachNode(tree: MutableTree, parentId: number | null, value: number, toLeft: boolean): number {
  const nextNode: MutableNode = {
    id: tree.nextId,
    value,
    left: null,
    right: null,
    parent: parentId,
  };

  tree.nodes.set(nextNode.id, nextNode);
  tree.nextId += 1;

  if (parentId === null) {
    tree.rootId = nextNode.id;
    return nextNode.id;
  }

  const parentNode = getNode(tree, parentId);
  if (!parentNode) {
    throw new Error('Invalid parent node while attaching BST node.');
  }

  if (toLeft) {
    parentNode.left = nextNode.id;
  } else {
    parentNode.right = nextNode.id;
  }

  return nextNode.id;
}

function insertSeedValue(tree: MutableTree, value: number): void {
  if (tree.rootId === null) {
    attachNode(tree, null, value, true);
    return;
  }

  let currentId: number | null = tree.rootId;
  let parentId: number | null = null;
  let toLeft = false;

  while (currentId !== null) {
    const currentNode = getNode(tree, currentId);
    if (!currentNode) {
      break;
    }

    parentId = currentNode.id;

    if (value === currentNode.value) {
      return;
    }

    if (value < currentNode.value) {
      toLeft = true;
      currentId = currentNode.left;
    } else {
      toLeft = false;
      currentId = currentNode.right;
    }
  }

  attachNode(tree, parentId, value, toLeft);
}

function buildTreeFromInput(input: number[]): MutableTree {
  const tree = createEmptyTree();
  input.forEach((value) => insertSeedValue(tree, value));
  return tree;
}

function replaceParentChild(tree: MutableTree, parentId: number | null, fromId: number, toId: number | null): void {
  if (parentId === null) {
    tree.rootId = toId;
    if (toId !== null) {
      const nextRoot = getNode(tree, toId);
      if (nextRoot) {
        nextRoot.parent = null;
      }
    }
    return;
  }

  const parent = getNode(tree, parentId);
  if (!parent) {
    throw new Error('Invalid parent during BST replaceParentChild.');
  }

  if (parent.left === fromId) {
    parent.left = toId;
  } else if (parent.right === fromId) {
    parent.right = toId;
  }

  if (toId !== null) {
    const child = getNode(tree, toId);
    if (child) {
      child.parent = parent.id;
    }
  }
}

function runSearchOperation(steps: BstStep[], tree: MutableTree, target: number): BstOutcome {
  const operation: BstOperation = 'searchPath';
  const pathIds: number[] = [];
  let currentId: number | null = tree.rootId;

  while (currentId !== null) {
    const currentNode = getNode(tree, currentId);
    if (!currentNode) {
      break;
    }

    pathIds.push(currentNode.id);
    const compareResult: -1 | 0 | 1 = target < currentNode.value ? -1 : target > currentNode.value ? 1 : 0;

    appendVisitStep(steps, tree, operation, target, pathIds, currentNode.id, compareResult, 3);

    if (compareResult === 0) {
      steps.push(
        createStep(
          tree,
          operation,
          target,
          'found',
          [4],
          [{ index: currentNode.id, type: 'matched' }],
          currentNode.id,
          0,
          pathIds,
          'none',
          null,
          'found',
        ),
      );
      return 'found';
    }

    currentId = compareResult < 0 ? currentNode.left : currentNode.right;
  }

  steps.push(createStep(tree, operation, target, 'notFound', [5], [], null, null, pathIds, 'none', null, 'notFound'));
  return 'notFound';
}

function runInsertOperation(steps: BstStep[], tree: MutableTree, target: number): BstOutcome {
  const operation: BstOperation = 'insert';
  const pathIds: number[] = [];

  if (tree.rootId === null) {
    const insertedId = attachNode(tree, null, target, true);
    steps.push(
      createStep(
        tree,
        operation,
        target,
        'inserted',
        [7],
        [{ index: insertedId, type: 'new-node' }],
        insertedId,
        null,
        [insertedId],
        'none',
        null,
        'inserted',
      ),
    );
    return 'inserted';
  }

  let currentId: number | null = tree.rootId;
  let parentId: number | null = null;
  let toLeft = false;

  while (currentId !== null) {
    const currentNode = getNode(tree, currentId);
    if (!currentNode) {
      break;
    }

    pathIds.push(currentNode.id);
    const compareResult: -1 | 0 | 1 = target < currentNode.value ? -1 : target > currentNode.value ? 1 : 0;

    appendVisitStep(steps, tree, operation, target, pathIds, currentNode.id, compareResult, 6);

    if (compareResult === 0) {
      steps.push(
        createStep(
          tree,
          operation,
          target,
          'duplicate',
          [6],
          [{ index: currentNode.id, type: 'matched' }],
          currentNode.id,
          0,
          pathIds,
          'none',
          null,
          'duplicate',
        ),
      );
      return 'duplicate';
    }

    parentId = currentNode.id;

    if (compareResult < 0) {
      toLeft = true;
      currentId = currentNode.left;
    } else {
      toLeft = false;
      currentId = currentNode.right;
    }
  }

  const insertedId = attachNode(tree, parentId, target, toLeft);
  pathIds.push(insertedId);
  steps.push(
    createStep(
      tree,
      operation,
      target,
      'inserted',
      [7],
      [{ index: insertedId, type: 'new-node' }],
      insertedId,
      null,
      pathIds,
      'none',
      null,
      'inserted',
    ),
  );

  return 'inserted';
}

function classifyDeleteCase(node: MutableNode): BstDeleteCase {
  if (node.left === null && node.right === null) {
    return 'leaf';
  }
  if (node.left === null || node.right === null) {
    return 'oneChild';
  }
  return 'twoChildren';
}

function runDeleteOperation(steps: BstStep[], tree: MutableTree, target: number): BstOutcome {
  const operation: BstOperation = 'delete';
  const pathIds: number[] = [];
  let currentId = tree.rootId;

  while (currentId !== null) {
    const currentNode = getNode(tree, currentId);
    if (!currentNode) {
      break;
    }

    pathIds.push(currentNode.id);
    const compareResult: -1 | 0 | 1 = target < currentNode.value ? -1 : target > currentNode.value ? 1 : 0;

    appendVisitStep(steps, tree, operation, target, pathIds, currentNode.id, compareResult, 8);

    if (compareResult === 0) {
      const deleteCase = classifyDeleteCase(currentNode);
      steps.push(
        createStep(
          tree,
          operation,
          target,
          'deleteCase',
          [10],
          [{ index: currentNode.id, type: 'matched' }],
          currentNode.id,
          0,
          pathIds,
          deleteCase,
          null,
          'ongoing',
        ),
      );

      if (deleteCase === 'leaf') {
        replaceParentChild(tree, currentNode.parent, currentNode.id, null);
        tree.nodes.delete(currentNode.id);

        steps.push(
          createStep(
            tree,
            operation,
            target,
            'deleted',
            [11],
            [],
            currentNode.parent,
            null,
            pathIds,
            deleteCase,
            null,
            'deleted',
          ),
        );
        return 'deleted';
      }

      if (deleteCase === 'oneChild') {
        const replacementId = currentNode.left ?? currentNode.right;
        replaceParentChild(tree, currentNode.parent, currentNode.id, replacementId);
        tree.nodes.delete(currentNode.id);

        steps.push(
          createStep(
            tree,
            operation,
            target,
            'deleted',
            [11],
            replacementId !== null ? [{ index: replacementId, type: 'matched' }] : [],
            replacementId,
            null,
            pathIds,
            deleteCase,
            null,
            'deleted',
          ),
        );
        return 'deleted';
      }

      let successorId = currentNode.right;
      const successorPath: number[] = [];

      while (successorId !== null) {
        const successorNode = getNode(tree, successorId);
        if (!successorNode) {
          break;
        }

        successorPath.push(successorNode.id);
        steps.push(
          createStep(
            tree,
            operation,
            target,
            'successor',
            [12],
            [
              { index: currentNode.id, type: 'matched' },
              { index: successorNode.id, type: 'comparing' },
            ],
            successorNode.id,
            null,
            [...pathIds, ...successorPath],
            deleteCase,
            successorNode.id,
            'ongoing',
          ),
        );

        if (successorNode.left === null) {
          break;
        }

        successorId = successorNode.left;
      }

      const successorNode = getNode(tree, successorId);
      if (!successorNode) {
        throw new Error('BST successor resolution failed for delete operation.');
      }

      currentNode.value = successorNode.value;

      replaceParentChild(tree, successorNode.parent, successorNode.id, successorNode.right);
      tree.nodes.delete(successorNode.id);

      steps.push(
        createStep(
          tree,
          operation,
          target,
          'deleted',
          [13],
          [{ index: currentNode.id, type: 'matched' }],
          currentNode.id,
          null,
          [...pathIds, ...successorPath],
          deleteCase,
          successorNode.id,
          'deleted',
        ),
      );

      return 'deleted';
    }

    currentId = compareResult < 0 ? currentNode.left : currentNode.right;
  }

  steps.push(createStep(tree, operation, target, 'notFound', [9], [], null, null, pathIds, 'none', null, 'notFound'));
  return 'notFound';
}

export function generateBstSteps(input: number[], operation: BstOperation, target: number): BstStep[] {
  const tree = buildTreeFromInput(input);
  const steps: BstStep[] = [];

  steps.push(createStep(tree, operation, target, 'initial', [1], [], null, null, [], 'none', null, 'ongoing'));

  if (operation === 'searchPath') {
    runSearchOperation(steps, tree, target);
  } else if (operation === 'insert') {
    runInsertOperation(steps, tree, target);
  } else {
    runDeleteOperation(steps, tree, target);
  }

  return steps;
}
