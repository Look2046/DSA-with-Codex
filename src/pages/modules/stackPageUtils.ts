import type { TranslationKey } from '../../i18n/translations';
import { STACK_CAPACITY, type StackOperation, type StackStep } from '../../modules/linear/stackOps';
import type { HighlightType, PlaybackStatus } from '../../types/animation';
import type { StackComparisonStep } from './stackComparisonUtils';

export type StackConfig = {
  stack: number[];
  operation: StackOperation;
};

export type StackBases = {
  sequential: number[];
  linked: number[];
};

export type StackComparisonSource = StackBases & {
  operation: StackConfig['operation'];
};

export type StackWorkspaceConfig = {
  pageClassName: string;
  panelLayout?: 'auto' | 'docked';
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
  shellClassName: string;
  floatingPanelsEnabledMinHeight: number;
  showJsonControls: boolean;
};

export type LinkedStackLayoutMode = 'regular' | 'compact' | 'dense';

export type SequentialTopPointerTarget =
  | { kind: 'cell'; index: number }
  | { kind: 'null' };

export type StackPageInitialState = {
  stackInput: string;
  operationType: StackConfig['operation']['type'];
  valueInput: string;
  error: string;
  hasValidConfig: boolean;
  activeBases: StackBases;
  comparisonSource: StackComparisonSource;
};

type Translator = (key: TranslationKey) => string;

type JsonParseResult<T> = {
  config: T | null;
  error: string;
};

const STACK_WORKSPACE_CONFIG: StackWorkspaceConfig = {
  pageClassName: 'array-page tree-page linear-adaptive linear-adaptive-viewport-lock',
  controlsPanelClassName: 'workspace-drawer-scroll array-controls-drawer stack-controls-drawer',
  controlsPanelSize: { width: 1080, height: 380 },
  controlsPanelAutoAvoid: false,
  controlsPanelOverflowMargin: 0,
  stepPanelAutoAvoid: false,
  stepPanelOverflowMargin: 0,
  contextPanelSize: { width: 760, height: 380 },
  stageClassName: 'workspace-stage-array workspace-stage-stack',
  stageBodyClassName: 'workspace-stage-body-array workspace-stage-body-stack',
  shellClassName: 'stack-workspace-shell',
  floatingPanelsEnabledMinHeight: 0,
  showJsonControls: false,
};

const DEFAULT_STACK_PAGE_CONFIG: StackConfig = {
  stack: [3, 8, 1],
  operation: { type: 'push', value: 9 },
};

export function getStackWorkspaceConfig(): StackWorkspaceConfig {
  return STACK_WORKSPACE_CONFIG;
}

export function getLinkedStackLayoutMode(visibleNodeCount: number): LinkedStackLayoutMode {
  if (visibleNodeCount >= STACK_CAPACITY) {
    return 'dense';
  }
  if (visibleNodeCount >= STACK_CAPACITY - 2) {
    return 'compact';
  }
  return 'regular';
}

export function createSharedStackBases(values: number[]): StackBases {
  return {
    sequential: [...values],
    linked: [...values],
  };
}

export function createInitialStackPageState(config: StackConfig = DEFAULT_STACK_PAGE_CONFIG): StackPageInitialState {
  const activeBases = createSharedStackBases(config.stack);
  return {
    stackInput: config.stack.join(', '),
    operationType: config.operation.type,
    valueInput: config.operation.type === 'push' ? String(config.operation.value) : '',
    error: '',
    hasValidConfig: true,
    activeBases,
    comparisonSource: {
      ...createSharedStackBases(config.stack),
      operation: config.operation.type === 'push' ? { type: 'push', value: config.operation.value } : config.operation,
    },
  };
}

export function getSequentialTopPointerTarget(size: number): SequentialTopPointerTarget {
  if (size >= STACK_CAPACITY) {
    return { kind: 'null' };
  }

  return { kind: 'cell', index: Math.max(0, size) };
}

export function getStackPseudocodeActiveLines(
  step: Pick<StackComparisonStep, 'action' | 'codeLines'> | undefined,
  lane: 'sequential' | 'linked',
): number[] {
  if (!step) {
    return [];
  }

  if (lane === 'sequential') {
    if (step.action === 'initial') {
      return [1];
    }
    if (step.action === 'preparePush' || step.action === 'linkPush') {
      return [2, 3];
    }
    if (step.action === 'overflow') {
      return [3];
    }
    if (step.action === 'push') {
      return [4];
    }
    if (step.action === 'pop') {
      return [5];
    }
    if (step.action === 'peek') {
      return [6];
    }
    if (step.codeLines.includes(5)) {
      return [4];
    }
    if (step.codeLines.includes(6)) {
      return [5];
    }
    if (step.codeLines.includes(7)) {
      return [6];
    }
    return [1];
  }

  if (step.action === 'initial') {
    return [1];
  }
  if (step.action === 'preparePush') {
    return [1, 2];
  }
  if (step.action === 'linkPush') {
    return [3];
  }
  if (step.action === 'overflow' || step.action === 'push') {
    return [4];
  }
  if (step.action === 'pop') {
    return [6, 7];
  }
  if (step.action === 'peek') {
    return [8];
  }
  if (step.codeLines.includes(5)) {
    return [4];
  }
  if (step.codeLines.includes(6)) {
    return [6, 7];
  }
  if (step.codeLines.includes(7)) {
    return [8];
  }
  return [1];
}

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
    const value = Number(valueInput);
    if (Number.isNaN(value)) {
      return { config: null, error: t('module.l04.error.value') };
    }
    return {
      config: { stack: parsedStack, operation: { type: 'push', value } },
      error: parsedStack.length >= STACK_CAPACITY ? t('module.l04.error.pushFull') : '',
    };
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
