import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { buildHeapSortTimelineFromInput } from '../../modules/sorting/heapTimelineAdapter';
import type { HeapSortStep } from '../../modules/sorting/heapSort';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

const DEFAULT_SIZE = 10;
const MIN_SIZE = 5;
const MAX_SIZE = 100;
const COMPACT_BAR_LABEL_THRESHOLD = 32;
const CODE_LINE_KEYS = [
  'module.s07.code.line1',
  'module.s07.code.line2',
  'module.s07.code.line3',
  'module.s07.code.line4',
  'module.s07.code.line5',
  'module.s07.code.line6',
  'module.s07.code.line7',
  'module.s07.code.line8',
  'module.s07.code.line9',
  'module.s07.code.line10',
  'module.s07.code.line11',
] as const;

function createRandomDataset(size: number): number[] {
  const poolSize = Math.max(90, size);
  const values = Array.from({ length: poolSize }, (_, index) => 10 + index);

  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }

  return values.slice(0, size);
}

function createAscendingDataset(size: number): number[] {
  const step = Math.max(1, Math.floor(80 / Math.max(size - 1, 1)));
  return Array.from({ length: size }, (_, index) => 10 + index * step);
}

function createDescendingDataset(size: number): number[] {
  return [...createAscendingDataset(size)].reverse();
}

function createNearlySortedDataset(size: number): number[] {
  const values = createAscendingDataset(size);
  const swapCount = Math.max(1, Math.floor(size / 5));

  for (let index = 0; index < swapCount; index += 1) {
    const leftIndex = Math.floor(Math.random() * (size - 1));
    const rightIndex = Math.min(size - 1, leftIndex + 1 + Math.floor(Math.random() * 2));
    [values[leftIndex], values[rightIndex]] = [values[rightIndex], values[leftIndex]];
  }

  return values;
}

function getStatusLabel(status: PlaybackStatus, t: ReturnType<typeof useI18n>['t']): string {
  switch (status) {
    case 'idle':
      return t('playback.status.idle');
    case 'playing':
      return t('playback.status.playing');
    case 'paused':
      return t('playback.status.paused');
    case 'completed':
      return t('playback.status.completed');
    default:
      return status;
  }
}

function getStepDescription(step: HeapSortStep | undefined, t: ReturnType<typeof useI18n>['t']): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.s07.step.initial');
  }
  if (step.action === 'heapifyStart') {
    return `${t('module.s07.step.heapifyStart')} ${step.indices[0] ?? '-'}`;
  }
  if (step.action === 'compare') {
    return step.phase === 'build'
      ? `${t('module.s07.step.buildCompare')} ${step.indices[0]} ${t('module.s01.step.and')} ${step.indices[1]}`
      : `${t('module.s07.step.sortCompare')} ${step.indices[0]} ${t('module.s01.step.and')} ${step.indices[1]}`;
  }
  if (step.action === 'swap') {
    return step.phase === 'build'
      ? `${t('module.s07.step.buildSwap')} ${step.indices[0]} ${t('module.s01.step.and')} ${step.indices[1]}`
      : `${t('module.s07.step.sortSwap')} ${step.indices[0]} ${t('module.s01.step.and')} ${step.indices[1]}`;
  }
  if (step.action === 'heapBuilt') {
    return t('module.s07.step.heapBuilt');
  }
  if (step.action === 'extractMax') {
    return `${t('module.s07.step.extractMax')} ${step.indices[1] ?? '-'}`;
  }
  return t('module.s07.step.completed');
}

function getHighlightLabel(type: HighlightType, t: ReturnType<typeof useI18n>['t']): string {
  if (type === 'comparing') {
    return t('module.s01.highlight.comparing');
  }
  if (type === 'swapping') {
    return t('module.s04.highlight.shifting');
  }
  if (type === 'sorted') {
    return t('module.s01.highlight.sorted');
  }
  if (type === 'visiting') {
    return t('module.s07.highlight.heapPath');
  }
  return t('module.s01.highlight.default');
}

function getBarHeightPercent(value: number, maxValue: number): number {
  if (maxValue <= 0) {
    return 0;
  }
  return (value / maxValue) * 100;
}

function formatArrayPreview(values: number[], maxVisible = 24): string {
  if (values.length <= maxVisible) {
    return values.join(', ');
  }
  const leftCount = Math.floor(maxVisible / 2);
  const rightCount = maxVisible - leftCount;
  const leftPart = values.slice(0, leftCount).join(', ');
  const rightPart = values.slice(-rightCount).join(', ');
  return `${leftPart}, ..., ${rightPart} (n=${values.length})`;
}

function getHeapSortBarStateClass(highlight: HighlightType | 'default'): string {
  if (highlight === 'comparing') {
    return 'shell-bar-comparing';
  }
  if (highlight === 'swapping') {
    return 'shell-bar-moving';
  }
  if (highlight === 'sorted') {
    return 'shell-bar-sorted';
  }
  return '';
}

export function HeapSortPage() {
  const { t } = useI18n();
  const [datasetSize, setDatasetSize] = useState(DEFAULT_SIZE);
  const [inputData, setInputData] = useState<number[]>(() => createRandomDataset(DEFAULT_SIZE));

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildHeapSortTimelineFromInput(inputData), [inputData]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const arrayState = currentSnapshot?.arrayState ?? inputData;
  const barCount = arrayState.length;
  const isCompactBarMode = barCount > COMPACT_BAR_LABEL_THRESHOLD;
  const indexLabelStep = barCount <= 24 ? 1 : barCount <= 40 ? 2 : barCount <= 70 ? 5 : 10;
  const maxValue = useMemo(() => Math.max(...arrayState, 1), [arrayState]);
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const isFinaleFrame = currentSnapshot?.action === 'completed';
  const codeLines = useMemo(() => CODE_LINE_KEYS.map((key) => t(key)), [t]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, HeapSortStep['highlights'][number]['type']>();
    (currentSnapshot?.highlights ?? []).forEach((item) => map.set(item.index, item.type));
    return map;
  }, [currentSnapshot]);

  const sortedIndexSet = useMemo(() => {
    const sorted = new Set<number>();
    if (!currentSnapshot) {
      return sorted;
    }

    if (currentSnapshot.action === 'completed') {
      currentSnapshot.arrayState.forEach((_, index) => sorted.add(index));
      return sorted;
    }

    for (let index = currentSnapshot.heapSize; index < currentSnapshot.arrayState.length; index += 1) {
      sorted.add(index);
    }

    return sorted;
  }, [currentSnapshot]);

  const activeHeapSet = useMemo(() => {
    const active = new Set<number>();
    const heapSize = currentSnapshot?.action === 'completed' ? 0 : (currentSnapshot?.heapSize ?? 0);
    for (let index = 0; index < heapSize; index += 1) {
      active.add(index);
    }
    return active;
  }, [currentSnapshot]);

  const focusPoint = useMemo(() => {
    if (currentSnapshot?.indices.length === 0 || arrayState.length === 0) {
      return null;
    }

    const anchorIndex = currentSnapshot.indices[0] ?? 0;
    return {
      x: ((anchorIndex + 0.5) / Math.max(arrayState.length, 1)) * 100,
      y: 44,
    };
  }, [currentSnapshot, arrayState.length]);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const highlightSummary = currentSnapshot?.highlights.length
    ? currentSnapshot.highlights.map((item) => `#${item.index} ${getHighlightLabel(item.type, t)}`).join(' · ')
    : t('module.s07.highlight.idle');

  const currentIndicesText = currentSnapshot?.indices.length
    ? currentSnapshot.indices.map((index) => `#${index}`).join(', ')
    : '-';

  const heapSize = currentSnapshot?.action === 'completed' ? 0 : (currentSnapshot?.heapSize ?? 0);
  const sortedCount = sortedIndexSet.size;

  const regenerateData = (generator: (size: number) => number[]) => {
    setInputData(generator(datasetSize));
    reset();
  };

  return (
    <WorkspaceShell
      pageClassName="bubble-page tree-page"
      shellClassName="workspace-shell-sorting"
      title={t('module.s07.title')}
      description={t('module.s07.body')}
      stageAriaLabel={t('module.s07.stage')}
      stageClassName="bubble-stage"
      stageMeta={
        <>
          <span className="bubble-stage-pill bubble-stage-pill-active">
            {t('playback.status')}: {getStatusLabel(status, t)}
          </span>
          <span className="bubble-stage-pill">
            {t('module.s07.meta.heapSize')}: {heapSize}
          </span>
          <span className="bubble-stage-pill">
            {t('module.s07.meta.sortedSuffix')}: {sortedCount}
          </span>
          <span className="bubble-stage-pill">{getStepDescription(currentSnapshot, t)}</span>
        </>
      }
      focusPoint={focusPoint}
      controlsContent={
        <div className="workspace-panel-scroll">
          <div className="tree-workspace-field">
            <label htmlFor="heap-sort-size">{t('module.s01.dataSize')}</label>
            <div className="bubble-control-row">
              <input
                id="heap-sort-size"
                type="range"
                min={MIN_SIZE}
                max={MAX_SIZE}
                value={datasetSize}
                onChange={(event) => {
                  const nextSize = Number(event.target.value);
                  setDatasetSize(nextSize);
                  setInputData(createRandomDataset(nextSize));
                  reset();
                }}
              />
              <strong>{datasetSize}</strong>
            </div>
          </div>

          <div className="tree-workspace-field">
            <label>{t('module.s01.sample')}</label>
            <textarea
              className="bubble-textarea"
              value={inputData.join(', ')}
              onChange={(event) => {
                const next = event.target.value
                  .split(',')
                  .map((value) => Number(value.trim()))
                  .filter((value) => Number.isFinite(value));
                if (next.length >= MIN_SIZE) {
                  setInputData(next);
                  setDatasetSize(next.length);
                  reset();
                }
              }}
            />
          </div>

          <div className="bubble-btn-row">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => regenerateData(createRandomDataset)}
            >
              {t('module.s01.generate.random')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => regenerateData(createAscendingDataset)}
            >
              {t('module.s01.generate.ascending')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => regenerateData(createDescendingDataset)}
            >
              {t('module.s01.generate.descending')}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => regenerateData(createNearlySortedDataset)}
            >
              {t('module.s01.generate.nearlySorted')}
            </button>
          </div>

          <div className="tree-workspace-field">
            <label>{t('module.s01.speed')}</label>
            <div className="bubble-btn-row">
              {[1200, 700, 350].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`btn ${speedMs === value ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSpeed(value)}
                >
                  {value === 1200 ? t('module.s01.speed.slow') : value === 700 ? t('module.s01.speed.normal') : t('module.s01.speed.fast')}
                </button>
              ))}
            </div>
          </div>
        </div>
      }
      stepContent={
        <div className="workspace-panel-scroll">
          <div className="workspace-panel-copy">
            <h3>{getStepDescription(currentSnapshot, t)}</h3>
            <p>
              {t('module.s01.currentArray')}: [{formatArrayPreview(currentSnapshot?.arrayState ?? [])}]
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
              <dt>{t('module.s01.dataSize')}</dt>
              <dd>{datasetSize}</dd>
            </div>
            <div>
              <dt>{t('module.s07.meta.heapSize')}</dt>
              <dd>{heapSize}</dd>
            </div>
            <div>
              <dt>{t('module.s07.meta.sortedSuffix')}</dt>
              <dd>
                {sortedCount}/{arrayState.length}
              </dd>
            </div>
            <div>
              <dt>{t('module.s01.highlight')}</dt>
              <dd>{highlightSummary}</dd>
            </div>
            <div>
              <dt>{t('module.s07.meta.active')}</dt>
              <dd>{currentIndicesText}</dd>
            </div>
          </dl>

          <div className="legend-row">
            <span className="legend-item legend-comparing">{t('module.s01.legend.comparing')}</span>
            <span className="legend-item legend-moving">{t('module.s01.legend.swapping')}</span>
            <span className="legend-item legend-sorted">{t('module.s01.legend.sorted')}</span>
            <span className="legend-item legend-default">{t('module.s07.legend.heap')}</span>
          </div>

          <div className="pseudocode-block">
            <h3>{t('module.s01.pseudocode')}</h3>
            <ol>
              {codeLines.map((line, index) => {
                const lineNumber = index + 1;
                const isActive = currentSnapshot?.codeLines.includes(lineNumber) ?? false;
                return (
                  <li key={lineNumber} className={isActive ? 'code-active' : ''}>
                    {line}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      }
      stageContent={
        <div
          className="shell-stage-track"
          style={
            {
              '--shell-count': Math.max(barCount, 1),
              '--shell-front-slots': 0,
              '--shell-motion-duration': `${Math.max(140, Math.floor(speedMs * 0.72))}ms`,
            } as CSSProperties
          }
        >
          <div
            className={`array-bars shell-array-bars${isCompactBarMode ? ' shell-array-bars-compact' : ''}`}
            aria-label="array-visualizer-s07"
          >
            {arrayState.map((value, index) => {
              const frameHighlight = highlightMap.get(index);
              const highlight = frameHighlight ?? (sortedIndexSet.has(index) ? 'sorted' : 'default');
              const barStateClass = getHeapSortBarStateClass(highlight);
              const barClassName = `array-bar shell-bar${barStateClass ? ` ${barStateClass}` : ''}${
                isFinaleFrame ? ' bar-finale' : ''
              }${activeHeapSet.has(index) && !sortedIndexSet.has(index) ? ' shell-bar-heap-active' : ''}`;
              const barStyle = {
                height: `${getBarHeightPercent(value, maxValue)}%`,
                '--shell-group-color': 'transparent',
                '--piano-order': index,
              } as CSSProperties;

              return (
                <div key={index} className={barClassName} style={barStyle} aria-label={`index-${index}-value-${value}`}>
                  {!isCompactBarMode ? <span>{value}</span> : null}
                </div>
              );
            })}
          </div>
          <div className={`shell-index-row${isCompactBarMode ? ' shell-index-row-compact' : ''}`} aria-hidden="true">
            {arrayState.map((_, index) => (
              <span key={index} className="shell-index-cell">
                {index % indexLabelStep === 0 ? index : ''}
              </span>
            ))}
          </div>
        </div>
      }
      transportLeft={
        <>
          <button type="button" className="tree-workspace-transport-btn" onClick={prev} disabled={steps.length === 0 || currentStep <= 0}>
            {t('playback.prev')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn tree-workspace-transport-btn-primary"
            onClick={status === 'playing' ? pause : play}
            disabled={steps.length === 0 || (status !== 'playing' && isAtLastFrame)}
          >
            {status === 'playing' ? t('playback.pause') : t('playback.play')}
          </button>
          <button type="button" className="tree-workspace-transport-btn" onClick={next} disabled={isAtLastFrame}>
            {t('playback.next')}
          </button>
          <button type="button" className="tree-workspace-transport-btn" onClick={reset} disabled={steps.length === 0}>
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
          <span className="tree-workspace-transport-chip">
            {t('module.s07.meta.heapSize')}: {heapSize}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.s07.meta.sortedSuffix')}: {sortedCount}
          </span>
          {currentSnapshot.indices.map((index) => (
            <span key={index} className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
              #{index}
            </span>
          ))}
        </>
      }
    />
  );
}
