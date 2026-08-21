import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { QUEUE_CAPACITY, type QueueMode as QueueRuntimeMode, type QueueRuntimeSnapshot } from '../../modules/linear/queueOps';
import { buildQueueTimelineFromInput } from '../../modules/linear/queueTimelineAdapter';
import {
  getQueueWorkspaceConfig,
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  resolveQueueConfig,
  type QueueConfig,
} from './queuePageUtils';
import type { HighlightType } from '../../types/animation';

const DEFAULT_CONFIG: QueueConfig = {
  queue: [3, 8, 1],
  operation: { type: 'enqueue', value: 9 },
};

type QueueMode = 'normal' | 'circular';
const QUEUE_WORKSPACE_CONFIG = getQueueWorkspaceConfig();

function createRandomQueueValue(): number {
  return Math.floor(Math.random() * 90) + 10;
}

function runtimeSeedsEqual(left: QueueRuntimeSnapshot | null, right: QueueRuntimeSnapshot | null): boolean {
  if (left === right) {
    return true;
  }
  if (!left || !right) {
    return false;
  }
  return (
    left.frontIndex === right.frontIndex &&
    left.rearIndex === right.rearIndex &&
    left.size === right.size &&
    left.queueState.length === right.queueState.length &&
    left.bufferState.length === right.bufferState.length &&
    left.queueState.every((value, index) => value === right.queueState[index]) &&
    left.bufferState.every((value, index) => value === right.bufferState[index])
  );
}

function cloneQueueConfig(config: QueueConfig): QueueConfig {
  return {
    queue: [...config.queue],
    operation:
      config.operation.type === 'enqueue'
        ? { type: 'enqueue', value: config.operation.value }
        : { type: config.operation.type },
  };
}

function shouldShowQueueFrontPointer(size: number, frontIndex: number, rearIndex: number, index: number): boolean {
  return index === frontIndex && (size > 0 || frontIndex === rearIndex);
}

export function QueuePage() {
  const { t } = useI18n();

  const [mode, setMode] = useState<QueueMode>('normal');
  const [queueInput, setQueueInput] = useState(DEFAULT_CONFIG.queue.join(', '));
  const [operationType, setOperationType] = useState<QueueConfig['operation']['type']>(DEFAULT_CONFIG.operation.type);
  const [valueInput, setValueInput] = useState(
    String(DEFAULT_CONFIG.operation.type === 'enqueue' ? DEFAULT_CONFIG.operation.value : ''),
  );
  const [error, setError] = useState('');
  const [hasValidConfig, setHasValidConfig] = useState(true);
  const [queueConfig, setQueueConfig] = useState<QueueConfig>(DEFAULT_CONFIG);
  const [runtimeSeed, setRuntimeSeed] = useState<QueueRuntimeSnapshot | null>(null);
  const queueCellsRef = useRef<HTMLDivElement | null>(null);
  const runtimeMode: QueueRuntimeMode = mode === 'circular' ? 'circular' : 'normal';

  const { status, speedMs, currentFrame, setSpeed, setTotalFrames, play, pause, next, prev, reset } = useTimelinePlayer(0);
  const currentStep = currentFrame;

  const recomputeInputState = useCallback(
    (nextQueueInput: string, nextOperationType: QueueConfig['operation']['type'], nextValueInput: string) => {
      const resolved = resolveQueueConfig(nextQueueInput, nextOperationType, nextValueInput, runtimeMode, t);
      setError(resolved.error);
      setHasValidConfig(resolved.config !== null);
      if (resolved.config) {
        setQueueConfig(resolved.config);
      }
      return resolved;
    },
    [runtimeMode, t],
  );

  const timelineResult = useMemo(() => {
    try {
      return {
        frames: buildQueueTimelineFromInput(queueConfig.queue, queueConfig.operation, runtimeMode, runtimeSeed ?? undefined),
        runtimeError: '',
      };
    } catch (caughtError) {
      return {
        frames: [],
        runtimeError: caughtError instanceof Error ? caughtError.message : 'Queue timeline build failed',
      };
    }
  }, [queueConfig, runtimeMode, runtimeSeed]);
  const timelineFrames = timelineResult.frames;
  const runtimeError = timelineResult.runtimeError;
  const effectiveError = error || runtimeError;
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const completedQueueText = useMemo(() => {
    const last = steps[steps.length - 1];
    return (last?.queueState ?? []).join(', ');
  }, [steps]);
  const completedRuntimeSeed = useMemo<QueueRuntimeSnapshot | null>(() => {
    const last = steps[steps.length - 1];
    if (!last) {
      return null;
    }
    return {
      queueState: [...last.queueState],
      bufferState: [...last.bufferState],
      frontIndex: last.frontIndex,
      rearIndex: last.rearIndex,
      size: last.size,
    };
  }, [steps]);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [setTotalFrames, reset, steps.length]);

  useEffect(() => {
    if (mode === 'circular') {
      return;
    }

    const container = queueCellsRef.current;
    if (!container || !currentSnapshot) {
      return;
    }

    const activeIndex = currentSnapshot.highlights[0]?.index ?? currentSnapshot.indices[0];
    if (activeIndex === undefined) {
      return;
    }

    const target = container.querySelector<HTMLElement>(`[data-queue-index="${activeIndex}"]`);
    if (!target) {
      return;
    }

    target.scrollIntoView({ inline: 'nearest', behavior: 'smooth' });
  }, [currentStep, currentSnapshot, mode]);

  const syncToCompletedQueue = useCallback(
    (nextOperationType: QueueConfig['operation']['type'], nextValue = valueInput) => {
      if (!completedRuntimeSeed) {
        return;
      }

      const nextQueueInput = completedQueueText;
      reset();
      setQueueInput(nextQueueInput);
      setRuntimeSeed(completedRuntimeSeed);
      setOperationType(nextOperationType);
      if (nextOperationType === 'enqueue') {
        setValueInput(nextValue);
      } else {
        setValueInput('');
      }
      recomputeInputState(nextQueueInput, nextOperationType, nextOperationType === 'enqueue' ? nextValue : '');
    },
    [completedQueueText, completedRuntimeSeed, recomputeInputState, reset, valueInput],
  );

  useEffect(() => {
    if (!hasValidConfig || steps.length === 0 || status !== 'completed' || currentSnapshot?.action !== 'completed' || operationType === 'front') {
      return;
    }

    const queueChanged = queueInput !== completedQueueText || !runtimeSeedsEqual(runtimeSeed, completedRuntimeSeed);
    if (!queueChanged) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (operationType === 'enqueue') {
        syncToCompletedQueue('enqueue', String(createRandomQueueValue()));
        return;
      }

      syncToCompletedQueue(operationType);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    completedQueueText,
    completedRuntimeSeed,
    currentSnapshot?.action,
    hasValidConfig,
    operationType,
    queueInput,
    runtimeSeed,
    status,
    steps.length,
    syncToCompletedQueue,
  ]);

  const handleModeSwitch = useCallback(
    (nextMode: QueueMode) => {
      const nextRuntimeMode: QueueRuntimeMode = nextMode === 'circular' ? 'circular' : 'normal';
      const shouldUseCompletedState = status === 'completed' && currentSnapshot?.action === 'completed';
      const nextQueueInput = shouldUseCompletedState ? completedQueueText : queueInput;
      const nextSeed = shouldUseCompletedState ? completedRuntimeSeed : runtimeSeed;
      const resolved = resolveQueueConfig(nextQueueInput, operationType, valueInput, nextRuntimeMode, t);
      reset();
      setMode(nextMode);
      setQueueInput(nextQueueInput);
      setRuntimeSeed(nextSeed);
      setError(resolved.error);
      setHasValidConfig(resolved.config !== null);
      if (resolved.config) {
        setQueueConfig(resolved.config);
      }
    },
    [completedQueueText, completedRuntimeSeed, currentSnapshot?.action, operationType, queueInput, reset, runtimeSeed, status, t, valueInput],
  );

  const highlightMap = useMemo(() => {
    const map = new Map<number, HighlightType>();
    (currentSnapshot?.highlights ?? []).forEach((item) => map.set(item.index, item.type));
    return map;
  }, [currentSnapshot]);

  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1200 },
    { key: 'module.s01.speed.normal', value: 700 },
    { key: 'module.s01.speed.fast', value: 350 },
  ] as const;

  const currentLength = currentSnapshot?.size ?? 0;
  const frontIndex = currentSnapshot?.frontIndex ?? 0;
  const rearIndex = currentSnapshot?.rearIndex ?? 0;
  const isNormalQueueTailAtEnd = mode === 'normal' && rearIndex >= QUEUE_CAPACITY;
  const isNormalQueueBlocked = mode === 'normal' && rearIndex >= QUEUE_CAPACITY;
  const isQueueFull = mode === 'circular' ? currentLength >= QUEUE_CAPACITY - 1 : isNormalQueueBlocked;
  const fullWarning =
    isQueueFull ? t(mode === 'circular' ? 'module.l05.error.circularFull' : 'module.l05.error.enqueueFull') : '';
  const isWrapped = currentLength > 0 && frontIndex > rearIndex;
  const modeTabs: Array<{ key: QueueMode; labelKey: Parameters<typeof t>[0] }> = [
    { key: 'normal', labelKey: 'module.l05.tab.normal' },
    { key: 'circular', labelKey: 'module.l05.tab.circular' },
  ];
  const isPlayableConfig = hasValidConfig && runtimeError.length === 0;
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const currentModeLabel = t(modeTabs.find((tab) => tab.key === mode)?.labelKey ?? 'module.l05.tab.normal');
  const focusPoint = useMemo(() => {
    if (currentLength === 0) {
      return null;
    }
    const indices = new Set<number>();
    if (typeof frontIndex === 'number') {
      indices.add(frontIndex);
    }
    if (typeof rearIndex === 'number') {
      indices.add(isNormalQueueTailAtEnd ? QUEUE_CAPACITY - 0.35 : rearIndex);
    }
    currentSnapshot?.highlights.forEach((item) => indices.add(item.index));
    if (indices.size === 0) {
      return null;
    }
    const averageIndex = [...indices].reduce((sum, value) => sum + value, 0) / indices.size;
    return {
      x: ((averageIndex + 0.5) / QUEUE_CAPACITY) * 100,
      y: mode === 'circular' ? 52 : 44,
    };
  }, [currentLength, currentSnapshot?.highlights, frontIndex, isNormalQueueTailAtEnd, mode, rearIndex]);
  const highlightSummary =
    (currentSnapshot?.highlights ?? [])
      .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
      .join(' | ') || t('module.s01.none');
  const operationLabel =
    operationType === 'enqueue'
      ? t('module.l05.operation.enqueue')
      : operationType === 'dequeue'
        ? t('module.l05.operation.dequeue')
        : t('module.l05.operation.front');
  const stepDescription = getStepDescription(currentSnapshot, t);
  const queueState = currentSnapshot?.queueState ?? [];
  const bufferState = currentSnapshot?.bufferState ?? [];
  const compactBufferState = useMemo(() => bufferState.filter((value): value is number => value !== null), [bufferState]);
  const showBufferNote =
    mode === 'circular' ||
    frontIndex !== 0 ||
    rearIndex !== currentLength ||
    compactBufferState.length !== queueState.length ||
    compactBufferState.some((value, index) => value !== queueState[index]);

  const handleResetOperation = useCallback(() => {
    const defaultQueueInput = DEFAULT_CONFIG.queue.join(', ');
    const defaultValueInput = String(DEFAULT_CONFIG.operation.type === 'enqueue' ? DEFAULT_CONFIG.operation.value : '');
    const nextMode = mode;
    const nextRuntimeMode: QueueRuntimeMode = nextMode === 'circular' ? 'circular' : 'normal';
    const resolved = resolveQueueConfig(
      defaultQueueInput,
      DEFAULT_CONFIG.operation.type,
      defaultValueInput,
      nextRuntimeMode,
      t,
    );
    reset();
    setMode(nextMode);
    setQueueInput(defaultQueueInput);
    setOperationType(DEFAULT_CONFIG.operation.type);
    setValueInput(defaultValueInput);
    setRuntimeSeed(null);
    setError(resolved.error);
    setHasValidConfig(resolved.config !== null);
    if (resolved.config) {
      setQueueConfig(resolved.config);
    } else {
      setQueueConfig(cloneQueueConfig(DEFAULT_CONFIG));
    }
  }, [mode, reset, t]);

  const stageVisualization = mode === 'circular' ? (
    <div className="queue-ring" aria-label="queue-ring">
      {Array.from({ length: QUEUE_CAPACITY }, (_, index) => {
        const angle = (index / QUEUE_CAPACITY) * Math.PI * 2 - Math.PI / 2;
        const radius = 160;
        const centerX = 210;
        const centerY = 200;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const ux = Math.cos(angle);
        const uy = Math.sin(angle);
        const innerOffset = 34;
        const outerOffset = 26;
        const value = currentSnapshot?.bufferState[index] ?? null;
        const highlight = highlightMap.get(index) ?? 'default';
        const isFront = shouldShowQueueFrontPointer(currentLength, frontIndex, rearIndex, index);
        const isTail = index === rearIndex;
        const isUnused = value === null;

        return (
          <div
            key={`ring-${index}-${String(value)}`}
            data-queue-index={index}
            className={`queue-ring-slot bar-${highlight}${isUnused ? ' queue-ring-slot-unused' : ''}`}
            style={{ left: `${x}px`, top: `${y}px` }}
          >
            {isFront ? (
              <span
                className="queue-ring-pointer queue-ring-pointer-front"
                style={{ left: `calc(50% + ${ux * outerOffset}px)`, top: `calc(50% + ${uy * outerOffset}px)` }}
              >
                F
              </span>
            ) : null}
            {isTail ? (
              <span
                className="queue-ring-pointer queue-ring-pointer-rear"
                style={{ left: `calc(50% - ${ux * innerOffset}px)`, top: `calc(50% - ${uy * innerOffset}px)` }}
              >
                R
              </span>
            ) : null}
            <span className="array-cell-index">{index}</span>
            <strong>{value ?? '∅'}</strong>
          </div>
        );
      })}
    </div>
  ) : (
    <div ref={queueCellsRef} className="array-cells queue-cells" aria-label="queue-cells">
      {Array.from({ length: QUEUE_CAPACITY }, (_, index) => {
        const value = currentSnapshot?.bufferState[index] ?? null;
        const highlight = highlightMap.get(index) ?? 'default';
        const isFront = shouldShowQueueFrontPointer(currentLength, frontIndex, rearIndex, index);
        const isTail = index === rearIndex;
        const isUnused = value === null;

        return (
          <div
            key={`${index}-${String(value)}`}
            data-queue-index={index}
            className={`array-cell bar-${highlight}${isUnused ? ' array-cell-unused' : ''}`}
          >
            {isFront ? <span className="queue-front-pointer">{t('module.l05.front')}</span> : null}
            {isTail ? <span className="queue-rear-pointer">{t('module.l05.rear')}</span> : null}
            <span className="array-cell-index">{index}</span>
            <strong>{value ?? '∅'}</strong>
          </div>
        );
      })}
      {isNormalQueueTailAtEnd ? (
        <div className="queue-tail-endcap">
          {shouldShowQueueFrontPointer(currentLength, frontIndex, rearIndex, QUEUE_CAPACITY) ? (
            <span className="queue-front-pointer queue-front-pointer-end">{t('module.l05.front')}</span>
          ) : null}
          <span className="queue-rear-pointer queue-rear-pointer-end">{t('module.l05.rear')}</span>
          <div className="array-cell array-cell-empty array-cell-unused queue-tail-endcap-cell">
            <strong>∅</strong>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <WorkspaceShell
      pageClassName={QUEUE_WORKSPACE_CONFIG.pageClassName}
      stageAriaLabel={t('module.l05.title')}
      title={t('module.l05.title')}
      description={t('module.l05.body')}
      stageClassName={QUEUE_WORKSPACE_CONFIG.stageClassName}
      stageBodyClassName={QUEUE_WORKSPACE_CONFIG.stageBodyClassName}
      controlsPanelClassName={QUEUE_WORKSPACE_CONFIG.controlsPanelClassName}
      stepPanelClassName="workspace-context-sheet-linear"
      defaultControlsPanelSize={QUEUE_WORKSPACE_CONFIG.controlsPanelSize}
      controlsPanelAutoAvoid={QUEUE_WORKSPACE_CONFIG.controlsPanelAutoAvoid}
      controlsPanelOverflowMargin={QUEUE_WORKSPACE_CONFIG.controlsPanelOverflowMargin}
      defaultContextPanelSize={QUEUE_WORKSPACE_CONFIG.contextPanelSize}
      stepPanelAutoAvoid={QUEUE_WORKSPACE_CONFIG.stepPanelAutoAvoid}
      stepPanelOverflowMargin={QUEUE_WORKSPACE_CONFIG.stepPanelOverflowMargin}
      focusPoint={focusPoint}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('playback.step')}: {currentStep}/{Math.max(steps.length - 1, 0)}
          </span>
          <span className="tree-workspace-pill">{currentModeLabel}</span>
          <span className="tree-workspace-pill">
            {t('module.l01.lengthCapacity')}: {currentLength}/{QUEUE_CAPACITY}
          </span>
          <span className="tree-workspace-pill">{stepDescription}</span>
        </>
      }
      controlsContent={
        <>
          <div className="array-controls-grid queue-controls-grid">
            <div className="tree-workspace-field array-controls-field queue-controls-field-mode">
              <span>{t('module.l05.input.operation')}</span>
              <div className="tree-workspace-toggle-row">
                {modeTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    className={`tree-workspace-toggle${mode === tab.key ? ' tree-workspace-toggle-active' : ''}`}
                    onClick={() => handleModeSwitch(tab.key)}
                  >
                    {t(tab.labelKey)}
                  </button>
                ))}
              </div>
            </div>

              <label className="tree-workspace-field array-controls-field queue-controls-field-queue" htmlFor="queue-input">
                <span>{t('module.l05.input.queue')}</span>
                <input
                  id="queue-input"
                  type="text"
                  value={queueInput}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    reset();
                    setRuntimeSeed(null);
                    setQueueInput(nextValue);
                    recomputeInputState(nextValue, operationType, valueInput);
                  }}
                  placeholder="3, 8, 1"
                />
            </label>

            <label className="tree-workspace-field array-controls-field" htmlFor="queue-operation">
                <span>{t('module.l05.input.operation')}</span>
                <select
                  id="queue-operation"
                  value={operationType}
                  onChange={(event) => {
                    const nextValue = event.target.value as QueueConfig['operation']['type'];
                    const shouldUseCompletedState = status === 'completed' && currentSnapshot?.action === 'completed';
                    const nextQueueInput = shouldUseCompletedState ? completedQueueText : queueInput;
                    const nextSeed = shouldUseCompletedState ? completedRuntimeSeed : runtimeSeed;
                    reset();
                    setOperationType(nextValue);
                    setQueueInput(nextQueueInput);
                    setRuntimeSeed(nextSeed);
                    const normalized = nextValue === 'enqueue' ? String(createRandomQueueValue()) : '';
                    if (nextValue !== 'enqueue') {
                      setValueInput('');
                    } else {
                      setValueInput(normalized);
                    }
                    recomputeInputState(nextQueueInput, nextValue, normalized);
                  }}
                >
                  <option value="enqueue">{t('module.l05.operation.enqueue')}</option>
                  <option value="dequeue">{t('module.l05.operation.dequeue')}</option>
                  <option value="front">{t('module.l05.operation.front')}</option>
                </select>
            </label>

            {operationType === 'enqueue' ? (
              <label className="tree-workspace-field array-controls-field" htmlFor="queue-value">
                  <span>{t('module.l05.input.value')}</span>
                  <input
                    id="queue-value"
                    type="number"
                    value={valueInput}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      reset();
                      setRuntimeSeed(null);
                      setValueInput(nextValue);
                      recomputeInputState(queueInput, operationType, nextValue);
                    }}
                  />
              </label>
            ) : null}

            <div className="tree-workspace-field array-controls-field array-controls-field-speed">
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

          <p className={`workspace-inline-feedback array-controls-feedback${effectiveError ? ' form-error' : ''}`} aria-live="polite">
            {effectiveError || ''}
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
                <span>{t('module.l05.input.operation')}</span>
                <strong>{operationLabel}</strong>
              </div>
              <div className="linear-controls-card">
                <span>{currentModeLabel}</span>
                <strong>
                  F={frontIndex} / R={rearIndex}
                </strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('module.l01.lengthCapacity')}</span>
                <strong>
                  {currentLength}/{QUEUE_CAPACITY}
                </strong>
              </div>
            </div>

            <div className="linear-controls-note-grid">
              <p className="linear-controls-note">{stepDescription}</p>
              <p className="linear-controls-note">
                {t('module.l05.currentQueue')}: [{queueState.join(', ')}]
              </p>
              {showBufferNote ? <p className="linear-controls-note">BUFFER: [{bufferState.map((value) => (value ?? '∅')).join(', ')}]</p> : null}
              <p className="linear-controls-note">
                {currentModeLabel}: F={frontIndex} / R={rearIndex}
              </p>
              {mode === 'circular' ? (
                <p className="linear-controls-note">{isWrapped ? t('module.l05.circular.wrapped') : t('module.l05.circular.tip')}</p>
              ) : null}
              <p className="linear-controls-note linear-controls-note-wide">
                {t('module.s01.highlight')}: {highlightSummary}
              </p>
            </div>
          </div>
        </>
      }
      stepContent={
        <div className="workspace-panel-scroll workspace-panel-scroll-linear">
          <div className="workspace-panel-code-only">
            <div className="workspace-panel-linear-code">
              <div className="pseudocode-block pseudocode-block-linear">
                <h3>{t('module.l05.pseudocode')}</h3>
                <ol>
                  <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.l05.code.line1')}</li>
                  <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.l05.code.line2')}</li>
                  <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.l05.code.line3')}</li>
                  <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.l05.code.line4')}</li>
                  <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.l05.code.line5')}</li>
                  <li className={currentSnapshot?.codeLines.includes(6) ? 'code-active' : ''}>{t('module.l05.code.line6')}</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      }
      stageContent={
        <div className="queue-stage-layout">
          {fullWarning ? (
            <p className="queue-stage-warning dynamic-array-capacity-full" aria-live="polite">
              {fullWarning}
            </p>
          ) : null}
          {stageVisualization}
        </div>
      }
      transportLeft={
        <>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={prev}
            disabled={!isPlayableConfig || steps.length === 0 || currentStep <= 0}
          >
            {t('playback.prev')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn tree-workspace-transport-btn-primary"
            onClick={status === 'playing' ? pause : play}
            disabled={!isPlayableConfig || steps.length === 0 || (status !== 'playing' && isAtLastFrame)}
          >
            {status === 'playing' ? t('playback.pause') : t('playback.play')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={next}
            disabled={!isPlayableConfig || isAtLastFrame}
          >
            {t('playback.next')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={handleResetOperation}
            disabled={!isPlayableConfig || steps.length === 0}
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
          <span className="tree-workspace-transport-chip">{currentModeLabel}</span>
          <span className="tree-workspace-transport-chip">F:{frontIndex}</span>
          <span className="tree-workspace-transport-chip">R:{rearIndex}</span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {currentLength}/{QUEUE_CAPACITY}
          </span>
        </>
      }
    />
  );
}
