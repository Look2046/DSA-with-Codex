import { describe, expect, it } from 'vitest';
import type { TranslationKey } from '../../i18n/translations';
import { generateLinearSearchSteps } from '../../modules/search/linearSearch';
import type { LinearSearchStep } from '../../modules/search/linearSearch';
import {
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  parseNumberArrayAllowEmpty,
  resolveLinearSearchConfig,
  resolveLinearSearchConfigFromJson,
  serializeLinearSearchConfigAsJson,
} from './linearSearchPageUtils';

const t = (key: TranslationKey): string => key;

function createStep(action: LinearSearchStep['action']): LinearSearchStep {
  return {
    description: '',
    codeLines: [],
    highlights: [],
    arrayState: [4, 1, 7, 3],
    action,
    currentIndex: 2,
    target: 7,
    foundIndex: 2,
  };
}

describe('linearSearchPageUtils', () => {
  it('parses number arrays and handles empty input', () => {
    expect(parseNumberArrayAllowEmpty('')).toEqual([]);
    expect(parseNumberArrayAllowEmpty('4, 1, 7')).toEqual([4, 1, 7]);
    expect(parseNumberArrayAllowEmpty('4, x, 7')).toBeNull();
  });

  it('validates linear-search input', () => {
    expect(resolveLinearSearchConfig('4,1,7', '1', t)).toEqual({
      config: { array: [4, 1, 7], target: 1 },
      error: '',
    });
    expect(resolveLinearSearchConfig('', '1', t)).toEqual({
      config: null,
      error: 'module.sr01.error.empty',
    });
    expect(resolveLinearSearchConfig('4,1,7', 'x', t)).toEqual({
      config: null,
      error: 'module.sr01.error.target',
    });
  });

  it('maps playback status and step/highlight labels', () => {
    expect(getStatusLabel('idle', t)).toBe('playback.status.idle');
    expect(getStepDescription(createStep('initial'), t)).toBe('module.sr01.step.initial');
    expect(getStepDescription(createStep('inspect'), t)).toBe('module.sr01.step.inspect 2');
    expect(getStepDescription(createStep('notFound'), t)).toBe('module.sr01.step.notFound');
    expect(getStepDescription(createStep('completed'), t)).toBe('module.sr01.step.completed');
    expect(getHighlightLabel('visiting', t)).toBe('module.sr01.highlight.visited');
    expect(getHighlightLabel('matched', t)).toBe('module.sr01.highlight.found');
  });

  it('serializes and resolves linear-search JSON config', () => {
    const serialized = serializeLinearSearchConfigAsJson({ array: [4, 1, 7], target: 7 });
    expect(resolveLinearSearchConfigFromJson(serialized, t)).toEqual({
      config: { array: [4, 1, 7], target: 7 },
      error: '',
    });
  });

  it('rejects invalid linear-search JSON and schema', () => {
    expect(resolveLinearSearchConfigFromJson('{oops}', t)).toEqual({
      config: null,
      error: 'module.sr01.json.error.parse',
    });
    expect(resolveLinearSearchConfigFromJson('{"arr":[1,2],"target":2}', t)).toEqual({
      config: null,
      error: 'module.sr01.json.error.schema',
    });
  });

  it('keeps replay deterministic after linear-search export/import round-trip', () => {
    const raw = serializeLinearSearchConfigAsJson({ array: [9, 3, 4, 3, 1], target: 3 });
    const resolved = resolveLinearSearchConfigFromJson(raw, t);
    expect(resolved.config).not.toBeNull();

    const direct = generateLinearSearchSteps([9, 3, 4, 3, 1], 3);
    const replay = generateLinearSearchSteps(resolved.config?.array ?? [], resolved.config?.target ?? 0);
    expect(replay).toEqual(direct);
    expect(replay[replay.length - 1]?.foundIndex).toBe(1);
  });
});
