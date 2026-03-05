import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { useI18n } from '../../i18n/useI18n';
import { QUEUE_CAPACITY } from '../../modules/linear/queueOps';
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

export function QueuePage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [mode, setMode] = useState<QueueMode>('normal');
  const [queueInput, setQueueInput] = useState(DEFAULT_CONFIG.queue.join(', '));
  const [operationType, setOperationType] = useState<QueueConfig['operation']['type']>(DEFAULT_CONFIG.operation.type);
  const [valueInput, setValueInput] = useState(String(DEFAULT_CONFIG.operation.type === 'enqueue' ? DEFAULT_CONFIG.operation.value : ''));
  const [error, setError] = useState('');
  const [hasValidConfig, setHasValidConfig] = useState(true);
  const [queueConfig, setQueueConfig] = useState<QueueConfig>(DEFAULT_CONFIG);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonFeedback, setJsonFeedback] = useState('');
  const [hasJsonError, setHasJsonError] = useState(false);
  const queueCellsRef = useRef<HTMLDivElement | null>(null);

  const { status, speedMs, currentFrame, setSpeed, setTotalFrames, play, pause, next, prev, reset } = useTimelinePlayer(0);
  const currentStep = currentFrame;

  const recomputeInputState = useCallback(
    (nextQueueInput: string, nextOperationType: QueueConfig['operation']['type'], nextValueInput: string) => {
      const resolved = resolveQueueConfig(nextQueueInput, nextOperationType, nextValueInput, t);
      setError(resolved.error);
      setHasValidConfig(resolved.config !== null);
      if (resolved.config) {
        setQueueConfig(resolved.config);
      }
    },
    [t],
  );

  const timelineFrames = useMemo(
    () => buildQueueTimelineFromInput(queueConfig.queue, queueConfig.operation),
    [queueConfig],
  );
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const completedQueueText = useMemo(() => {
    const last = steps[steps.length - 1];
    return (last?.queueState ?? []).join(', ');
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

  const syncInputToCompletedQueue = useCallback(() => {
    if (!hasValidConfig || steps.length === 0) {
      return;
    }
    if (operationType === 'front') {
      return;
    }
    if (queueInput === completedQueueText) {
      return;
    }

    reset();
    setQueueInput(completedQueueText);
    recomputeInputState(completedQueueText, operationType, valueInput);
  }, [completedQueueText, hasValidConfig, operationType, queueInput, recomputeInputState, reset, steps.length, valueInput]);

  useEffect(() => {
    if (!hasValidConfig || steps.length === 0) {
      return;
    }

    if (operationType === 'front') {
      return;
    }

    if (currentSnapshot?.action !== 'enqueue' && currentSnapshot?.action !== 'dequeue' && currentSnapshot?.action !== 'completed') {
      return;
    }

    if (queueInput === completedQueueText) {
      return;
    }

    const timer = window.setTimeout(() => {
      syncInputToCompletedQueue();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [completedQueueText, currentSnapshot?.action, hasValidConfig, operationType, queueInput, steps.length, syncInputToCompletedQueue]);

  const handleExportJson = useCallback(() => {
    setJsonInput(serializeQueueConfigAsJson(queueConfig));
    setHasJsonError(false);
    setJsonFeedback(t('module.l05.json.exported'));
  }, [queueConfig, t]);

  const handleImportJson = useCallback(() => {
    const resolved = resolveQueueConfigFromJson(jsonInput, t);
    if (!resolved.config) {
      setHasJsonError(true);
      setJsonFeedback(resolved.error);
      return;
    }

    const nextQueueInput = resolved.config.queue.join(', ');
    const nextOperationType = resolved.config.operation.type;
    const nextValueInput = resolved.config.operation.type === 'enqueue' ? String(resolved.config.operation.value) : '';

    reset();
    setQueueInput(nextQueueInput);
    setOperationType(nextOperationType);
    setValueInput(nextValueInput);
    recomputeInputState(nextQueueInput, nextOperationType, nextValueInput);
    setHasJsonError(false);
    setJsonFeedback(t('module.l05.json.imported'));
  }, [jsonInput, recomputeInputState, reset, t]);

  const handleNextStep = useCallback(() => {
    const willComplete = currentStep >= steps.length - 2;
    next();
    if (willComplete) {
      syncInputToCompletedQueue();
    }
  }, [currentStep, next, steps.length, syncInputToCompletedQueue]);

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
  const frontIndex = currentSnapshot?.frontIndex ?? -1;
  const rearIndex = currentSnapshot?.rearIndex ?? -1;
  const isWrapped = currentLength > 0 && frontIndex > rearIndex;
  const modeTabs: Array<{ key: QueueMode; labelKey: Parameters<typeof t>[0] }> = [
    { key: 'normal', labelKey: 'module.l05.tab.normal' },
    { key: 'circular', labelKey: 'module.l05.tab.circular' },
    { key: 'deque', labelKey: 'module.l05.tab.deque' },
  ];

  return (
    <section className="array-page">
      <h2>{t('module.l05.title')}</h2>
      <p>{t('module.l05.body')}</p>

      <div className="modules-filter-row">
        {modeTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`modules-filter-btn${mode === tab.key ? ' modules-filter-btn-active' : ''}`}
            onClick={() => {
              reset();
              setMode(tab.key);
            }}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {mode === 'deque' ? (
        <p className="array-preview">{t('module.l05.deque.pending')}</p>
      ) : (
        <>
          <div className="array-form">
            <label htmlFor="queue-input">
              <span>{t('module.l05.input.queue')}</span>
              <input
                id="queue-input"
                value={queueInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  reset();
                  setQueueInput(nextValue);
                  recomputeInputState(nextValue, operationType, valueInput);
                }}
                placeholder="3, 8, 1"
              />
            </label>
            <label htmlFor="queue-operation">
              <span>{t('module.l05.input.operation')}</span>
              <select
                id="queue-operation"
                value={operationType}
                onChange={(event) => {
                  const nextValue = event.target.value as QueueConfig['operation']['type'];
                  reset();
                  setOperationType(nextValue);
                  const normalized = nextValue === 'enqueue' ? valueInput : '';
                  if (nextValue !== 'enqueue') {
                    setValueInput('');
                  }
                  recomputeInputState(queueInput, nextValue, normalized);
                }}
              >
                <option value="enqueue">{t('module.l05.operation.enqueue')}</option>
                <option value="dequeue">{t('module.l05.operation.dequeue')}</option>
                <option value="front">{t('module.l05.operation.front')}</option>
              </select>
            </label>
            {operationType === 'enqueue' ? (
              <label htmlFor="queue-value">
                <span>{t('module.l05.input.value')}</span>
                <input
                  id="queue-value"
                  type="number"
                  value={valueInput}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    reset();
                    setValueInput(nextValue);
                    recomputeInputState(queueInput, operationType, nextValue);
                  }}
                />
              </label>
            ) : null}
          </div>

          {error ? <p className="form-error">{error}</p> : null}

          <div className="array-form">
            <label htmlFor="queue-json-input">
              <span>{t('module.l05.json.label')}</span>
              <textarea
                id="queue-json-input"
                value={jsonInput}
                onChange={(event) => setJsonInput(event.target.value)}
                rows={6}
                placeholder={t('module.l05.json.placeholder')}
              />
            </label>
          </div>
          <div className="playback-actions">
            <button type="button" onClick={handleExportJson}>
              {t('module.l05.json.export')}
            </button>
            <button type="button" onClick={handleImportJson}>
              {t('module.l05.json.import')}
            </button>
          </div>
          {jsonFeedback ? <p className={hasJsonError ? 'form-error' : 'array-preview'}>{jsonFeedback}</p> : null}

          <div className="bubble-toolbar">
            <span>{t('module.s01.speed')}</span>
            <div className="speed-group">
              {speedOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className={speedMs === option.value ? 'speed-active' : ''}
                  onClick={() => setSpeed(option.value)}
                >
                  {t(option.key)}
                </button>
              ))}
            </div>
          </div>

          <p>
            {t('module.s01.moduleLabel')}: {currentModule?.id ?? '-'} | {t('playback.step')}: {currentStep}/
            {Math.max(steps.length - 1, 0)} | {t('playback.status')}: {getStatusLabel(status, t)}
          </p>

          <p>{getStepDescription(currentSnapshot, t)}</p>
          <p className="array-preview">
            {t('module.l05.currentQueue')}: [{(currentSnapshot?.queueState ?? []).join(', ')}]
          </p>
          <p className="array-preview">
            {t('module.l01.lengthCapacity')}: {currentLength}/{QUEUE_CAPACITY} | FRONT={frontIndex} | REAR={rearIndex}
          </p>
          {mode === 'circular' ? (
            <p className="array-preview">{isWrapped ? t('module.l05.circular.wrapped') : t('module.l05.circular.tip')}</p>
          ) : null}
          <p>
            {t('module.s01.highlight')}:{' '}
            {(currentSnapshot?.highlights ?? [])
              .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
              .join(' | ') || t('module.s01.none')}
          </p>

          <VisualizationCanvas
            title={t('module.l05.title')}
            subtitle={mode === 'circular' ? t('module.l05.stage.circular') : t('module.l05.stage')}
            stageClassName="viz-canvas-stage-array"
          >
            {mode === 'circular' ? (
              <div className="queue-ring" aria-label="queue-ring">
                {Array.from({ length: QUEUE_CAPACITY }, (_, index) => {
                  const angle = (index / QUEUE_CAPACITY) * Math.PI * 2 - Math.PI / 2;
                  const radius = 160;
                  const centerX = 210;
                  const centerY = 200;
                  const x = centerX + Math.cos(angle) * radius;
                  const y = centerY + Math.sin(angle) * radius;
                  const value = currentSnapshot?.bufferState[index] ?? null;
                  const highlight = highlightMap.get(index) ?? 'default';
                  const isFront = currentLength > 0 && index === frontIndex;
                  const isTail = currentLength > 0 && index === rearIndex;
                  const isUnused = value === null;

                  return (
                    <div
                      key={`ring-${index}-${String(value)}`}
                      data-queue-index={index}
                      className={`queue-ring-slot bar-${highlight}${isUnused ? ' queue-ring-slot-unused' : ''}`}
                      style={{ left: `${x}px`, top: `${y}px` }}
                    >
                      {isFront ? <span className="queue-ring-pointer queue-ring-pointer-front">F</span> : null}
                      {isTail ? <span className="queue-ring-pointer queue-ring-pointer-rear">R</span> : null}
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
                  const isFront = currentLength > 0 && index === frontIndex;
                  const isTail = currentLength > 0 && index === rearIndex;
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
            )}
          </VisualizationCanvas>

          <div className="legend-row">
            <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
            <span className="legend-item legend-inserted">{t('module.l05.highlight.enqueued')}</span>
            <span className="legend-item legend-moving">{t('module.l05.highlight.dequeued')}</span>
            <span className="legend-item legend-matched">{t('module.l05.highlight.front')}</span>
          </div>

          <div className="playback-actions">
            <button type="button" onClick={play} disabled={status === 'playing' || !hasValidConfig || steps.length === 0}>
              {t('playback.play')}
            </button>
            <button type="button" onClick={pause} disabled={status !== 'playing'}>
              {t('playback.pause')}
            </button>
            <button type="button" onClick={prev} disabled={!hasValidConfig || steps.length === 0}>
              {t('playback.prev')}
            </button>
            <button type="button" onClick={handleNextStep} disabled={!hasValidConfig || steps.length === 0}>
              {t('playback.next')}
            </button>
            <button type="button" onClick={reset} disabled={!hasValidConfig || steps.length === 0}>
              {t('playback.reset')}
            </button>
          </div>

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
    </section>
  );
}
