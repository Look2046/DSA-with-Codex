import { describe, expect, it } from 'vitest';
import type { TranslationKey } from '../../i18n/translations';
import { generateArrayDeleteSteps, generateArrayInsertSteps } from '../../modules/linear/arrayInsert';
import type { ArrayInsertStep } from '../../modules/linear/arrayInsert';
import {
  getArrayWorkspaceConfig,
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  parseNumberArray,
  resolveArrayConfig,
  resolveArrayConfigFromJson,
  serializeArrayConfigAsJson,
} from './arrayPageUtils';

const t = (key: TranslationKey): string => key;

function createStep(action: ArrayInsertStep['action'], indices: number[] = []): ArrayInsertStep {
  return {
    description: '',
    codeLines: [],
    highlights: [],
    arrayState: [],
    logicalLength: 0,
    action,
    indices,
  };
}

describe('arrayPageUtils', () => {
  it('parses valid arrays and rejects invalid input while accepting empty input as empty array', () => {
    expect(parseNumberArray('3, 8, 1, 5')).toEqual([3, 8, 1, 5]);
    expect(parseNumberArray('')).toEqual([]);
    expect(parseNumberArray('3, a, 5')).toBeNull();
  });

  it('validates array/index/value for insert operation in array config resolver', () => {
    expect(resolveArrayConfig('', 'insert', '1', '9', t)).toEqual({ config: null, error: 'module.l01.error.index' });
    expect(resolveArrayConfig(Array.from({ length: 20 }, () => '1').join(','), 'insert', '1', '9', t)).toEqual({
      config: { array: Array.from({ length: 20 }, () => 1), operation: { type: 'insert', index: 1, value: 9 } },
      error: 'module.l01.error.capacity',
    });
    expect(resolveArrayConfig('3,8,1', 'insert', '9', '9', t)).toEqual({ config: null, error: 'module.l01.error.index' });
    expect(resolveArrayConfig('3,8,1', 'insert', '1', 'x', t)).toEqual({ config: null, error: 'module.l01.error.value' });
    expect(resolveArrayConfig('3,8,1', 'insert', '1', '9', t)).toEqual({
      config: { array: [3, 8, 1], operation: { type: 'insert', index: 1, value: 9 } },
      error: '',
    });
  });

  it('validates array/index for delete operation in array config resolver', () => {
    expect(resolveArrayConfig('', 'delete', '0', '', t)).toEqual({
      config: { array: [], operation: { type: 'delete', index: 0 } },
      error: '',
    });
    expect(resolveArrayConfig('3,8,1', 'delete', '3', '', t)).toEqual({
      config: null,
      error: 'module.l01.error.deleteIndex',
    });
    expect(resolveArrayConfig('3,8,1', 'delete', '-1', '', t)).toEqual({
      config: null,
      error: 'module.l01.error.deleteIndex',
    });
    expect(resolveArrayConfig('3,8,1', 'delete', '1', '', t)).toEqual({
      config: { array: [3, 8, 1], operation: { type: 'delete', index: 1 } },
      error: '',
    });
  });

  it('maps playback status and highlight labels', () => {
    expect(getStatusLabel('idle', t)).toBe('playback.status.idle');
    expect(getStatusLabel('playing', t)).toBe('playback.status.playing');
    expect(getHighlightLabel('moving', t)).toBe('module.l01.highlight.moving');
    expect(getHighlightLabel('visiting', t)).toBe('module.l01.highlight.visiting');
    expect(getHighlightLabel('new-node', t)).toBe('module.l01.highlight.inserted');
    expect(getHighlightLabel('default', t)).toBe('module.s01.highlight.default');
  });

  it('builds step descriptions for each action', () => {
    expect(getStepDescription(createStep('initial'), t)).toBe('module.l01.step.initial');
    expect(getStepDescription(createStep('shift', [2, 3]), t)).toBe('module.l01.step.shift 2 -> 3');
    expect(getStepDescription(createStep('shift', [3, 2]), t)).toBe('module.l01.step.shiftLeft 3 -> 2');
    expect(getStepDescription(createStep('insert', [1]), t)).toBe('module.l01.step.insert 1');
    expect(getStepDescription(createStep('visit', [1]), t)).toBe('module.l01.step.visit 1');
    expect(getStepDescription(createStep('completed'), t)).toBe('module.l01.step.completed');
    expect(getStepDescription(undefined, t)).toBe('-');
  });

  it('serializes and resolves JSON dataset config for both operations', () => {
    const serializedInsert = serializeArrayConfigAsJson({
      array: [3, 8, 1],
      operation: { type: 'insert', index: 1, value: 9 },
    });
    expect(JSON.parse(serializedInsert)).toEqual({ array: [3, 8, 1], operation: { type: 'insert', index: 1, value: 9 } });

    expect(resolveArrayConfigFromJson(serializedInsert, t)).toEqual({
      config: { array: [3, 8, 1], operation: { type: 'insert', index: 1, value: 9 } },
      error: '',
    });

    const serializedDelete = serializeArrayConfigAsJson({ array: [3, 8, 1], operation: { type: 'delete', index: 1 } });
    expect(JSON.parse(serializedDelete)).toEqual({ array: [3, 8, 1], operation: { type: 'delete', index: 1 } });

    expect(resolveArrayConfigFromJson(serializedDelete, t)).toEqual({
      config: { array: [3, 8, 1], operation: { type: 'delete', index: 1 } },
      error: '',
    });
  });

  it('keeps accepting the legacy insert JSON shape', () => {
    expect(resolveArrayConfigFromJson('{"array":[3,8,1],"index":1,"value":9}', t)).toEqual({
      config: { array: [3, 8, 1], operation: { type: 'insert', index: 1, value: 9 } },
      error: '',
    });
  });

  it('rejects invalid JSON and invalid schema', () => {
    expect(resolveArrayConfigFromJson('{bad json}', t)).toEqual({
      config: null,
      error: 'module.l01.json.error.parse',
    });
    expect(resolveArrayConfigFromJson('{"list":[1,2],"idx":1}', t)).toEqual({
      config: null,
      error: 'module.l01.json.error.schema',
    });
  });

  it('applies existing validation on parsed JSON payload', () => {
    expect(
      resolveArrayConfigFromJson('{"array":[3,8,1],"operation":{"type":"insert","index":9,"value":9}}', t),
    ).toEqual({
      config: null,
      error: 'module.l01.error.index',
    });
    expect(resolveArrayConfigFromJson('{"array":[3,8,1],"operation":{"type":"delete","index":9}}', t)).toEqual({
      config: null,
      error: 'module.l01.error.deleteIndex',
    });
  });

  it('uses the compact L-01 workspace configuration without json controls', () => {
    expect(getArrayWorkspaceConfig()).toEqual({
      pageClassName: 'array-page tree-page linear-adaptive linear-adaptive-viewport-lock',
      controlsPanelClassName: 'workspace-drawer-scroll array-controls-drawer linear-controls-drawer',
      controlsPanelSize: { width: 980, height: 340 },
      controlsPanelAutoAvoid: false,
      controlsPanelOverflowMargin: 0,
      stepPanelAutoAvoid: false,
      stepPanelOverflowMargin: 0,
      contextPanelSize: { width: 620, height: 340 },
      stageClassName: 'workspace-stage-array workspace-stage-array-compact',
      stageBodyClassName: 'workspace-stage-body-array workspace-stage-body-array-centered',
      showJsonControls: false,
    });
  });

  it('keeps replay deterministic after export and import round-trip', () => {
    const raw = serializeArrayConfigAsJson({
      array: [3, 8, 1, 5],
      operation: { type: 'insert', index: 2, value: 9 },
    });
    const resolved = resolveArrayConfigFromJson(raw, t);
    expect(resolved.config).not.toBeNull();

    const direct = generateArrayInsertSteps([3, 8, 1, 5], 2, 9);
    const replay = generateArrayInsertSteps(
      resolved.config?.array ?? [],
      resolved.config?.operation.type === 'insert' ? resolved.config.operation.index : 0,
      resolved.config?.operation.type === 'insert' ? resolved.config.operation.value : 0,
    );
    expect(replay).toEqual(direct);
  });

  it('keeps replay deterministic for delete after export and import round-trip', () => {
    const raw = serializeArrayConfigAsJson({ array: [3, 8, 1, 5], operation: { type: 'delete', index: 1 } });
    const resolved = resolveArrayConfigFromJson(raw, t);
    expect(resolved.config).not.toBeNull();

    const direct = generateArrayDeleteSteps([3, 8, 1, 5], 1);
    const replay = generateArrayDeleteSteps(resolved.config?.array ?? [], resolved.config?.operation.index ?? 0);
    expect(replay).toEqual(direct);
  });

  it('keeps a full array config visible while surfacing capacity warning', () => {
    const fullArray = Array.from({ length: 20 }, (_, index) => index);
    expect(resolveArrayConfig(fullArray.join(','), 'insert', '20', '42', t)).toEqual({
      config: { array: fullArray, operation: { type: 'insert', index: 20, value: 42 } },
      error: 'module.l01.error.capacity',
    });
  });
});