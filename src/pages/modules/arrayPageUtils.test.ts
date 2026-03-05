import { describe, expect, it } from 'vitest';
import type { TranslationKey } from '../../i18n/translations';
import { generateArrayInsertSteps } from '../../modules/linear/arrayInsert';
import type { ArrayInsertStep } from '../../modules/linear/arrayInsert';
import {
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  parseNumberArray,
  resolveInsertConfig,
  resolveInsertConfigFromJson,
  serializeInsertConfigAsJson,
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
  it('parses valid arrays and rejects invalid/empty input', () => {
    expect(parseNumberArray('3, 8, 1, 5')).toEqual([3, 8, 1, 5]);
    expect(parseNumberArray('')).toBeNull();
    expect(parseNumberArray('3, a, 5')).toBeNull();
  });

  it('validates array/index/value in insert config resolver', () => {
    expect(resolveInsertConfig('', '1', '9', t)).toEqual({ config: null, error: 'module.l01.error.array' });
    expect(resolveInsertConfig(Array.from({ length: 20 }, () => '1').join(','), '1', '9', t)).toEqual({
      config: null,
      error: 'module.l01.error.capacity',
    });
    expect(resolveInsertConfig('3,8,1', '9', '9', t)).toEqual({ config: null, error: 'module.l01.error.index' });
    expect(resolveInsertConfig('3,8,1', '1', 'x', t)).toEqual({ config: null, error: 'module.l01.error.value' });
    expect(resolveInsertConfig('3,8,1', '1', '9', t)).toEqual({
      config: { array: [3, 8, 1], index: 1, value: 9 },
      error: '',
    });
  });

  it('maps playback status and highlight labels', () => {
    expect(getStatusLabel('idle', t)).toBe('playback.status.idle');
    expect(getStatusLabel('playing', t)).toBe('playback.status.playing');
    expect(getHighlightLabel('moving', t)).toBe('module.l01.highlight.moving');
    expect(getHighlightLabel('new-node', t)).toBe('module.l01.highlight.inserted');
    expect(getHighlightLabel('default', t)).toBe('module.s01.highlight.default');
  });

  it('builds step descriptions for each action', () => {
    expect(getStepDescription(createStep('initial'), t)).toBe('module.l01.step.initial');
    expect(getStepDescription(createStep('shift', [2, 3]), t)).toBe('module.l01.step.shift 2 -> 3');
    expect(getStepDescription(createStep('insert', [1]), t)).toBe('module.l01.step.insert 1');
    expect(getStepDescription(createStep('completed'), t)).toBe('module.l01.step.completed');
    expect(getStepDescription(undefined, t)).toBe('-');
  });

  it('serializes and resolves JSON dataset config', () => {
    const serialized = serializeInsertConfigAsJson({ array: [3, 8, 1], index: 1, value: 9 });
    expect(JSON.parse(serialized)).toEqual({ array: [3, 8, 1], index: 1, value: 9 });

    expect(resolveInsertConfigFromJson(serialized, t)).toEqual({
      config: { array: [3, 8, 1], index: 1, value: 9 },
      error: '',
    });
  });

  it('rejects invalid JSON and invalid schema', () => {
    expect(resolveInsertConfigFromJson('{bad json}', t)).toEqual({
      config: null,
      error: 'module.l01.json.error.parse',
    });
    expect(resolveInsertConfigFromJson('{"list":[1,2],"idx":1}', t)).toEqual({
      config: null,
      error: 'module.l01.json.error.schema',
    });
  });

  it('applies existing insert validation on parsed JSON payload', () => {
    expect(resolveInsertConfigFromJson('{"array":[3,8,1],"index":9,"value":9}', t)).toEqual({
      config: null,
      error: 'module.l01.error.index',
    });
  });

  it('keeps replay deterministic after export and import round-trip', () => {
    const raw = serializeInsertConfigAsJson({ array: [3, 8, 1, 5], index: 2, value: 9 });
    const resolved = resolveInsertConfigFromJson(raw, t);
    expect(resolved.config).not.toBeNull();

    const direct = generateArrayInsertSteps([3, 8, 1, 5], 2, 9);
    const replay = generateArrayInsertSteps(
      resolved.config?.array ?? [],
      resolved.config?.index ?? 0,
      resolved.config?.value ?? 0,
    );
    expect(replay).toEqual(direct);
  });
});
