import { describe, expect, it } from 'vitest';
import type { TranslationKey } from '../../i18n/translations';
import { generateDynamicArraySteps, type DynamicArrayStep } from '../../modules/linear/dynamicArrayOps';
import {
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  parseNumberArrayAllowEmpty,
  resolveDynamicArrayConfig,
  resolveDynamicArrayConfigFromJson,
  serializeDynamicArrayConfigAsJson,
} from './dynamicArrayPageUtils';

const t = (key: TranslationKey): string => key;

function createStep(action: DynamicArrayStep['action']): DynamicArrayStep {
  return {
    description: '',
    codeLines: [],
    highlights: [],
    arrayState: [3, 8],
    bufferState: [3, 8, ...Array.from({ length: 18 }, () => null)],
    size: 2,
    capacity: 2,
    action,
    indices: [0, 1],
    resizeFrom: 2,
    resizeTo: 4,
    migratedIndex: 1,
    appendedValue: 9,
  };
}

describe('dynamicArrayPageUtils', () => {
  it('parses number arrays and handles empty input', () => {
    expect(parseNumberArrayAllowEmpty('')).toEqual([]);
    expect(parseNumberArrayAllowEmpty('1, 2, 3')).toEqual([1, 2, 3]);
    expect(parseNumberArrayAllowEmpty('1, x, 3')).toBeNull();
  });

  it('validates dynamic-array config input', () => {
    expect(resolveDynamicArrayConfig('3, 8', '4', '9', t)).toEqual({
      config: {
        array: [3, 8],
        capacity: 4,
        operation: { type: 'append', value: 9 },
      },
      error: '',
    });

    expect(resolveDynamicArrayConfig('3, 8', 'x', '9', t)).toEqual({
      config: null,
      error: 'module.l02.error.capacityInteger',
    });

    expect(resolveDynamicArrayConfig('3, 8, 1', '2', '9', t)).toEqual({
      config: null,
      error: 'module.l02.error.lengthExceedsCapacity',
    });
  });

  it('maps playback status and step/highlight labels', () => {
    expect(getStatusLabel('idle', t)).toBe('playback.status.idle');
    expect(getStepDescription(createStep('initial'), t)).toBe('module.l02.step.initial');
    expect(getStepDescription(createStep('resize-start'), t)).toBe('module.l02.step.resizeStart 2 -> 4');
    expect(getStepDescription(createStep('migrate'), t)).toBe('module.l02.step.migrate 1');
    expect(getStepDescription(createStep('resize-complete'), t)).toBe('module.l02.step.resizeComplete 4');
    expect(getStepDescription(createStep('append'), t)).toBe('module.l02.step.append 9');
    expect(getStepDescription(createStep('completed'), t)).toBe('module.l02.step.completed');
    expect(getHighlightLabel('moving', t)).toBe('module.l02.highlight.migrating');
    expect(getHighlightLabel('new-node', t)).toBe('module.l02.highlight.appended');
  });

  it('serializes and resolves dynamic-array JSON config', () => {
    const serialized = serializeDynamicArrayConfigAsJson({
      array: [3, 8],
      capacity: 2,
      operation: { type: 'append', value: 9 },
    });

    expect(resolveDynamicArrayConfigFromJson(serialized, t)).toEqual({
      config: {
        array: [3, 8],
        capacity: 2,
        operation: { type: 'append', value: 9 },
      },
      error: '',
    });
  });

  it('rejects invalid dynamic-array JSON and schema', () => {
    expect(resolveDynamicArrayConfigFromJson('{oops}', t)).toEqual({
      config: null,
      error: 'module.l02.json.error.parse',
    });

    expect(resolveDynamicArrayConfigFromJson('{"array":[1,2],"operation":{"type":"append"}}', t)).toEqual({
      config: null,
      error: 'module.l02.json.error.schema',
    });
  });

  it('keeps replay deterministic after dynamic-array export/import round-trip', () => {
    const raw = serializeDynamicArrayConfigAsJson({
      array: [3, 8],
      capacity: 2,
      operation: { type: 'append', value: 9 },
    });
    const resolved = resolveDynamicArrayConfigFromJson(raw, t);
    expect(resolved.config).not.toBeNull();

    const direct = generateDynamicArraySteps([3, 8], 2, { type: 'append', value: 9 });
    const replay = generateDynamicArraySteps(
      resolved.config?.array ?? [],
      resolved.config?.capacity ?? 1,
      resolved.config?.operation ?? { type: 'append', value: 0 },
    );
    expect(replay).toEqual(direct);
  });
});
