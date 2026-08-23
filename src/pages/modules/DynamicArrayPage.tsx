import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { buildDynamicArrayTimelineFromInput } from '../../modules/linear/dynamicArrayTimelineAdapter';
import {
  getDynamicArrayWorkspaceConfig,
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

const DYNAMIC_ARRAY_CN_LINE_KEYS = [
  'module.l02.code.line1',
  'module.l02.code.line2',
  'module.l02.code.line3',
  'module.l02.code.line4',
  'module.l02.code.line5',
  'module.l02.code.line6',
  'module.l02.code.line7',
] as const;

const DYNAMIC_ARRAY_C_LINES = [
  'if (size < capacity) data[size++] = value;',
  'else {',
  '    newCapacity = capacity * 2;',
  '    newData = malloc(newCapacity * sizeof(int));',
  '    for (int i = 0; i < size; ++i) newData[i] = data[i];',
  '    free(data); data = newData; capacity = newCapacity;',
  '    data[size++] = value; }',
] as const;

function createRandomAppendValue(): number {
  return Math.floor(Math.random() * 90) + 10;
}

const DYNAMIC_ARRAY_WORKSPACE_CONFIG = getDynamicArrayWorkspaceConfig();

export function DynamicArrayPage() {
  const { t } = useI18n();

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
      return resolved;
    },
    [t],
  );

  const handleResetToInitialState = useCallback(() => {
    reset();
    setArrayInput(DEFAULT_CONFIG.array.join(', '));
    setCapacityInput(String(DEFAULT_CONFIG.capacity));
    setValueInput(String(DEFAULT_CONFIG.operation.value));
    setError('');
    setHasValidConfig(true);
    setConfig({
      array: [...DEFAULT_CONFIG.array],
      capacity: DEFAULT_CONFIG.capacity,
      operation: { type: 'append', value: DEFAULT_CONFIG.operation.value },
    });
    setJsonInput('');
    setJsonFeedback('');
    setHasJsonError(false);
    setFullWarningFlash(false);
    if (fullWarningTimerRef.current !== null) {
      window.clearTimeout(fullWarningTimerRef.current);
      fullWarningTimerRef.current = null;
    }
  }, [reset]);

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

  const syncInputToCompletedState = useCallback(
    (nextValueInput = valueInput) => {
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
    },
    [
      arrayInput,
      capacityInput,
      completedArrayText,
      completedCapacityText,
      hasValidConfig,
      recomputeInputState,
      reset,
      steps.length,
      valueInput,
    ],
  );

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
      const nextValueInput = String(createRandomAppendValue());
      setValueInput(nextValueInput);
      syncInputToCompletedState(nextValueInput);
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
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const focusPoint = useMemo(() => {
    const resolvedCapacity = Math.max(currentSnapshot?.capacity ?? config.capacity, 1);
    const activeIndex =
      currentSnapshot?.migratedIndex ??
      currentSnapshot?.highlights[0]?.index ??
      Math.max(0, Math.min((currentSnapshot?.size ?? 1) - 1, resolvedCapacity - 1));
    return {
      x: ((activeIndex + 0.5) / resolvedCapacity) * 100,
      y: isResizePhase || isPromotePhase ? 60 : 42,
    };
  }, [
    config.capacity,
    currentSnapshot?.capacity,
    currentSnapshot?.highlights,
    currentSnapshot?.migratedIndex,
    currentSnapshot?.size,
    isPromotePhase,
    isResizePhase,
  ]);
  const highlightSummary =
    (currentSnapshot?.highlights ?? [])
      .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
      .join(' | ') || t('module.s01.none');
  const stepDescription = getStepDescription(currentSnapshot, t);
  const chinesePseudocodeLines = useMemo(() => DYNAMIC_ARRAY_CN_LINE_KEYS.map((key) => t(key)), [t]);
  const resizeHintText =
    isResizePhase || isPromotePhase
      ? `${t('module.l02.resizeHint')} ${currentSnapshot?.resizeFrom ?? currentCapacity} -> ${currentSnapshot?.resizeTo ?? currentCapacity}`
      : '';

  const renderArrayCells = (
    buffer: Array<number | null>,
    rowType: 'single' | 'source' | 'target',
    rowCapacity: number,
    migratedIndex?: number,
  ) => (
    <div className="array-cells dynamic-array-cells-row" aria-label={`dynamic-array-cells-${rowType}`}>
      {Array.from({ length: rowCapacity }, (_, index) => {
        const value = buffer[index] ?? null;
        const highlight =
          rowType === 'source' || rowType === 'target'
            ? index === migratedIndex
              ? 'moving'
              : 'default'
            : (highlightMap.get(index) ?? 'default');
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
    <WorkspaceShell
      pageClassName={DYNAMIC_ARRAY_WORKSPACE_CONFIG.pageClassName}
      stageAriaLabel={t('module.l02.title')}
      title={t('module.l02.title')}
      description={t('module.l02.body')}
      stageClassName={DYNAMIC_ARRAY_WORKSPACE_CONFIG.stageClassName}
      stageBodyClassName={DYNAMIC_ARRAY_WORKSPACE_CONFIG.stageBodyClassName}
      controlsPanelClassName={DYNAMIC_ARRAY_WORKSPACE_CONFIG.controlsPanelClassName}
      stepPanelClassName="workspace-context-sheet-linear"
      defaultControlsPanelSize={DYNAMIC_ARRAY_WORKSPACE_CONFIG.controlsPanelSize}
      controlsPanelAutoAvoid={DYNAMIC_ARRAY_WORKSPACE_CONFIG.controlsPanelAutoAvoid}
      controlsPanelOverflowMargin={DYNAMIC_ARRAY_WORKSPACE_CONFIG.controlsPanelOverflowMargin}
      defaultContextPanelSize={DYNAMIC_ARRAY_WORKSPACE_CONFIG.contextPanelSize}
      stepPanelAutoAvoid={DYNAMIC_ARRAY_WORKSPACE_CONFIG.stepPanelAutoAvoid}
      stepPanelOverflowMargin={DYNAMIC_ARRAY_WORKSPACE_CONFIG.stepPanelOverflowMargin}
      focusPoint={focusPoint}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('playback.step')}: {currentStep}/{Math.max(steps.length - 1, 0)}
          </span>
          <span className="tree-workspace-pill">
            {t('module.l01.lengthCapacity')}: {currentLength}/{currentCapacity}
          </span>
          <span className="tree-workspace-pill">{stepDescription}</span>
          {resizeHintText ? <span className="tree-workspace-pill">{resizeHintText}</span> : null}
        </>
      }
      controlsContent={
        <>
          <div className="array-controls-grid">
            <label className="tree-workspace-field array-controls-field array-controls-field-array" htmlFor="dynamic-array-input">
              <span>{t('module.l02.input.array')}</span>
              <input
                id="dynamic-array-input"
                type="text"
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

            <label className="tree-workspace-field array-controls-field" htmlFor="dynamic-array-capacity">
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

            <label className="tree-workspace-field array-controls-field" htmlFor="dynamic-array-value">
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

          <p
            className={`workspace-inline-feedback array-controls-feedback${error || hasJsonError ? ' form-error' : ''}`}
            aria-live="polite"
          >
            {error || jsonFeedback || ''}
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
                <span>{t('module.l02.meta.currentCapacity')}</span>
                <strong>{currentCapacity}</strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('module.l02.meta.size')}</span>
                <strong>{currentLength}</strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('module.l02.input.value')}</span>
                <strong>{config.operation.value}</strong>
              </div>
            </div>

            <div className="linear-controls-note-grid">
              <p className="linear-controls-note">{stepDescription}</p>
              <p className="linear-controls-note">
                {t('module.l02.currentArray')}: [{(currentSnapshot?.arrayState ?? []).join(', ')}]
              </p>
              {resizeHintText ? <p className="linear-controls-note">{resizeHintText}</p> : null}
              {currentSnapshot?.action === 'append' ? (
                <p className="linear-controls-note">
                  {t('module.l02.appendedItem')}: {currentSnapshot.appendedValue ?? valueInput}
                </p>
              ) : null}
              <p className="linear-controls-note linear-controls-note-wide">
                {t('module.s01.highlight')}: {highlightSummary}
              </p>
              {isCapacityFull ? (
                <p
                  className={`linear-controls-note linear-controls-note-wide dynamic-array-capacity-full dynamic-array-status-line${
                    fullWarningFlash ? ' dynamic-array-capacity-flash' : ''
                  }`}
                >
                  {t('module.l02.fullWarning')}
                </p>
              ) : null}
            </div>

          </div>

          {DYNAMIC_ARRAY_WORKSPACE_CONFIG.showJsonControls ? (
            <>
              <label className="tree-workspace-field" htmlFor="dynamic-array-json-input">
                <span>{t('module.l02.json.label')}</span>
                <textarea
                  id="dynamic-array-json-input"
                  value={jsonInput}
                  onChange={(event) => setJsonInput(event.target.value)}
                  rows={6}
                  placeholder={t('module.l02.json.placeholder')}
                />
              </label>

              <div className="tree-workspace-drawer-actions">
                <button type="button" className="tree-workspace-ghost-button" onClick={handleExportJson}>
                  {t('module.l02.json.export')}
                </button>
                <button type="button" className="tree-workspace-ghost-button" onClick={handleImportJson}>
                  {t('module.l02.json.import')}
                </button>
              </div>
            </>
          ) : null}
        </>
      }
      stepContent={
        <div className="workspace-panel-scroll workspace-panel-scroll-linear">
          <div className="workspace-panel-code-only workspace-panel-code-grid-double">
            <div className="workspace-panel-linear-code">
              <div className="pseudocode-block pseudocode-block-linear">
                <h3>{t('module.l02.pseudocode')}：中文式</h3>
                <ol>
                  {chinesePseudocodeLines.map((line, index) => (
                    <li key={`cn-${line}`} className={currentSnapshot?.codeLines.includes(index + 1) ? 'code-active' : ''}>
                      {line}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="workspace-panel-linear-code">
              <div className="pseudocode-block pseudocode-block-linear">
                <h3>{t('module.l02.pseudocode')}：类 C 式</h3>
                <ol>
                  {DYNAMIC_ARRAY_C_LINES.map((line, index) => (
                    <li key={`c-${line}`} className={currentSnapshot?.codeLines.includes(index + 1) ? 'code-active' : ''}>
                      <code>{line}</code>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      }
      stageContent={
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
            disabled={!hasValidConfig || steps.length === 0}
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
          <span className="tree-workspace-transport-chip">{currentLength}/{currentCapacity}</span>
          <span className="tree-workspace-transport-chip">+{config.operation.value}</span>
          {resizeHintText ? <span className="tree-workspace-transport-chip">{resizeHintText}</span> : null}
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {isCapacityFull ? t('module.l02.fullWarning') : t('module.l02.meta.size')}
          </span>
        </>
      }
    />
  );
}
