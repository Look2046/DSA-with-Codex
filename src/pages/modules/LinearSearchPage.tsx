import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { useI18n } from '../../i18n/useI18n';
import { buildLinearSearchTimelineFromInput } from '../../modules/search/linearSearchTimelineAdapter';
import {
  LINEAR_SEARCH_CAPACITY,
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  resolveLinearSearchConfig,
  resolveLinearSearchConfigFromJson,
  serializeLinearSearchConfigAsJson,
  type LinearSearchConfig,
} from './linearSearchPageUtils';
import type { HighlightType } from '../../types/animation';

const DEFAULT_CONFIG: LinearSearchConfig = {
  array: [4, 1, 7, 3, 9, 5],
  target: 7,
};
const MIN_SIZE = 5;
const MAX_SIZE = 20;

function createRandomDataset(size: number): number[] {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 99) + 1);
}

export function LinearSearchPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [datasetSize, setDatasetSize] = useState(DEFAULT_CONFIG.array.length);
  const [arrayInput, setArrayInput] = useState(DEFAULT_CONFIG.array.join(', '));
  const [targetInput, setTargetInput] = useState(String(DEFAULT_CONFIG.target));
  const [error, setError] = useState('');
  const [hasValidConfig, setHasValidConfig] = useState(true);
  const [config, setConfig] = useState<LinearSearchConfig>(DEFAULT_CONFIG);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonFeedback, setJsonFeedback] = useState('');
  const [hasJsonError, setHasJsonError] = useState(false);

  const { status, speedMs, currentFrame, setSpeed, setTotalFrames, play, pause, next, prev, reset } = useTimelinePlayer(0);
  const currentStep = currentFrame;

  const recomputeInputState = useCallback(
    (nextArrayInput: string, nextTargetInput: string) => {
      const resolved = resolveLinearSearchConfig(nextArrayInput, nextTargetInput, t);
      setError(resolved.error);
      setHasValidConfig(resolved.config !== null);
      if (resolved.config) {
        setConfig(resolved.config);
      }
    },
    [t],
  );

  const timelineFrames = useMemo(() => buildLinearSearchTimelineFromInput(config.array, config.target), [config]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const maxValue = useMemo(() => Math.max(...(currentSnapshot?.arrayState ?? config.array), 1), [config.array, currentSnapshot?.arrayState]);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [setTotalFrames, reset, steps.length]);

  const handleExportJson = useCallback(() => {
    setJsonInput(serializeLinearSearchConfigAsJson(config));
    setHasJsonError(false);
    setJsonFeedback(t('module.sr01.json.exported'));
  }, [config, t]);

  const handleImportJson = useCallback(() => {
    const resolved = resolveLinearSearchConfigFromJson(jsonInput, t);
    if (!resolved.config) {
      setHasJsonError(true);
      setJsonFeedback(resolved.error);
      return;
    }

    const nextArrayInput = resolved.config.array.join(', ');
    const nextTargetInput = String(resolved.config.target);

    reset();
    setArrayInput(nextArrayInput);
    setTargetInput(nextTargetInput);
    recomputeInputState(nextArrayInput, nextTargetInput);
    setHasJsonError(false);
    setJsonFeedback(t('module.sr01.json.imported'));
  }, [jsonInput, recomputeInputState, reset, t]);

  const handleRegenerate = useCallback(() => {
    const nextArray = createRandomDataset(datasetSize);
    const targetIndex = Math.floor(Math.random() * nextArray.length);
    const nextTarget = String(nextArray[targetIndex] ?? 0);
    const nextArrayInput = nextArray.join(', ');

    reset();
    setArrayInput(nextArrayInput);
    setTargetInput(nextTarget);
    recomputeInputState(nextArrayInput, nextTarget);
  }, [datasetSize, recomputeInputState, reset]);

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
      <h2>{t('module.sr01.title')}</h2>
      <p>{t('module.sr01.body')}</p>

      <div className="array-form">
        <label htmlFor="linear-search-size">
          <span>{t('module.s01.dataSize')}</span>
          <input
            id="linear-search-size"
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={datasetSize}
            onChange={(event) => setDatasetSize(Number(event.target.value))}
          />
          <strong>{datasetSize}</strong>
        </label>
        <label htmlFor="linear-search-array">
          <span>{t('module.sr01.input.array')}</span>
          <input
            id="linear-search-array"
            value={arrayInput}
            onChange={(event) => {
              const nextValue = event.target.value;
              reset();
              setArrayInput(nextValue);
              recomputeInputState(nextValue, targetInput);
            }}
            placeholder="4, 1, 7, 3, 9"
          />
        </label>
        <label htmlFor="linear-search-target">
          <span>{t('module.sr01.input.target')}</span>
          <input
            id="linear-search-target"
            type="number"
            value={targetInput}
            onChange={(event) => {
              const nextValue = event.target.value;
              reset();
              setTargetInput(nextValue);
              recomputeInputState(arrayInput, nextValue);
            }}
          />
        </label>
        <button type="button" onClick={handleRegenerate}>
          {t('module.s01.regenerate')}
        </button>
      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="array-form">
        <label htmlFor="linear-search-json-input">
          <span>{t('module.sr01.json.label')}</span>
          <textarea
            id="linear-search-json-input"
            value={jsonInput}
            onChange={(event) => setJsonInput(event.target.value)}
            rows={6}
            placeholder={t('module.sr01.json.placeholder')}
          />
        </label>
      </div>
      <div className="playback-actions">
        <button type="button" onClick={handleExportJson}>
          {t('module.sr01.json.export')}
        </button>
        <button type="button" onClick={handleImportJson}>
          {t('module.sr01.json.import')}
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

      <div className="module-status-block">
        <p className="module-status-line">
          {t('module.s01.moduleLabel')}: {currentModule?.id ?? '-'} | {t('playback.step')}: {currentStep}/
          {Math.max(steps.length - 1, 0)} | {t('playback.status')}: {getStatusLabel(status, t)}
        </p>
        <p className="module-status-line">{getStepDescription(currentSnapshot, t)}</p>
        <p className="module-status-line">{t('module.sr01.meta.foundIndex')}: {currentSnapshot?.foundIndex ?? -1}</p>
      </div>

      <p className="array-preview">
        {t('module.sr01.currentArray')}: [{(currentSnapshot?.arrayState ?? []).join(', ')}]
      </p>
      <p className="array-preview">
        {t('module.l01.lengthCapacity')}: {(currentSnapshot?.arrayState ?? []).length}/{LINEAR_SEARCH_CAPACITY}
      </p>
      <p className="array-preview">
        {t('module.sr01.meta.target')}: {config.target} | {t('module.sr01.meta.currentIndex')}:{' '}
        {currentSnapshot?.currentIndex ?? 0}
      </p>
      <p>
        {t('module.s01.highlight')}:{' '}
        {(currentSnapshot?.highlights ?? [])
          .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
          .join(' | ') || t('module.s01.none')}
      </p>

      <VisualizationCanvas
        title={t('module.sr01.title')}
        subtitle={t('module.sr01.stage')}
        stageClassName="viz-canvas-stage-sorting"
      >
        <div className="binary-search-stage-head">
          <span className="array-preview">
            {t('module.sr01.meta.target')}: <strong>{config.target}</strong>
          </span>
          <span className="array-preview">
            {t('module.sr01.meta.foundIndex')}: <strong>{currentSnapshot?.foundIndex ?? -1}</strong>
          </span>
        </div>
        <div className="array-bars" aria-label="linear-search-bars">
          {(currentSnapshot?.arrayState ?? []).map((value, index) => {
            const highlight = highlightMap.get(index) ?? 'default';
            const pointerText = currentSnapshot?.currentIndex === index ? 'i' : '';
            return (
              <div
                key={`${index}-${value}`}
                className={`array-bar bar-${highlight}`}
                style={{ height: `${(value / maxValue) * 100}%` }}
              >
                {pointerText ? <span className="binary-bar-pointer">{pointerText}</span> : null}
                <span>{value}</span>
              </div>
            );
          })}
        </div>
      </VisualizationCanvas>

      <div className="legend-row">
        <span className="legend-item legend-comparing">{t('module.s01.legend.comparing')}</span>
        <span className="legend-item legend-visiting">{t('module.sr01.legend.visited')}</span>
        <span className="legend-item legend-matched">{t('module.sr01.legend.found')}</span>
        <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
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
        <button type="button" onClick={next} disabled={!hasValidConfig || steps.length === 0}>
          {t('playback.next')}
        </button>
        <button type="button" onClick={reset} disabled={!hasValidConfig || steps.length === 0}>
          {t('playback.reset')}
        </button>
      </div>

      <div className="pseudocode-block">
        <h3>{t('module.sr01.pseudocode')}</h3>
        <ol>
          <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.sr01.code.line1')}</li>
          <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.sr01.code.line2')}</li>
          <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.sr01.code.line3')}</li>
          <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.sr01.code.line4')}</li>
          <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.sr01.code.line5')}</li>
          <li className={currentSnapshot?.codeLines.includes(6) ? 'code-active' : ''}>{t('module.sr01.code.line6')}</li>
        </ol>
      </div>
    </section>
  );
}
