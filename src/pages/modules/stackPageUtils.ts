import type { TranslationKey } from '../../i18n/translations';
import { STACK_CAPACITY, type StackOperation, type StackStep } from '../../modules/linear/stackOps';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

export type StackConfig = {
  stack: number[];
  operation: StackOperation;
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

export function resolveStackConfig(
  stackInput: string,
  operationType: StackOperation['type'],
  valueInput: string,
  t: Translator,
): { config: StackConfig | null; error: string } {
  const parsedStack = parseNumberArrayAllowEmpty(stackInput);
  if (!parsedStack) {
    return { config: null, error: t('module.l04.error.stack') };
  }
  if (parsedStack.length > STACK_CAPACITY) {
    return { config: null, error: t('module.l04.error.capacity') };
  }

  if (operationType === 'push') {
    if (parsedStack.length >= STACK_CAPACITY) {
      return { config: null, error: t('module.l04.error.pushFull') };
    }
    const value = Number(valueInput);
    if (Number.isNaN(value)) {
      return { config: null, error: t('module.l04.error.value') };
    }
    return { config: { stack: parsedStack, operation: { type: 'push', value } }, error: '' };
  }

  if (parsedStack.length === 0) {
    const operation: StackOperation = operationType === 'pop' ? { type: 'pop' } : { type: 'peek' };
    return {
      config: { stack: parsedStack, operation },
      error: operationType === 'pop' ? t('module.l04.error.popEmpty') : t('module.l04.error.peekEmpty'),
    };
  }

  const operation: StackOperation = operationType === 'pop' ? { type: 'pop' } : { type: 'peek' };
  return {
    config: { stack: parsedStack, operation },
    error: '',
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function serializeStackConfigAsJson(config: StackConfig): string {
  return JSON.stringify(config, null, 2);
}

export function resolveStackConfigFromJson(rawJson: string, t: Translator): JsonParseResult<StackConfig> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { config: null, error: t('module.l04.json.error.parse') };
  }

  if (!isObjectRecord(parsed) || !Array.isArray(parsed.stack) || !isObjectRecord(parsed.operation) || typeof parsed.operation.type !== 'string') {
    return { config: null, error: t('module.l04.json.error.schema') };
  }

  const stackInput = parsed.stack.join(', ');
  if (parsed.operation.type === 'push') {
    if (typeof parsed.operation.value !== 'number') {
      return { config: null, error: t('module.l04.json.error.schema') };
    }
    return resolveStackConfig(stackInput, 'push', String(parsed.operation.value), t);
  }
  if (parsed.operation.type === 'pop') {
    return resolveStackConfig(stackInput, 'pop', '', t);
  }
  if (parsed.operation.type === 'peek') {
    return resolveStackConfig(stackInput, 'peek', '', t);
  }
  return { config: null, error: t('module.l04.json.error.schema') };
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

export function getStepDescription(step: StackStep | undefined, t: Translator): string {
  if (!step) {
    return '-';
  }
  if (step.action === 'initial') {
    return t('module.l04.step.initial');
  }
  if (step.action === 'push') {
    return `${t('module.l04.step.push')} ${step.peekValue ?? step.stackState[step.stackState.length - 1]}`;
  }
  if (step.action === 'pop') {
    return `${t('module.l04.step.pop')} ${step.poppedValue ?? ''}`.trim();
  }
  if (step.action === 'peek') {
    return `${t('module.l04.step.peek')} ${step.peekValue ?? ''}`.trim();
  }
  return t('module.l04.step.completed');
}

export function getHighlightLabel(type: HighlightType, t: Translator): string {
  if (type === 'new-node') {
    return t('module.l04.highlight.pushed');
  }
  if (type === 'moving') {
    return t('module.l04.highlight.popped');
  }
  if (type === 'matched') {
    return t('module.l04.highlight.peeked');
  }
  return t('module.s01.highlight.default');
}
