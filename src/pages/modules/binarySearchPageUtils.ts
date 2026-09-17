import type { TranslationKey } from '../../i18n/translations';
import type { BinarySearchStep } from '../../modules/search/binarySearch';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

export const BINARY_SEARCH_CAPACITY = 30;

export type BinarySearchConfig = {
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

function isSortedAscending(values: number[]): boolean {
  for (let i = 1; i < values.length; i += 1) {
    if (values[i] < values[i - 1]) {
      return false;
    }
  }
  return true;
}

export function resolveBinarySearchConfig(
  arrayInput: string,
  targetInput: string,
  t: Translator,
): { config: BinarySearchConfig | null; error: string } {
  const parsedArray = parseNumberArrayAllowEmpty(arrayInput);
  if (!parsedArray) {
    return { config: null, error: t('module.sr02.error.array') };
  }

  if (parsedArray.length === 0) {
    return { config: null, error: t('module.sr02.error.empty') };
  }

  if (parsedArray.length > BINARY_SEARCH_CAPACITY) {
    return { config: null, error: t('module.sr02.error.capacity') };
  }

  if (!isSortedAscending(parsedArray)) {
    return { config: null, error: t('module.sr02.error.sorted') };
  }

  const target = Number(targetInput);
  if (Number.isNaN(target)) {
    return { config: null, error: t('module.sr02.error.target') };
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

export function serializeBinarySearchConfigAsJson(config: BinarySearchConfig): string {
  return JSON.stringify(config, null, 2);
}

export function resolveBinarySearchConfigFromJson(rawJson: string, t: Translator): JsonParseResult<BinarySearchConfig> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { config: null, error: t('module.sr02.json.error.parse') };
  }

  if (!isObjectRecord(parsed) || !Array.isArray(parsed.array) || typeof parsed.target !== 'number') {
    return { config: null, error: t('module.sr02.json.error.schema') };
  }

  return resolveBinarySearchConfig(parsed.array.join(', '), String(parsed.target), t);
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

export function getStepDescription(step: BinarySearchStep | undefined, t: Translator): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.sr02.step.initial');
  }
  if (step.action === 'inspect') {
    return `${t('module.sr02.step.inspect')} low=${step.low}, mid=${step.mid}, high=${step.high}`;
  }
  if (step.action === 'moveLow') {
    return `${t('module.sr02.step.moveLow')} ${step.low}`;
  }
  if (step.action === 'moveHigh') {
    return `${t('module.sr02.step.moveHigh')} ${step.high}`;
  }
  if (step.action === 'found') {
    return `${t('module.sr02.step.found')} ${step.foundIndex}`;
  }
  if (step.action === 'notFound') {
    return t('module.sr02.step.notFound');
  }
  return t('module.sr02.step.completed');
}

export function getHighlightLabel(type: HighlightType, t: Translator): string {
  if (type === 'visiting') {
    return t('module.sr02.highlight.window');
  }
  if (type === 'comparing') {
    return t('module.s01.highlight.comparing');
  }
  if (type === 'matched') {
    return t('module.sr02.highlight.found');
  }
  return t('module.s01.highlight.default');
}
