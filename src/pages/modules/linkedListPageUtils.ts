import type { TranslationKey } from '../../i18n/translations';
import type { LinkedListOperation, LinkedListStep } from '../../modules/linear/linkedListOps';

export type LinkedListConfig = {
  list: number[];
  operation: LinkedListOperation;
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

export function resolveLinkedListConfig(
  listInput: string,
  operationType: LinkedListOperation['type'],
  valueInput: string,
  indexInput: string,
  t: Translator,
): { config: LinkedListConfig | null; error: string } {
  const parsedList = parseNumberArrayAllowEmpty(listInput);
  if (!parsedList) {
    return { config: null, error: t('module.l03.error.list') };
  }
  if (parsedList.length > 30) {
    return { config: null, error: t('module.l03.error.length') };
  }

  if (operationType === 'find') {
    const value = Number(valueInput);
    if (Number.isNaN(value)) {
      return { config: null, error: t('module.l03.error.value') };
    }
    return { config: { list: parsedList, operation: { type: 'find', value } }, error: '' };
  }

  if (operationType === 'insertAt') {
    const displayIndex = Number(indexInput);
    const value = Number(valueInput);
    if (!Number.isInteger(displayIndex) || displayIndex < 1 || displayIndex > parsedList.length + 1) {
      return { config: null, error: t('module.l03.error.insertIndex') };
    }
    if (Number.isNaN(value)) {
      return { config: null, error: t('module.l03.error.value') };
    }
    return { config: { list: parsedList, operation: { type: 'insertAt', index: displayIndex - 1, value } }, error: '' };
  }

  const displayIndex = Number(indexInput);
  if (!Number.isInteger(displayIndex) || displayIndex < 1 || displayIndex > parsedList.length) {
    return { config: null, error: t('module.l03.error.deleteIndex') };
  }
  return { config: { list: parsedList, operation: { type: 'deleteAt', index: displayIndex - 1 } }, error: '' };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function serializeLinkedListConfigAsJson(config: LinkedListConfig): string {
  return JSON.stringify(config, null, 2);
}

export function resolveLinkedListConfigFromJson(rawJson: string, t: Translator): JsonParseResult<LinkedListConfig> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { config: null, error: t('module.l03.json.error.parse') };
  }

  if (!isObjectRecord(parsed) || !Array.isArray(parsed.list) || !isObjectRecord(parsed.operation) || typeof parsed.operation.type !== 'string') {
    return { config: null, error: t('module.l03.json.error.schema') };
  }

  const listInput = parsed.list.join(', ');
  const operationType = parsed.operation.type;
  if (operationType === 'find') {
    if (typeof parsed.operation.value !== 'number') {
      return { config: null, error: t('module.l03.json.error.schema') };
    }
    return resolveLinkedListConfig(listInput, operationType, String(parsed.operation.value), '', t);
  }

  if (operationType === 'insertAt') {
    if (typeof parsed.operation.value !== 'number' || typeof parsed.operation.index !== 'number') {
      return { config: null, error: t('module.l03.json.error.schema') };
    }
    return resolveLinkedListConfig(
      listInput,
      operationType,
      String(parsed.operation.value),
      String(parsed.operation.index + 1),
      t,
    );
  }

  if (operationType === 'deleteAt') {
    if (typeof parsed.operation.index !== 'number') {
      return { config: null, error: t('module.l03.json.error.schema') };
    }
    return resolveLinkedListConfig(listInput, operationType, '', String(parsed.operation.index + 1), t);
  }

  return { config: null, error: t('module.l03.json.error.schema') };
}

export function getFindResultText(
  operation: LinkedListOperation,
  list: number[],
  step: LinkedListStep | undefined,
  t: Translator,
): string | null {
  if (operation.type !== 'find') {
    return null;
  }

  if (step?.action !== 'completed') {
    return null;
  }

  const matchedIndex = list.indexOf(operation.value);
  if (matchedIndex >= 0) {
    return `${t('module.l03.findResult.found')} ${matchedIndex}`;
  }

  if (list.length === 0) {
    return `${t('module.l03.findResult.notFound')} []`;
  }

  return `${t('module.l03.findResult.notFound')} [0, ${list.length - 1}]`;
}

export function buildLogicalStepByIndex(steps: LinkedListStep[]): number[] {
  return steps.reduce<number[]>((acc, step) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : -1;
    const isInsertVisualTail = step.operation === 'insertAt' && (step.action === 'shiftForInsert' || step.action === 'completed');
    const isDeleteVisualTail = step.operation === 'deleteAt' && step.action === 'completed';
    const next = isInsertVisualTail || isDeleteVisualTail ? Math.max(prev, 0) : prev + 1;
    return [...acc, Math.max(next, 0)];
  }, []);
}
