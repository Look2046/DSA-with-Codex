import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { QUEUE_CAPACITY, type QueueMode as QueueRuntimeMode, type QueueRuntimeSnapshot } from '../../modules/linear/queueOps';
import { buildQueueTimelineFromInput } from '../../modules/linear/queueTimelineAdapter';
import {
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  resolveQueueConfig,
  resolveQueueConfigFromJson,
  serializeQueueConfigAsJson,
  type QueueConfig,
} from './queuePageUtils';
import type { HighlightType } from '../../types/animation';

const DEFAULT_CONFIG: QueueConfig = {
  queue: [3, 8, 1],
  operation: { type: 'enqueue', value: 9 },
};

type QueueMode = 'normal' | 'circular' | 'deque';

function createRandomQueueValue(): number {
  return Math.floor(Math.random() * 90) + 10;
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
  const [jsonInput, setJsonInput] = useState('');
  const [jsonFeedback, setJsonFeedback] = useState('');
  const [hasJsonError, setHasJsonError] = useState(false);
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
    if (mode === 'circular' || mode === 'deque') {
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

  const handleExportJson = useCallback(() => {
    setJsonInput(serializeQueueConfigAsJson(queueConfig));
    setHasJsonError(false);
    setJsonFeedback(t('module.l05.json.exported'));
  }, [queueConfig, t]);

  const handleImportJson = useCallback(() => {
    const resolved = resolveQueueConfigFromJson(jsonInput, runtimeMode, t);
    if (!resolved.config) {
      setHasJsonError(true);
      setJsonFeedback(resolved.error);
      return;
    }

    const nextQueueInput = resolved.config.queue.join(', ');
    const nextOperationType = resolved.config.operation.type;
    const nextValueInput = resolved.config.operation.type === 'enqueue' ? String(resolved.config.operation.value) : '';

    reset();
    setRuntimeSeed(null);
    setQueueInput(nextQueueInput);
    setOperationType(nextOperationType);
    setValueInput(nextValueInput);
    recomputeInputState(nextQueueInput, nextOperationType, nextValueInput);
    setHasJsonError(false);
    setJsonFeedback(t('module.l05.json.imported'));
  }, [jsonInput, recomputeInputState, reset, runtimeMode, t]);

  const handleNextStep = useCallback(() => {
    if (status === 'completed' && operationType !== 'front') {
      const nextQueueInput = completedQueueText;
      const nextValueInput = operationType === 'enqueue' ? String(createRandomQueueValue()) : valueInput;
      const resolved = resolveQueueConfig(nextQueueInput, operationType, nextValueInput, runtimeMode, t);
      if (!resolved.config) {
        setQueueInput(nextQueueInput);
        setRuntimeSeed(null);
        setError(resolved.error);
        setHasValidConfig(false);
        return;
      }

      setQueueInput(nextQueueInput);
      if (operationType === 'enqueue') {
        setValueInput(nextValueInput);
      }
      setRuntimeSeed(completedRuntimeSeed);
      setError(resolved.error);
      setHasValidConfig(true);
      setQueueConfig(resolved.config);
      reset();
      window.setTimeout(() => {
        next();
      }, 0);
      return;
    }
    next();
  }, [completedQueueText, completedRuntimeSeed, next, operationType, reset, runtimeMode, status, t, valueInput]);

  const handleModeSwitch = useCallback(
    (nextMode: QueueMode) => {
      const nextRuntimeMode: QueueRuntimeMode = nextMode === 'circular' ? 'circular' : 'normal';
      const nextQueueInput = status === 'completed' && operationType !== 'front' ? completedQueueText : queueInput;
      const nextSeed = status === 'completed' ? completedRuntimeSeed : runtimeSeed;
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
    [completedQueueText, completedRuntimeSeed, operationType, queueInput, reset, runtimeSeed, status, t, valueInput],
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
  const isWrapped = currentLength > 0 && frontIndex > rearIndex;
  const modeTabs: Array<{ key: QueueMode; labelKey: Parameters<typeof t>[0] }> = [
    { key: 'normal', labelKey: 'module.l05.tab.normal' },
    { key: 'circular', labelKey: 'module.l05.tab.circular' },
    { key: 'deque', labelKey: 'module.l05.tab.deque' },
  ];
  const isDequeMode = mode === 'deque';
  const isPlayableConfig = hasValidConfig && runtimeError.length === 0 && !isDequeMode;
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const currentModeLabel = t(modeTabs.find((tab) => tab.key === mode)?.labelKey ?? 'module.l05.tab.normal');
  const focusPoint = useMemo(() => {
    if (isDequeMode || currentLength === 0) {
      return null;
    }
    const indices = new Set<number>();
    if (typeof frontIndex === 'number') {
      indices.add(frontIndex);
    }
    if (typeof rearIndex === 'number') {
      indices.add(rearIndex);
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
  }, [currentLength, currentSnapshot?.highlights, frontIndex, isDequeMode, mode, rearIndex]);
  const highlightSummary =
    (currentSnapshot?.highlights ?? [])
      .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
      .join(' | ') || t('module.s01.none');
  const pendingText = t('module.l05.deque.pending');
  const operationLabel =
    operationType === 'enqueue'
      ? t('module.l05.operation.enqueue')
      : operationType === 'dequeue'
        ? t('module.l05.operation.dequeue')
        : t('module.l05.operation.front');

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page"
      stageAriaLabel={t('module.l05.title')}
      title={t('module.l05.title')}
      description={t('module.l05.body')}
      stageClassName="workspace-stage-array"
      stageBodyClassName="workspace-stage-body-array"
      controlsPanelClassName="workspace-drawer-xl workspace-drawer-scroll"
      stepPanelClassName="workspace-context-sheet-wide workspace-context-sheet-rich"
      defaultControlsPanelSize={{ width: 344, height: 640 }}
      defaultContextPanelSize={{ width: 332, height: 560 }}
      focusPoint={focusPoint}
      stageMeta={
        isDequeMode ? (
          <>
            <span className="tree-workspace-pill tree-workspace-pill-active">{currentModeLabel}</span>
            <span className="tree-workspace-pill">{pendingText}</span>
          </>
        ) : (
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
            <span className="tree-workspace-pill">{getStepDescription(currentSnapshot, t)}</span>
          </>
        )
      }
      controlsContent={
        <>
          <div className="tree-workspace-field">
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

          {isDequeMode ? (
            <div className="tree-workspace-sample-block">
              <span>{t('module.l05.tab.deque')}</span>
              <code>{pendingText}</code>
            </div>
          ) : (
            <>
              <label className="tree-workspace-field" htmlFor="queue-input">
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

              <label className="tree-workspace-field" htmlFor="queue-operation">
                <span>{t('module.l05.input.operation')}</span>
                <select
                  id="queue-operation"
                  value={operationType}
                  onChange={(event) => {
                    const nextValue = event.target.value as QueueConfig['operation']['type'];
                    const nextQueueInput = status === 'completed' && operationType !== 'front' ? completedQueueText : queueInput;
                    const nextSeed = status === 'completed' ? completedRuntimeSeed : runtimeSeed;
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
                <label className="tree-workspace-field" htmlFor="queue-value">
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

              <div className="tree-workspace-field">
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

              <label className="tree-workspace-field" htmlFor="queue-json-input">
                <span>{t('module.l05.json.label')}</span>
                <textarea
                  id="queue-json-input"
                  value={jsonInput}
                  onChange={(event) => setJsonInput(event.target.value)}
                  rows={6}
                  placeholder={t('module.l05.json.placeholder')}
                />
              </label>

              {effectiveError ? <p className="form-error workspace-inline-feedback">{effectiveError}</p> : null}
              {jsonFeedback ? (
                <p className={`${hasJsonError ? 'form-error' : 'array-preview'} workspace-inline-feedback`}>{jsonFeedback}</p>
              ) : null}

              <div className="tree-workspace-drawer-actions">
                <button type="button" className="tree-workspace-ghost-button" onClick={handleExportJson}>
                  {t('module.l05.json.export')}
                </button>
                <button type="button" className="tree-workspace-ghost-button" onClick={handleImportJson}>
                  {t('module.l05.json.import')}
                </button>
              </div>
            </>
          )}
        </>
      }
      stepContent={
        <div className="workspace-panel-scroll">
          {isDequeMode ? (
            <div className="workspace-panel-copy">
              <h3>{currentModeLabel}</h3>
              <p>{pendingText}</p>
            </div>
          ) : (
            <>
              <div className="workspace-panel-copy">
                <h3>{getStepDescription(currentSnapshot, t)}</h3>
                <p>
                  {t('module.l05.currentQueue')}: [{(currentSnapshot?.queueState ?? []).join(', ')}]
                </p>
                <p>
                  {t('module.l01.lengthCapacity')}: {currentLength}/{QUEUE_CAPACITY} | FRONT={frontIndex} | REAR={rearIndex}
                </p>
              </div>

              <dl className="tree-workspace-kv">
                <div>
                  <dt>{t('playback.status')}</dt>
                  <dd>{getStatusLabel(status, t)}</dd>
                </div>
                <div>
                  <dt>{t('playback.step')}</dt>
                  <dd>
                    {currentStep}/{Math.max(steps.length - 1, 0)}
                  </dd>
                </div>
                <div>
                  <dt>{t('module.l05.input.operation')}</dt>
                  <dd>{operationLabel}</dd>
                </div>
                <div>
                  <dt>{currentModeLabel}</dt>
                  <dd>
                    F={frontIndex} / R={rearIndex}
                  </dd>
                </div>
                <div>
                  <dt>{t('module.s01.highlight')}</dt>
                  <dd>{highlightSummary}</dd>
                </div>
              </dl>

              <div className="legend-row">
                <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
                <span className="legend-item legend-inserted">{t('module.l05.highlight.enqueued')}</span>
                <span className="legend-item legend-moving">{t('module.l05.highlight.dequeued')}</span>
                <span className="legend-item legend-matched">{t('module.l05.highlight.front')}</span>
              </div>

              <p className={mode === 'circular' ? 'array-preview' : 'array-preview module-status-placeholder'}>
                {mode === 'circular' ? (isWrapped ? t('module.l05.circular.wrapped') : t('module.l05.circular.tip')) : '-'}
              </p>

              <div className="pseudocode-block">
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
            </>
          )}
        </div>
      }
      stageContent={
        isDequeMode ? (
          <div className="stack-empty">{pendingText}</div>
        ) : mode === 'circular' ? (
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
              const isFront = index === frontIndex;
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
              const isFront = index === frontIndex;
              const isTail = index === rearIndex;
              const isUnused = value === null;

              return (
                <div
                  key={`${index}-${String(value)}`}
                  data-queue-index={index}
                  className={`array-cell bar-${highlight}${isUnused ? ' array-cell-unused' : ''}`}
                >
                  {isFront ? <span className="array-insert-pointer">{t('module.l05.front')}</span> : null}
                  {isTail ? <span className="queue-tail-pointer">{t('module.l05.rear')}</span> : null}
                  <span className="array-cell-index">{index}</span>
                  <strong>{value ?? '∅'}</strong>
                </div>
              );
            })}
          </div>
        )
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
            onClick={handleNextStep}
            disabled={!isPlayableConfig || isAtLastFrame}
          >
            {t('playback.next')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={reset}
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
            {isDequeMode ? '-' : `${currentStep}/${Math.max(steps.length - 1, 0)}`}
          </span>
        </>
      }
      transportRight={
        isDequeMode ? (
          <span className="tree-workspace-transport-empty">{pendingText}</span>
        ) : (
          <>
            <span className="tree-workspace-transport-chip">{currentModeLabel}</span>
            <span className="tree-workspace-transport-chip">F:{frontIndex}</span>
            <span className="tree-workspace-transport-chip">R:{rearIndex}</span>
            <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
              {currentLength}/{QUEUE_CAPACITY}
            </span>
          </>
        )
      }
    />
  );
}
