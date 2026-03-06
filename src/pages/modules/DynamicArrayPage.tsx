import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { useI18n } from '../../i18n/useI18n';
import { buildDynamicArrayTimelineFromInput } from '../../modules/linear/dynamicArrayTimelineAdapter';
import {
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  resolveDynamicArrayConfig,
  resolveDynamicArrayConfigFromJson,
  serializeDynamicArrayConfigAsJson,
  type DynamicArrayConfig,
} from './dynamicArrayPageUtils';
import type { HighlightType } from '../../types/animation';

const DEFAULT_CONFIG: DynamicArrayConfig = {
  array: [3, 8],
  capacity: 2,
  operation: { type: 'append', value: 9 },
};

function createRandomAppendValue(): number {
  return Math.floor(Math.random() * 90) + 10;
}

export function DynamicArrayPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [arrayInput, setArrayInput] = useState(DEFAULT_CONFIG.array.join(', '));
  const [capacityInput, setCapacityInput] = useState(String(DEFAULT_CONFIG.capacity));
  const [valueInput, setValueInput] = useState(String(DEFAULT_CONFIG.operation.value));
  const [error, setError] = useState('');
  const [hasValidConfig, setHasValidConfig] = useState(true);
  const [config, setConfig] = useState<DynamicArrayConfig>(DEFAULT_CONFIG);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonFeedback, setJsonFeedback] = useState('');
  const [hasJsonError, setHasJsonError] = useState(false);
  const [fullWarningFlash, setFullWarningFlash] = useState(false);
  const arrayCellsRef = useRef<HTMLDivElement | null>(null);
  const fullWarningTimerRef = useRef<number | null>(null);

  const { status, speedMs, currentFrame, setSpeed, setTotalFrames, play, pause, next, prev, reset } = useTimelinePlayer(0);
  const currentStep = currentFrame;

  const recomputeInputState = useCallback(
    (nextArrayInput: string, nextCapacityInput: string, nextValueInput: string) => {
      const resolved = resolveDynamicArrayConfig(nextArrayInput, nextCapacityInput, nextValueInput, t);
      setError(resolved.error);
      setHasValidConfig(resolved.config !== null);
      if (resolved.config) {
        setConfig(resolved.config);
      }
    },
    [t],
  );

  const timelineFrames = useMemo(
    () => buildDynamicArrayTimelineFromInput(config.array, config.capacity, config.operation),
    [config],
  );
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentSnapshot = steps[currentStep] ?? steps[0];

  const completedArrayText = useMemo(() => {
    const last = steps[steps.length - 1];
    return (last?.arrayState ?? []).join(', ');
  }, [steps]);

  const completedCapacityText = useMemo(() => {
    const last = steps[steps.length - 1];
    return String(last?.capacity ?? config.capacity);
  }, [config.capacity, steps]);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [setTotalFrames, reset, steps.length]);

  useEffect(() => {
    const container = arrayCellsRef.current;
    if (!container || !currentSnapshot) {
      return;
    }

    const activeIndex = currentSnapshot.highlights[0]?.index ?? currentSnapshot.indices[0];
    if (activeIndex === undefined) {
      return;
    }

    const target = container.querySelector<HTMLElement>(`[data-array-index="${activeIndex}"]`);
    if (!target) {
      return;
    }

    target.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'auto' });
  }, [currentStep, currentSnapshot]);

  const syncInputToCompletedState = useCallback((nextValueInput = valueInput) => {
    if (!hasValidConfig || steps.length === 0) {
      return;
    }

    if (arrayInput === completedArrayText && capacityInput === completedCapacityText) {
      return;
    }

    reset();
    setArrayInput(completedArrayText);
    setCapacityInput(completedCapacityText);
    recomputeInputState(completedArrayText, completedCapacityText, nextValueInput);
  }, [arrayInput, capacityInput, completedArrayText, completedCapacityText, hasValidConfig, recomputeInputState, reset, steps.length, valueInput]);

  useEffect(() => {
    if (!hasValidConfig || steps.length === 0) {
      return;
    }

    if (currentSnapshot?.action !== 'completed') {
      return;
    }

    if (arrayInput === completedArrayText && capacityInput === completedCapacityText) {
      return;
    }

    const timer = window.setTimeout(() => {
      syncInputToCompletedState();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    arrayInput,
    capacityInput,
    completedArrayText,
    completedCapacityText,
    currentSnapshot?.action,
    hasValidConfig,
    steps.length,
    syncInputToCompletedState,
  ]);

  const handleExportJson = useCallback(() => {
    setJsonInput(serializeDynamicArrayConfigAsJson(config));
    setHasJsonError(false);
    setJsonFeedback(t('module.l02.json.exported'));
  }, [config, t]);

  const handleImportJson = useCallback(() => {
    const resolved = resolveDynamicArrayConfigFromJson(jsonInput, t);
    if (!resolved.config) {
      setHasJsonError(true);
      setJsonFeedback(resolved.error);
      return;
    }

    const nextArrayInput = resolved.config.array.join(', ');
    const nextCapacityInput = String(resolved.config.capacity);
    const nextValueInput = String(resolved.config.operation.value);

    reset();
    setArrayInput(nextArrayInput);
    setCapacityInput(nextCapacityInput);
    setValueInput(nextValueInput);
    recomputeInputState(nextArrayInput, nextCapacityInput, nextValueInput);
    setHasJsonError(false);
    setJsonFeedback(t('module.l02.json.imported'));
  }, [jsonInput, recomputeInputState, reset, t]);

  const handleNextStep = useCallback(() => {
    const activeLength = currentSnapshot?.size ?? 0;
    const activeCapacity = currentSnapshot?.capacity ?? config.capacity;
    const isFullNow = activeLength === activeCapacity;
    if (isFullNow) {
      setFullWarningFlash(true);
      if (fullWarningTimerRef.current !== null) {
        window.clearTimeout(fullWarningTimerRef.current);
      }
      fullWarningTimerRef.current = window.setTimeout(() => {
        setFullWarningFlash(false);
      }, 700);
    }

    const willComplete = currentStep >= steps.length - 2;
    next();
    if (willComplete) {
      const nextValueInput = String(createRandomAppendValue());
      setValueInput(nextValueInput);
      syncInputToCompletedState(nextValueInput);
      return;
    }

    // Dynamic-array flow requirement: after user triggers next, continue playing remaining steps automatically.
    window.setTimeout(() => {
      play();
    }, 0);
  }, [config.capacity, currentSnapshot?.capacity, currentSnapshot?.size, currentStep, next, play, steps.length, syncInputToCompletedState]);

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
  const currentCapacity = currentSnapshot?.capacity ?? config.capacity;
  const isCapacityFull = currentLength === currentCapacity;
  const isResizePhase = currentSnapshot?.action === 'resize-start' || currentSnapshot?.action === 'migrate';
  const isPromotePhase = currentSnapshot?.action === 'resize-complete';

  const renderArrayCells = (
    buffer: Array<number | null>,
    rowType: 'single' | 'source' | 'target',
    rowCapacity: number,
    migratedIndex?: number,
  ) => (
    <div className="array-cells dynamic-array-cells-row" aria-label={`dynamic-array-cells-${rowType}`}>
      {Array.from({ length: rowCapacity }, (_, index) => {
        const value = buffer[index] ?? null;
        const highlight = rowType === 'source' || rowType === 'target' ? (index === migratedIndex ? 'moving' : 'default') : (highlightMap.get(index) ?? 'default');
        const isUnused = value === null;

        return (
          <div
            key={`${rowType}-${index}-${String(value)}-${rowCapacity}`}
            data-array-index={index}
            className={`array-cell bar-${highlight}${isUnused ? ' array-cell-unused' : ''}`}
          >
            {index + 1 === rowCapacity ? <span className="array-insert-pointer">{t('module.l02.capMarker')}</span> : null}
            <span className="array-cell-index">{index}</span>
            <strong>{value ?? '∅'}</strong>
          </div>
        );
      })}
    </div>
  );

  useEffect(() => {
    return () => {
      if (fullWarningTimerRef.current !== null) {
        window.clearTimeout(fullWarningTimerRef.current);
      }
    };
  }, []);

  return (
    <section className="array-page">
      <h2>{t('module.l02.title')}</h2>
      <p>{t('module.l02.body')}</p>

      <div className="array-form">
        <label htmlFor="dynamic-array-input">
          <span>{t('module.l02.input.array')}</span>
          <input
            id="dynamic-array-input"
            value={arrayInput}
            onChange={(event) => {
              const nextValue = event.target.value;
              reset();
              setArrayInput(nextValue);
              recomputeInputState(nextValue, capacityInput, valueInput);
            }}
            placeholder="3, 8"
          />
        </label>
        <label htmlFor="dynamic-array-capacity">
          <span>{t('module.l02.input.capacity')}</span>
          <input
            id="dynamic-array-capacity"
            type="number"
            min={1}
            value={capacityInput}
            onChange={(event) => {
              const nextValue = event.target.value;
              reset();
              setCapacityInput(nextValue);
              recomputeInputState(arrayInput, nextValue, valueInput);
            }}
          />
        </label>
        <label htmlFor="dynamic-array-value">
          <span>{t('module.l02.input.value')}</span>
          <input
            id="dynamic-array-value"
            type="number"
            value={valueInput}
            onChange={(event) => {
              const nextValue = event.target.value;
              reset();
              setValueInput(nextValue);
              recomputeInputState(arrayInput, capacityInput, nextValue);
            }}
          />
        </label>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="array-form">
        <label htmlFor="dynamic-array-json-input">
          <span>{t('module.l02.json.label')}</span>
          <textarea
            id="dynamic-array-json-input"
            value={jsonInput}
            onChange={(event) => setJsonInput(event.target.value)}
            rows={6}
            placeholder={t('module.l02.json.placeholder')}
          />
        </label>
      </div>
      <div className="playback-actions">
        <button type="button" onClick={handleExportJson}>
          {t('module.l02.json.export')}
        </button>
        <button type="button" onClick={handleImportJson}>
          {t('module.l02.json.import')}
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
        {t('module.l02.currentArray')}: [{(currentSnapshot?.arrayState ?? []).join(', ')}]
      </p>
      <p className="array-preview">
        {t('module.l01.lengthCapacity')}: {currentLength}/{currentCapacity}
      </p>
      <div className="dynamic-array-status-lines">
        <p
          className={`array-preview${isCapacityFull ? ' dynamic-array-capacity-full' : ''}${fullWarningFlash ? ' dynamic-array-capacity-flash' : ''}`}
        >
          {t('module.l02.meta.currentCapacity')}: {currentCapacity} | {t('module.l02.meta.size')}: {currentLength}
        </p>
        <p className={isCapacityFull ? 'form-error dynamic-array-status-line' : 'dynamic-array-status-line dynamic-array-status-placeholder'}>
          {isCapacityFull ? t('module.l02.fullWarning') : '-'}
        </p>
        <p className={isResizePhase || isPromotePhase ? 'array-preview dynamic-array-status-line' : 'array-preview dynamic-array-status-line dynamic-array-status-placeholder'}>
          {isResizePhase || isPromotePhase
            ? `${t('module.l02.resizeHint')} ${currentSnapshot?.resizeFrom ?? currentCapacity} -> ${currentSnapshot?.resizeTo ?? currentCapacity}`
            : '-'}
        </p>
        <p className={currentSnapshot?.action === 'append' ? 'array-preview dynamic-array-status-line' : 'array-preview dynamic-array-status-line dynamic-array-status-placeholder'}>
          {currentSnapshot?.action === 'append' ? `${t('module.l02.appendedItem')}: ${currentSnapshot.appendedValue ?? valueInput}` : '-'}
        </p>
      </div>
      <p>
        {t('module.s01.highlight')}:{' '}
        {(currentSnapshot?.highlights ?? [])
          .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
          .join(' | ') || t('module.s01.none')}
      </p>

      <VisualizationCanvas
        title={t('module.l02.title')}
        subtitle={t('module.l02.stage')}
        stageClassName="viz-canvas-stage-array"
      >
        <div ref={arrayCellsRef} className="dynamic-array-stage-content">
          {isResizePhase ? (
            <div className="dynamic-array-dual">
              <div>
                {renderArrayCells(
                  currentSnapshot?.sourceBufferState ?? currentSnapshot?.arrayState.map((value) => value) ?? [],
                  'source',
                  currentSnapshot?.resizeFrom ?? currentCapacity,
                  currentSnapshot?.migratedIndex,
                )}
              </div>
              <div>
                {renderArrayCells(
                  currentSnapshot?.targetBufferState ?? currentSnapshot?.bufferState ?? [],
                  'target',
                  currentSnapshot?.resizeTo ?? currentCapacity,
                  currentSnapshot?.migratedIndex,
                )}
              </div>
            </div>
          ) : isPromotePhase ? (
            <div className="dynamic-array-promote">
              {renderArrayCells(
                currentSnapshot?.targetBufferState ?? currentSnapshot?.bufferState ?? [],
                'target',
                currentSnapshot?.resizeTo ?? currentCapacity,
              )}
            </div>
          ) : (
            renderArrayCells(currentSnapshot?.bufferState ?? [], 'single', currentCapacity)
          )}
        </div>
      </VisualizationCanvas>

      <div className="legend-row">
        <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
        <span className="legend-item legend-moving">{t('module.l02.highlight.migrating')}</span>
        <span className="legend-item legend-inserted">{t('module.l02.highlight.appended')}</span>
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
        <h3>{t('module.l02.pseudocode')}</h3>
        <ol>
          <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.l02.code.line1')}</li>
          <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.l02.code.line2')}</li>
          <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.l02.code.line3')}</li>
          <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.l02.code.line4')}</li>
          <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.l02.code.line5')}</li>
          <li className={currentSnapshot?.codeLines.includes(6) ? 'code-active' : ''}>{t('module.l02.code.line6')}</li>
          <li className={currentSnapshot?.codeLines.includes(7) ? 'code-active' : ''}>{t('module.l02.code.line7')}</li>
        </ol>
      </div>
    </section>
  );
}
