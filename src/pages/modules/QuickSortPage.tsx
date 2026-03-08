import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useI18n } from '../../i18n/useI18n';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import type { QuickSortStep } from '../../modules/sorting/quickSort';
import { buildQuickSortTimelineFromInput } from '../../modules/sorting/quickTimelineAdapter';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

const DEFAULT_SIZE = 10;
const MIN_SIZE = 5;
const MAX_SIZE = 100;
const COMPACT_BAR_LABEL_THRESHOLD = 32;
const EMPTY_INDICES: number[] = [];

type GhostEndpoint = { kind: 'front' } | { kind: 'bar'; index: number };

type MotionGhostSpec = {
  className: string;
  value: number;
  heightPercent: number;
  source: GhostEndpoint;
  target: GhostEndpoint;
};

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

function getStepDescription(step: QuickSortStep | undefined, t: ReturnType<typeof useI18n>['t']): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.s05.step.initial');
  }
  if (step.action === 'partitionStart') {
    return `${t('module.s05.step.partitionStart')} [${step.low}, ${step.high}]`;
  }
  if (step.action === 'pivotLift') {
    return t('module.s05.step.pivotLift');
  }
  if (step.action === 'scanRight') {
    return `${t('module.s05.step.scanRight')} ${step.j ?? '-'}`;
  }
  if (step.action === 'fillLeft') {
    return `${t('module.s05.step.fillLeft')} ${step.indices[0]} -> ${step.indices[1]}`;
  }
  if (step.action === 'scanLeft') {
    return `${t('module.s05.step.scanLeft')} ${step.i ?? '-'}`;
  }
  if (step.action === 'fillRight') {
    return `${t('module.s05.step.fillRight')} ${step.indices[0]} -> ${step.indices[1]}`;
  }
  if (step.action === 'pivotPlace') {
    return `${t('module.s05.step.pivotPlace')} ${step.indices[0]}`;
  }
  if (step.action === 'rangeSorted') {
    return `${t('module.s05.step.rangeSorted')} ${step.indices[0]}`;
  }

  return t('module.s05.step.completed');
}

function getOperationExpression(step: QuickSortStep | undefined, t: ReturnType<typeof useI18n>['t']): string | null {
  if (!step) {
    return null;
  }

  if (step.action === 'partitionStart') {
    return `${t('module.s05.meta.partition')}: [${step.low}, ${step.high}]`;
  }
  if (step.action === 'pivotLift') {
    return `pivot (${step.pivotValue}) -> temp`;
  }
  if (step.action === 'scanRight' && step.j !== null) {
    return `arr[${step.j}] >= pivot (${step.pivotValue}) ?`;
  }
  if (step.action === 'fillLeft' && step.indices.length === 2) {
    return `arr[${step.indices[1]}] <- arr[${step.indices[0]}]`;
  }
  if (step.action === 'scanLeft' && step.i !== null) {
    return `arr[${step.i}] <= pivot (${step.pivotValue}) ?`;
  }
  if (step.action === 'fillRight' && step.indices.length === 2) {
    return `arr[${step.indices[1]}] <- arr[${step.indices[0]}]`;
  }
  if (step.action === 'pivotPlace' && step.indices.length > 0) {
    return `arr[${step.indices[0]}] <- pivot (${step.pivotValue})`;
  }
  if (step.action === 'rangeSorted' && step.indices.length > 0) {
    return `${t('module.s05.meta.pivotFixed')} ${step.indices[0]}`;
  }

  return null;
}

function getHighlightLabel(type: HighlightType, t: ReturnType<typeof useI18n>['t']): string {
  if (type === 'comparing') {
    return t('module.s01.highlight.comparing');
  }
  if (type === 'moving' || type === 'swapping') {
    return t('module.s05.highlight.moving');
  }
  if (type === 'sorted') {
    return t('module.s01.highlight.sorted');
  }
  return t('module.s01.highlight.default');
}

function getQuickBarStateClass(highlight: HighlightType | 'default'): string {
  if (highlight === 'comparing') {
    return 'shell-bar-comparing';
  }
  if (highlight === 'moving' || highlight === 'swapping') {
    return 'shell-bar-moving';
  }
  if (highlight === 'sorted') {
    return 'shell-bar-sorted';
  }
  return '';
}

function getBarHeightPercent(value: number, maxValue: number): number {
  if (maxValue <= 0) {
    return 0;
  }
  return (value / maxValue) * 100;
}

function formatArrayPreview(values: Array<number | string>, maxVisible = 24): string {
  if (values.length <= maxVisible) {
    return values.join(', ');
  }
  const leftCount = Math.floor(maxVisible / 2);
  const rightCount = maxVisible - leftCount;
  const leftPart = values.slice(0, leftCount).join(', ');
  const rightPart = values.slice(-rightCount).join(', ');
  return `${leftPart}, ..., ${rightPart} (n=${values.length})`;
}

export function QuickSortPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [datasetSize, setDatasetSize] = useState(DEFAULT_SIZE);
  const [inputData, setInputData] = useState<number[]>(() => createRandomDataset(DEFAULT_SIZE));

  const ghostRef = useRef<HTMLDivElement | null>(null);
  const frontSlotRef = useRef<HTMLDivElement | null>(null);
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } = useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildQuickSortTimelineFromInput(inputData), [inputData]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const currentAction = currentSnapshot?.action;
  const currentIndices = currentSnapshot?.indices ?? EMPTY_INDICES;
  const arrayState = currentSnapshot?.arrayState ?? inputData;
  const pivotValue = currentSnapshot?.pivotValue ?? null;
  const holeIndex = currentSnapshot?.pivotLifted ? (currentSnapshot?.holeIndex ?? null) : null;

  const barCount = arrayState.length;
  const isCompactBarMode = barCount > COMPACT_BAR_LABEL_THRESHOLD;
  const indexLabelStep = barCount <= 24 ? 1 : barCount <= 40 ? 2 : barCount <= 70 ? 5 : 10;
  const motionDurationMs = useMemo(() => Math.max(140, Math.floor(speedMs * 0.72)), [speedMs]);
  const isFinaleFrame = currentSnapshot?.action === 'completed';
  const maxValue = useMemo(() => Math.max(...arrayState, pivotValue ?? 1, 1), [arrayState, pivotValue]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, QuickSortStep['highlights'][number]['type']>();
    (currentSnapshot?.highlights ?? []).forEach((item) => map.set(item.index, item.type));
    return map;
  }, [currentSnapshot]);

  const sortedIndexSet = useMemo(() => {
    const sorted = new Set<number>();
    for (let frameIndex = 0; frameIndex <= currentStep && frameIndex < steps.length; frameIndex += 1) {
      const step = steps[frameIndex];
      if (!step) {
        continue;
      }
      if (step.action === 'rangeSorted' && step.indices.length > 0) {
        sorted.add(step.indices[0]);
      }
      if (step.action === 'completed') {
        step.arrayState.forEach((_, index) => sorted.add(index));
      }
    }
    return sorted;
  }, [steps, currentStep]);

  const activeRangeSet = useMemo(() => {
    if (currentSnapshot?.low === null || currentSnapshot?.high === null) {
      return new Set<number>();
    }
    const set = new Set<number>();
    for (let index = currentSnapshot.low; index <= currentSnapshot.high; index += 1) {
      set.add(index);
    }
    return set;
  }, [currentSnapshot]);

  const showHeldPivot = (currentSnapshot?.pivotLifted ?? false) && currentAction !== 'pivotPlace' && pivotValue !== null;
  const heldPivotHeightPercent = pivotValue === null ? 0 : getBarHeightPercent(pivotValue, maxValue);
  const heldPivotStyle = {
    height: `${heldPivotHeightPercent}%`,
    '--shell-held-offset': 0,
  } as CSSProperties;
  const heldPivotClassName = [
    'shell-held-bar',
    'quick-held-pivot',
    currentAction === 'scanRight' || currentAction === 'scanLeft' ? 'shell-held-bar-comparing' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const motionGhost = useMemo<MotionGhostSpec | null>(() => {
    if (!currentSnapshot) {
      return null;
    }

    if (currentAction === 'pivotLift' && pivotValue !== null && currentIndices.length > 0) {
      const sourceIndex = currentIndices[0];
      return {
        className: 'shell-motion-ghost shell-motion-ghost-lift',
        value: pivotValue,
        heightPercent: getBarHeightPercent(pivotValue, maxValue),
        source: { kind: 'bar', index: sourceIndex },
        target: { kind: 'front' },
      };
    }

    if ((currentAction === 'fillLeft' || currentAction === 'fillRight') && currentIndices.length === 2) {
      const sourceIndex = currentIndices[0];
      const targetIndex = currentIndices[1];
      const movedValue = arrayState[targetIndex];
      return {
        className: 'shell-motion-ghost shell-motion-ghost-shift',
        value: movedValue,
        heightPercent: getBarHeightPercent(movedValue, maxValue),
        source: { kind: 'bar', index: sourceIndex },
        target: { kind: 'bar', index: targetIndex },
      };
    }

    if (currentAction === 'pivotPlace' && pivotValue !== null && currentIndices.length > 0) {
      const targetIndex = currentIndices[0];
      return {
        className: 'shell-motion-ghost shell-motion-ghost-insert',
        value: pivotValue,
        heightPercent: getBarHeightPercent(pivotValue, maxValue),
        source: { kind: 'front' },
        target: { kind: 'bar', index: targetIndex },
      };
    }

    return null;
  }, [arrayState, currentAction, currentIndices, currentSnapshot, maxValue, pivotValue]);

  useLayoutEffect(() => {
    const ghostElement = ghostRef.current;
    if (!ghostElement || !motionGhost) {
      return;
    }

    const resolveElement = (endpoint: GhostEndpoint): HTMLDivElement | null => {
      if (endpoint.kind === 'front') {
        return frontSlotRef.current;
      }
      return barRefs.current[endpoint.index] ?? null;
    };

    const sourceElement = resolveElement(motionGhost.source);
    const targetElement = resolveElement(motionGhost.target);
    if (!sourceElement || !targetElement) {
      return;
    }

    const startLeft = sourceElement.offsetLeft;
    const deltaX = targetElement.offsetLeft - sourceElement.offsetLeft;
    ghostElement.style.setProperty('--shell-ghost-start-left', `${startLeft}px`);
    ghostElement.style.setProperty('--shell-ghost-delta-x', `${deltaX}px`);
  }, [motionGhost]);

  const motionGhostKey =
    motionGhost === null
      ? null
      : `ghost-${currentStep}-${currentAction}-${motionGhost.source.kind}-${motionGhost.target.kind}-${motionGhost.value}`;

  const hiddenTargetSet = useMemo(() => {
    const set = new Set<number>();
    if (currentAction === 'pivotLift' && currentIndices.length > 0) {
      set.add(currentIndices[0]);
    }
    if ((currentAction === 'fillLeft' || currentAction === 'fillRight') && currentIndices.length === 2) {
      set.add(currentIndices[1]);
    }
    if (currentAction === 'pivotPlace' && currentIndices.length > 0) {
      set.add(currentIndices[0]);
    }
    return set;
  }, [currentAction, currentIndices]);

  const previewArray = useMemo(
    () =>
      (currentSnapshot?.arrayState ?? []).map((value, index) => {
        if (holeIndex === index) {
          return '_';
        }
        return String(value);
      }),
    [currentSnapshot?.arrayState, holeIndex],
  );

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

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

  const operationExpression = getOperationExpression(currentSnapshot, t);
  const activeGroupText =
    currentSnapshot?.low !== null && currentSnapshot?.high !== null ? `[${currentSnapshot.low}, ${currentSnapshot.high}]` : '-';

  return (
    <section className="bubble-page">
      <h2>{t('module.s05.title')}</h2>
      <p>{t('module.s05.body')}</p>

      <div className="bubble-toolbar">
        <label htmlFor="dataset-size-s05" className="control-inline">
          <span>{t('module.s01.dataSize')}</span>
          <input
            id="dataset-size-s05"
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={datasetSize}
            onChange={(event) => setDatasetSize(Number(event.target.value))}
          />
          <strong>{datasetSize}</strong>
        </label>
        <div className="speed-group">
          <button type="button" onClick={() => regenerateData(createRandomDataset)}>
            {t('module.s01.generate.random')}
          </button>
          <button type="button" onClick={() => regenerateData(createNearlySortedDataset)}>
            {t('module.s01.generate.nearlySorted')}
          </button>
          <button type="button" onClick={() => regenerateData(createAscendingDataset)}>
            {t('module.s01.generate.ascending')}
          </button>
          <button type="button" onClick={() => regenerateData(createDescendingDataset)}>
            {t('module.s01.generate.descending')}
          </button>
        </div>
      </div>

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

      <p>
        {t('module.s01.sample')}: [{formatArrayPreview(inputData)}]
      </p>

      <div className="shell-status-lines">
        <p className="shell-status-line">{getStepDescription(currentSnapshot, t)}</p>
        <p className="shell-status-line">
          {t('module.s05.meta.low')}: {currentSnapshot?.low ?? '-'} | {t('module.s05.meta.high')}: {currentSnapshot?.high ?? '-'} |{' '}
          {t('module.s05.meta.pivotValue')}: {pivotValue ?? '-'}
        </p>
        <p className="shell-status-line">
          {t('module.s05.meta.leftPointer')}: {currentSnapshot?.i ?? '-'} | {t('module.s05.meta.rightPointer')}: {currentSnapshot?.j ?? '-'} |{' '}
          {t('module.s05.meta.hole')}: {holeIndex ?? '-'} | {t('module.s05.meta.activeGroup')}: {activeGroupText}
        </p>
        <p className={`shell-status-line shell-operation-hint${operationExpression ? '' : ' shell-status-placeholder'}`}>
          {operationExpression ?? '-'}
        </p>
      </div>

      <VisualizationCanvas
        title={t('module.s05.title')}
        subtitle={t('module.canvas.sortingStage')}
        stageClassName="viz-canvas-stage-sorting"
      >
        <div
          className="shell-stage-track"
          style={
            {
              '--shell-count': Math.max(barCount, 1),
              '--shell-front-slots': 1,
              '--shell-motion-duration': `${motionDurationMs}ms`,
            } as CSSProperties
          }
        >
          <div
            className={`array-bars shell-array-bars quick-array-bars${isCompactBarMode ? ' shell-array-bars-compact' : ''}`}
            aria-label="array-visualizer-s05"
          >
            {motionGhost ? (
              <div
                ref={ghostRef}
                key={motionGhostKey ?? undefined}
                className={motionGhost.className}
                style={
                  {
                    height: `${motionGhost.heightPercent}%`,
                  } as CSSProperties
                }
              >
                <span>{motionGhost.value}</span>
              </div>
            ) : null}

            <div ref={frontSlotRef} className="shell-front-slot" aria-hidden="true">
              {showHeldPivot ? (
                <div className={heldPivotClassName} style={heldPivotStyle}>
                  <span>{pivotValue}</span>
                </div>
              ) : null}
            </div>

            {arrayState.map((value, index) => {
              const frameHighlight = highlightMap.get(index);
              const highlight = frameHighlight ?? (sortedIndexSet.has(index) ? 'sorted' : 'default');
              const barStateClass = getQuickBarStateClass(highlight);
              const inRangeClass = activeRangeSet.has(index) ? ' quick-bar-in-range' : '';
              const pivotClass = currentSnapshot?.pivotIndex === index ? ' quick-bar-pivot' : '';
              const pointerClass =
                currentSnapshot?.i === index && currentSnapshot?.j === index
                  ? ' quick-bar-pointer-both'
                  : currentSnapshot?.i === index
                    ? ' quick-bar-pointer-i'
                    : currentSnapshot?.j === index
                      ? ' quick-bar-pointer-j'
                      : '';
              const isHole = holeIndex === index && pivotValue !== null;
              const hiddenDuringMotion = hiddenTargetSet.has(index);

              const barClassName = isHole
                ? `array-bar bar-hole quick-bar-hole${inRangeClass}${pointerClass}`
                : `array-bar shell-bar${barStateClass ? ` ${barStateClass}` : ''}${inRangeClass}${pivotClass}${pointerClass}${
                    hiddenDuringMotion ? ' shell-motion-hidden' : ''
                  }${isFinaleFrame ? ' bar-finale' : ''}`;

              const barStyle = isHole
                ? ({
                    height: `${getBarHeightPercent(value, maxValue)}%`,
                  } as CSSProperties)
                : ({
                    height: `${getBarHeightPercent(value, maxValue)}%`,
                    '--shell-group-color': 'transparent',
                    '--piano-order': index,
                  } as CSSProperties);

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
                  {!isCompactBarMode ? <span>{isHole ? t('module.s05.hole.label') : value}</span> : null}
                </div>
              );
            })}
          </div>

          <div className={`shell-index-row${isCompactBarMode ? ' shell-index-row-compact' : ''}`} aria-hidden="true">
            <span className="shell-index-spacer" />
            {arrayState.map((_, index) => (
              <span key={index} className="shell-index-cell">
                {index % indexLabelStep === 0 ? index : ''}
              </span>
            ))}
          </div>

          <div className={`quick-group-row${isCompactBarMode ? ' quick-group-row-compact' : ''}`} aria-hidden="true">
            <span className="shell-index-spacer" />
            {arrayState.map((_, index) => {
              const inGroup = activeRangeSet.has(index);
              const isLow = currentSnapshot?.low === index;
              const isHigh = currentSnapshot?.high === index;
              const marker = isLow ? 'L' : isHigh ? 'H' : '';

              return (
                <span
                  key={`group-${index}`}
                  className={`quick-group-cell${inGroup ? ' quick-group-cell-active' : ''}${isLow ? ' quick-group-cell-low' : ''}${
                    isHigh ? ' quick-group-cell-high' : ''
                  }`}
                >
                  {marker}
                </span>
              );
            })}
          </div>
        </div>
      </VisualizationCanvas>

      <div className="legend-row">
        <span className="legend-item legend-comparing">{t('module.s01.legend.comparing')}</span>
        <span className="legend-item legend-moving">{t('module.s05.legend.moving')}</span>
        <span className="legend-item legend-pivot">{t('module.s05.legend.pivot')}</span>
        <span className="legend-item legend-hole">{t('module.s05.legend.hole')}</span>
        <span className="legend-item legend-group">{t('module.s05.legend.group')}</span>
        <span className="legend-item legend-sorted">{t('module.s01.legend.sorted')}</span>
        <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
      </div>

      <p className="array-preview">
        {t('module.s01.currentArray')}: [{formatArrayPreview(previewArray)}]
      </p>

      <p>
        {t('module.s01.highlight')}:{' '}
        {(currentSnapshot?.highlights ?? []).map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`).join(' | ') || t('module.s01.none')}
      </p>

      <div className="playback-actions">
        <button type="button" onClick={play} disabled={status === 'playing' || steps.length === 0}>
          {t('playback.play')}
        </button>
        <button type="button" onClick={pause} disabled={status !== 'playing'}>
          {t('playback.pause')}
        </button>
        <button type="button" onClick={prev} disabled={steps.length === 0}>
          {t('playback.prev')}
        </button>
        <button type="button" onClick={next} disabled={steps.length === 0}>
          {t('playback.next')}
        </button>
        <button type="button" onClick={reset} disabled={steps.length === 0}>
          {t('playback.reset')}
        </button>
      </div>

      <div className="pseudocode-block">
        <h3>{t('module.s01.pseudocode')}</h3>
        <ol>
          <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.s05.code.line1')}</li>
          <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.s05.code.line2')}</li>
          <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.s05.code.line3')}</li>
          <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.s05.code.line4')}</li>
          <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.s05.code.line5')}</li>
          <li className={currentSnapshot?.codeLines.includes(6) ? 'code-active' : ''}>{t('module.s05.code.line6')}</li>
          <li className={currentSnapshot?.codeLines.includes(7) ? 'code-active' : ''}>{t('module.s05.code.line7')}</li>
          <li className={currentSnapshot?.codeLines.includes(8) ? 'code-active' : ''}>{t('module.s05.code.line8')}</li>
          <li className={currentSnapshot?.codeLines.includes(9) ? 'code-active' : ''}>{t('module.s05.code.line9')}</li>
        </ol>
      </div>
    </section>
  );
}
