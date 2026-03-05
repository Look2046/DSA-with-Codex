import { describe, expect, it } from 'vitest';
import type { TranslationKey } from '../../i18n/translations';
import type { LinkedListStep } from '../../modules/linear/linkedListOps';
import { buildLogicalStepByIndex, getFindResultText, parseNumberArrayAllowEmpty, resolveLinkedListConfig } from './linkedListPageUtils';

const t = (key: TranslationKey): string => key;

function createStep(operation: LinkedListStep['operation'], action: LinkedListStep['action']): LinkedListStep {
  return {
    description: '',
    codeLines: [],
    highlights: [],
    operation,
    action,
    nodes: [],
    headId: null,
    renderOrder: [],
    floatingNodeIds: [],
    hiddenLinkFromIds: [],
    transientLinks: [],
  };
}

describe('linkedListPageUtils', () => {
  it('parses number arrays and handles empty input', () => {
    expect(parseNumberArrayAllowEmpty('')).toEqual([]);
    expect(parseNumberArrayAllowEmpty('1, 2, 3')).toEqual([1, 2, 3]);
    expect(parseNumberArrayAllowEmpty('1, a, 3')).toBeNull();
  });

  it('validates insert and delete index ranges', () => {
    const insertError = resolveLinkedListConfig('1,2', 'insertAt', '9', '0', t);
    const deleteError = resolveLinkedListConfig('1,2', 'deleteAt', '9', '3', t);

    expect(insertError.config).toBeNull();
    expect(insertError.error).toBe('module.l03.error.insertIndex');
    expect(deleteError.config).toBeNull();
    expect(deleteError.error).toBe('module.l03.error.deleteIndex');
  });

  it('returns find result text only after completed step', () => {
    const completed = createStep('find', 'completed');
    const visiting = createStep('find', 'visit');

    expect(getFindResultText({ type: 'find', value: 7 }, [4, 7, 11], visiting, t)).toBeNull();
    expect(getFindResultText({ type: 'find', value: 7 }, [4, 7, 11], completed, t)).toBe('module.l03.findResult.found 1');
    expect(getFindResultText({ type: 'find', value: 99 }, [4, 7, 11], completed, t)).toBe(
      'module.l03.findResult.notFound [0, 2]',
    );
  });

  it('keeps visual tail frames from increasing logical step count', () => {
    const steps: LinkedListStep[] = [
      createStep('insertAt', 'initial'),
      createStep('insertAt', 'visit'),
      createStep('insertAt', 'shiftForInsert'),
      createStep('insertAt', 'completed'),
      createStep('deleteAt', 'prepareDelete'),
      createStep('deleteAt', 'completed'),
    ];

    expect(buildLogicalStepByIndex(steps)).toEqual([0, 1, 1, 1, 2, 2]);
  });
});
