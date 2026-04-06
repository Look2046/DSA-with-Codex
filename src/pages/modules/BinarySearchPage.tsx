import { useCallback, useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { buildBinarySearchTimelineFromInput } from '../../modules/search/binarySearchTimelineAdapter';
import {
  getHighlightLabel,
  getStatusLabel,
  getStepDescription,
  resolveBinarySearchConfig,
  resolveBinarySearchConfigFromJson,
  serializeBinarySearchConfigAsJson,
  type BinarySearchConfig,
} from './binarySearchPageUtils';
import type { HighlightType } from '../../types/animation';

const DEFAULT_CONFIG: BinarySearchConfig = {
  array: [1, 3, 5, 7, 9, 11],
  target: 7,
};
const MIN_SIZE = 5;
const MAX_SIZE = 20;

function createRandomSortedDataset(size: number): number[] {
  let current = Math.floor(Math.random() * 5) + 1;
  return Array.from({ length: size }, () => {
    current += Math.floor(Math.random() * 4) + 1;
    return current;
  });
}

export function BinarySearchPage() {
  const { t } = useI18n();

  const [datasetSize, setDatasetSize] = useState(DEFAULT_CONFIG.array.length);
  const [arrayInput, setArrayInput] = useState(DEFAULT_CONFIG.array.join(', '));
  const [targetInput, setTargetInput] = useState(String(DEFAULT_CONFIG.target));
  const [error, setError] = useState('');
  const [hasValidConfig, setHasValidConfig] = useState(true);
  const [config, setConfig] = useState<BinarySearchConfig>(DEFAULT_CONFIG);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonFeedback, setJsonFeedback] = useState('');
  const [hasJsonError, setHasJsonError] = useState(false);

  const { status, speedMs, currentFrame, setSpeed, setTotalFrames, play, pause, next, prev, reset } = useTimelinePlayer(0);
  const currentStep = currentFrame;

  const recomputeInputState = useCallback(
    (nextArrayInput: string, nextTargetInput: string) => {
      const resolved = resolveBinarySearchConfig(nextArrayInput, nextTargetInput, t);
      setError(resolved.error);
      setHasValidConfig(resolved.config !== null);
      if (resolved.config) {
        setConfig(resolved.config);
      }
    },
    [t],
  );

  const timelineFrames = useMemo(() => buildBinarySearchTimelineFromInput(config.array, config.target), [config]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const maxValue = useMemo(
    () => Math.max(...(currentSnapshot?.arrayState ?? config.array), 1),
    [config.array, currentSnapshot?.arrayState],
  );
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const focusPoint = useMemo(() => {
    const focusedIndex =
      typeof currentSnapshot?.foundIndex === 'number' && currentSnapshot.foundIndex >= 0
        ? currentSnapshot.foundIndex
        : (currentSnapshot?.mid ?? 0);
    const arrayLength = currentSnapshot?.arrayState.length ?? config.array.length;
    return {
      x: ((focusedIndex + 0.5) / Math.max(arrayLength, 1)) * 100,
      y: 58,
    };
  }, [config.array.length, currentSnapshot?.arrayState.length, currentSnapshot?.foundIndex, currentSnapshot?.mid]);
  const highlightSummary =
    (currentSnapshot?.highlights ?? [])
      .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
      .join(' | ') || t('module.s01.none');

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [setTotalFrames, reset, steps.length]);

  const handleExportJson = useCallback(() => {
    setJsonInput(serializeBinarySearchConfigAsJson(config));
    setHasJsonError(false);
    setJsonFeedback(t('module.sr02.json.exported'));
  }, [config, t]);

  const handleImportJson = useCallback(() => {
    const resolved = resolveBinarySearchConfigFromJson(jsonInput, t);
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
    setJsonFeedback(t('module.sr02.json.imported'));
  }, [jsonInput, recomputeInputState, reset, t]);

  const handleRegenerate = useCallback(() => {
    const nextArray = createRandomSortedDataset(datasetSize);
    const nextTarget = String(nextArray[Math.floor(nextArray.length / 2)]);
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

  const pointerTextForIndex = (index: number): string => {
    const labels: string[] = [];
    if (currentSnapshot && currentSnapshot.low === index) {
      labels.push('L');
    }
    if (currentSnapshot && currentSnapshot.mid === index) {
      labels.push('M');
    }
    if (currentSnapshot && currentSnapshot.high === index) {
      labels.push('H');
    }
    return labels.join('/');
  };

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page"
      stageAriaLabel={t('module.sr02.title')}
      title={t('module.sr02.title')}
      description={t('module.sr02.body')}
      stageClassName="workspace-stage-sorting"
      stageBodyClassName="workspace-stage-body-sorting"
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
            {t('playback.step')}: {currentStep}/{Math.max(steps.length - 1, 0)}
          </span>
          <span className="tree-workspace-pill">
            {t('module.sr02.meta.target')}: {config.target}
          </span>
          <span className="tree-workspace-pill">
            {t('module.sr02.meta.foundIndex')}: {currentSnapshot?.foundIndex ?? -1}
          </span>
          <span className="tree-workspace-pill">{getStepDescription(currentSnapshot, t)}</span>
        </>
      }
      controlsContent={
        <>
          <label className="tree-workspace-field" htmlFor="binary-search-size">
            <span>{t('module.s01.dataSize')}</span>
            <input
              id="binary-search-size"
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={datasetSize}
              onChange={(event) => setDatasetSize(Number(event.target.value))}
            />
            <strong>{datasetSize}</strong>
          </label>

          <label className="tree-workspace-field" htmlFor="binary-search-array">
            <span>{t('module.sr02.input.array')}</span>
            <input
              id="binary-search-array"
              type="text"
              value={arrayInput}
              onChange={(event) => {
                const nextValue = event.target.value;
                reset();
                setArrayInput(nextValue);
                recomputeInputState(nextValue, targetInput);
              }}
              placeholder="1, 3, 5, 7, 9"
            />
          </label>

          <label className="tree-workspace-field" htmlFor="binary-search-target">
            <span>{t('module.sr02.input.target')}</span>
            <input
              id="binary-search-target"
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

          <label className="tree-workspace-field" htmlFor="binary-search-json-input">
            <span>{t('module.sr02.json.label')}</span>
            <textarea
              id="binary-search-json-input"
              value={jsonInput}
              onChange={(event) => setJsonInput(event.target.value)}
              rows={6}
              placeholder={t('module.sr02.json.placeholder')}
            />
          </label>

          {error ? <p className="form-error workspace-inline-feedback">{error}</p> : null}
          {jsonFeedback ? (
            <p className={`${hasJsonError ? 'form-error' : 'array-preview'} workspace-inline-feedback`}>{jsonFeedback}</p>
          ) : null}

          <div className="tree-workspace-drawer-actions">
            <button type="button" className="tree-workspace-ghost-button" onClick={handleRegenerate}>
              {t('module.s01.regenerate')}
            </button>
            <button type="button" className="tree-workspace-ghost-button" onClick={handleExportJson}>
              {t('module.sr02.json.export')}
            </button>
            <button type="button" className="tree-workspace-ghost-button" onClick={handleImportJson}>
              {t('module.sr02.json.import')}
            </button>
          </div>
        </>
      }
      stepContent={
        <div className="workspace-panel-scroll">
          <div className="workspace-panel-copy">
            <h3>{getStepDescription(currentSnapshot, t)}</h3>
            <p>
              {t('module.sr02.currentArray')}: [{(currentSnapshot?.arrayState ?? []).join(', ')}]
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
              <dt>{t('module.sr02.meta.target')}</dt>
              <dd>{config.target}</dd>
            </div>
            <div>
              <dt>L / M / H</dt>
              <dd>
                {currentSnapshot?.low ?? '-'} / {currentSnapshot?.mid ?? '-'} / {currentSnapshot?.high ?? '-'}
              </dd>
            </div>
            <div>
              <dt>{t('module.sr02.meta.foundIndex')}</dt>
              <dd>{currentSnapshot?.foundIndex ?? -1}</dd>
            </div>
            <div>
              <dt>{t('module.s01.highlight')}</dt>
              <dd>{highlightSummary}</dd>
            </div>
          </dl>

          <div className="legend-row">
            <span className="legend-item legend-visiting">{t('module.sr02.legend.window')}</span>
            <span className="legend-item legend-comparing">{t('module.s01.legend.comparing')}</span>
            <span className="legend-item legend-matched">{t('module.sr02.legend.found')}</span>
            <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
          </div>

          <div className="pseudocode-block">
            <h3>{t('module.s01.pseudocode')}</h3>
            <ol>
              <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.sr02.code.line1')}</li>
              <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.sr02.code.line2')}</li>
              <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.sr02.code.line3')}</li>
              <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.sr02.code.line4')}</li>
              <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.sr02.code.line5')}</li>
              <li className={currentSnapshot?.codeLines.includes(6) ? 'code-active' : ''}>{t('module.sr02.code.line6')}</li>
              <li className={currentSnapshot?.codeLines.includes(7) ? 'code-active' : ''}>{t('module.sr02.code.line7')}</li>
              <li className={currentSnapshot?.codeLines.includes(8) ? 'code-active' : ''}>{t('module.sr02.code.line8')}</li>
            </ol>
          </div>
        </div>
      }
      stageContent={
        <div className="array-bars" aria-label="binary-search-bars">
          {(currentSnapshot?.arrayState ?? []).map((value, index) => {
            const highlight = highlightMap.get(index) ?? 'default';
            const pointerText = pointerTextForIndex(index);
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
            onClick={next}
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
            {currentStep}/{Math.max(steps.length - 1, 0)}
          </span>
        </>
      }
      transportRight={
        <>
          <span className="tree-workspace-transport-chip">L:{currentSnapshot?.low ?? '-'}</span>
          <span className="tree-workspace-transport-chip">M:{currentSnapshot?.mid ?? '-'}</span>
          <span className="tree-workspace-transport-chip">H:{currentSnapshot?.high ?? '-'}</span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {currentSnapshot?.foundIndex ?? -1}
          </span>
        </>
      }
    />
  );
}
