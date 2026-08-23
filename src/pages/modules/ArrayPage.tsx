import { useCallback, useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { ARRAY_CAPACITY, generateArrayDeleteSteps, generateArrayInsertSteps } from '../../modules/linear/arrayInsert';
import {
  getArrayWorkspaceConfig,
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  resolveArrayConfig,
  resolveArrayConfigFromJson,
  serializeArrayConfigAsJson,
  type ArrayConfig,
  type ArrayOperation,
} from './arrayPageUtils';
import type { HighlightType } from '../../types/animation';

const DEFAULT_CONFIG: ArrayConfig = {
  array: [3, 8, 1, 5, 6],
  operation: {
    type: 'insert',
    index: 2,
    value: 9,
  },
};

const INSERT_CN_LINES = [
  'module.l01.code.line1',
  'module.l01.code.line2',
  'module.l01.code.line3',
  'module.l01.code.line4',
] as const;

const DELETE_CN_LINES = [
  'module.l01.code.delete.line1',
  'module.l01.code.delete.line2',
  'module.l01.code.delete.line3',
  'module.l01.code.delete.line4',
] as const;

const INSERT_C_LINES = [
  'if (index < 0 || index > length) return ERROR;',
  'for (int i = length; i > index; --i) arr[i] = arr[i - 1];',
  'arr[index] = value; length++;',
  'return OK;',
] as const;

const DELETE_C_LINES = [
  'if (index < 0 || index >= length) return ERROR;',
  'for (int i = index; i < length - 1; ++i) arr[i] = arr[i + 1];',
  'length--;',
  'return OK;',
] as const;

function createRandomInsertValue(): number {
  return Math.floor(Math.random() * 90) + 10;
}

const ARRAY_WORKSPACE_CONFIG = getArrayWorkspaceConfig();

export function ArrayPage() {
  const { t } = useI18n();

  const [arrayInput, setArrayInput] = useState(DEFAULT_CONFIG.array.join(', '));
  const [operationType, setOperationType] = useState<ArrayOperation['type']>(DEFAULT_CONFIG.operation.type);
  const [indexInput, setIndexInput] = useState(String(DEFAULT_CONFIG.operation.type === 'insert' ? DEFAULT_CONFIG.operation.index : 0));
  const [valueInput, setValueInput] = useState(String(DEFAULT_CONFIG.operation.type === 'insert' ? DEFAULT_CONFIG.operation.value : ''));
  const [error, setError] = useState('');
  const [hasValidConfig, setHasValidConfig] = useState(true);
  const [arrayConfig, setArrayConfig] = useState<ArrayConfig>(DEFAULT_CONFIG);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonFeedback, setJsonFeedback] = useState('');
  const [hasJsonError, setHasJsonError] = useState(false);

  const { status, speedMs, currentFrame, setSpeed, setTotalFrames, play, pause, next, prev, reset } = useTimelinePlayer(0);
  const currentStep = currentFrame;

  const steps = useMemo(() => {
    const operation = arrayConfig.operation;
    if (operation.type === 'delete') {
      return generateArrayDeleteSteps(arrayConfig.array, operation.index);
    }
    return generateArrayInsertSteps(arrayConfig.array, operation.index, operation.value);
  }, [arrayConfig]);
  const activeOperationType = arrayConfig.operation.type;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const logicalStepByIndex = useMemo(
    () =>
      steps.reduce<number[]>((acc, step) => {
        const prevValue = acc.length > 0 ? acc[acc.length - 1] : -1;
        const nextValue = step.action === 'completed' ? Math.max(prevValue, 0) : prevValue + 1;
        return [...acc, Math.max(nextValue, 0)];
      }, []),
    [steps],
  );
  const currentLogicalStep = logicalStepByIndex[currentStep] ?? 0;
  const totalLogicalSteps = logicalStepByIndex[logicalStepByIndex.length - 1] ?? 0;
  const completedArrayText = useMemo(() => {
    const last = steps[steps.length - 1];
    const used = (last?.arrayState ?? []).slice(0, last?.logicalLength ?? 0).filter((value): value is number => value !== null);
    return used.join(', ');
  }, [steps]);
  const usedArrayPreview = useMemo(
    () =>
      (currentSnapshot?.arrayState ?? [])
        .slice(0, currentSnapshot?.logicalLength ?? 0)
        .filter((value): value is number => value !== null),
    [currentSnapshot],
  );
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const focusPoint = useMemo(() => {
    const operation = arrayConfig.operation;
    const highlightedIndex = currentSnapshot?.highlights?.[0]?.index ?? (operation.type === 'delete' ? operation.index : operation.index);
    return {
      x: ((highlightedIndex + 0.5) / ARRAY_CAPACITY) * 100,
      y: 38,
    };
  }, [arrayConfig, currentSnapshot?.highlights]);
  const highlightSummary =
    (currentSnapshot?.highlights ?? [])
      .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
      .join(' | ') || t('module.s01.none');
  const stepDescription = getStepDescription(currentSnapshot, t);
  const chinesePseudocodeLines = useMemo(
    () => (activeOperationType === 'delete' ? DELETE_CN_LINES.map((key) => t(key)) : INSERT_CN_LINES.map((key) => t(key))),
    [activeOperationType, t],
  );
  const cStylePseudocodeLines = activeOperationType === 'delete' ? DELETE_C_LINES : INSERT_C_LINES;
  const visualUsedLength = useMemo(() => {
    const logicalLength = currentSnapshot?.logicalLength ?? 0;
    if (currentSnapshot?.action === 'shift' && activeOperationType === 'insert') {
      return Math.min(logicalLength + 1, ARRAY_CAPACITY);
    }
    return logicalLength;
  }, [activeOperationType, currentSnapshot]);
  const isArrayFull = (currentSnapshot?.logicalLength ?? arrayConfig.array.length) >= ARRAY_CAPACITY;
  const fullWarning = isArrayFull ? t('module.l01.error.capacity') : '';

  const recomputeInputState = useCallback(
    (nextArrayInput: string, nextOperationType: ArrayOperation['type'], nextIndexInput: string, nextValueInput: string) => {
      const resolved = resolveArrayConfig(nextArrayInput, nextOperationType, nextIndexInput, nextValueInput, t);
      setError(resolved.error);
      setHasValidConfig(resolved.config !== null);
      if (resolved.config) {
        setArrayConfig(resolved.config);
      }
      return resolved;
    },
    [t],
  );

  const handleResetToInitialState = useCallback(() => {
    reset();
    setArrayInput(DEFAULT_CONFIG.array.join(', '));
    setOperationType(DEFAULT_CONFIG.operation.type);
    setIndexInput(String(DEFAULT_CONFIG.operation.index));
    setValueInput(String(DEFAULT_CONFIG.operation.type === 'insert' ? DEFAULT_CONFIG.operation.value : ''));
    setError('');
    setHasValidConfig(true);
    setArrayConfig({
      array: [...DEFAULT_CONFIG.array],
      operation: {
        type: 'insert',
        index: DEFAULT_CONFIG.operation.index,
        value: DEFAULT_CONFIG.operation.type === 'insert' ? DEFAULT_CONFIG.operation.value : 0,
      },
    });
    setJsonInput('');
    setJsonFeedback('');
    setHasJsonError(false);
  }, [reset]);

  const syncInputToCompletedArray = useCallback(
    (nextValueInput = valueInput) => {
      if (!hasValidConfig || steps.length === 0) {
        return;
      }

      if (arrayInput === completedArrayText) {
        return;
      }

      let nextIndexInput = indexInput;
      if (activeOperationType === 'delete') {
        const newLength = completedArrayText.length === 0 ? 0 : completedArrayText.split(',').length;
        const rawIndex = Number.parseInt(indexInput, 10);
        nextIndexInput = String(Math.max(0, Math.min(Number.isNaN(rawIndex) ? 0 : rawIndex, Math.max(newLength - 1, 0))));
      }

      reset();
      setArrayInput(completedArrayText);
      setIndexInput(nextIndexInput);
      recomputeInputState(completedArrayText, activeOperationType, nextIndexInput, nextValueInput);
    },
    [
      activeOperationType,
      arrayInput,
      completedArrayText,
      hasValidConfig,
      indexInput,
      recomputeInputState,
      reset,
      steps.length,
      valueInput,
    ],
  );

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [setTotalFrames, reset, steps]);

  useEffect(() => {
    if (!hasValidConfig || steps.length === 0) {
      return;
    }

    if (currentSnapshot?.action !== 'completed') {
      return;
    }

    if (arrayInput === completedArrayText) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (activeOperationType === 'insert') {
        const nextValueInput = String(createRandomInsertValue());
        setValueInput(nextValueInput);
        syncInputToCompletedArray(nextValueInput);
        return;
      }
      syncInputToCompletedArray();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    activeOperationType,
    arrayInput,
    completedArrayText,
    currentSnapshot?.action,
    hasValidConfig,
    steps.length,
    syncInputToCompletedArray,
  ]);

  const handleNextStep = useCallback(() => {
    const willComplete = currentStep >= steps.length - 2;
    next();
    if (willComplete) {
      if (activeOperationType === 'insert') {
        const nextValueInput = String(createRandomInsertValue());
        setValueInput(nextValueInput);
        syncInputToCompletedArray(nextValueInput);
        return;
      }
      syncInputToCompletedArray();
    }
  }, [activeOperationType, currentStep, next, steps.length, syncInputToCompletedArray]);

  const handleExportJson = useCallback(() => {
    setJsonInput(serializeArrayConfigAsJson(arrayConfig));
    setHasJsonError(false);
    setJsonFeedback(t('module.l01.json.exported'));
  }, [arrayConfig, t]);

  const handleImportJson = useCallback(() => {
    const resolved = resolveArrayConfigFromJson(jsonInput, t);
    if (!resolved.config) {
      setHasJsonError(true);
      setJsonFeedback(resolved.error);
      return;
    }

    const nextArrayInput = resolved.config.array.join(', ');
    const nextOperationType = resolved.config.operation.type;
    const nextIndexInput = String(resolved.config.operation.index);
    const nextValueInput =
      resolved.config.operation.type === 'insert' ? String(resolved.config.operation.value) : valueInput;

    reset();
    setArrayInput(nextArrayInput);
    setOperationType(nextOperationType);
    setIndexInput(nextIndexInput);
    setValueInput(nextValueInput);
    recomputeInputState(nextArrayInput, nextOperationType, nextIndexInput, nextValueInput);
    setHasJsonError(false);
    setJsonFeedback(t('module.l01.json.imported'));
  }, [jsonInput, recomputeInputState, reset, t, valueInput]);

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

  return (
    <WorkspaceShell
      pageClassName={ARRAY_WORKSPACE_CONFIG.pageClassName}
      stageAriaLabel={t('module.l01.title')}
      title={t('module.l01.title')}
      description={t('module.l01.body')}
      stageClassName={ARRAY_WORKSPACE_CONFIG.stageClassName}
      stageBodyClassName={ARRAY_WORKSPACE_CONFIG.stageBodyClassName}
      controlsPanelClassName={ARRAY_WORKSPACE_CONFIG.controlsPanelClassName}
      stepPanelClassName="workspace-context-sheet-linear"
      defaultControlsPanelSize={ARRAY_WORKSPACE_CONFIG.controlsPanelSize}
      controlsPanelAutoAvoid={ARRAY_WORKSPACE_CONFIG.controlsPanelAutoAvoid}
      controlsPanelOverflowMargin={ARRAY_WORKSPACE_CONFIG.controlsPanelOverflowMargin}
      defaultContextPanelSize={ARRAY_WORKSPACE_CONFIG.contextPanelSize}
      stepPanelAutoAvoid={ARRAY_WORKSPACE_CONFIG.stepPanelAutoAvoid}
      stepPanelOverflowMargin={ARRAY_WORKSPACE_CONFIG.stepPanelOverflowMargin}
      focusPoint={focusPoint}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('playback.step')}: {currentLogicalStep}/{totalLogicalSteps}
          </span>
          <span className="tree-workspace-pill">
            {t('module.l01.lengthCapacity')}: {currentSnapshot?.logicalLength ?? 0}/{ARRAY_CAPACITY}
          </span>
          <span className="tree-workspace-pill">{stepDescription}</span>
        </>
      }
controlsContent={
        <>
          <div className="array-controls-grid">
          <label className="tree-workspace-field array-controls-field array-controls-field-array" htmlFor="array-input">
            <span>{t('module.l01.input.array')}</span>
            <input
              id="array-input"
              type="text"
              value={arrayInput}
              onChange={(event) => {
                const nextValue = event.target.value;
                setArrayInput(nextValue);
                recomputeInputState(nextValue, operationType, indexInput, valueInput);
              }}
              placeholder="3, 8, 1, 5, 6"
            />
          </label>

          <label className="tree-workspace-field array-controls-field" htmlFor="array-operation">
            <span>{t('module.l01.input.operation')}</span>
            <select
              id="array-operation"
              value={operationType}
              onChange={(event) => {
                const nextOperationType = event.target.value as ArrayOperation['type'];
                const nextIndexInput =
                  nextOperationType === 'delete'
                    ? String(Math.max(0, (arrayConfig.array.length || 1) - 1))
                    : indexInput;
                reset();
                setOperationType(nextOperationType);
                setIndexInput(nextIndexInput);
                recomputeInputState(arrayInput, nextOperationType, nextIndexInput, valueInput);
              }}
            >
              <option value="insert">{t('module.l01.operation.insert')}</option>
              <option value="delete">{t('module.l01.operation.delete')}</option>
            </select>
          </label>

          <label className="tree-workspace-field array-controls-field" htmlFor="array-index">
            <span>{operationType === 'insert' ? t('module.l01.input.index') : t('module.l01.input.deleteIndex')}</span>
            <input
              id="array-index"
              type="number"
              value={indexInput}
              onChange={(event) => {
                const nextValue = event.target.value;
                setIndexInput(nextValue);
                recomputeInputState(arrayInput, operationType, nextValue, valueInput);
              }}
            />
          </label>

          {operationType === 'insert' && (
            <label className="tree-workspace-field array-controls-field" htmlFor="array-value">
              <span>{t('module.l01.input.value')}</span>
              <input
                id="array-value"
                type="number"
                value={valueInput}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setValueInput(nextValue);
                  recomputeInputState(arrayInput, operationType, indexInput, nextValue);
                }}
              />
            </label>
          )}

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
                  {currentLogicalStep}/{totalLogicalSteps}
                </strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('module.l01.input.operation')}</span>
                <strong>
                  {activeOperationType === 'insert' ? t('module.l01.operation.insert') : t('module.l01.operation.delete')}
                </strong>
              </div>
              <div className="linear-controls-card">
                <span>{activeOperationType === 'insert' ? t('module.l01.input.index') : t('module.l01.input.deleteIndex')}</span>
                <strong>{arrayConfig.operation.index}</strong>
              </div>
              {activeOperationType === 'insert' ? (
                <div className="linear-controls-card">
                  <span>{t('module.l01.input.value')}</span>
                  <strong>{arrayConfig.operation.type === 'insert' ? arrayConfig.operation.value : ''}</strong>
                </div>
              ) : null}
              <div className="linear-controls-card">
                <span>{t('module.l01.lengthCapacity')}</span>
                <strong>
                  {currentSnapshot?.logicalLength ?? 0}/{ARRAY_CAPACITY}
                </strong>
              </div>
            </div>

            <div className="linear-controls-note-grid">
              <p className="linear-controls-note">{stepDescription}</p>
              <p className="linear-controls-note">
                {t('module.l01.currentArray')}: [{usedArrayPreview.join(', ')}]
              </p>
              <p className="linear-controls-note linear-controls-note-wide">
                {t('module.s01.highlight')}: {highlightSummary}
              </p>
            </div>

          </div>

          {ARRAY_WORKSPACE_CONFIG.showJsonControls ? (
            <>
              <label className="tree-workspace-field" htmlFor="array-json-input">
                <span>{t('module.l01.json.label')}</span>
                <textarea
                  id="array-json-input"
                  value={jsonInput}
                  onChange={(event) => setJsonInput(event.target.value)}
                  rows={6}
                  placeholder={t('module.l01.json.placeholder')}
                />
              </label>

              {jsonFeedback ? (
                <p className={`${hasJsonError ? 'form-error' : 'array-preview'} workspace-inline-feedback`}>
                  {jsonFeedback}
                </p>
              ) : null}

              <div className="tree-workspace-drawer-actions">
                <button type="button" className="tree-workspace-ghost-button" onClick={handleExportJson}>
                  {t('module.l01.json.export')}
                </button>
                <button type="button" className="tree-workspace-ghost-button" onClick={handleImportJson}>
                  {t('module.l01.json.import')}
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
                <h3>{t('module.l01.pseudocode')}：中文式</h3>
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
                <h3>{t('module.l01.pseudocode')}：类 C 式</h3>
                <ol>
                  {cStylePseudocodeLines.map((line, index) => (
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
        <div className="linear-stage-layout">
          {fullWarning ? (
            <p className="linear-stage-warning dynamic-array-capacity-full" aria-live="polite">
              {fullWarning}
            </p>
          ) : null}
          <div className="array-cells" aria-label="array-cells">
            {(currentSnapshot?.arrayState ?? []).map((value, index) => {
              const highlight = highlightMap.get(index) ?? 'default';
              const isEmpty = value === null;
              const isUnused = index >= visualUsedLength;
              const isInsertTarget =
                activeOperationType === 'insert' && arrayConfig.operation.type === 'insert' && index === arrayConfig.operation.index;
              const cellClassName = `array-cell bar-${highlight}${isEmpty ? ' array-cell-empty' : ''}${isUnused ? ' array-cell-unused' : ''}`;

              return (
                <div key={`${index}-${String(value)}`} className={cellClassName}>
                  {isInsertTarget ? <span className="array-insert-pointer">↓</span> : null}
                  <span className="array-cell-index">{index}</span>
                  <strong>{value ?? '∅'}</strong>
                </div>
              );
            })}
          </div>
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
            {currentLogicalStep}/{totalLogicalSteps}
          </span>
        </>
      }
      transportRight={
        <>
          <span className="tree-workspace-transport-chip">#{arrayConfig.operation.index}</span>
          {activeOperationType === 'insert' ? (
            <span className="tree-workspace-transport-chip">
              {arrayConfig.operation.type === 'insert' ? arrayConfig.operation.value : ''}
            </span>
          ) : null}
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {currentSnapshot?.logicalLength ?? 0}/{ARRAY_CAPACITY}
          </span>
        </>
      }
    />
  );
}
