import { describe, expect, it } from 'vitest';
import { generateLinkedListSteps } from './linkedListOps';

function collectChainValues(step: ReturnType<typeof generateLinkedListSteps>[number]): number[] {
  const map = new Map(step.nodes.map((node) => [node.id, node]));
  const values: number[] = [];
  const visited = new Set<string>();

  let cursor = step.headId;
  while (cursor) {
    if (visited.has(cursor)) {
      throw new Error('Detected loop in singly linked list chain');
    }
    visited.add(cursor);

    const node = map.get(cursor);
    if (!node) {
      throw new Error(`Missing node: ${cursor}`);
    }

    values.push(node.value);
    cursor = node.nextId;
  }

  return values;
}

function collectCircularValues(step: ReturnType<typeof generateLinkedListSteps>[number]): number[] {
  const map = new Map(step.nodes.map((node) => [node.id, node]));
  const values: number[] = [];
  let cursor = step.headId;

  for (let count = 0; count < step.nodes.length && cursor; count += 1) {
    const node = map.get(cursor);
    if (!node) {
      throw new Error(`Missing node: ${cursor}`);
    }
    values.push(node.value);
    cursor = node.nextId;
  }

  return values;
}

function assertLinkTargetsValid(step: ReturnType<typeof generateLinkedListSteps>[number]): void {
  const validIds = new Set(step.nodes.map((node) => node.id));

  step.nodes.forEach((node) => {
    if (node.nextId !== null) {
      expect(validIds.has(node.nextId)).toBe(true);
    }
  });
}

describe('generateLinkedListSteps', () => {
  it('returns deterministic steps for same input', () => {
    const run1 = generateLinkedListSteps([3, 8, 1, 5], { type: 'insertAt', index: 2, value: 9 });
    const run2 = generateLinkedListSteps([3, 8, 1, 5], { type: 'insertAt', index: 2, value: 9 });

    expect(run1).toEqual(run2);
  });

  it('find operation marks matched node and keeps structure unchanged', () => {
    const steps = generateLinkedListSteps([4, 7, 11], { type: 'find', value: 7 });
    const matchStep = steps.find((step) => step.action === 'match');
    const last = steps[steps.length - 1];

    expect(matchStep).toBeDefined();
    expect(last.action).toBe('completed');
    expect(collectChainValues(last)).toEqual([4, 7, 11]);
  });

  it('find operation supports not found path', () => {
    const steps = generateLinkedListSteps([4, 7, 11], { type: 'find', value: 100 });

    expect(steps.some((step) => step.action === 'notFound')).toBe(true);
    expect(collectChainValues(steps[steps.length - 1])).toEqual([4, 7, 11]);
  });

  it('insertAt supports head and middle insertion', () => {
    const headInsert = generateLinkedListSteps([2, 6], { type: 'insertAt', index: 0, value: 1 });
    const midInsert = generateLinkedListSteps([2, 6, 9], { type: 'insertAt', index: 1, value: 4 });

    expect(collectChainValues(headInsert[headInsert.length - 1])).toEqual([1, 2, 6]);
    expect(collectChainValues(midInsert[midInsert.length - 1])).toEqual([2, 4, 6, 9]);
  });

  it('deleteAt supports deleting head, middle, and tail', () => {
    const deleteHead = generateLinkedListSteps([2, 6, 9], { type: 'deleteAt', index: 0 });
    const deleteMiddle = generateLinkedListSteps([2, 6, 9], { type: 'deleteAt', index: 1 });
    const deleteTail = generateLinkedListSteps([2, 6, 9], { type: 'deleteAt', index: 2 });

    expect(collectChainValues(deleteHead[deleteHead.length - 1])).toEqual([6, 9]);
    expect(collectChainValues(deleteMiddle[deleteMiddle.length - 1])).toEqual([2, 9]);
    expect(collectChainValues(deleteTail[deleteTail.length - 1])).toEqual([2, 6]);
  });

  it('deleteAt uses dedicated deletion transition metadata', () => {
    const deleteHead = generateLinkedListSteps([2, 6, 9], { type: 'deleteAt', index: 0 });
    const deleteMiddle = generateLinkedListSteps([2, 6, 9], { type: 'deleteAt', index: 1 });

    const headDeleteStep = deleteHead.find((step) => step.action === 'delete');
    const middleDeleteStep = deleteMiddle.find((step) => step.action === 'delete');

    expect(headDeleteStep?.floatingNodeIds).toEqual(['n0']);
    expect(headDeleteStep?.targetIndex).toBe(0);

    expect(middleDeleteStep?.floatingNodeIds).toEqual(['n1']);
    expect(middleDeleteStep?.hiddenLinkFromIds).toEqual(['n0', 'n1']);
    expect(middleDeleteStep?.transientLinks).toEqual([{ fromId: 'n0', toId: 'n2', style: 'delete-link' }]);
    expect(middleDeleteStep?.targetIndex).toBe(1);
  });

  it('keeps every step link target valid', () => {
    const steps = generateLinkedListSteps([5, 8, 12], { type: 'insertAt', index: 1, value: 7 });

    steps.forEach((step) => assertLinkTargetsValid(step));
  });

  it('throws for out-of-range operations', () => {
    expect(() => generateLinkedListSteps([1, 2], { type: 'insertAt', index: 3, value: 9 })).toThrow(RangeError);
    expect(() => generateLinkedListSteps([1, 2], { type: 'deleteAt', index: 2 })).toThrow(RangeError);
    expect(() => generateLinkedListSteps([], { type: 'deleteAt', index: 1 })).not.toThrow(RangeError);
  });

  it('deleteAt on an empty list is a no-op timeline', () => {
    const steps = generateLinkedListSteps([], { type: 'deleteAt', index: 0 });

    expect(steps[0].action).toBe('initial');
    expect(steps[steps.length - 1].action).toBe('completed');
    expect(collectChainValues(steps[steps.length - 1])).toEqual([]);
  });

  it('doubly mode maintains previous links after insertion and deletion', () => {
    const insertSteps = generateLinkedListSteps([2, 6, 9], { type: 'insertAt', index: 1, value: 4 }, 'doubly');
    const insertLast = insertSteps[insertSteps.length - 1];
    const insertMap = new Map(insertLast.nodes.map((node) => [node.id, node]));

    expect(insertSteps.map((step) => step.action)).toEqual([
      'initial',
      'visit',
      'prepareInsert',
      'setPrevLink',
      'setNextLink',
      'setBackLink',
      'setForwardLink',
      'completed',
    ]);
    const insertForwardStep = insertSteps.find((step) => step.action === 'setForwardLink');
    expect(insertForwardStep?.hiddenLinkFromIds).toEqual(['n0']);
    expect(insertForwardStep?.floatingNodeIds).toEqual(['n3']);
    expect(insertForwardStep?.transientLinks).toEqual([{ fromId: 'n0', toId: 'n3', style: 'new-link' }]);
    expect(collectChainValues(insertLast)).toEqual([2, 4, 6, 9]);
    insertLast.renderOrder.forEach((nodeId, index) => {
      const node = insertMap.get(nodeId);
      expect(node?.prevId ?? null).toBe(index === 0 ? null : insertLast.renderOrder[index - 1]);
    });

    const deleteSteps = generateLinkedListSteps([2, 6, 9], { type: 'deleteAt', index: 1 }, 'doubly');
    const deleteLast = deleteSteps[deleteSteps.length - 1];
    const deleteMap = new Map(deleteLast.nodes.map((node) => [node.id, node]));

    expect(deleteSteps.map((step) => step.action)).toEqual([
      'initial',
      'visit',
      'prepareDelete',
      'setForwardLink',
      'setBackLink',
      'delete',
      'completed',
    ]);
    expect(collectChainValues(deleteLast)).toEqual([2, 9]);
    deleteLast.renderOrder.forEach((nodeId, index) => {
      const node = deleteMap.get(nodeId);
      expect(node?.prevId ?? null).toBe(index === 0 ? null : deleteLast.renderOrder[index - 1]);
    });
  });

  it('circular mode keeps the tail linked back to head after insertion and deletion', () => {
    const insertSteps = generateLinkedListSteps([2, 6, 9], { type: 'insertAt', index: 3, value: 12 }, 'circular');
    const insertLast = insertSteps[insertSteps.length - 1];
    const insertTail = insertLast.nodes.find((node) => node.id === insertLast.renderOrder[insertLast.renderOrder.length - 1]);

    expect(collectCircularValues(insertLast)).toEqual([2, 6, 9, 12]);
    expect(insertTail?.nextId).toBe(insertLast.headId);

    const deleteSteps = generateLinkedListSteps([2, 6, 9], { type: 'deleteAt', index: 0 }, 'circular');
    const deleteLast = deleteSteps[deleteSteps.length - 1];
    const deleteTail = deleteLast.nodes.find((node) => node.id === deleteLast.renderOrder[deleteLast.renderOrder.length - 1]);

    expect(collectCircularValues(deleteLast)).toEqual([6, 9]);
    expect(deleteTail?.nextId).toBe(deleteLast.headId);
  });
});
