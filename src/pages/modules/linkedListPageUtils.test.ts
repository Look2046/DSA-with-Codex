import { describe, expect, it } from 'vitest';
import type { TranslationKey } from '../../i18n/translations';
import { generateLinkedListSteps } from '../../modules/linear/linkedListOps';
import type { LinkedListStep } from '../../modules/linear/linkedListOps';
import {
  buildLogicalStepByIndex,
  getFindResultText,
  getLinkedListWorkspaceConfig,
  parseNumberArrayAllowEmpty,
  resolveLinkedListConfig,
  resolveLinkedListConfigFromJson,
  serializeLinkedListConfigAsJson,
} from './linkedListPageUtils';

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

  it('treats delete on an empty list with index 1 as a valid no-op config', () => {
    const resolved = resolveLinkedListConfig('', 'deleteAt', '', '1', t);

    expect(resolved.error).toBe('');
    expect(resolved.config).toEqual({
      list: [],
      operation: { type: 'deleteAt', index: 0 },
    });
  });

  it('allows deleting the only node of a single-element list and rejects out-of-range index', () => {
    const singleValid = resolveLinkedListConfig('5', 'deleteAt', '', '1', t);
    const singleOverflow = resolveLinkedListConfig('5', 'deleteAt', '', '2', t);
    const multi = resolveLinkedListConfig('5,6', 'deleteAt', '', '2', t);

    expect(singleValid.config?.operation).toEqual({ type: 'deleteAt', index: 0 });
    expect(singleValid.error).toBe('');
    expect(singleOverflow.config).toBeNull();
    expect(singleOverflow.error).toBe('module.l03.error.deleteIndex');
    expect(multi.config?.operation).toEqual({ type: 'deleteAt', index: 1 });
    expect(multi.error).toBe('');
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

  it('uses the compact L-03 workspace configuration without json controls', () => {
    expect(getLinkedListWorkspaceConfig()).toEqual({
      pageClassName: 'linked-list-page tree-page linear-adaptive linear-adaptive-viewport-lock',
      controlsPanelClassName: 'workspace-drawer-scroll array-controls-drawer linked-controls-drawer',
      controlsPanelSize: { width: 1040, height: 340 },
      controlsPanelAutoAvoid: false,
      controlsPanelOverflowMargin: 0,
      stepPanelAutoAvoid: false,
      stepPanelOverflowMargin: 0,
      contextPanelSize: { width: 620, height: 340 },
      stageClassName: 'workspace-stage-linked viz-canvas-stage-linked',
      stageBodyClassName: 'workspace-stage-body-linked',
      shellClassName: 'linked-list-workspace-shell',
      floatingPanelsEnabledMinHeight: 0,
      showJsonControls: false,
    });
  });

  it('serializes and resolves linked-list JSON config', () => {
    const serialized = serializeLinkedListConfigAsJson({
      list: [4, 7, 11],
      operation: { type: 'insertAt', index: 1, value: 9 },
    });
    expect(resolveLinkedListConfigFromJson(serialized, t)).toEqual({
      config: { list: [4, 7, 11], operation: { type: 'insertAt', index: 1, value: 9 } },
      error: '',
    });
  });

  it('rejects invalid linked-list JSON and schema', () => {
    expect(resolveLinkedListConfigFromJson('{oops}', t)).toEqual({
      config: null,
      error: 'module.l03.json.error.parse',
    });
    expect(resolveLinkedListConfigFromJson('{"list":[1,2],"operation":{"kind":"find"}}', t)).toEqual({
      config: null,
      error: 'module.l03.json.error.schema',
    });
  });

  it('keeps replay deterministic after linked-list export/import round-trip', () => {
    const raw = serializeLinkedListConfigAsJson({
      list: [4, 7, 11],
      operation: { type: 'find', value: 7 },
    });
    const resolved = resolveLinkedListConfigFromJson(raw, t);
    expect(resolved.config).not.toBeNull();

    const direct = generateLinkedListSteps([4, 7, 11], { type: 'find', value: 7 });
    const replay = generateLinkedListSteps(resolved.config?.list ?? [], resolved.config?.operation ?? { type: 'find', value: 0 });
    expect(replay).toEqual(direct);
  });
});
