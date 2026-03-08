import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { useI18n } from '../../i18n/useI18n';
import { buildShellSortTimelineFromInput } from '../../modules/sorting/shellTimelineAdapter';
import type { ShellSortStep } from '../../modules/sorting/shellSort';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

const DEFAULT_SIZE = 10;
const MIN_SIZE = 5;
const MAX_SIZE = 100;
const COMPACT_BAR_LABEL_THRESHOLD = 32;
const SHELL_BASE_UNIFORM_COLOR = '#cfe1f3';

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

function getStepDescription(step: ShellSortStep | undefined, t: ReturnType<typeof useI18n>['t']): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.s04.step.initial');
  }

  if (step.action === 'gapChange') {
    return `${t('module.s04.step.gapChange')} ${step.gap}`;
  }

  if (step.action === 'selectCurrent') {
    return `${t('module.s04.step.selectCurrent')} ${step.indices[0]}`;
  }

  if (step.action === 'lift') {
    return `${t('module.s04.step.lift')} ${step.indices[0]}`;
  }

  if (step.action === 'compare') {
    return `${t('module.s04.step.compare')} ${step.indices[0]} ${t('module.s01.step.and')} ${step.indices[1]}`;
  }

  if (step.action === 'shift') {
    return `${t('module.s04.step.shift')} ${step.indices[0]} -> ${step.indices[1]}`;
  }

  if (step.action === 'insert') {
    return `${t('module.s04.step.insert')} ${step.indices[0]}`;
  }

  if (step.action === 'groupMark') {
    return t('module.s04.step.groupMark');
  }

  return t('module.s04.step.completed');
}

function getOperationExpression(step: ShellSortStep | undefined): string | null {
  if (!step) {
    return null;
  }

  if (step.action === 'compare') {
    const fromIndex = step.indices[0];
    const fromValue = step.arrayState[fromIndex];
    return `arr[${fromIndex}] (${fromValue}) > current (${step.currentValue}) ?`;
  }

  if (step.action === 'lift') {
    const fromIndex = step.indices[0];
    return `temp <- arr[${fromIndex}] (${step.currentValue})`;
  }

  if (step.action === 'shift') {
    const [fromIndex, toIndex] = step.indices;
    return `arr[${toIndex}] <- arr[${fromIndex}]`;
  }

  if (step.action === 'insert') {
    const toIndex = step.indices[0];
    return `arr[${toIndex}] <- current (${step.currentValue})`;
  }

  return null;
}

function getHighlightLabel(type: HighlightType, t: ReturnType<typeof useI18n>['t']): string {
  if (type === 'comparing') {
    return t('module.s01.highlight.comparing');
  }
  if (type === 'swapping') {
    return t('module.s01.highlight.swapping');
  }
  if (type === 'sorted') {
    return t('module.s01.highlight.sorted');
  }
  if (type === 'moving') {
    return t('module.s04.highlight.shifting');
  }
  if (type === 'new-node') {
    return t('module.s04.highlight.inserting');
  }
  return t('module.s01.highlight.default');
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

function getShellGroupColor(index: number, gap: number): string {
  const safeGap = gap > 0 ? gap : 1;
  const groupId = ((index % safeGap) + safeGap) % safeGap;
  const hue = (groupId * 47) % 360;
  return `hsl(${hue} 72% 74%)`;
}

function isShellGroupingVisible(action: ShellSortStep['action']): boolean {
  return action !== 'initial' && action !== 'gapChange' && action !== 'completed';
}

function getShellBarStateClass(highlight: HighlightType | 'default'): string {
  if (highlight === 'comparing') {
    return 'shell-bar-comparing';
  }
  if (highlight === 'moving') {
    return 'shell-bar-moving';
  }
  if (highlight === 'new-node') {
    return 'shell-bar-inserting';
  }
  if (highlight === 'sorted') {
    return 'shell-bar-sorted';
  }
  return '';
}

type GhostEndpoint = { kind: 'front' } | { kind: 'bar'; index: number };

type MotionGhostSpec = {
  className: string;
  value: number;
  heightPercent: number;
  source: GhostEndpoint;
  target: GhostEndpoint;
};

export function ShellSortPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [datasetSize, setDatasetSize] = useState(DEFAULT_SIZE);
  const [inputData, setInputData] = useState<number[]>(() => createRandomDataset(DEFAULT_SIZE));
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const frontSlotRef = useRef<HTMLDivElement | null>(null);
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } = useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildShellSortTimelineFromInput(inputData), [inputData]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const currentAction = currentSnapshot?.action;
  const keyLifted = currentSnapshot?.keyLifted ?? false;
  const tempValue = currentSnapshot?.currentValue ?? null;
  const stepHoleIndex = currentSnapshot?.holeIndex ?? null;
  const effectiveHoleIndex = useMemo(() => {
    if (tempValue === null) {
      return null;
    }
    if (currentAction === 'lift' || currentAction === 'insert') {
      return null;
    }
    if (keyLifted && currentAction === 'compare' && currentSnapshot.indices.length > 1) {
      return currentSnapshot.indices[1];
    }
    return stepHoleIndex;
  }, [currentAction, currentSnapshot, keyLifted, stepHoleIndex, tempValue]);

  const maxValue = useMemo(() => {
    const values = currentSnapshot?.arrayState ?? inputData;
    return Math.max(...values, tempValue ?? 1, 1);
  }, [currentSnapshot?.arrayState, inputData, tempValue]);
  const operationExpression = getOperationExpression(currentSnapshot);
  const shiftFrom = currentAction === 'shift' ? currentSnapshot.indices[0] : null;
  const shiftTo = currentAction === 'shift' ? currentSnapshot.indices[1] : null;
  const insertTargetIndex = currentAction === 'insert' && currentSnapshot.indices.length > 0 ? currentSnapshot.indices[0] : null;
  const arrayState = currentSnapshot?.arrayState ?? [];
  const barCount = arrayState.length;
  const isFinaleFrame = currentSnapshot?.action === 'completed';
  const isCompactBarMode = barCount > COMPACT_BAR_LABEL_THRESHOLD;
  const indexLabelStep =
    barCount <= 24 ? 1 : barCount <= 40 ? 2 : barCount <= 70 ? 5 : 10;
  const motionDurationMs = useMemo(() => Math.max(140, Math.floor(speedMs * 0.72)), [speedMs]);
  const showHeldBar = tempValue !== null && keyLifted && currentAction !== 'lift' && currentAction !== 'insert';
  const heldTargetOffset = currentAction === 'insert' && currentSnapshot.indices.length > 0 ? currentSnapshot.indices[0] + 1 : 0;
  const heldBarHeightPercent = tempValue === null ? 0 : getBarHeightPercent(tempValue, maxValue);
  const heldBarStyle = {
    height: `${heldBarHeightPercent}%`,
    '--shell-held-offset': heldTargetOffset,
  } as CSSProperties;
  const heldBarClassName = [
    'shell-held-bar',
    currentAction === 'insert' ? 'shell-held-bar-insert' : '',
    currentAction === 'compare' ? 'shell-held-bar-comparing' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const motionGhost = useMemo<MotionGhostSpec | null>(() => {
    if (currentAction === 'lift' && tempValue !== null && currentSnapshot.indices.length > 0) {
      const sourceIndex = currentSnapshot.indices[0];
      return {
        className: 'shell-motion-ghost shell-motion-ghost-lift',
        value: tempValue,
        heightPercent: getBarHeightPercent(tempValue, maxValue),
        source: { kind: 'bar', index: sourceIndex },
        target: { kind: 'front' },
      };
    }

    if (currentAction === 'shift' && currentSnapshot.indices.length > 1) {
      const sourceIndex = currentSnapshot.indices[0];
      const targetIndex = currentSnapshot.indices[1];
      const movedValue = currentSnapshot.arrayState[targetIndex];
      return {
        className: 'shell-motion-ghost shell-motion-ghost-shift',
        value: movedValue,
        heightPercent: getBarHeightPercent(movedValue, maxValue),
        source: { kind: 'bar', index: sourceIndex },
        target: { kind: 'bar', index: targetIndex },
      };
    }

    if (currentAction === 'insert' && tempValue !== null && currentSnapshot.indices.length > 0) {
      const targetIndex = currentSnapshot.indices[0];
      return {
        className: 'shell-motion-ghost shell-motion-ghost-insert',
        value: tempValue,
        heightPercent: getBarHeightPercent(tempValue, maxValue),
        source: { kind: 'front' },
        target: { kind: 'bar', index: targetIndex },
      };
    }

    return null;
  }, [currentAction, currentSnapshot, maxValue, tempValue]);
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

  const highlightMap = useMemo(() => {
    const map = new Map<number, ShellSortStep['highlights'][number]['type']>();
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
      if (step.action === 'gapChange') {
        sorted.clear();
      }
      if (step.action === 'groupMark') {
        step.indices.forEach((index) => sorted.add(index));
      }
      if (step.action === 'completed') {
        step.arrayState.forEach((_, index) => sorted.add(index));
      }
    }
    return sorted;
  }, [steps, currentStep]);
  const previewArray = useMemo(
    () =>
      (currentSnapshot?.arrayState ?? []).map((value, index) => {
        if (effectiveHoleIndex === index) {
          return '_';
        }
        return String(value);
      }),
    [currentSnapshot?.arrayState, effectiveHoleIndex],
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

  return (
    <section className="bubble-page">
      <h2>{t('module.s04.title')}</h2>
      <p>{t('module.s04.body')}</p>

      <div className="bubble-toolbar">
        <label htmlFor="dataset-size-s04" className="control-inline">
          <span>{t('module.s01.dataSize')}</span>
          <input
            id="dataset-size-s04"
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
          {t('module.s04.meta.temp')}: {tempValue ?? '-'} | {t('module.s04.meta.gap')}: {currentSnapshot?.gap ?? '-'} |{' '}
          {t('module.s04.meta.hole')}: {effectiveHoleIndex ?? '-'}
        </p>
        <p className={`shell-status-line shell-operation-hint${operationExpression ? '' : ' shell-status-placeholder'}`}>
          {operationExpression ? `${t('module.s04.meta.operation')}: ${operationExpression}` : '-'}
        </p>
        <p className={`shell-status-line shell-shift-hint${shiftFrom !== null && shiftTo !== null ? '' : ' shell-status-placeholder'}`}>
          {shiftFrom !== null && shiftTo !== null ? `${t('module.s04.meta.shiftPath')}: ${shiftFrom} -> ${shiftTo}` : '-'}
        </p>
      </div>

      <VisualizationCanvas
        title={t('module.s04.title')}
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
            className={`array-bars shell-array-bars${isCompactBarMode ? ' shell-array-bars-compact' : ''}`}
            aria-label="array-visualizer-s04"
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
              {showHeldBar ? (
                <div className={heldBarClassName} style={heldBarStyle}>
                  <span>{tempValue}</span>
                </div>
              ) : null}
            </div>
            {arrayState.map((value, index) => {
              const frameHighlight = highlightMap.get(index);
              const highlight = frameHighlight ?? (sortedIndexSet.has(index) ? 'sorted' : 'default');
              const isHole = effectiveHoleIndex === index && tempValue !== null;
              const groupVisible = isShellGroupingVisible(currentSnapshot.action);
              const groupColor = groupVisible ? getShellGroupColor(index, currentSnapshot.gap) : 'transparent';
              const barStateClass = getShellBarStateClass(highlight);
              const hiddenDuringMotion =
                (currentAction === 'lift' && currentSnapshot.indices[0] === index) ||
                (currentAction === 'shift' && shiftTo === index) || (currentAction === 'insert' && insertTargetIndex === index);
              const barClassName = isHole
                ? 'array-bar bar-hole'
                : `array-bar shell-bar${groupVisible ? ' shell-group-active' : ''}${barStateClass ? ` ${barStateClass}` : ''}${
                    hiddenDuringMotion ? ' shell-motion-hidden' : ''
                  }${isFinaleFrame ? ' bar-finale' : ''}`;
              const valueHeightPercent = getBarHeightPercent(value, maxValue);
              const holeHeightPercent = valueHeightPercent;
              const barHeight = isHole ? `${holeHeightPercent}%` : `${valueHeightPercent}%`;
              const barStyle = isHole
                ? { height: barHeight }
                : ({
                    height: barHeight,
                    '--shell-group-color': groupColor,
                    '--shell-base-color': SHELL_BASE_UNIFORM_COLOR,
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
                  {!isCompactBarMode ? <span>{isHole ? t('module.s04.hole.label') : value}</span> : null}
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
        </div>
      </VisualizationCanvas>

      <div className="legend-row">
        <span className="legend-item legend-comparing">{t('module.s01.legend.comparing')}</span>
        <span className="legend-item legend-moving">{t('module.s04.legend.shifting')}</span>
        <span className="legend-item legend-inserted">{t('module.s04.legend.inserting')}</span>
        <span className="legend-item legend-sorted">{t('module.s01.legend.sorted')}</span>
        <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
      </div>

      <p className="array-preview">
        {t('module.s01.currentArray')}: [{formatArrayPreview(previewArray)}]
      </p>
      <p>
        {t('module.s01.highlight')}:{' '}
        {(currentSnapshot?.highlights ?? [])
          .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
          .join(' | ') || t('module.s01.none')}
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
          <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.s04.code.line1')}</li>
          <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.s04.code.line2')}</li>
          <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.s04.code.line3')}</li>
          <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.s04.code.line4')}</li>
          <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.s04.code.line5')}</li>
          <li className={currentSnapshot?.codeLines.includes(6) ? 'code-active' : ''}>{t('module.s04.code.line6')}</li>
          <li className={currentSnapshot?.codeLines.includes(7) ? 'code-active' : ''}>{t('module.s04.code.line7')}</li>
          <li className={currentSnapshot?.codeLines.includes(8) ? 'code-active' : ''}>{t('module.s04.code.line8')}</li>
          <li className={currentSnapshot?.codeLines.includes(9) ? 'code-active' : ''}>{t('module.s04.code.line9')}</li>
        </ol>
      </div>
    </section>
  );
}
