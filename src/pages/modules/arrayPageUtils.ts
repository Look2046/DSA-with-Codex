import type { TranslationKey } from '../../i18n/translations';
import { ARRAY_CAPACITY } from '../../modules/linear/arrayInsert';
import type { ArrayInsertStep } from '../../modules/linear/arrayInsert';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

export type InsertConfig = {
  array: number[];
  index: number;
  value: number;
};

type Translator = (key: TranslationKey) => string;

export function parseNumberArray(raw: string): number[] | null {
  const parts = raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  if (parts.length === 0) {
    return null;
  }

  const parsed = parts.map((item) => Number(item));
  if (parsed.some((value) => Number.isNaN(value))) {
    return null;
  }

  return parsed;
}

export function resolveInsertConfig(
  arrayInput: string,
  indexInput: string,
  valueInput: string,
  t: Translator,
): { config: InsertConfig | null; error: string } {
  const parsedArray = parseNumberArray(arrayInput);
  if (!parsedArray) {
    return { config: null, error: t('module.l01.error.array') };
  }
  if (parsedArray.length >= ARRAY_CAPACITY) {
    return { config: null, error: t('module.l01.error.capacity') };
  }

  const parsedIndex = Number(indexInput);
  if (!Number.isInteger(parsedIndex) || parsedIndex < 0 || parsedIndex > parsedArray.length) {
    return { config: null, error: t('module.l01.error.index') };
  }

  const parsedValue = Number(valueInput);
  if (Number.isNaN(parsedValue)) {
    return { config: null, error: t('module.l01.error.value') };
  }

  return {
    config: {
      array: parsedArray,
      index: parsedIndex,
      value: parsedValue,
    },
    error: '',
  };
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

export function getStepDescription(step: ArrayInsertStep | undefined, t: Translator): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.l01.step.initial');
  }
  if (step.action === 'shift') {
    return `${t('module.l01.step.shift')} ${step.indices[0]} -> ${step.indices[1]}`;
  }
  if (step.action === 'insert') {
    return `${t('module.l01.step.insert')} ${step.indices[0]}`;
  }
  return t('module.l01.step.completed');
}

export function getHighlightLabel(type: HighlightType, t: Translator): string {
  if (type === 'moving') {
    return t('module.l01.highlight.moving');
  }
  if (type === 'new-node') {
    return t('module.l01.highlight.inserted');
  }
  return t('module.s01.highlight.default');
}
