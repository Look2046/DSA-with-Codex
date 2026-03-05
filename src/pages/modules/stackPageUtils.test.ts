import { describe, expect, it } from 'vitest';
import type { TranslationKey } from '../../i18n/translations';
import { generateStackSteps } from '../../modules/linear/stackOps';
import type { StackStep } from '../../modules/linear/stackOps';
import {
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  parseNumberArrayAllowEmpty,
  resolveStackConfig,
  resolveStackConfigFromJson,
  serializeStackConfigAsJson,
} from './stackPageUtils';

const t = (key: TranslationKey): string => key;

function createStep(action: StackStep['action']): StackStep {
  return {
    description: '',
    codeLines: [],
    highlights: [],
    stackState: [3, 8, 1],
    action,
    indices: [2],
    poppedValue: 1,
    peekValue: 1,
  };
}

describe('stackPageUtils', () => {
  it('parses number arrays and handles empty input', () => {
    expect(parseNumberArrayAllowEmpty('')).toEqual([]);
    expect(parseNumberArrayAllowEmpty('1, 2, 3')).toEqual([1, 2, 3]);
    expect(parseNumberArrayAllowEmpty('1, x, 3')).toBeNull();
  });

  it('validates stack operation input', () => {
    expect(resolveStackConfig('', 'push', '9', t)).toEqual({
      config: { stack: [], operation: { type: 'push', value: 9 } },
      error: '',
    });
    expect(resolveStackConfig('1,2', 'push', 'x', t)).toEqual({
      config: null,
      error: 'module.l04.error.value',
    });
    expect(resolveStackConfig('', 'pop', '', t)).toEqual({
      config: { stack: [], operation: { type: 'pop' } },
      error: 'module.l04.error.popEmpty',
    });
  });

  it('maps playback status and step/highlight labels', () => {
    expect(getStatusLabel('idle', t)).toBe('playback.status.idle');
    expect(getStepDescription(createStep('initial'), t)).toBe('module.l04.step.initial');
    expect(getStepDescription(createStep('push'), t)).toBe('module.l04.step.push 1');
    expect(getStepDescription(createStep('pop'), t)).toBe('module.l04.step.pop 1');
    expect(getStepDescription(createStep('peek'), t)).toBe('module.l04.step.peek 1');
    expect(getStepDescription(createStep('completed'), t)).toBe('module.l04.step.completed');
    expect(getHighlightLabel('new-node', t)).toBe('module.l04.highlight.pushed');
    expect(getHighlightLabel('moving', t)).toBe('module.l04.highlight.popped');
    expect(getHighlightLabel('matched', t)).toBe('module.l04.highlight.peeked');
  });

  it('serializes and resolves stack JSON config', () => {
    const serialized = serializeStackConfigAsJson({ stack: [3, 8, 1], operation: { type: 'push', value: 9 } });
    expect(resolveStackConfigFromJson(serialized, t)).toEqual({
      config: { stack: [3, 8, 1], operation: { type: 'push', value: 9 } },
      error: '',
    });
  });

  it('rejects invalid stack JSON and schema', () => {
    expect(resolveStackConfigFromJson('{oops}', t)).toEqual({
      config: null,
      error: 'module.l04.json.error.parse',
    });
    expect(resolveStackConfigFromJson('{"stack":[1,2],"operation":{"kind":"push"}}', t)).toEqual({
      config: null,
      error: 'module.l04.json.error.schema',
    });
  });

  it('keeps replay deterministic after stack export/import round-trip', () => {
    const raw = serializeStackConfigAsJson({ stack: [3, 8, 1], operation: { type: 'push', value: 9 } });
    const resolved = resolveStackConfigFromJson(raw, t);
    expect(resolved.config).not.toBeNull();

    const direct = generateStackSteps([3, 8, 1], { type: 'push', value: 9 });
    const replay = generateStackSteps(
      resolved.config?.stack ?? [],
      resolved.config?.operation ?? { type: 'push', value: 0 },
    );
    expect(replay).toEqual(direct);
  });
});
