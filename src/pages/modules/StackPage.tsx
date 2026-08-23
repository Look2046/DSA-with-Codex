import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { STACK_CAPACITY } from '../../modules/linear/stackOps';
import { buildStackComparisonSteps, type StackComparisonStep, type StackLaneOutcome } from './stackComparisonUtils';
import {
  createSharedStackBases,
  createInitialStackPageState,
  getSequentialTopPointerTarget,
  getHighlightLabel,
  getLinkedStackLayoutMode,
  getStackPseudocodeActiveLines,
  getStackWorkspaceConfig,
  getStatusLabel,
  resolveStackConfig,
  type StackBases,
  type StackComparisonSource,
  type StackConfig,
} from './stackPageUtils';
import type { HighlightType } from '../../types/animation';

const STACK_WORKSPACE_CONFIG = getStackWorkspaceConfig();
const INITIAL_STACK_PAGE_STATE = createInitialStackPageState();

const SEQUENTIAL_STACK_PSEUDOCODE = {
  push: [
    { sourceLine: 1, textKey: 'module.l04.sequentialCode.line1', cLine: 'validate top position' },
    { sourceLine: 2, textKey: 'module.l04.sequentialCode.line2', cLine: 'start push branch' },
    { sourceLine: 3, textKey: 'module.l04.sequentialCode.line3', cLine: 'if (top == MAX) return OVERFLOW;' },
    { sourceLine: 4, textKey: 'module.l04.sequentialCode.line4', cLine: 'data[top] = value; top = top + 1;' },
  ],
  pop: [
    { sourceLine: 1, textKey: 'module.l04.sequentialCode.line1', cLine: 'validate top position' },
    { sourceLine: 5, textKey: 'module.l04.sequentialCode.line5', cLine: 'top = top - 1; return data[top];' },
  ],
  peek: [
    { sourceLine: 1, textKey: 'module.l04.sequentialCode.line1', cLine: 'validate top position' },
    { sourceLine: 6, textKey: 'module.l04.sequentialCode.line6', cLine: 'return data[top - 1];' },
  ],
} as const;

const LINKED_STACK_PSEUDOCODE = {
  push: [
    { sourceLine: 1, textKey: 'module.l04.linkedCode.line1', cLine: 'locate current top' },
    { sourceLine: 2, textKey: 'module.l04.linkedCode.line2', cLine: 'start push branch' },
    { sourceLine: 3, textKey: 'module.l04.linkedCode.line3', cLine: 'Node *s = createNode(value);' },
    { sourceLine: 4, textKey: 'module.l04.linkedCode.line4', cLine: 's->next = top;' },
    { sourceLine: 5, textKey: 'module.l04.linkedCode.line5', cLine: 'top = s;' },
  ],
  pop: [
    { sourceLine: 1, textKey: 'module.l04.linkedCode.line1', cLine: 'locate current top' },
    { sourceLine: 6, textKey: 'module.l04.linkedCode.line6', cLine: 'top = top->next;' },
  ],
  peek: [
    { sourceLine: 1, textKey: 'module.l04.linkedCode.line1', cLine: 'locate current top' },
    { sourceLine: 7, textKey: 'module.l04.linkedCode.line7', cLine: 'return top->data;' },
  ],
} as const;

function createRandomPushValue(): number {
  return Math.floor(Math.random() * 90) + 10;
}

function formatStack(values: number[]): string {
  return values.length > 0 ? `[${values.join(', ')}]` : '[]';
}

function stacksEqual(left: number[], right: number[]): boolean {
  return left.length === right.length && left.every((value, index) => right[index] === value);
}

function getOutcomeLabel(outcome: StackLaneOutcome, t: ReturnType<typeof useI18n>['t']): string {
  if (outcome === 'overflow') {
    return t('module.l04.compare.outcome.overflow');
  }
  if (outcome === 'empty') {
    return t('module.l04.compare.outcome.empty');
  }
  return t('module.l04.compare.outcome.ok');
}

function getStepValue(step: StackComparisonStep | undefined): number | undefined {
  if (!step) {
    return undefined;
  }

  if (step.action === 'preparePush' || step.action === 'linkPush') {
    return step.linked.incomingValue;
  }

  if (step.action === 'push') {
    return step.linked.peekValue ?? step.sequential.peekValue;
  }

  if (step.action === 'pop') {
    return step.linked.poppedValue ?? step.sequential.poppedValue;
  }

  if (step.action === 'peek') {
    return step.linked.peekValue ?? step.sequential.peekValue;
  }

  return undefined;
}

function getComparisonStepDescription(step: StackComparisonStep | undefined, t: ReturnType<typeof useI18n>['t']): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.l04.step.initial');
  }

  if (step.action === 'preparePush') {
    return `${t('module.l04.step.preparePush')} ${getStepValue(step) ?? ''}`.trim();
  }

  if (step.action === 'linkPush') {
    return `${t('module.l04.step.linkPush')} ${getStepValue(step) ?? ''}`.trim();
  }

  if (step.action === 'overflow') {
    return t('module.l04.step.pushBlocked');
  }

  if (step.action === 'push') {
    return `${t('module.l04.step.push')} ${getStepValue(step) ?? ''}`.trim();
  }

  if (step.action === 'pop') {
    return `${t('module.l04.step.pop')} ${getStepValue(step) ?? ''}`.trim();
  }

  if (step.action === 'peek') {
    return `${t('module.l04.step.peek')} ${getStepValue(step) ?? ''}`.trim();
  }

  return t('module.l04.step.completed');
}

function getComparisonNote(step: StackComparisonStep | undefined, t: ReturnType<typeof useI18n>['t']): string {
  if (!step || step.action === 'initial') {
    return t('module.l04.compare.note.initial');
  }

  if (step.action === 'preparePush') {
    return t('module.l04.compare.note.preparePush');
  }

  if (step.action === 'linkPush') {
    return t('module.l04.compare.note.linkPush');
  }

  if (step.action === 'overflow') {
    return t('module.l04.compare.note.overflow');
  }

  return t('module.l04.compare.note.aligned');
}

type PointerLabelProps = {
  className: string;
  direction: 'left' | 'right' | 'down';
  label: string;
};

function PointerLabel({ className, direction, label }: PointerLabelProps) {
  if (direction === 'down') {
    return (
      <span className={className}>
        <span className="stack-pointer-text">{label}</span>
        <span className="stack-pointer-arrow" aria-hidden="true">
          ↓
        </span>
      </span>
    );
  }

  if (direction === 'left') {
    return (
      <span className={className}>
        <span className="stack-pointer-arrow" aria-hidden="true">
          ←
        </span>
        <span className="stack-pointer-text">{label}</span>
      </span>
    );
  }

  return (
    <span className={className}>
      <span className="stack-pointer-text">{label}</span>
      <span className="stack-pointer-arrow" aria-hidden="true">
        →
      </span>
    </span>
  );
}

type SequentialOverflowPointerProps = {
  topLabel: string;
  nullLabel: string;
};

type ConnectorPoint = {
  x: number;
  y: number;
};

export function SequentialOverflowPointer({ topLabel, nullLabel }: SequentialOverflowPointerProps) {
  return (
    <div className="stack-top-pointer-overflow" aria-label="sequential-stack-top-overflow">
      <div className="stack-cell stack-cell-compact stack-cell-unused stack-top-pointer-overflow-cell">
        <strong className="stack-pointer-null-text">{nullLabel}</strong>
        <PointerLabel
          className="stack-top-pointer stack-top-pointer-overflow-inline"
          direction="left"
          label={topLabel}
        />
      </div>
    </div>
  );
}

export function buildLinkedStackConnectorPath(start: ConnectorPoint, end: ConnectorPoint): string {
  const horizontalSpan = Math.abs(end.x - start.x);
  const startDropY = start.y + Math.max(14, horizontalSpan * 0.08);
  const travelX = start.x - Math.max(18, horizontalSpan * 0.16);
  const safeAboveEndY = end.y - Math.max(20, horizontalSpan * 0.06);
  const arcX = end.x + Math.max(28, horizontalSpan * 0.34);
  const endApproachY = end.y - 12;

  return [
    `M ${start.x} ${start.y}`,
    `C ${start.x} ${startDropY}, ${travelX} ${startDropY + 8}, ${arcX} ${safeAboveEndY}`,
    `S ${end.x + 8} ${endApproachY}, ${end.x} ${endApproachY}`,
    `L ${end.x} ${end.y}`,
  ].join(' ');
}

export function LinkedStackLinkPreview({ path }: { path: string }) {
  return (
    <svg className="linked-stack-link-preview" aria-hidden="true">
      <defs>
        <marker
          id="linked-stack-link-preview-arrowhead"
          markerWidth="7"
          markerHeight="7"
          refX="5.2"
          refY="3.5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M 0 0 L 7 3.5 L 0 7 z" className="linked-stack-link-preview-arrowhead" />
        </marker>
      </defs>
      <path
        d={path}
        className="linked-stack-link-preview-path"
        markerEnd="url(#linked-stack-link-preview-arrowhead)"
      />
    </svg>
  );
}

export function StackPage() {
  const { t } = useI18n();

  const [stackInput, setStackInput] = useState(INITIAL_STACK_PAGE_STATE.stackInput);
  const [operationType, setOperationType] = useState<StackConfig['operation']['type']>(INITIAL_STACK_PAGE_STATE.operationType);
  const [valueInput, setValueInput] = useState(INITIAL_STACK_PAGE_STATE.valueInput);
  const [error, setError] = useState(INITIAL_STACK_PAGE_STATE.error);
  const [hasValidConfig, setHasValidConfig] = useState(INITIAL_STACK_PAGE_STATE.hasValidConfig);
  const [activeBases, setActiveBases] = useState<StackBases>(INITIAL_STACK_PAGE_STATE.activeBases);
  const [comparisonSource, setComparisonSource] = useState<StackComparisonSource>(INITIAL_STACK_PAGE_STATE.comparisonSource);
  const [linkedPreviewPath, setLinkedPreviewPath] = useState('');

  const sequentialCellsRef = useRef<HTMLDivElement | null>(null);
  const linkedCellsRef = useRef<HTMLDivElement | null>(null);
  const linkedSceneRef = useRef<HTMLDivElement | null>(null);
  const linkedFloatingNodeRef = useRef<HTMLDivElement | null>(null);
  const linkedTargetNodeRef = useRef<HTMLDivElement | null>(null);

  const { status, speedMs, currentFrame, setSpeed, setTotalFrames, play, pause, next, prev, reset } = useTimelinePlayer(0);
  const currentStep = currentFrame;

  const recomputeInputState = useCallback(
    (
      nextStackInput: string,
      nextOperationType: StackConfig['operation']['type'],
      nextValueInput: string,
      nextBases: StackBases,
    ) => {
      const resolved = resolveStackConfig(nextStackInput, nextOperationType, nextValueInput, t);
      setError(resolved.error);
      setHasValidConfig(resolved.config !== null);
      if (resolved.config) {
        setComparisonSource({
          sequential: [...nextBases.sequential],
          linked: [...nextBases.linked],
          operation: resolved.config.operation,
        });
      }
    },
    [t],
  );

  const comparisonResult = useMemo(
    () => buildStackComparisonSteps(comparisonSource.sequential, comparisonSource.linked, comparisonSource.operation),
    [comparisonSource],
  );
  const steps = comparisonResult.steps;
  const currentSnapshot = steps[currentStep] ?? steps[0];

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  useEffect(() => {
    const sequentialContainer = sequentialCellsRef.current;
    const linkedContainer = linkedCellsRef.current;
    if (!currentSnapshot) {
      return;
    }

    const sequentialActiveIndex =
      currentSnapshot.sequential.highlights[0]?.index ?? currentSnapshot.sequential.indices[0];
    if (sequentialContainer && sequentialActiveIndex !== undefined) {
      const target = sequentialContainer.querySelector<HTMLElement>(`[data-stack-index="${sequentialActiveIndex}"]`);
      target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    const linkedActiveIndex = currentSnapshot.linked.highlights[0]?.index ?? currentSnapshot.linked.indices[0];
    if (linkedContainer && linkedActiveIndex !== undefined) {
      const target = linkedContainer.querySelector<HTMLElement>(`[data-linked-stack-index="${linkedActiveIndex}"]`);
      target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentSnapshot]);

  const syncToCompletedStacks = useCallback(
    (nextValueInput = valueInput) => {
      if (!hasValidConfig || steps.length === 0 || operationType === 'peek') {
        return;
      }

      const nextBases: StackBases = {
        sequential: [...comparisonResult.completedSequential],
        linked: [...comparisonResult.completedLinked],
      };
      const nextStackInput = nextBases.sequential.join(', ');

      reset();
      setActiveBases(nextBases);
      setStackInput(nextStackInput);
      recomputeInputState(nextStackInput, operationType, nextValueInput, nextBases);
    },
    [comparisonResult.completedLinked, comparisonResult.completedSequential, hasValidConfig, operationType, recomputeInputState, reset, steps.length, valueInput],
  );

  const handleResetToInitialState = useCallback(() => {
    const nextState = createInitialStackPageState();
    reset();
    setStackInput(nextState.stackInput);
    setOperationType(nextState.operationType);
    setValueInput(nextState.valueInput);
    setError(nextState.error);
    setHasValidConfig(nextState.hasValidConfig);
    setActiveBases(nextState.activeBases);
    setComparisonSource(nextState.comparisonSource);
  }, [reset]);

  useEffect(() => {
    if (!hasValidConfig || steps.length === 0 || currentSnapshot?.action !== 'completed' || operationType === 'peek') {
      return;
    }

    const stacksChanged =
      !stacksEqual(activeBases.sequential, comparisonResult.completedSequential) ||
      !stacksEqual(activeBases.linked, comparisonResult.completedLinked);

    if (!stacksChanged) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (operationType === 'push') {
        const nextValue = String(createRandomPushValue());
        setValueInput(nextValue);
        syncToCompletedStacks(nextValue);
        return;
      }

      syncToCompletedStacks();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    activeBases.linked,
    activeBases.sequential,
    comparisonResult.completedLinked,
    comparisonResult.completedSequential,
    currentSnapshot?.action,
    hasValidConfig,
    operationType,
    steps.length,
    syncToCompletedStacks,
  ]);

  const handleNextStep = useCallback(() => {
    const willComplete = currentStep >= steps.length - 2;
    next();

    if (!willComplete) {
      return;
    }

    if (operationType === 'push') {
      const nextValue = String(createRandomPushValue());
      setValueInput(nextValue);
      syncToCompletedStacks(nextValue);
      return;
    }

    syncToCompletedStacks();
  }, [currentStep, next, operationType, steps.length, syncToCompletedStacks]);

  const sequentialHighlightMap = useMemo(() => {
    const map = new Map<number, HighlightType>();
    (currentSnapshot?.sequential.highlights ?? []).forEach((item) => map.set(item.index, item.type));
    return map;
  }, [currentSnapshot]);

  const linkedHighlightMap = useMemo(() => {
    const map = new Map<number, HighlightType>();
    (currentSnapshot?.linked.highlights ?? []).forEach((item) => map.set(item.index, item.type));
    return map;
  }, [currentSnapshot]);

  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1200 },
    { key: 'module.s01.speed.normal', value: 700 },
    { key: 'module.s01.speed.fast', value: 350 },
  ] as const;

  const currentSequentialStack = currentSnapshot?.sequential.stackState ?? [];
  const currentLinkedStack = currentSnapshot?.linked.stackState ?? [];
  const currentSequentialSize = currentSequentialStack.length;
  const currentLinkedSize = currentLinkedStack.length;
  const sequentialTopPointerTarget = getSequentialTopPointerTarget(currentSequentialSize);
  const currentSequentialTopSlot = currentSequentialSize;
  const currentLinkedTopIndex = currentLinkedSize - 1;
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const operationLabel =
    operationType === 'push'
      ? t('module.l04.operation.push')
      : operationType === 'pop'
        ? t('module.l04.operation.pop')
        : t('module.l04.operation.peek');
  const diverged = comparisonResult.diverged;
  const stepDescription = getComparisonStepDescription(currentSnapshot, t);
  const stepNote = getComparisonNote(currentSnapshot, t);
  const sequentialHighlightSummary =
    (currentSnapshot?.sequential.highlights ?? [])
      .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
      .join(' | ') || t('module.s01.none');
  const linkedHighlightSummary =
    (currentSnapshot?.linked.highlights ?? [])
      .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
      .join(' | ') || t('module.s01.none');
  const linkedIncomingValue = currentSnapshot?.linked.incomingValue;
  const linkedFloatingAction = currentSnapshot?.linked.action;
  const showLinkedFloatingNode = linkedFloatingAction === 'preparePush' || linkedFloatingAction === 'linkPush';
  const showLinkedNextLink = linkedFloatingAction === 'linkPush';
  const linkedIncomingNextIndex = currentSnapshot?.linked.incomingNextIndex;
  const linkedDisplayNodes = [...currentLinkedStack]
    .map((value, index) => ({ value, index }))
    .reverse();
  const linkedVisibleNodeCount = linkedDisplayNodes.length + (showLinkedFloatingNode ? 1 : 0);
  const linkedStackLayoutMode = getLinkedStackLayoutMode(linkedVisibleNodeCount);
  const linkedStackSceneClassName = `linked-stack-scene linked-stack-scene-${linkedStackLayoutMode}`;
  const linkedStackFloatingClassName = `linked-stack-floating linked-stack-floating-${linkedStackLayoutMode}`;
  const linkedStackCellsClassName = `linked-stack-cells linked-stack-cells-${linkedStackLayoutMode}`;
  const sequentialOutcomeLabel = getOutcomeLabel(currentSnapshot?.sequential.outcome ?? 'ok', t);
  const linkedOutcomeLabel = getOutcomeLabel(currentSnapshot?.linked.outcome ?? 'ok', t);
  const sequentialCodeLines = getStackPseudocodeActiveLines(currentSnapshot, 'sequential');
  const linkedCodeLines = getStackPseudocodeActiveLines(currentSnapshot, 'linked');
  const sequentialPseudocode = SEQUENTIAL_STACK_PSEUDOCODE[operationType];
  const linkedPseudocode = LINKED_STACK_PSEUDOCODE[operationType];
  const sequentialActiveDisplayLines = sequentialPseudocode
    .map((item, index) => (sequentialCodeLines.includes(item.sourceLine) ? index + 1 : -1))
    .filter((line) => line > 0);
  const linkedActiveDisplayLines = linkedPseudocode
    .map((item, index) => (linkedCodeLines.includes(item.sourceLine) ? index + 1 : -1))
    .filter((line) => line > 0);

  useLayoutEffect(() => {
    if (!showLinkedNextLink) {
      setLinkedPreviewPath('');
      return;
    }

    const scene = linkedSceneRef.current;
    const floatingNode = linkedFloatingNodeRef.current;
    const targetNode = linkedTargetNodeRef.current;
    if (!scene || !floatingNode || !targetNode) {
      setLinkedPreviewPath('');
      return;
    }

    const sceneRect = scene.getBoundingClientRect();
    const floatingRect = floatingNode.getBoundingClientRect();
    const targetRect = targetNode.getBoundingClientRect();

    const start = {
      x: floatingRect.left + floatingRect.width / 2 - sceneRect.left,
      y: floatingRect.bottom - sceneRect.top,
    };
    const end = {
      x: targetRect.left + targetRect.width / 2 - sceneRect.left,
      y: targetRect.top - sceneRect.top,
    };

    setLinkedPreviewPath(buildLinkedStackConnectorPath(start, end));
  }, [currentStep, linkedIncomingNextIndex, showLinkedNextLink]);

  return (
    <WorkspaceShell
      pageClassName={STACK_WORKSPACE_CONFIG.pageClassName}
      panelLayout={STACK_WORKSPACE_CONFIG.panelLayout}
      stageAriaLabel={t('module.l04.stage')}
      title={t('module.l04.title')}
      description={t('module.l04.body')}
      shellClassName={STACK_WORKSPACE_CONFIG.shellClassName}
      stageClassName={STACK_WORKSPACE_CONFIG.stageClassName}
      stageBodyClassName={STACK_WORKSPACE_CONFIG.stageBodyClassName}
      controlsPanelClassName={STACK_WORKSPACE_CONFIG.controlsPanelClassName}
      stepPanelClassName="workspace-context-sheet-linear workspace-context-sheet-linear-stack"
      defaultControlsPanelSize={STACK_WORKSPACE_CONFIG.controlsPanelSize}
      controlsPanelAutoAvoid={STACK_WORKSPACE_CONFIG.controlsPanelAutoAvoid}
      controlsPanelOverflowMargin={STACK_WORKSPACE_CONFIG.controlsPanelOverflowMargin}
      defaultContextPanelSize={STACK_WORKSPACE_CONFIG.contextPanelSize}
      stepPanelAutoAvoid={STACK_WORKSPACE_CONFIG.stepPanelAutoAvoid}
      stepPanelOverflowMargin={STACK_WORKSPACE_CONFIG.stepPanelOverflowMargin}
      floatingPanelsEnabledMinHeight={STACK_WORKSPACE_CONFIG.floatingPanelsEnabledMinHeight}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('playback.step')}: {currentStep}/{Math.max(steps.length - 1, 0)}
          </span>
          <span className="tree-workspace-pill">{operationLabel}</span>
          <span className="tree-workspace-pill">
            {t('module.l04.compare.sequential')}: {currentSequentialSize}/{STACK_CAPACITY}
          </span>
          <span className="tree-workspace-pill">
            {t('module.l04.compare.linked')}: {currentLinkedSize}
          </span>
          <span className={`tree-workspace-pill${diverged ? '' : ' tree-workspace-pill-active-soft'}`}>
            {diverged ? t('module.l04.compare.diverged') : t('module.l04.compare.aligned')}
          </span>
          <span className="tree-workspace-pill">{stepDescription}</span>
        </>
      }
      controlsContent={
        <>
          <div className="array-controls-grid stack-controls-grid">
            <label className="tree-workspace-field array-controls-field stack-controls-field-stack" htmlFor="stack-input">
              <span>{t('module.l04.input.stack')}</span>
              <input
                id="stack-input"
                type="text"
                value={stackInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  reset();
                  setStackInput(nextValue);

                  const resolved = resolveStackConfig(nextValue, operationType, valueInput, t);
                  setError(resolved.error);
                  setHasValidConfig(resolved.config !== null);
                  if (resolved.config) {
                    const nextBases = createSharedStackBases(resolved.config.stack);
                    setActiveBases(nextBases);
                    setComparisonSource({
                      ...nextBases,
                      operation: resolved.config.operation,
                    });
                  }
                }}
                placeholder="3, 8, 1"
              />
            </label>

            <label className="tree-workspace-field array-controls-field" htmlFor="stack-operation">
              <span>{t('module.l04.input.operation')}</span>
              <select
                id="stack-operation"
                value={operationType}
                onChange={(event) => {
                  const nextOperation = event.target.value as StackConfig['operation']['type'];
                  reset();
                  setOperationType(nextOperation);

                  const normalizedValue = nextOperation === 'push' ? String(createRandomPushValue()) : '';
                  setValueInput(normalizedValue);
                  recomputeInputState(stackInput, nextOperation, normalizedValue, activeBases);
                }}
              >
                <option value="push">{t('module.l04.operation.push')}</option>
                <option value="pop">{t('module.l04.operation.pop')}</option>
                <option value="peek">{t('module.l04.operation.peek')}</option>
              </select>
            </label>

            {operationType === 'push' ? (
              <label className="tree-workspace-field array-controls-field" htmlFor="stack-value">
                <span>{t('module.l04.input.value')}</span>
                <input
                  id="stack-value"
                  type="number"
                  value={valueInput}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    reset();
                    setValueInput(nextValue);
                    recomputeInputState(stackInput, operationType, nextValue, activeBases);
                  }}
                />
              </label>
            ) : null}

            <div className="tree-workspace-field array-controls-field stack-controls-field-speed">
              <span>{t('module.s01.speed')}</span>
              <div className="tree-workspace-toggle-row">
                {speedOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={`tree-workspace-toggle${speedMs === option.value ? ' tree-workspace-toggle-active' : ''}`}
                    onClick={() => setSpeed(option.value)}
                  >
                    {t(option.key)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className={`workspace-inline-feedback array-controls-feedback${error ? ' form-error' : ''}`} aria-live="polite">
            {error || ''}
          </p>

          <div className="linear-controls-section">
            <div className="linear-controls-summary">
              <div className="linear-controls-card">
                <span>{t('playback.status')}</span>
                <strong>{getStatusLabel(status, t)}</strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('playback.step')}</span>
                <strong>
                  {currentStep}/{Math.max(steps.length - 1, 0)}
                </strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('module.l04.input.operation')}</span>
                <strong>{operationLabel}</strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('module.l04.compare.stateSequential')}</span>
                <strong>{sequentialOutcomeLabel}</strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('module.l04.compare.stateLinked')}</span>
                <strong>{linkedOutcomeLabel}</strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('module.l04.compare.sequential')}</span>
                <strong>
                  {currentSequentialSize}/{STACK_CAPACITY}
                </strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('module.l04.compare.linked')}</span>
                <strong>{currentLinkedSize}</strong>
              </div>
            </div>

            <div className="linear-controls-note-grid">
              <p className="linear-controls-note linear-controls-note-wide">
                {stepDescription} · {stepNote} · {diverged ? t('module.l04.compare.diverged') : t('module.l04.compare.aligned')}
              </p>
              <p className="linear-controls-note">
                {t('module.l04.compare.sequential')}: {formatStack(currentSequentialStack)} | {t('module.s01.highlight')}:{' '}
                {sequentialHighlightSummary}
              </p>
              <p className="linear-controls-note">
                {t('module.l04.compare.linked')}: {formatStack(currentLinkedStack)} | {t('module.s01.highlight')}: {linkedHighlightSummary}
              </p>
            </div>

          </div>
        </>
      }
      stepContent={
        <div className="workspace-panel-scroll workspace-panel-scroll-linear">
          <div className="workspace-panel-code-only workspace-panel-code-grid-double">
            <div className="workspace-panel-linear-code">
              <div className="pseudocode-block pseudocode-block-linear">
                <h3>
                  {t('module.l04.compare.sequential')} {t('module.l04.pseudocode')}：中文式
                </h3>
                <ol>
                  {sequentialPseudocode.map((item, index) => (
                    <li
                      key={`seq-cn-${item.sourceLine}`}
                      className={sequentialActiveDisplayLines.includes(index + 1) ? 'code-active' : ''}
                    >
                      {t(item.textKey)}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="pseudocode-block pseudocode-block-linear">
                <h3>
                  {t('module.l04.compare.sequential')} {t('module.l04.pseudocode')}：类 C 式
                </h3>
                <ol>
                  {sequentialPseudocode.map((item, index) => (
                    <li
                      key={`seq-c-${item.sourceLine}`}
                      className={sequentialActiveDisplayLines.includes(index + 1) ? 'code-active' : ''}
                    >
                      <code>{item.cLine}</code>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="workspace-panel-linear-code">
              <div className="pseudocode-block pseudocode-block-linear">
                <h3>
                  {t('module.l04.compare.linked')} {t('module.l04.pseudocode')}：中文式
                </h3>
                <ol>
                  {linkedPseudocode.map((item, index) => (
                    <li
                      key={`linked-cn-${item.sourceLine}`}
                      className={linkedActiveDisplayLines.includes(index + 1) ? 'code-active' : ''}
                    >
                      {t(item.textKey)}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="pseudocode-block pseudocode-block-linear">
                <h3>
                  {t('module.l04.compare.linked')} {t('module.l04.pseudocode')}：类 C 式
                </h3>
                <ol>
                  {linkedPseudocode.map((item, index) => (
                    <li
                      key={`linked-c-${item.sourceLine}`}
                      className={linkedActiveDisplayLines.includes(index + 1) ? 'code-active' : ''}
                    >
                      <code>{item.cLine}</code>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      }
      stageContent={
        <div className="stack-compare-stage">
          <section className="stack-compare-lane">
            <header className="stack-compare-lane-head">
              <div>
                <h3>{t('module.l04.compare.sequential')}</h3>
                <p>
                  {currentSequentialSize}/{STACK_CAPACITY}
                </p>
              </div>
              <span className={`stack-compare-outcome stack-compare-outcome-${currentSnapshot?.sequential.outcome ?? 'ok'}`}>
                {getOutcomeLabel(currentSnapshot?.sequential.outcome ?? 'ok', t)}
              </span>
            </header>

            <div className="stack-compare-lane-body">
              <div className="stack-cells-sequential-scene">
                {sequentialTopPointerTarget.kind === 'null' ? (
                  <SequentialOverflowPointer topLabel={t('module.l04.top')} nullLabel={t('module.l04.nullLiteral')} />
                ) : null}

                <div ref={sequentialCellsRef} className="stack-cells stack-cells-sequential" aria-label="sequential-stack-cells">
                {Array.from({ length: STACK_CAPACITY }, (_, index) => {
                  const value = currentSequentialStack[index] ?? null;
                  const highlight = sequentialHighlightMap.get(index) ?? 'default';
                  const isTop = sequentialTopPointerTarget.kind === 'cell' && sequentialTopPointerTarget.index === index;
                  const isBottom = index === 0;
                  const isUnused = value === null;

                  return (
                    <div
                      key={`sequential-${index}-${String(value)}`}
                      data-stack-index={index}
                      className={`stack-cell stack-cell-compact bar-${highlight}${isUnused ? ' stack-cell-unused' : ''}`}
                    >
                      {isTop ? <PointerLabel className="stack-top-pointer" direction="left" label={t('module.l04.top')} /> : null}
                      {isBottom ? <PointerLabel className="stack-bottom-pointer" direction="right" label={t('module.l04.bottom')} /> : null}
                      <span className="array-cell-index">{index}</span>
                      <strong>{value ?? '∅'}</strong>
                    </div>
                  );
                })}
                </div>
              </div>
            </div>
          </section>

          <section className="stack-compare-lane">
            <header className="stack-compare-lane-head">
              <div>
                <h3>{t('module.l04.compare.linked')}</h3>
                <p>{currentLinkedSize}</p>
              </div>
              <span className={`stack-compare-outcome stack-compare-outcome-${currentSnapshot?.linked.outcome ?? 'ok'}`}>
                {getOutcomeLabel(currentSnapshot?.linked.outcome ?? 'ok', t)}
              </span>
            </header>

            <div className="stack-compare-lane-body">
              <div ref={linkedSceneRef} className={linkedStackSceneClassName}>
                {showLinkedNextLink && linkedPreviewPath ? <LinkedStackLinkPreview path={linkedPreviewPath} /> : null}
                <div ref={linkedCellsRef} className={linkedStackCellsClassName} aria-label="linked-stack-cells">
                  {linkedDisplayNodes.length > 0 ? (
                    linkedDisplayNodes.map((node, displayIndex) => {
                      const highlight = linkedHighlightMap.get(node.index) ?? 'default';
                      const isTop = node.index === currentLinkedTopIndex;
                      const isBottom = currentLinkedSize > 0 && node.index === 0;
                      const isTail = displayIndex === linkedDisplayNodes.length - 1;
                      const isIncomingLinkTarget = showLinkedNextLink && linkedIncomingNextIndex === node.index;

                      return (
                        <div
                          key={`linked-${node.index}-${node.value}`}
                          className={`linked-stack-item linked-stack-item-${linkedStackLayoutMode}${isTail ? ' linked-stack-item-tail' : ''}`}
                        >
                          <div
                            ref={isIncomingLinkTarget ? linkedTargetNodeRef : null}
                            data-linked-stack-index={node.index}
                            className={`linked-stack-node linked-stack-node-${linkedStackLayoutMode} bar-${highlight}${
                              isIncomingLinkTarget ? ' linked-stack-node-link-target' : ''
                            }`}
                          >
                            {isTop ? <PointerLabel className="linked-stack-top-pointer" direction="right" label={t('module.l04.top')} /> : null}
                            {isBottom ? <PointerLabel className="linked-stack-bottom-pointer" direction="left" label={t('module.l04.bottom')} /> : null}
                            <span className="array-cell-index">{node.index}</span>
                            <strong>{node.value}</strong>
                          </div>
                          {!isTail ? (
                            <span
                              className={`linked-stack-connector linked-stack-connector-${linkedStackLayoutMode}`}
                              aria-hidden="true"
                            />
                          ) : null}
                        </div>
                      );
                    })
                  ) : (
                    <div className="stack-empty">{t('module.l04.empty')}</div>
                  )}
                </div>

                {showLinkedFloatingNode && linkedIncomingValue !== undefined ? (
                  <div className={linkedStackFloatingClassName}>
                    <div
                      ref={linkedFloatingNodeRef}
                      className={`linked-stack-node linked-stack-node-floating bar-new-node${
                        showLinkedNextLink ? ' linked-stack-node-preview-active' : ''
                      }`}
                    >
                      <span className="linked-stack-variable-badge">s</span>
                      <span className="array-cell-index">{currentLinkedSize}</span>
                      <strong>{linkedIncomingValue}</strong>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      }
      transportLeft={
        <>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={prev}
            disabled={!hasValidConfig || steps.length === 0 || currentStep <= 0}
          >
            {t('playback.prev')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn tree-workspace-transport-btn-primary"
            onClick={status === 'playing' ? pause : play}
            disabled={!hasValidConfig || steps.length === 0 || (status !== 'playing' && isAtLastFrame)}
          >
            {status === 'playing' ? t('playback.pause') : t('playback.play')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={handleNextStep}
            disabled={!hasValidConfig || isAtLastFrame}
          >
            {t('playback.next')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={handleResetToInitialState}
          >
            {t('playback.reset')}
          </button>
          <div className="tree-workspace-transport-progress" aria-hidden="true">
            <span
              className="tree-workspace-transport-progress-fill"
              style={{
                width: `${steps.length <= 1 ? 0 : (currentStep / Math.max(steps.length - 1, 1)) * 100}%`,
              }}
            />
          </div>
          <span className="tree-workspace-transport-step">
            {currentStep}/{Math.max(steps.length - 1, 0)}
          </span>
        </>
      }
      transportRight={
        <>
          <span className="tree-workspace-transport-chip">{operationLabel}</span>
          {operationType === 'push' ? (
            <span className="tree-workspace-transport-chip">+{valueInput}</span>
          ) : null}
          <span className="tree-workspace-transport-chip">
            S:{currentSequentialTopSlot}
          </span>
          <span className="tree-workspace-transport-chip">
            L:{currentLinkedTopIndex >= 0 ? currentLinkedTopIndex : '-'}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {currentSequentialSize}/{STACK_CAPACITY}
          </span>
          <span className={`tree-workspace-transport-chip${diverged ? ' tree-workspace-transport-chip-alert' : ''}`}>
            {diverged ? t('module.l04.compare.diverged') : t('module.l04.compare.aligned')}
          </span>
        </>
      }
    />
  );
}
