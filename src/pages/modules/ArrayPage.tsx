import { useCallback, useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { ARRAY_CAPACITY, generateArrayInsertSteps } from '../../modules/linear/arrayInsert';
import {
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  resolveInsertConfig,
  resolveInsertConfigFromJson,
  serializeInsertConfigAsJson,
  type InsertConfig,
} from './arrayPageUtils';
import type { HighlightType } from '../../types/animation';

const DEFAULT_CONFIG: InsertConfig = {
  array: [3, 8, 1, 5, 6],
  index: 2,
  value: 9,
};

function createRandomInsertValue(): number {
  return Math.floor(Math.random() * 90) + 10;
}

export function ArrayPage() {
  const { t } = useI18n();

  const [arrayInput, setArrayInput] = useState(DEFAULT_CONFIG.array.join(', '));
  const [indexInput, setIndexInput] = useState(String(DEFAULT_CONFIG.index));
  const [valueInput, setValueInput] = useState(String(DEFAULT_CONFIG.value));
  const [error, setError] = useState('');
  const [hasValidConfig, setHasValidConfig] = useState(true);
  const [insertConfig, setInsertConfig] = useState<InsertConfig>(DEFAULT_CONFIG);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonFeedback, setJsonFeedback] = useState('');
  const [hasJsonError, setHasJsonError] = useState(false);

  const { status, speedMs, currentFrame, setSpeed, setTotalFrames, play, pause, next, prev, reset } = useTimelinePlayer(0);
  const currentStep = currentFrame;

  const steps = useMemo(
    () => generateArrayInsertSteps(insertConfig.array, insertConfig.index, insertConfig.value),
    [insertConfig],
  );
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
    const highlightedIndex = currentSnapshot?.highlights?.[0]?.index ?? insertConfig.index;
    return {
      x: ((highlightedIndex + 0.5) / ARRAY_CAPACITY) * 100,
      y: 38,
    };
  }, [currentSnapshot?.highlights, insertConfig.index]);
  const highlightSummary =
    (currentSnapshot?.highlights ?? [])
      .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
      .join(' | ') || t('module.s01.none');
  const visualUsedLength = useMemo(() => {
    const logicalLength = currentSnapshot?.logicalLength ?? 0;
    if (currentSnapshot?.action === 'shift') {
      return Math.min(logicalLength + 1, ARRAY_CAPACITY);
    }
    return logicalLength;
  }, [currentSnapshot]);

  const recomputeInputState = useCallback(
    (nextArrayInput: string, nextIndexInput: string, nextValueInput: string) => {
      const resolved = resolveInsertConfig(nextArrayInput, nextIndexInput, nextValueInput, t);
      setError(resolved.error);
      setHasValidConfig(resolved.config !== null);
      if (resolved.config) {
        setInsertConfig(resolved.config);
      }
    },
    [t],
  );

  const syncInputToCompletedArray = useCallback(
    (nextValueInput = valueInput) => {
      if (!hasValidConfig || steps.length === 0) {
        return;
      }

      if (arrayInput === completedArrayText) {
        return;
      }

      reset();
      setArrayInput(completedArrayText);
      recomputeInputState(completedArrayText, indexInput, nextValueInput);
    },
    [arrayInput, completedArrayText, hasValidConfig, indexInput, recomputeInputState, reset, steps.length, valueInput],
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
      const nextValueInput = String(createRandomInsertValue());
      setValueInput(nextValueInput);
      syncInputToCompletedArray(nextValueInput);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [arrayInput, completedArrayText, currentSnapshot?.action, hasValidConfig, steps.length, syncInputToCompletedArray]);

  const handleNextStep = useCallback(() => {
    const willComplete = currentStep >= steps.length - 2;
    next();
    if (willComplete) {
      const nextValueInput = String(createRandomInsertValue());
      setValueInput(nextValueInput);
      syncInputToCompletedArray(nextValueInput);
    }
  }, [currentStep, next, steps.length, syncInputToCompletedArray]);

  const handleExportJson = useCallback(() => {
    setJsonInput(serializeInsertConfigAsJson(insertConfig));
    setHasJsonError(false);
    setJsonFeedback(t('module.l01.json.exported'));
  }, [insertConfig, t]);

  const handleImportJson = useCallback(() => {
    const resolved = resolveInsertConfigFromJson(jsonInput, t);
    if (!resolved.config) {
      setHasJsonError(true);
      setJsonFeedback(resolved.error);
      return;
    }

    const nextArrayInput = resolved.config.array.join(', ');
    const nextIndexInput = String(resolved.config.index);
    const nextValueInput = String(resolved.config.value);

    reset();
    setArrayInput(nextArrayInput);
    setIndexInput(nextIndexInput);
    setValueInput(nextValueInput);
    recomputeInputState(nextArrayInput, nextIndexInput, nextValueInput);
    setHasJsonError(false);
    setJsonFeedback(t('module.l01.json.imported'));
  }, [jsonInput, recomputeInputState, reset, t]);

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
      pageClassName="array-page"
      stageAriaLabel={t('module.l01.title')}
      title={t('module.l01.title')}
      description={t('module.l01.body')}
      stageClassName="workspace-stage-array"
      stageBodyClassName="workspace-stage-body-array"
      controlsPanelClassName="workspace-drawer-xl workspace-drawer-scroll"
      stepPanelClassName="workspace-context-sheet-wide workspace-context-sheet-rich"
      defaultControlsPanelSize={{ width: 332, height: 620 }}
      defaultContextPanelSize={{ width: 320, height: 540 }}
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
          <span className="tree-workspace-pill">{getStepDescription(currentSnapshot, t)}</span>
        </>
      }
      controlsContent={
        <>
          <label className="tree-workspace-field" htmlFor="array-input">
            <span>{t('module.l01.input.array')}</span>
            <input
              id="array-input"
              type="text"
              value={arrayInput}
              onChange={(event) => {
                const nextValue = event.target.value;
                setArrayInput(nextValue);
                recomputeInputState(nextValue, indexInput, valueInput);
              }}
              placeholder="3, 8, 1, 5, 6"
            />
          </label>

          <label className="tree-workspace-field" htmlFor="insert-index">
            <span>{t('module.l01.input.index')}</span>
            <input
              id="insert-index"
              type="number"
              value={indexInput}
              onChange={(event) => {
                const nextValue = event.target.value;
                setIndexInput(nextValue);
                recomputeInputState(arrayInput, nextValue, valueInput);
              }}
            />
          </label>

          <label className="tree-workspace-field" htmlFor="insert-value">
            <span>{t('module.l01.input.value')}</span>
            <input
              id="insert-value"
              type="number"
              value={valueInput}
              onChange={(event) => {
                const nextValue = event.target.value;
                setValueInput(nextValue);
                recomputeInputState(arrayInput, indexInput, nextValue);
              }}
            />
          </label>

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

          {error ? <p className="form-error workspace-inline-feedback">{error}</p> : null}
          {jsonFeedback ? (
            <p className={`${hasJsonError ? 'form-error' : 'array-preview'} workspace-inline-feedback`}>{jsonFeedback}</p>
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
      }
      stepContent={
        <div className="workspace-panel-scroll">
          <div className="workspace-panel-copy">
            <h3>{getStepDescription(currentSnapshot, t)}</h3>
            <p>
              {t('module.l01.currentArray')}: [{usedArrayPreview.join(', ')}]
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
                {currentLogicalStep}/{totalLogicalSteps}
              </dd>
            </div>
            <div>
              <dt>{t('module.l01.input.index')}</dt>
              <dd>{insertConfig.index}</dd>
            </div>
            <div>
              <dt>{t('module.l01.input.value')}</dt>
              <dd>{insertConfig.value}</dd>
            </div>
            <div>
              <dt>{t('module.l01.lengthCapacity')}</dt>
              <dd>
                {currentSnapshot?.logicalLength ?? 0}/{ARRAY_CAPACITY}
              </dd>
            </div>
            <div>
              <dt>{t('module.s01.highlight')}</dt>
              <dd>{highlightSummary}</dd>
            </div>
          </dl>

          <div className="legend-row">
            <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
            <span className="legend-item legend-moving">{t('module.l01.highlight.moving')}</span>
            <span className="legend-item legend-inserted">{t('module.l01.highlight.inserted')}</span>
          </div>

          <div className="pseudocode-block">
            <h3>{t('module.l01.pseudocode')}</h3>
            <ol>
              <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.l01.code.line1')}</li>
              <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.l01.code.line2')}</li>
              <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.l01.code.line3')}</li>
              <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.l01.code.line4')}</li>
            </ol>
          </div>
        </div>
      }
      stageContent={
        <div className="array-cells" aria-label="array-cells">
          {(currentSnapshot?.arrayState ?? []).map((value, index) => {
            const highlight = highlightMap.get(index) ?? 'default';
            const isEmpty = value === null;
            const isUnused = index >= visualUsedLength;
            const isInsertTarget = index === insertConfig.index;
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
            onClick={reset}
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
          <span className="tree-workspace-transport-chip">#{insertConfig.index}</span>
          <span className="tree-workspace-transport-chip">{insertConfig.value}</span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {currentSnapshot?.logicalLength ?? 0}/{ARRAY_CAPACITY}
          </span>
        </>
      }
    />
  );
}
