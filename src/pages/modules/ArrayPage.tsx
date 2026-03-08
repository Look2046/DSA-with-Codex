import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useCurrentModule } from '../../hooks/useCurrentModule';
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
  const currentModule = useCurrentModule();

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
        const prev = acc.length > 0 ? acc[acc.length - 1] : -1;
        const next = step.action === 'completed' ? Math.max(prev, 0) : prev + 1;
        return [...acc, Math.max(next, 0)];
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
  const usedArrayPreview = useMemo(() => {
    return (currentSnapshot?.arrayState ?? [])
      .slice(0, currentSnapshot?.logicalLength ?? 0)
      .filter((value): value is number => value !== null);
  }, [currentSnapshot]);
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

  const syncInputToCompletedArray = useCallback((nextValueInput = valueInput) => {
    if (!hasValidConfig || steps.length === 0) {
      return;
    }

    if (arrayInput === completedArrayText) {
      return;
    }

    reset();
    setArrayInput(completedArrayText);
    recomputeInputState(completedArrayText, indexInput, nextValueInput);
  }, [arrayInput, completedArrayText, hasValidConfig, indexInput, recomputeInputState, reset, steps.length, valueInput]);

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
    <section className="array-page">
      <h2>{t('module.l01.title')}</h2>
      <p>{t('module.l01.body')}</p>

      <div className="array-form">
        <label htmlFor="array-input">
          <span>{t('module.l01.input.array')}</span>
          <input
            id="array-input"
            value={arrayInput}
            onChange={(event) => {
              const next = event.target.value;
              setArrayInput(next);
              recomputeInputState(next, indexInput, valueInput);
            }}
            placeholder="3, 8, 1, 5, 6"
          />
        </label>
        <label htmlFor="insert-index">
          <span>{t('module.l01.input.index')}</span>
          <input
            id="insert-index"
            type="number"
            value={indexInput}
            onChange={(event) => {
              const next = event.target.value;
              setIndexInput(next);
              recomputeInputState(arrayInput, next, valueInput);
            }}
          />
        </label>
        <label htmlFor="insert-value">
          <span>{t('module.l01.input.value')}</span>
          <input
            id="insert-value"
            type="number"
            value={valueInput}
            onChange={(event) => {
              const next = event.target.value;
              setValueInput(next);
              recomputeInputState(arrayInput, indexInput, next);
            }}
          />
        </label>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="array-form">
        <label htmlFor="array-json-input">
          <span>{t('module.l01.json.label')}</span>
          <textarea
            id="array-json-input"
            value={jsonInput}
            onChange={(event) => setJsonInput(event.target.value)}
            rows={6}
            placeholder={t('module.l01.json.placeholder')}
          />
        </label>
      </div>
      <div className="playback-actions">
        <button type="button" onClick={handleExportJson}>
          {t('module.l01.json.export')}
        </button>
        <button type="button" onClick={handleImportJson}>
          {t('module.l01.json.import')}
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
        {t('module.s01.moduleLabel')}: {currentModule?.id ?? '-'} | {t('playback.step')}: {currentLogicalStep}/
        {totalLogicalSteps} | {t('playback.status')}: {getStatusLabel(status, t)}
      </p>

      <p>{getStepDescription(currentSnapshot, t)}</p>
      <p className="array-preview">
        {t('module.l01.currentArray')}: [{usedArrayPreview.join(', ')}]
      </p>
      <p className="array-preview">
        {t('module.l01.lengthCapacity')}: {currentSnapshot?.logicalLength ?? 0}/{ARRAY_CAPACITY}
      </p>
      <p>
        {t('module.s01.highlight')}:{' '}
        {(currentSnapshot?.highlights ?? [])
          .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
          .join(' | ') || t('module.s01.none')}
      </p>

      <VisualizationCanvas
        title={t('module.l01.title')}
        subtitle={t('module.canvas.arrayStage')}
        stageClassName="viz-canvas-stage-array"
      >
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
      </VisualizationCanvas>

      <div className="legend-row">
        <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
        <span className="legend-item legend-moving">{t('module.l01.highlight.moving')}</span>
        <span className="legend-item legend-inserted">{t('module.l01.highlight.inserted')}</span>
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
        <h3>{t('module.l01.pseudocode')}</h3>
        <ol>
          <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.l01.code.line1')}</li>
          <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.l01.code.line2')}</li>
          <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.l01.code.line3')}</li>
          <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.l01.code.line4')}</li>
        </ol>
      </div>
    </section>
  );
}
