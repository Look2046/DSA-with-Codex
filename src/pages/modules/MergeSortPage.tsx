import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useI18n } from '../../i18n/useI18n';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import type { MergeSortStep } from '../../modules/sorting/mergeSort';
import { buildMergeSortTimelineFromInput, type MergeSortImplementation } from '../../modules/sorting/mergeTimelineAdapter';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

const DEFAULT_SIZE = 10;
const MIN_SIZE = 5;
const MAX_SIZE = 100;
const COMPACT_BAR_LABEL_THRESHOLD = 32;
const MERGE_BAR_BASE_PERCENT = 4;
const MERGE_BAR_MAX_PERCENT = 56;
const TOP_DOWN_PSEUDOCODE_KEYS = [
  'module.s06.code.line1',
  'module.s06.code.line2',
  'module.s06.code.line3',
  'module.s06.code.line4',
  'module.s06.code.line5',
  'module.s06.code.line6',
  'module.s06.code.line7',
  'module.s06.code.line8',
  'module.s06.code.line9',
  'module.s06.code.line10',
] as const;
const BOTTOM_UP_PSEUDOCODE_KEYS = [
  'module.s06.bottomUp.code.line1',
  'module.s06.bottomUp.code.line2',
  'module.s06.bottomUp.code.line3',
  'module.s06.bottomUp.code.line4',
  'module.s06.bottomUp.code.line5',
  'module.s06.bottomUp.code.line6',
  'module.s06.bottomUp.code.line7',
  'module.s06.bottomUp.code.line8',
  'module.s06.bottomUp.code.line9',
  'module.s06.bottomUp.code.line10',
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

function getStepDescription(
  step: MergeSortStep | undefined,
  t: ReturnType<typeof useI18n>['t'],
  implementation: MergeSortImplementation,
): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.s06.step.initial');
  }
  if (step.action === 'split') {
    if (implementation === 'bottomUp') {
      const width = step.left !== null && step.mid !== null ? step.mid - step.left + 1 : '-';
      return `${t('module.s06.step.pass')} w=${width} [${step.left}, ${step.right}] @ ${step.mid}`;
    }
    return `${t('module.s06.step.split')} [${step.left}, ${step.right}] @ ${step.mid}`;
  }
  if (step.action === 'compare') {
    return `${t('module.s06.step.compare')} ${step.indices[0]} ${t('module.s01.step.and')} ${step.indices[1]}`;
  }
  if (step.action === 'takeLeft') {
    return `${t('module.s06.step.takeLeft')} ${step.sourceIndex} -> ${step.targetIndex}`;
  }
  if (step.action === 'takeRight') {
    return `${t('module.s06.step.takeRight')} ${step.sourceIndex} -> ${step.targetIndex}`;
  }
  if (step.action === 'writeBack') {
    if (step.left !== null && step.right !== null) {
      return `${t('module.s06.step.writeBack')} [${step.left}, ${step.right}]`;
    }
    return `${t('module.s06.step.writeBack')} ${step.targetIndex}`;
  }
  if (step.action === 'rangeMerged') {
    return `${t('module.s06.step.rangeMerged')} [${step.left}, ${step.right}]`;
  }

  return t('module.s06.step.completed');
}

function getOperationExpression(
  step: MergeSortStep | undefined,
  t: ReturnType<typeof useI18n>['t'],
  implementation: MergeSortImplementation,
): string | null {
  if (!step) {
    return null;
  }

  if (step.action === 'split') {
    if (implementation === 'bottomUp') {
      const width = step.left !== null && step.mid !== null ? step.mid - step.left + 1 : null;
      if (width !== null) {
        return `${t('module.s06.meta.width')}: ${width}, ${t('module.s06.meta.range')}: [${step.left}, ${step.right}]`;
      }
    }
    return `${t('module.s06.meta.range')}: [${step.left}, ${step.right}]`;
  }

  if (step.action === 'compare' && step.i !== null && step.j !== null) {
    const leftValue = step.arrayState[step.i];
    const rightValue = step.arrayState[step.j];
    return `arr[${step.i}] (${leftValue}) <= arr[${step.j}] (${rightValue}) ?`;
  }

  if ((step.action === 'takeLeft' || step.action === 'takeRight') && step.sourceIndex !== null && step.targetIndex !== null) {
    return `buffer[${step.targetIndex}] <- arr[${step.sourceIndex}]`;
  }

  if (step.action === 'writeBack' && step.targetIndex !== null) {
    const value = step.arrayState[step.targetIndex];
    return `arr[${step.targetIndex}] <- ${value}`;
  }
  if (step.action === 'writeBack' && step.left !== null && step.right !== null) {
    return `arr[${step.left}..${step.right}] <- buffer[${step.left}..${step.right}]`;
  }

  if (step.action === 'rangeMerged') {
    return `${t('module.s06.meta.operation')}: ${t('module.s06.step.rangeMerged')}`;
  }

  return null;
}

function getHighlightLabel(type: HighlightType, t: ReturnType<typeof useI18n>['t']): string {
  if (type === 'comparing') {
    return t('module.s01.highlight.comparing');
  }
  if (type === 'moving' || type === 'swapping') {
    return t('module.s06.highlight.moving');
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
  return MERGE_BAR_BASE_PERCENT + (value / maxValue) * MERGE_BAR_MAX_PERCENT;
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

function getMergeBarStateClass(highlight: HighlightType | 'default'): string {
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

type MotionGhostSpec = {
  key: string;
  value: number;
  sourceIndex: number;
  targetIndex: number;
  sourceLayer: 'array' | 'buffer';
  targetLayer: 'array' | 'buffer';
};

export function MergeSortPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [datasetSize, setDatasetSize] = useState(DEFAULT_SIZE);
  const [implementation, setImplementation] = useState<MergeSortImplementation>('topDown');
  const [inputData, setInputData] = useState<number[]>(() => createRandomDataset(DEFAULT_SIZE));

  const stageTrackRef = useRef<HTMLDivElement | null>(null);
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);
  const bufferCellRefs = useRef<Array<HTMLDivElement | null>>([]);
  const ghostRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } = useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildMergeSortTimelineFromInput(inputData, implementation), [inputData, implementation]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const arrayState = currentSnapshot?.arrayState ?? inputData;
  const bufferState = currentSnapshot?.bufferState ?? Array.from({ length: arrayState.length }, () => null as number | null);
  const barCount = arrayState.length;
  const isCompactBarMode = barCount > COMPACT_BAR_LABEL_THRESHOLD;
  const indexLabelStep = barCount <= 24 ? 1 : barCount <= 40 ? 2 : barCount <= 70 ? 5 : 10;
  const motionDurationMs = useMemo(() => Math.max(140, Math.floor(speedMs * 0.72)), [speedMs]);
  const isFinaleFrame = currentSnapshot?.action === 'completed';
  const maxValue = useMemo(() => Math.max(...arrayState, 1), [arrayState]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, MergeSortStep['highlights'][number]['type']>();
    (currentSnapshot?.highlights ?? []).forEach((item) => map.set(item.index, item.type));
    return map;
  }, [currentSnapshot]);

  const activeRangeSet = useMemo(() => {
    if (
      !currentSnapshot ||
      currentSnapshot.left === null ||
      currentSnapshot.right === null ||
      currentSnapshot.action === 'rangeMerged'
    ) {
      return new Set<number>();
    }
    const set = new Set<number>();
    for (let index = currentSnapshot.left; index <= currentSnapshot.right; index += 1) {
      set.add(index);
    }
    return set;
  }, [currentSnapshot]);

  const leftHalfSet = useMemo(() => {
    if (
      !currentSnapshot ||
      currentSnapshot.left === null ||
      currentSnapshot.mid === null ||
      currentSnapshot.action === 'rangeMerged'
    ) {
      return new Set<number>();
    }
    const set = new Set<number>();
    for (let index = currentSnapshot.left; index <= currentSnapshot.mid; index += 1) {
      set.add(index);
    }
    return set;
  }, [currentSnapshot]);

  const rightHalfSet = useMemo(() => {
    if (
      !currentSnapshot ||
      currentSnapshot.mid === null ||
      currentSnapshot.right === null ||
      currentSnapshot.action === 'rangeMerged'
    ) {
      return new Set<number>();
    }
    const set = new Set<number>();
    for (let index = currentSnapshot.mid + 1; index <= currentSnapshot.right; index += 1) {
      set.add(index);
    }
    return set;
  }, [currentSnapshot]);

  const sortedIndexSet = useMemo(() => {
    const sorted = new Set<number>();
    for (let frameIndex = 0; frameIndex <= currentStep && frameIndex < steps.length; frameIndex += 1) {
      const step = steps[frameIndex];
      if (!step) {
        continue;
      }
      if (step.action === 'completed') {
        step.arrayState.forEach((_, index) => sorted.add(index));
      }
    }
    return sorted;
  }, [steps, currentStep]);

  const motionGhosts = useMemo<MotionGhostSpec[]>(() => {
    if (!currentSnapshot) {
      return [];
    }

    if ((currentSnapshot.action === 'takeLeft' || currentSnapshot.action === 'takeRight') && currentSnapshot.sourceIndex !== null && currentSnapshot.targetIndex !== null) {
      const value = currentSnapshot.bufferState[currentSnapshot.targetIndex] ?? currentSnapshot.arrayState[currentSnapshot.sourceIndex];
      return [
        {
          key: `merge-${currentStep}-${currentSnapshot.action}-${currentSnapshot.sourceIndex}-${currentSnapshot.targetIndex}-${value}`,
          value,
          sourceIndex: currentSnapshot.sourceIndex,
          targetIndex: currentSnapshot.targetIndex,
          sourceLayer: 'array',
          targetLayer: 'buffer',
        },
      ];
    }

    if (currentSnapshot.action === 'writeBack' && currentSnapshot.left !== null && currentSnapshot.right !== null) {
      const ghosts: MotionGhostSpec[] = [];
      for (let index = currentSnapshot.left; index <= currentSnapshot.right; index += 1) {
        const value = currentSnapshot.bufferState[index] ?? currentSnapshot.arrayState[index];
        ghosts.push({
          key: `merge-${currentStep}-writeBack-${index}-${value}`,
          value,
          sourceIndex: index,
          targetIndex: index,
          sourceLayer: 'buffer',
          targetLayer: 'array',
        });
      }
      return ghosts;
    }

    return [];
  }, [currentSnapshot, currentStep]);

  useLayoutEffect(() => {
    const stageTrack = stageTrackRef.current;
    if (!stageTrack) {
      return;
    }

    const stageRect = stageTrack.getBoundingClientRect();
    motionGhosts.forEach((ghost) => {
      const ghostElement = ghostRefs.current[ghost.key];
      const sourceElement =
        ghost.sourceLayer === 'array' ? barRefs.current[ghost.sourceIndex] : bufferCellRefs.current[ghost.sourceIndex];
      const targetElement =
        ghost.targetLayer === 'array' ? barRefs.current[ghost.targetIndex] : bufferCellRefs.current[ghost.targetIndex];
      if (!ghostElement || !sourceElement || !targetElement) {
        return;
      }

      const sourceRect = sourceElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const startLeft = sourceRect.left - stageRect.left;
      const startTop = sourceRect.top - stageRect.top;
      const deltaX = targetRect.left - sourceRect.left;
      const deltaY = targetRect.top - sourceRect.top;
      const sourceStyle = window.getComputedStyle(sourceElement);
      const isToBuffer = ghost.targetLayer === 'buffer';
      const ghostBg = isToBuffer ? '#63c87b' : sourceStyle.backgroundColor;
      const ghostBorder = isToBuffer ? '#56b66d' : sourceStyle.borderColor;
      const ghostColor = isToBuffer ? '#103620' : sourceStyle.color;
      const ghostShadow = isToBuffer ? '0 10px 18px rgba(53, 131, 75, 0.22)' : '0 8px 14px rgba(31, 96, 163, 0.2)';

      ghostElement.style.setProperty('--shell-ghost-start-left', `${startLeft}px`);
      ghostElement.style.setProperty('--shell-ghost-start-top', `${startTop}px`);
      ghostElement.style.setProperty('--shell-ghost-width', `${sourceRect.width}px`);
      ghostElement.style.setProperty('--shell-ghost-start-height', `${sourceRect.height}px`);
      ghostElement.style.setProperty('--shell-ghost-end-height', `${targetRect.height}px`);
      ghostElement.style.setProperty('--shell-ghost-delta-x', `${deltaX}px`);
      ghostElement.style.setProperty('--shell-ghost-delta-y', `${deltaY}px`);
      ghostElement.style.setProperty('--shell-ghost-bg', ghostBg);
      ghostElement.style.setProperty('--shell-ghost-border', ghostBorder);
      ghostElement.style.setProperty('--shell-ghost-color', ghostColor);
      ghostElement.style.setProperty('--shell-ghost-shadow', ghostShadow);
    });
  }, [motionGhosts]);

  const hiddenIndexSet = useMemo(() => {
    if (!currentSnapshot) {
      return new Set<number>();
    }

    if (
      currentSnapshot.left === null ||
      currentSnapshot.right === null ||
      currentSnapshot.action === 'rangeMerged' ||
      currentSnapshot.action === 'completed'
    ) {
      return new Set<number>();
    }

    const hidden = new Set<number>();
    const { left, right } = currentSnapshot;

    if (currentSnapshot.action === 'writeBack') {
      for (let index = left; index <= right; index += 1) {
        hidden.add(index);
      }
      return hidden;
    }

    if (currentSnapshot.mid !== null) {
      const leftConsumedEnd = currentSnapshot.i !== null ? currentSnapshot.i - 1 : left - 1;
      for (let index = left; index <= Math.min(currentSnapshot.mid, leftConsumedEnd); index += 1) {
        hidden.add(index);
      }

      const rightStart = currentSnapshot.mid + 1;
      const rightConsumedEnd = currentSnapshot.j !== null ? currentSnapshot.j - 1 : rightStart - 1;
      for (let index = rightStart; index <= Math.min(right, rightConsumedEnd); index += 1) {
        hidden.add(index);
      }
    }

    if ((currentSnapshot.action === 'takeLeft' || currentSnapshot.action === 'takeRight') && currentSnapshot.sourceIndex !== null) {
      hidden.add(currentSnapshot.sourceIndex);
    }

    return hidden;
  }, [currentSnapshot]);

  const previewArray = useMemo(() => bufferState.map((value) => (value === null ? '_' : String(value))), [bufferState]);

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

  const implementationLabel = implementation === 'topDown' ? t('module.s06.mode.topDown') : t('module.s06.mode.bottomUp');
  const operationExpression = getOperationExpression(currentSnapshot, t, implementation);
  const pseudocodeKeys = implementation === 'topDown' ? TOP_DOWN_PSEUDOCODE_KEYS : BOTTOM_UP_PSEUDOCODE_KEYS;

  return (
    <section className="bubble-page">
      <h2>{t('module.s06.title')}</h2>
      <p>{t('module.s06.body')}</p>

      <div className="bubble-toolbar">
        <label htmlFor="dataset-size-s06" className="control-inline">
          <span>{t('module.s01.dataSize')}</span>
          <input
            id="dataset-size-s06"
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
        <span>{t('module.s06.mode.label')}</span>
        <div className="speed-group">
          <button
            type="button"
            className={implementation === 'topDown' ? 'speed-active' : ''}
            onClick={() => {
              setImplementation('topDown');
              reset();
            }}
          >
            {t('module.s06.mode.topDown')}
          </button>
          <button
            type="button"
            className={implementation === 'bottomUp' ? 'speed-active' : ''}
            onClick={() => {
              setImplementation('bottomUp');
              reset();
            }}
          >
            {t('module.s06.mode.bottomUp')}
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
        {Math.max(steps.length - 1, 0)} | {t('playback.status')}: {getStatusLabel(status, t)} | {t('module.s06.mode.label')}:{' '}
        {implementationLabel}
      </p>

      <p>
        {t('module.s01.sample')}: [{formatArrayPreview(inputData)}]
      </p>

      <div className="shell-status-lines">
        <p className="shell-status-line">{getStepDescription(currentSnapshot, t, implementation)}</p>
        <p className="shell-status-line">
          {t('module.s06.meta.left')}: {currentSnapshot?.left ?? '-'} | {t('module.s06.meta.mid')}: {currentSnapshot?.mid ?? '-'} |{' '}
          {t('module.s06.meta.right')}: {currentSnapshot?.right ?? '-'}
        </p>
        <p className="shell-status-line">
          {t('module.s06.meta.leftPointer')}: {currentSnapshot?.i ?? '-'} | {t('module.s06.meta.rightPointer')}: {currentSnapshot?.j ?? '-'} |{' '}
          {t('module.s06.meta.writePointer')}: {currentSnapshot?.k ?? '-'}
        </p>
        <p className={`shell-status-line shell-operation-hint${operationExpression ? '' : ' shell-status-placeholder'}`}>
          {operationExpression ? `${t('module.s06.meta.operation')}: ${operationExpression}` : '-'}
        </p>
      </div>

      <VisualizationCanvas
        className="merge-sort-canvas"
        title={t('module.s06.title')}
        subtitle={t('module.canvas.sortingStage')}
        stageClassName="viz-canvas-stage-sorting"
      >
        <div
          ref={stageTrackRef}
          className="shell-stage-track"
          style={
            {
              '--shell-count': Math.max(barCount, 1),
              '--shell-front-slots': 0,
              '--shell-motion-duration': `${motionDurationMs}ms`,
            } as CSSProperties
          }
        >
          {motionGhosts.map((ghost) => (
            <div
              key={ghost.key}
              ref={(node) => {
                ghostRefs.current[ghost.key] = node;
              }}
              className="shell-motion-ghost shell-motion-ghost-shift"
            >
              <span>{ghost.value}</span>
            </div>
          ))}

          <div
            className={`array-bars shell-array-bars merge-array-bars${isCompactBarMode ? ' shell-array-bars-compact' : ''}`}
            aria-label="array-visualizer-s06"
          >
            {arrayState.map((value, index) => {
              const frameHighlight = highlightMap.get(index);
              const highlight =
                currentSnapshot?.action === 'writeBack' && activeRangeSet.has(index)
                  ? 'sorted'
                  : frameHighlight === 'comparing'
                    ? 'comparing'
                    : sortedIndexSet.has(index)
                      ? 'sorted'
                      : 'default';
              const barStateClass = getMergeBarStateClass(highlight);
              const inRangeClass = activeRangeSet.has(index) ? ' merge-bar-in-range' : '';
              const leftHalfClass = leftHalfSet.has(index) ? ' merge-bar-left' : '';
              const rightHalfClass = rightHalfSet.has(index) ? ' merge-bar-right' : '';
              const pointerClass =
                currentSnapshot?.i === index && currentSnapshot?.j === index && activeRangeSet.has(index)
                  ? ' merge-bar-pointer-both'
                  : currentSnapshot?.i === index && activeRangeSet.has(index)
                    ? ' merge-bar-pointer-i'
                    : currentSnapshot?.j === index && activeRangeSet.has(index)
                      ? ' merge-bar-pointer-j'
                      : '';

              const barClassName = `array-bar shell-bar${barStateClass ? ` ${barStateClass}` : ''}${inRangeClass}${leftHalfClass}${rightHalfClass}${pointerClass}${
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

          <div className={`merge-buffer-wrap${isCompactBarMode ? ' merge-buffer-wrap-compact' : ''}`} aria-hidden="true">
            <div
              className={`array-bars shell-array-bars merge-buffer-bars${isCompactBarMode ? ' shell-array-bars-compact merge-buffer-bars-compact' : ''}`}
              aria-label="buffer-visualizer-s06"
            >
              {bufferState.map((value, index) => {
                const inRangeClass = activeRangeSet.has(index) ? ' merge-buffer-bar-in-range' : '';
                const writtenClass = value !== null ? ' merge-buffer-bar-written' : ' merge-buffer-bar-empty';
                const pointerClass = currentSnapshot?.k === index && activeRangeSet.has(index) ? ' merge-buffer-bar-pointer' : '';
                const barStyle = {
                  height: `${value === null ? MERGE_BAR_BASE_PERCENT : getBarHeightPercent(value, maxValue)}%`,
                } as CSSProperties;

                return (
                  <div
                    key={`buffer-${index}`}
                    ref={(node) => {
                      bufferCellRefs.current[index] = node;
                    }}
                    className={`array-bar shell-bar merge-buffer-bar${inRangeClass}${writtenClass}${pointerClass}`}
                    style={barStyle}
                  >
                    {value === null ? '' : value}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </VisualizationCanvas>

      <div className="legend-row">
        <span className="legend-item legend-comparing">{t('module.s01.legend.comparing')}</span>
        <span className="legend-item legend-moving">{t('module.s06.legend.moving')}</span>
        <span className="legend-item legend-merge-left">{t('module.s06.legend.left')}</span>
        <span className="legend-item legend-merge-right">{t('module.s06.legend.right')}</span>
        <span className="legend-item legend-merge-buffer">{t('module.s06.legend.buffer')}</span>
        <span className="legend-item legend-sorted">{t('module.s01.legend.sorted')}</span>
        <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
      </div>

      <p className="array-preview">
        {t('module.s06.meta.buffer')}: [{formatArrayPreview(previewArray)}]
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
          {pseudocodeKeys.map((lineKey, lineIndex) => (
            <li key={lineKey} className={currentSnapshot?.codeLines.includes(lineIndex + 1) ? 'code-active' : ''}>
              {t(lineKey)}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
