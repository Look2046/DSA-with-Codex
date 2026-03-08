import type { TranslationKey } from '../../i18n/translations';
import { type DynamicArrayOperation, type DynamicArrayStep } from '../../modules/linear/dynamicArrayOps';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

export type DynamicArrayConfig = {
  array: number[];
  capacity: number;
  operation: DynamicArrayOperation;
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

export function resolveDynamicArrayConfig(
  arrayInput: string,
  capacityInput: string,
  valueInput: string,
  t: Translator,
): { config: DynamicArrayConfig | null; error: string } {
  const parsedArray = parseNumberArrayAllowEmpty(arrayInput);
  if (!parsedArray) {
    return { config: null, error: t('module.l02.error.array') };
  }

  const capacity = Number(capacityInput);
  if (!Number.isInteger(capacity)) {
    return { config: null, error: t('module.l02.error.capacityInteger') };
  }
  if (capacity < 1) {
    return { config: null, error: t('module.l02.error.capacityRange') };
  }
  if (parsedArray.length > capacity) {
    return { config: null, error: t('module.l02.error.lengthExceedsCapacity') };
  }

  const value = Number(valueInput);
  if (Number.isNaN(value)) {
    return { config: null, error: t('module.l02.error.value') };
  }

  return {
    config: {
      array: parsedArray,
      capacity,
      operation: { type: 'append', value },
    },
    error: '',
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function serializeDynamicArrayConfigAsJson(config: DynamicArrayConfig): string {
  return JSON.stringify(config, null, 2);
}

export function resolveDynamicArrayConfigFromJson(rawJson: string, t: Translator): JsonParseResult<DynamicArrayConfig> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { config: null, error: t('module.l02.json.error.parse') };
  }

  if (!isObjectRecord(parsed) || !Array.isArray(parsed.array) || typeof parsed.capacity !== 'number') {
    return { config: null, error: t('module.l02.json.error.schema') };
  }

  if (!isObjectRecord(parsed.operation) || parsed.operation.type !== 'append' || typeof parsed.operation.value !== 'number') {
    return { config: null, error: t('module.l02.json.error.schema') };
  }

  return resolveDynamicArrayConfig(parsed.array.join(', '), String(parsed.capacity), String(parsed.operation.value), t);
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

export function getStepDescription(step: DynamicArrayStep | undefined, t: Translator): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.l02.step.initial');
  }
  if (step.action === 'resize-start') {
    return `${t('module.l02.step.resizeStart')} ${step.resizeFrom ?? ''} -> ${step.resizeTo ?? ''}`.trim();
  }
  if (step.action === 'migrate') {
    return `${t('module.l02.step.migrate')} ${step.migratedIndex ?? ''}`.trim();
  }
  if (step.action === 'resize-complete') {
    return `${t('module.l02.step.resizeComplete')} ${step.resizeTo ?? ''}`.trim();
  }
  if (step.action === 'append') {
    return `${t('module.l02.step.append')} ${step.appendedValue ?? ''}`.trim();
  }
  return t('module.l02.step.completed');
}

export function getHighlightLabel(type: HighlightType, t: Translator): string {
  if (type === 'moving') {
    return t('module.l02.highlight.migrating');
  }
  if (type === 'new-node') {
    return t('module.l02.highlight.appended');
  }
  return t('module.s01.highlight.default');
}
