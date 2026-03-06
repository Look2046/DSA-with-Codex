import { describe, expect, it } from 'vitest';
import type { TranslationKey } from '../../i18n/translations';
import { generateBinarySearchSteps } from '../../modules/search/binarySearch';
import type { BinarySearchStep } from '../../modules/search/binarySearch';
import {
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  parseNumberArrayAllowEmpty,
  resolveBinarySearchConfig,
  resolveBinarySearchConfigFromJson,
  serializeBinarySearchConfigAsJson,
} from './binarySearchPageUtils';

const t = (key: TranslationKey): string => key;

function createStep(action: BinarySearchStep['action']): BinarySearchStep {
  return {
    description: '',
    codeLines: [],
    highlights: [],
    arrayState: [1, 3, 5, 7, 9],
    action,
    indices: [0, 2, 4],
    low: 0,
    high: 4,
    mid: 2,
    target: 5,
    foundIndex: 2,
  };
}

describe('binarySearchPageUtils', () => {
  it('parses number arrays and handles empty input', () => {
    expect(parseNumberArrayAllowEmpty('')).toEqual([]);
    expect(parseNumberArrayAllowEmpty('1, 3, 5')).toEqual([1, 3, 5]);
    expect(parseNumberArrayAllowEmpty('1, x, 5')).toBeNull();
  });

  it('validates binary-search input', () => {
    expect(resolveBinarySearchConfig('1,3,5', '3', t)).toEqual({
      config: { array: [1, 3, 5], target: 3 },
      error: '',
    });
    expect(resolveBinarySearchConfig('3,1,5', '3', t)).toEqual({
      config: null,
      error: 'module.sr02.error.sorted',
    });
    expect(resolveBinarySearchConfig('', '3', t)).toEqual({
      config: null,
      error: 'module.sr02.error.empty',
    });
  });

  it('maps playback status and step/highlight labels', () => {
    expect(getStatusLabel('idle', t)).toBe('playback.status.idle');
    expect(getStepDescription(createStep('initial'), t)).toBe('module.sr02.step.initial');
    expect(getStepDescription(createStep('notFound'), t)).toBe('module.sr02.step.notFound');
    expect(getStepDescription(createStep('completed'), t)).toBe('module.sr02.step.completed');
    expect(getHighlightLabel('visiting', t)).toBe('module.sr02.highlight.window');
    expect(getHighlightLabel('matched', t)).toBe('module.sr02.highlight.found');
  });

  it('serializes and resolves binary-search JSON config', () => {
    const serialized = serializeBinarySearchConfigAsJson({ array: [1, 3, 5], target: 3 });
    expect(resolveBinarySearchConfigFromJson(serialized, t)).toEqual({
      config: { array: [1, 3, 5], target: 3 },
      error: '',
    });
  });

  it('rejects invalid binary-search JSON and schema', () => {
    expect(resolveBinarySearchConfigFromJson('{oops}', t)).toEqual({
      config: null,
      error: 'module.sr02.json.error.parse',
    });
    expect(resolveBinarySearchConfigFromJson('{"arr":[1,2],"target":2}', t)).toEqual({
      config: null,
      error: 'module.sr02.json.error.schema',
    });
  });

  it('keeps replay deterministic after binary-search export/import round-trip', () => {
    const raw = serializeBinarySearchConfigAsJson({ array: [1, 3, 5, 7, 9], target: 7 });
    const resolved = resolveBinarySearchConfigFromJson(raw, t);
    expect(resolved.config).not.toBeNull();

    const direct = generateBinarySearchSteps([1, 3, 5, 7, 9], 7);
    const replay = generateBinarySearchSteps(resolved.config?.array ?? [], resolved.config?.target ?? 0);
    expect(replay).toEqual(direct);
  });
});
