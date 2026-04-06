import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useI18n } from '../../i18n/useI18n';
import type { SelectionSortStep } from '../../modules/sorting/selectionSort';
import { buildSelectionSortTimelineFromInput } from '../../modules/sorting/selectionTimelineAdapter';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

const DEFAULT_SIZE = 10;
const MIN_SIZE = 5;
const MAX_SIZE = 100;
const COMPACT_BAR_LABEL_THRESHOLD = 32;

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

function getStepDescription(step: SelectionSortStep | undefined, t: ReturnType<typeof useI18n>['t']): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.s02.step.initial');
  }

  if (step.action === 'selectCandidate') {
    return `${t('module.s02.step.selectCandidate')} ${step.indices[0]}`;
  }

  if (step.action === 'compare') {
    return `${t('module.s02.step.compare')} ${step.indices[0]} ${t('module.s01.step.and')} ${step.indices[1]}`;
  }

  if (step.action === 'newMin') {
    return `${t('module.s02.step.newMin')} ${step.indices[0]}`;
  }

  if (step.action === 'swap') {
    return `${t('module.s02.step.swap')} ${step.indices[0]} ${t('module.s01.step.and')} ${step.indices[1]}`;
  }

  if (step.action === 'sortedMark') {
    return `${t('module.s02.step.sorted')} ${step.indices[0]}`;
  }

  return t('module.s02.step.completed');
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

function getSelectionBarStateClass(highlight: HighlightType | 'default'): string {
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

type MotionGhostSpec = {
  key: string;
  value: number;
  sourceIndex: number;
  targetIndex: number;
};

export function SelectionSortPage() {
  const { t } = useI18n();

  const [datasetSize, setDatasetSize] = useState(DEFAULT_SIZE);
  const [inputData, setInputData] = useState<number[]>(() => createRandomDataset(DEFAULT_SIZE));
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);
  const ghostRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } = useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildSelectionSortTimelineFromInput(inputData), [inputData]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const currentAction = currentSnapshot?.action;
  const arrayState = currentSnapshot?.arrayState ?? inputData;
  const barCount = arrayState.length;
  const isCompactBarMode = barCount > COMPACT_BAR_LABEL_THRESHOLD;
  const indexLabelStep =
    barCount <= 24 ? 1 : barCount <= 40 ? 2 : barCount <= 70 ? 5 : 10;
  const motionDurationMs = useMemo(() => Math.max(140, Math.floor(speedMs * 0.72)), [speedMs]);
  const isFinaleFrame = currentSnapshot?.action === 'completed';
  const maxValue = useMemo(() => Math.max(...arrayState, 1), [arrayState]);
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  const highlightMap = useMemo(() => {
    const map = new Map<number, SelectionSortStep['highlights'][number]['type']>();
    (currentSnapshot?.highlights ?? []).forEach((item) => map.set(item.index, item.type));
    return map;
  }, [currentSnapshot]);
  const hiddenIndexSet = useMemo(() => {
    if (currentAction === 'swap' && currentSnapshot.indices.length === 2) {
      return new Set(currentSnapshot.indices);
    }
    return new Set<number>();
  }, [currentAction, currentSnapshot.indices]);

  const motionGhosts = useMemo<MotionGhostSpec[]>(() => {
    if (currentAction !== 'swap' || currentSnapshot.indices.length !== 2) {
      return [];
    }
    const [leftIndex, rightIndex] = currentSnapshot.indices;
    const leftToRightValue = currentSnapshot.arrayState[rightIndex];
    const rightToLeftValue = currentSnapshot.arrayState[leftIndex];
    return [
      {
        key: `swap-lr-${currentStep}-${leftIndex}-${rightIndex}-${leftToRightValue}`,
        value: leftToRightValue,
        sourceIndex: leftIndex,
        targetIndex: rightIndex,
      },
      {
        key: `swap-rl-${currentStep}-${leftIndex}-${rightIndex}-${rightToLeftValue}`,
        value: rightToLeftValue,
        sourceIndex: rightIndex,
        targetIndex: leftIndex,
      },
    ];
  }, [currentAction, currentSnapshot, currentStep]);

  useLayoutEffect(() => {
    motionGhosts.forEach((ghost) => {
      const ghostElement = ghostRefs.current[ghost.key];
      const sourceElement = barRefs.current[ghost.sourceIndex];
      const targetElement = barRefs.current[ghost.targetIndex];
      if (!ghostElement || !sourceElement || !targetElement) {
        return;
      }
      const startLeft = sourceElement.offsetLeft;
      const deltaX = targetElement.offsetLeft - sourceElement.offsetLeft;
      ghostElement.style.setProperty('--shell-ghost-start-left', `${startLeft}px`);
      ghostElement.style.setProperty('--shell-ghost-delta-x', `${deltaX}px`);
    });
  }, [motionGhosts]);

  const sortedIndexSet = useMemo(() => {
    const sorted = new Set<number>();
    for (let frameIndex = 0; frameIndex <= currentStep && frameIndex < steps.length; frameIndex += 1) {
      const step = steps[frameIndex];
      if (!step) {
        continue;
      }
      if (step.action === 'sortedMark' && step.indices.length > 0) {
        sorted.add(step.indices[0]);
      }
      if (step.action === 'completed') {
        step.arrayState.forEach((_, index) => sorted.add(index));
      }
    }
    return sorted;
  }, [steps, currentStep]);
  const focusPoint = useMemo(() => {
    if (currentSnapshot.indices.length === 0 || arrayState.length === 0) {
      return null;
    }

    const averageIndex = currentSnapshot.indices.reduce((sum, value) => sum + value, 0) / currentSnapshot.indices.length;
    return {
      x: ((averageIndex + 0.5) / arrayState.length) * 100,
      y: 58,
    };
  }, [arrayState.length, currentSnapshot.indices]);
  const currentIndicesText = currentSnapshot.indices.length > 0 ? currentSnapshot.indices.join(', ') : '-';
  const highlightSummary =
    (currentSnapshot?.highlights ?? [])
      .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
      .join(' | ') || t('module.s01.none');

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [setTotalFrames, reset, steps.length]);

  const regenerateData = (generator: (size: number) => number[]) => {
    setInputData(generator(datasetSize));
    reset();
  };

  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1200 },
    { key: 'module.s01.speed.normal', value: 700 },
    { key: 'module.s01.speed.fast', value: 350 },
    { key: 'module.s01.speed.faster', value: 175 },
    { key: 'module.s01.speed.fastest', value: 88 },
    { key: 'module.s01.speed.ultra', value: 44 },
    { key: 'module.s01.speed.extreme', value: 22 },
    { key: 'module.s01.speed.hyper', value: 11 },
    { key: 'module.s01.speed.insane', value: 6 },
  ] as const;

  return (
    <WorkspaceShell
      pageClassName="bubble-page tree-page"
      shellClassName="workspace-shell-sorting"
      stageAriaLabel={t('module.s02.title')}
      title={t('module.s02.title')}
      description={t('module.s02.body')}
      stageClassName="workspace-stage-sorting"
      stageBodyClassName="workspace-stage-body-sorting"
      controlsPanelClassName="workspace-drawer-wide workspace-drawer-scroll"
      stepPanelClassName="workspace-context-sheet-wide workspace-context-sheet-rich"
      defaultControlsPanelSize={{ width: 286, height: 520 }}
      defaultContextPanelSize={{ width: 320, height: 520 }}
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
            {t('module.s01.dataSize')}: {datasetSize}
          </span>
          <span className="tree-workspace-pill">{getStepDescription(currentSnapshot, t)}</span>
        </>
      }
      controlsContent={
        <>
          <label className="tree-workspace-field" htmlFor="dataset-size-s02">
            <span>{t('module.s01.dataSize')}</span>
            <input
              id="dataset-size-s02"
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={datasetSize}
              onChange={(event) => setDatasetSize(Number(event.target.value))}
            />
            <strong>{datasetSize}</strong>
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

          <div className="tree-workspace-field">
            <span>{t('module.s01.regenerate')}</span>
            <div className="tree-workspace-toggle-row">
              <button type="button" className="tree-workspace-ghost-button" onClick={() => regenerateData(createRandomDataset)}>
                {t('module.s01.generate.random')}
              </button>
              <button type="button" className="tree-workspace-ghost-button" onClick={() => regenerateData(createNearlySortedDataset)}>
                {t('module.s01.generate.nearlySorted')}
              </button>
            </div>
            <div className="tree-workspace-toggle-row">
              <button type="button" className="tree-workspace-ghost-button" onClick={() => regenerateData(createAscendingDataset)}>
                {t('module.s01.generate.ascending')}
              </button>
              <button type="button" className="tree-workspace-ghost-button" onClick={() => regenerateData(createDescendingDataset)}>
                {t('module.s01.generate.descending')}
              </button>
            </div>
          </div>

          <div className="tree-workspace-sample-block">
            <span>{t('module.s01.sample')}</span>
            <code>[{formatArrayPreview(inputData)}]</code>
          </div>
        </>
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
              <dt>{t('module.s01.highlight')}</dt>
              <dd>{highlightSummary}</dd>
            </div>
            <div>
              <dt>{t('module.s01.legend.sorted')}</dt>
              <dd>
                {sortedIndexSet.size}/{arrayState.length}
              </dd>
            </div>
            <div>
              <dt>{t('module.s01.highlight.comparing')}</dt>
              <dd>{currentIndicesText}</dd>
            </div>
          </dl>

          <div className="legend-row">
            <span className="legend-item legend-comparing">{t('module.s01.legend.comparing')}</span>
            <span className="legend-item legend-moving">{t('module.s01.legend.swapping')}</span>
            <span className="legend-item legend-sorted">{t('module.s01.legend.sorted')}</span>
            <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
          </div>

          <div className="pseudocode-block">
            <h3>{t('module.s01.pseudocode')}</h3>
            <ol>
              <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.s02.code.line1')}</li>
              <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.s02.code.line2')}</li>
              <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.s02.code.line3')}</li>
              <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.s02.code.line4')}</li>
              <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.s02.code.line5')}</li>
              <li className={currentSnapshot?.codeLines.includes(6) ? 'code-active' : ''}>{t('module.s02.code.line6')}</li>
              <li className={currentSnapshot?.codeLines.includes(7) ? 'code-active' : ''}>{t('module.s02.code.line7')}</li>
              <li className={currentSnapshot?.codeLines.includes(8) ? 'code-active' : ''}>{t('module.s02.code.line8')}</li>
              <li className={currentSnapshot?.codeLines.includes(9) ? 'code-active' : ''}>{t('module.s02.code.line9')}</li>
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
              '--shell-motion-duration': `${motionDurationMs}ms`,
            } as CSSProperties
          }
        >
          <div
            className={`array-bars shell-array-bars${isCompactBarMode ? ' shell-array-bars-compact' : ''}`}
            aria-label="array-visualizer-s02"
          >
            {motionGhosts.map((ghost) => (
              <div
                key={ghost.key}
                ref={(node) => {
                  ghostRefs.current[ghost.key] = node;
                }}
                className="shell-motion-ghost shell-motion-ghost-shift"
                style={{ height: `${getBarHeightPercent(ghost.value, maxValue)}%` }}
              >
                <span>{ghost.value}</span>
              </div>
            ))}
            {arrayState.map((value, index) => {
              const frameHighlight = highlightMap.get(index);
              const highlight = frameHighlight ?? (sortedIndexSet.has(index) ? 'sorted' : 'default');
              const barStateClass = getSelectionBarStateClass(highlight);
              const barClassName = `array-bar shell-bar${barStateClass ? ` ${barStateClass}` : ''}${
                hiddenIndexSet.has(index) ? ' shell-motion-hidden' : ''
              }${isFinaleFrame ? ' bar-finale' : ''}`;
              const barStyle = {
                height: `${getBarHeightPercent(value, maxValue)}%`,
                '--shell-group-color': 'transparent',
                '--piano-order': index,
              } as CSSProperties;
              return (
                <div
                  key={index}
                  ref={(node) => {
                    barRefs.current[index] = node;
                  }}
                  className={barClassName}
                  style={barStyle}
                  aria-label={`index-${index}-value-${value}`}
                >
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
        currentSnapshot.indices.length > 0 ? (
          <>
            {currentSnapshot.indices.map((index) => (
              <span key={index} className="tree-workspace-transport-chip">
                #{index}
              </span>
            ))}
            <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
              {sortedIndexSet.size}/{arrayState.length}
            </span>
          </>
        ) : (
          <span className="tree-workspace-transport-empty">{getStepDescription(currentSnapshot, t)}</span>
        )
      }
    />
  );
}
