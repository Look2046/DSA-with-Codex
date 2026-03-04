import type { AnimationStep, HighlightType } from '../../types/animation';

type LinkedListNode = {
  id: string;
  value: number;
  nextId: string | null;
  detached?: boolean;
};

export type LinkedListOperation =
  | { type: 'find'; value: number }
  | { type: 'insertAt'; index: number; value: number }
  | { type: 'deleteAt'; index: number };

export type LinkedListStep = AnimationStep & {
  operation: LinkedListOperation['type'];
  action:
    | 'initial'
    | 'visit'
    | 'match'
    | 'notFound'
    | 'prepareInsert'
    | 'movePointerRoot'
    | 'linkNewNode'
    | 'shiftForInsert'
    | 'insert'
    | 'prepareDelete'
    | 'delete'
    | 'completed';
  nodes: LinkedListNode[];
  headId: string | null;
  renderOrder: string[];
  floatingNodeIds: string[];
  hiddenLinkFromIds: string[];
  transientLinks: Array<{
    fromId: string;
    toId: string;
    style: 'moving-root' | 'new-link' | 'delete-link';
    moveToPointerId?: string;
  }>;
  targetIndex?: number;
};

const MAX_LIST_LENGTH = 30;

function cloneNodes(nodes: LinkedListNode[]): LinkedListNode[] {
  return nodes.map((node) => ({ ...node }));
}

function getNodeMap(nodes: LinkedListNode[]): Map<string, LinkedListNode> {
  return new Map(nodes.map((node) => [node.id, node]));
}

function createNodes(values: number[]): LinkedListNode[] {
  return values.map((value, index) => ({
    id: `n${index}`,
    value,
    nextId: index < values.length - 1 ? `n${index + 1}` : null,
  }));
}

function buildRenderOrder(headId: string | null, nodes: LinkedListNode[]): string[] {
  const nodeMap = getNodeMap(nodes);
  const order: string[] = [];
  const visited = new Set<string>();

  let cursor = headId;
  while (cursor) {
    if (visited.has(cursor)) {
      break;
    }
    visited.add(cursor);
    order.push(cursor);
    cursor = nodeMap.get(cursor)?.nextId ?? null;
  }

  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      order.push(node.id);
    }
  });

  return order;
}

function buildHighlights(
  renderOrder: string[],
  entries: Array<{ id: string; type: HighlightType }>,
): Array<{ index: number; type: HighlightType }> {
  const indexMap = new Map(renderOrder.map((id, index) => [id, index]));
  return entries
    .map((entry) => {
      const index = indexMap.get(entry.id);
      if (index === undefined) {
        return null;
      }
      return { index, type: entry.type };
    })
    .filter((entry): entry is { index: number; type: HighlightType } => entry !== null);
}

function appendStep(
  steps: LinkedListStep[],
  operation: LinkedListOperation['type'],
  action: LinkedListStep['action'],
  codeLines: number[],
  nodes: LinkedListNode[],
  headId: string | null,
  highlightEntries: Array<{ id: string; type: HighlightType }> = [],
  options?: {
    floatingNodeIds?: string[];
    hiddenLinkFromIds?: string[];
    transientLinks?: Array<{ fromId: string; toId: string; style: 'moving-root' | 'new-link' | 'delete-link'; moveToPointerId?: string }>;
    targetIndex?: number;
  },
): void {
  const renderOrder = buildRenderOrder(headId, nodes);
  steps.push({
    description: '',
    codeLines,
    highlights: buildHighlights(renderOrder, highlightEntries),
    operation,
    action,
    nodes: cloneNodes(nodes),
    headId,
    renderOrder,
    floatingNodeIds: options?.floatingNodeIds ?? [],
    hiddenLinkFromIds: options?.hiddenLinkFromIds ?? [],
    transientLinks: options?.transientLinks ?? [],
    targetIndex: options?.targetIndex,
  });
}

function assertListRange(values: number[]): void {
  if (values.length < 0 || values.length > MAX_LIST_LENGTH) {
    throw new RangeError(`Linked list length must be within [0, ${MAX_LIST_LENGTH}]`);
  }
}

function createDetachedNode(nodes: LinkedListNode[], value: number): LinkedListNode {
  const nextId = nodes.length;
  return {
    id: `n${nextId}`,
    value,
    nextId: null,
    detached: true,
  };
}

export function generateLinkedListSteps(input: number[], operation: LinkedListOperation): LinkedListStep[] {
  assertListRange(input);

  const steps: LinkedListStep[] = [];
  const nodes = createNodes(input);
  let headId: string | null = nodes[0]?.id ?? null;

  if (operation.type === 'find') {
    appendStep(steps, operation.type, 'initial', [1], nodes, headId);

    const visitedIds = buildRenderOrder(headId, nodes);
    let found = false;

    for (const id of visitedIds) {
      const node = nodes.find((item) => item.id === id);
      if (!node) {
        continue;
      }

      appendStep(steps, operation.type, 'visit', [2], nodes, headId, [{ id, type: 'visiting' }]);

      if (node.value === operation.value) {
        found = true;
        appendStep(steps, operation.type, 'match', [3], nodes, headId, [{ id, type: 'matched' }]);
        break;
      }
    }

    if (!found) {
      appendStep(steps, operation.type, 'notFound', [4], nodes, headId);
    }

    appendStep(steps, operation.type, 'completed', [5], nodes, headId);
    return steps;
  }

  if (operation.type === 'insertAt') {
    if (!Number.isInteger(operation.index) || operation.index < 0 || operation.index > nodes.length) {
      throw new RangeError(`Insert index out of range: ${operation.index}`);
    }

    appendStep(steps, operation.type, 'initial', [1], nodes, headId);

    if (operation.index > 0) {
      const traversalOrder = buildRenderOrder(headId, nodes);
      for (let index = 0; index < operation.index; index += 1) {
        const visitId = traversalOrder[index];
        if (!visitId) {
          continue;
        }
        appendStep(steps, operation.type, 'visit', [2], nodes, headId, [{ id: visitId, type: 'visiting' }]);
      }
    }

    const detachedNode = createDetachedNode(nodes, operation.value);
    nodes.push(detachedNode);

    if (operation.index === 0) {
      detachedNode.nextId = headId;
      appendStep(steps, operation.type, 'prepareInsert', [3], nodes, headId, [{ id: detachedNode.id, type: 'new-node' }], {
        floatingNodeIds: [detachedNode.id],
        targetIndex: 0,
      });

      appendStep(steps, operation.type, 'shiftForInsert', [4], nodes, headId, [{ id: detachedNode.id, type: 'new-node' }], {
        floatingNodeIds: [detachedNode.id],
        targetIndex: 0,
      });

      headId = detachedNode.id;
      detachedNode.detached = false;
      appendStep(steps, operation.type, 'insert', [4], nodes, headId, [{ id: detachedNode.id, type: 'new-node' }]);

      appendStep(steps, operation.type, 'completed', [5], nodes, headId);
      return steps;
    }

    const traversalOrder = buildRenderOrder(headId, nodes);
    const prevId = traversalOrder[operation.index - 1];
    const prevNode = nodes.find((node) => node.id === prevId);
    if (!prevNode) {
      throw new RangeError(`Insert index out of range: ${operation.index}`);
    }

    detachedNode.nextId = prevNode.nextId;
    appendStep(steps, operation.type, 'prepareInsert', [3], nodes, headId, [
      { id: prevNode.id, type: 'swapping' },
      { id: detachedNode.id, type: 'new-node' },
    ], {
      floatingNodeIds: [detachedNode.id],
      targetIndex: operation.index,
    });

    if (detachedNode.nextId) {
      appendStep(steps, operation.type, 'movePointerRoot', [4], nodes, headId, [
        { id: prevNode.id, type: 'swapping' },
        { id: detachedNode.id, type: 'new-node' },
      ], {
        floatingNodeIds: [detachedNode.id],
        hiddenLinkFromIds: [prevNode.id, detachedNode.id],
        transientLinks: [{ fromId: prevNode.id, toId: detachedNode.nextId, style: 'moving-root', moveToPointerId: detachedNode.id }],
        targetIndex: operation.index,
      });
    }

    appendStep(steps, operation.type, 'linkNewNode', [5], nodes, headId, [
      { id: prevNode.id, type: 'swapping' },
      { id: detachedNode.id, type: 'new-node' },
    ], {
      floatingNodeIds: [detachedNode.id],
      hiddenLinkFromIds: [prevNode.id],
      transientLinks: [{ fromId: prevNode.id, toId: detachedNode.id, style: 'new-link' }],
      targetIndex: operation.index,
    });

    prevNode.nextId = detachedNode.id;
    detachedNode.detached = false;
    appendStep(steps, operation.type, 'shiftForInsert', [6, 7], nodes, headId, [
      { id: prevNode.id, type: 'swapping' },
      { id: detachedNode.id, type: 'new-node' },
    ], {
      targetIndex: operation.index,
    });
    appendStep(steps, operation.type, 'completed', [8], nodes, headId);
    return steps;
  }

  if (!Number.isInteger(operation.index) || operation.index < 0 || operation.index >= nodes.length) {
    throw new RangeError(`Delete index out of range: ${operation.index}`);
  }

  appendStep(steps, operation.type, 'initial', [1], nodes, headId);

  if (operation.index > 0) {
    const traversalOrder = buildRenderOrder(headId, nodes);
    for (let index = 0; index < operation.index; index += 1) {
      const visitId = traversalOrder[index];
      if (!visitId) {
        continue;
      }
      appendStep(steps, operation.type, 'visit', [2], nodes, headId, [{ id: visitId, type: 'visiting' }]);
    }
  }

  if (operation.index === 0) {
    const deleteId = headId;
    const deleteNode = deleteId ? nodes.find((node) => node.id === deleteId) : undefined;
    if (!deleteNode) {
      throw new RangeError(`Delete index out of range: ${operation.index}`);
    }

    appendStep(steps, operation.type, 'prepareDelete', [3], nodes, headId, [{ id: deleteId, type: 'swapping' }]);

    const nextHeadId = deleteNode.nextId;
    headId = nextHeadId;
    deleteNode.detached = true;
    deleteNode.nextId = null;
    appendStep(steps, operation.type, 'delete', [4], nodes, headId, [{ id: deleteId, type: 'swapping' }], {
      floatingNodeIds: [deleteId],
      hiddenLinkFromIds: [deleteId],
      targetIndex: 0,
    });

    const removeIndex = nodes.findIndex((node) => node.id === deleteId);
    nodes.splice(removeIndex, 1);
    appendStep(steps, operation.type, 'completed', [5], nodes, headId);
    return steps;
  }

  const traversalOrder = buildRenderOrder(headId, nodes);
  const prevId = traversalOrder[operation.index - 1];
  const prevNode = nodes.find((node) => node.id === prevId);
  if (!prevNode || !prevNode.nextId) {
    throw new RangeError(`Delete index out of range: ${operation.index}`);
  }

  const deleteId = prevNode.nextId;
  const deleteNode = nodes.find((node) => node.id === deleteId);
  if (!deleteNode) {
    throw new RangeError(`Delete index out of range: ${operation.index}`);
  }

  appendStep(steps, operation.type, 'prepareDelete', [3], nodes, headId, [
    { id: prevNode.id, type: 'swapping' },
    { id: deleteNode.id, type: 'swapping' },
  ]);

  const nextIdAfterDelete = deleteNode.nextId;
  prevNode.nextId = nextIdAfterDelete;
  deleteNode.nextId = null;
  deleteNode.detached = true;
  appendStep(steps, operation.type, 'delete', [4], nodes, headId, [
    { id: prevNode.id, type: 'swapping' },
    { id: deleteNode.id, type: 'swapping' },
  ], {
    floatingNodeIds: [deleteNode.id],
    hiddenLinkFromIds: [prevNode.id, deleteNode.id],
    transientLinks: nextIdAfterDelete ? [{ fromId: prevNode.id, toId: nextIdAfterDelete, style: 'delete-link' }] : [],
    targetIndex: operation.index,
  });

  const removeIndex = nodes.findIndex((node) => node.id === deleteId);
  nodes.splice(removeIndex, 1);

  appendStep(steps, operation.type, 'completed', [5], nodes, headId);
  return steps;
}
