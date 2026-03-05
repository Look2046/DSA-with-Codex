import type { TranslationKey } from '../../i18n/translations';
import type { LinkedListOperation, LinkedListStep } from '../../modules/linear/linkedListOps';

export type LinkedListConfig = {
  list: number[];
  operation: LinkedListOperation;
};

type Translator = (key: TranslationKey) => string;

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
