import type { TranslationKey } from '../../i18n/translations';
import { QUEUE_CAPACITY, type QueueOperation, type QueueStep } from '../../modules/linear/queueOps';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

export type QueueConfig = {
  queue: number[];
  operation: QueueOperation;
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

export function resolveQueueConfig(
  queueInput: string,
  operationType: QueueOperation['type'],
  valueInput: string,
  t: Translator,
): { config: QueueConfig | null; error: string } {
  const parsedQueue = parseNumberArrayAllowEmpty(queueInput);
  if (!parsedQueue) {
    return { config: null, error: t('module.l05.error.queue') };
  }
  if (parsedQueue.length > QUEUE_CAPACITY) {
    return { config: null, error: t('module.l05.error.capacity') };
  }

  if (operationType === 'enqueue') {
    if (parsedQueue.length >= QUEUE_CAPACITY) {
      return { config: null, error: t('module.l05.error.enqueueFull') };
    }
    const value = Number(valueInput);
    if (Number.isNaN(value)) {
      return { config: null, error: t('module.l05.error.value') };
    }
    return { config: { queue: parsedQueue, operation: { type: 'enqueue', value } }, error: '' };
  }

  if (parsedQueue.length === 0) {
    const operation: QueueOperation = operationType === 'dequeue' ? { type: 'dequeue' } : { type: 'front' };
    return {
      config: { queue: parsedQueue, operation },
      error: operationType === 'dequeue' ? t('module.l05.error.dequeueEmpty') : t('module.l05.error.frontEmpty'),
    };
  }

  const operation: QueueOperation = operationType === 'dequeue' ? { type: 'dequeue' } : { type: 'front' };
  return {
    config: { queue: parsedQueue, operation },
    error: '',
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function serializeQueueConfigAsJson(config: QueueConfig): string {
  return JSON.stringify(config, null, 2);
}

export function resolveQueueConfigFromJson(rawJson: string, t: Translator): JsonParseResult<QueueConfig> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { config: null, error: t('module.l05.json.error.parse') };
  }

  if (!isObjectRecord(parsed) || !Array.isArray(parsed.queue) || !isObjectRecord(parsed.operation) || typeof parsed.operation.type !== 'string') {
    return { config: null, error: t('module.l05.json.error.schema') };
  }

  const queueInput = parsed.queue.join(', ');
  if (parsed.operation.type === 'enqueue') {
    if (typeof parsed.operation.value !== 'number') {
      return { config: null, error: t('module.l05.json.error.schema') };
    }
    return resolveQueueConfig(queueInput, 'enqueue', String(parsed.operation.value), t);
  }
  if (parsed.operation.type === 'dequeue') {
    return resolveQueueConfig(queueInput, 'dequeue', '', t);
  }
  if (parsed.operation.type === 'front') {
    return resolveQueueConfig(queueInput, 'front', '', t);
  }
  return { config: null, error: t('module.l05.json.error.schema') };
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

export function getStepDescription(step: QueueStep | undefined, t: Translator): string {
  if (!step) {
    return '-';
  }
  if (step.action === 'initial') {
    return t('module.l05.step.initial');
  }
  if (step.action === 'enqueue') {
    return `${t('module.l05.step.enqueue')} ${step.queueState[step.queueState.length - 1] ?? ''}`.trim();
  }
  if (step.action === 'dequeue') {
    return `${t('module.l05.step.dequeue')} ${step.dequeuedValue ?? ''}`.trim();
  }
  if (step.action === 'front') {
    return `${t('module.l05.step.front')} ${step.frontValue ?? ''}`.trim();
  }
  return t('module.l05.step.completed');
}

export function getHighlightLabel(type: HighlightType, t: Translator): string {
  if (type === 'new-node') {
    return t('module.l05.highlight.enqueued');
  }
  if (type === 'moving') {
    return t('module.l05.highlight.dequeued');
  }
  if (type === 'matched') {
    return t('module.l05.highlight.front');
  }
  return t('module.s01.highlight.default');
}
