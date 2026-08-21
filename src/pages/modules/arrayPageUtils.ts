import type { TranslationKey } from '../../i18n/translations';
import { ARRAY_CAPACITY } from '../../modules/linear/arrayInsert';
import type { ArrayInsertStep } from '../../modules/linear/arrayInsert';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

export type ArrayOperation =
  | { type: 'insert'; index: number; value: number }
  | { type: 'delete'; index: number };

export type ArrayConfig = {
  array: number[];
  operation: ArrayOperation;
};

type Translator = (key: TranslationKey) => string;

type JsonParseResult<T> = {
  config: T | null;
  error: string;
};

export type ArrayWorkspaceConfig = {
  pageClassName: string;
  controlsPanelClassName: string;
  controlsPanelSize: {
    width: number;
    height: number;
  };
  controlsPanelAutoAvoid: boolean;
  controlsPanelOverflowMargin: number;
  stepPanelAutoAvoid: boolean;
  stepPanelOverflowMargin: number;
  contextPanelSize: {
    width: number;
    height: number;
  };
  stageClassName: string;
  stageBodyClassName: string;
  showJsonControls: boolean;
};

const ARRAY_WORKSPACE_CONFIG: ArrayWorkspaceConfig = {
  pageClassName: 'array-page tree-page linear-adaptive linear-adaptive-viewport-lock',
  controlsPanelClassName: 'workspace-drawer-scroll array-controls-drawer linear-controls-drawer',
  controlsPanelSize: { width: 980, height: 340 },
  controlsPanelAutoAvoid: false,
  controlsPanelOverflowMargin: 0,
  stepPanelAutoAvoid: false,
  stepPanelOverflowMargin: 0,
  contextPanelSize: { width: 620, height: 340 },
  stageClassName: 'workspace-stage-array workspace-stage-array-compact',
  stageBodyClassName: 'workspace-stage-body-array workspace-stage-body-array-centered',
  showJsonControls: false,
};

export function getArrayWorkspaceConfig(): ArrayWorkspaceConfig {
  return ARRAY_WORKSPACE_CONFIG;
}

export function parseNumberArray(raw: string): number[] | null {
  const parts = raw
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const parsed = parts.map((item) => Number(item));
  if (parsed.some((value) => Number.isNaN(value))) {
    return null;
  }

  return parsed;
}

export function resolveArrayConfig(
  arrayInput: string,
  operationType: ArrayOperation['type'],
  indexInput: string,
  valueInput: string,
  t: Translator,
): { config: ArrayConfig | null; error: string } {
  const parsedArray = parseNumberArray(arrayInput);
  if (!parsedArray) {
    return { config: null, error: t('module.l01.error.array') };
  }

  if (operationType === 'delete') {
    const parsedIndex = Number(indexInput);
    if (parsedArray.length === 0) {
      if (parsedIndex === 0) {
        return { config: { array: [], operation: { type: 'delete', index: 0 } }, error: '' };
      }
      return { config: null, error: t('module.l01.error.deleteIndex') };
    }
    if (!Number.isInteger(parsedIndex) || parsedIndex < 0 || parsedIndex >= parsedArray.length) {
      return { config: null, error: t('module.l01.error.deleteIndex') };
    }
    return { config: { array: parsedArray, operation: { type: 'delete', index: parsedIndex } }, error: '' };
  }

  if (parsedArray.length >= ARRAY_CAPACITY) {
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
        operation: { type: 'insert', index: parsedIndex, value: parsedValue },
      },
      error: t('module.l01.error.capacity'),
    };
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
      operation: { type: 'insert', index: parsedIndex, value: parsedValue },
    },
    error: '',
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function serializeArrayConfigAsJson(config: ArrayConfig): string {
  return JSON.stringify(config, null, 2);
}

export function resolveArrayConfigFromJson(rawJson: string, t: Translator): JsonParseResult<ArrayConfig> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { config: null, error: t('module.l01.json.error.parse') };
  }

  if (!isObjectRecord(parsed) || !Array.isArray(parsed.array)) {
    return { config: null, error: t('module.l01.json.error.schema') };
  }

  const arrayInput = parsed.array.join(', ');

  if (isObjectRecord(parsed.operation) && parsed.operation.type === 'insert') {
    if (typeof parsed.operation.index !== 'number' || typeof parsed.operation.value !== 'number') {
      return { config: null, error: t('module.l01.json.error.schema') };
    }
    return resolveArrayConfig(
      arrayInput,
      'insert',
      String(parsed.operation.index),
      String(parsed.operation.value),
      t,
    );
  }

  if (isObjectRecord(parsed.operation) && parsed.operation.type === 'delete') {
    if (typeof parsed.operation.index !== 'number') {
      return { config: null, error: t('module.l01.json.error.schema') };
    }
    return resolveArrayConfig(arrayInput, 'delete', String(parsed.operation.index), '', t);
  }

  if (typeof parsed.index === 'number' && typeof parsed.value === 'number') {
    return resolveArrayConfig(arrayInput, 'insert', String(parsed.index), String(parsed.value), t);
  }

  return { config: null, error: t('module.l01.json.error.schema') };
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
  if (step.action === 'visit') {
    return `${t('module.l01.step.visit')} ${step.indices[0]}`;
  }
  if (step.action === 'shift') {
    const shiftLabel = step.indices[0] < step.indices[1] ? t('module.l01.step.shift') : t('module.l01.step.shiftLeft');
    return `${shiftLabel} ${step.indices[0]} -> ${step.indices[1]}`;
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
  if (type === 'visiting') {
    return t('module.l01.highlight.visiting');
  }
  return t('module.s01.highlight.default');
}
