import type { TranslationKey } from '../../i18n/translations';
import type { LinearSearchStep } from '../../modules/search/linearSearch';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

export const LINEAR_SEARCH_CAPACITY = 30;

export type LinearSearchConfig = {
  array: number[];
  target: number;
};

type Translator = (key: TranslationKey) => string;

type JsonParseResult<T> = {
  config: T | null;
  error: string;
};

export function parseNumberArrayAllowEmpty(raw: string): number[] | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const parts = trimmed
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const parsed = parts.map((item) => Number(item));
  if (parsed.some((value) => Number.isNaN(value))) {
    return null;
  }
  return parsed;
}

export function resolveLinearSearchConfig(
  arrayInput: string,
  targetInput: string,
  t: Translator,
): { config: LinearSearchConfig | null; error: string } {
  const parsedArray = parseNumberArrayAllowEmpty(arrayInput);
  if (!parsedArray) {
    return { config: null, error: t('module.sr01.error.array') };
  }

  if (parsedArray.length === 0) {
    return { config: null, error: t('module.sr01.error.empty') };
  }

  if (parsedArray.length > LINEAR_SEARCH_CAPACITY) {
    return { config: null, error: t('module.sr01.error.capacity') };
  }

  const target = Number(targetInput);
  if (Number.isNaN(target)) {
    return { config: null, error: t('module.sr01.error.target') };
  }

  return {
    config: {
      array: parsedArray,
      target,
    },
    error: '',
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function serializeLinearSearchConfigAsJson(config: LinearSearchConfig): string {
  return JSON.stringify(config, null, 2);
}

export function resolveLinearSearchConfigFromJson(rawJson: string, t: Translator): JsonParseResult<LinearSearchConfig> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { config: null, error: t('module.sr01.json.error.parse') };
  }

  if (!isObjectRecord(parsed) || !Array.isArray(parsed.array) || typeof parsed.target !== 'number') {
    return { config: null, error: t('module.sr01.json.error.schema') };
  }

  return resolveLinearSearchConfig(parsed.array.join(', '), String(parsed.target), t);
}

export function getStatusLabel(status: PlaybackStatus, t: Translator): string {
  switch (status) {
    case 'idle':
      return t('playback.status.idle');
    case 'playing':
      return t('playback.status.playing');
    case 'paused':
      return t('playback.status.paused');
    case 'completed':
      return t('playback.status.completed');
    default:
      return status;
  }
}

export function getStepDescription(step: LinearSearchStep | undefined, t: Translator): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.sr01.step.initial');
  }
  if (step.action === 'inspect') {
    return `${t('module.sr01.step.inspect')} ${step.currentIndex}`;
  }
  if (step.action === 'advance') {
    return `${t('module.sr01.step.advance')} ${step.currentIndex + 1}`;
  }
  if (step.action === 'found') {
    return `${t('module.sr01.step.found')} ${step.foundIndex}`;
  }
  if (step.action === 'notFound') {
    return t('module.sr01.step.notFound');
  }
  return t('module.sr01.step.completed');
}

export function getHighlightLabel(type: HighlightType, t: Translator): string {
  if (type === 'visiting') {
    return t('module.sr01.highlight.visited');
  }
  if (type === 'comparing') {
    return t('module.s01.highlight.comparing');
  }
  if (type === 'matched') {
    return t('module.sr01.highlight.found');
  }
  return t('module.s01.highlight.default');
}
