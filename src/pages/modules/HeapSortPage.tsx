import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { buildHeapSortTimelineFromInput } from '../../modules/sorting/heapTimelineAdapter';
import type { HeapSortStep } from '../../modules/sorting/heapSort';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

const DEFAULT_SIZE = 10;
const MIN_SIZE = 5;
const MAX_SIZE = 31;
const COMPACT_BAR_LABEL_THRESHOLD = 32;
const MAX_VISIBLE_HEAP_NODES = 31;
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

function encourageEarlyHeapifySwap(values: number[]): number[] {
  if (values.length < MIN_SIZE) {
    return values;
  }

  const startIndex = Math.floor(values.length / 2) - 1;
  const leftIndex = startIndex * 2 + 1;
  const rightIndex = startIndex * 2 + 2;
  const childIndices = [leftIndex, rightIndex].filter((index) => index < values.length);
  if (childIndices.length === 0) {
    return values;
  }

  const largestChildIndex = childIndices.reduce((bestIndex, childIndex) =>
    values[childIndex] > values[bestIndex] ? childIndex : bestIndex,
  );
  if (values[startIndex] < values[largestChildIndex]) {
    return values;
  }

  const minIndex = values.reduce((bestIndex, value, index) => (value < values[bestIndex] ? index : bestIndex), 0);
  const maxIndex = values.reduce((bestIndex, value, index) => (value > values[bestIndex] ? index : bestIndex), 0);
  [values[startIndex], values[minIndex]] = [values[minIndex], values[startIndex]];
  [values[largestChildIndex], values[maxIndex]] = [values[maxIndex], values[largestChildIndex]];
  return values;
}

function createRandomDataset(size: number): number[] {
  const poolSize = Math.max(90, size);
  const values = Array.from({ length: poolSize }, (_, index) => 10 + index);

  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }

  return encourageEarlyHeapifySwap(values.slice(0, size));
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

function getHeapNodePosition(index: number, total: number) {
  const level = Math.floor(Math.log2(index + 1));
  const firstIndexAtLevel = 2 ** level - 1;
  const positionInLevel = index - firstIndexAtLevel;
  const nodesInLevel = 2 ** level;
  const levelCount = Math.max(1, Math.floor(Math.log2(Math.max(total, 1))) + 1);

  return {
    x: ((positionInLevel + 1) / (nodesInLevel + 1)) * 100,
    y: levelCount === 1 ? 18 : 10 + (level / Math.max(levelCount - 1, 1)) * 76,
  };
}

function getSortedLandingPosition(index: number, total: number) {
  const sortedOffset = total - index - 1;
  return {
    x: Math.max(58, 94 - sortedOffset * 7),
    y: 94,
  };
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
  const previousSnapshot = currentStep > 0 ? steps[currentStep - 1] : undefined;
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
  const heapSize = currentSnapshot?.action === 'completed' ? 0 : (currentSnapshot?.heapSize ?? 0);
  const sortedCount = sortedIndexSet.size;

  const activeHeapSet = useMemo(() => {
    const active = new Set<number>();
    const heapSize = currentSnapshot?.action === 'completed' ? 0 : (currentSnapshot?.heapSize ?? 0);
    for (let index = 0; index < heapSize; index += 1) {
      active.add(index);
    }
    return active;
  }, [currentSnapshot]);

  const heapNodePositions = useMemo(
    () =>
      Array.from({ length: Math.min(heapSize, MAX_VISIBLE_HEAP_NODES) }, (_, index) => ({
        index,
        ...getHeapNodePosition(index, Math.min(heapSize, MAX_VISIBLE_HEAP_NODES)),
      })),
    [heapSize],
  );

  const heapNodePositionMap = useMemo(
    () => new Map(heapNodePositions.map((node) => [node.index, node] as const)),
    [heapNodePositions],
  );

  const heapEdges = useMemo(
    () =>
      heapNodePositions
        .filter((node) => node.index > 0)
        .map((node) => ({
          child: node,
          parent: heapNodePositionMap.get(Math.floor((node.index - 1) / 2)),
        }))
        .filter((edge): edge is { child: (typeof heapNodePositions)[number]; parent: (typeof heapNodePositions)[number] } =>
          Boolean(edge.parent),
        ),
    [heapNodePositionMap, heapNodePositions],
  );

  const hiddenHeapNodeCount = Math.max(0, heapSize - MAX_VISIBLE_HEAP_NODES);

  const heapMotionPath = useMemo(() => {
    if (!currentSnapshot || !previousSnapshot || currentSnapshot.indices.length < 2) {
      return null;
    }

    if (currentSnapshot.action !== 'swap' && currentSnapshot.action !== 'extractMax') {
      return null;
    }

    const [leftIndex, rightIndex] = currentSnapshot.indices;
    const visibleHeapSize = Math.min(
      currentSnapshot.action === 'extractMax' ? previousSnapshot.heapSize : currentSnapshot.heapSize,
      MAX_VISIBLE_HEAP_NODES,
    );
    if (leftIndex >= MAX_VISIBLE_HEAP_NODES || rightIndex >= previousSnapshot.arrayState.length) {
      return null;
    }

    const from = getHeapNodePosition(leftIndex, Math.max(visibleHeapSize, 1));
    const to =
      currentSnapshot.action === 'extractMax'
        ? getSortedLandingPosition(rightIndex, previousSnapshot.arrayState.length)
        : getHeapNodePosition(rightIndex, Math.max(visibleHeapSize, 1));
    const controlY = Math.min(from.y, to.y) - (currentSnapshot.action === 'extractMax' ? 10 : 8);
    const path = `M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${controlY} ${to.x} ${to.y}`;

    return {
      from,
      to,
      path,
      value: previousSnapshot.arrayState[leftIndex],
      returningValue: previousSnapshot.arrayState[rightIndex],
      action: currentSnapshot.action,
    };
  }, [currentSnapshot, previousSnapshot]);

  const focusPoint = useMemo(() => {
    if (currentSnapshot?.indices.length === 0 || arrayState.length === 0) {
      return null;
    }

    const anchorIndex = currentSnapshot.indices.find((index) => index < heapSize) ?? 0;
    const anchorPosition = getHeapNodePosition(anchorIndex, Math.max(heapSize, 1));
    return {
      x: anchorPosition.x,
      y: anchorPosition.y,
    };
  }, [currentSnapshot, arrayState.length, heapSize]);

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
              <select
                id="heap-sort-size"
                value={datasetSize}
                onChange={(event) => {
                  const nextSize = Number(event.target.value);
                  setDatasetSize(nextSize);
                  setInputData(createRandomDataset(nextSize));
                  reset();
                }}
                >
                  {Array.from({ length: MAX_SIZE - MIN_SIZE + 1 }, (_, optionIndex) => MIN_SIZE + optionIndex).map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
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

          <label className="tree-workspace-field" htmlFor="speed-select-HeapSortPage">
            <span>{t('module.s01.speed')}</span>
            <select
              id="speed-select-HeapSortPage"
              value={speedMs}
              onChange={(event) => setSpeed(Number(event.target.value))}
            >
              {([
                { key: 'module.s01.speed.slow', value: 1200 },
                { key: 'module.s01.speed.normal', value: 700 },
                { key: 'module.s01.speed.fast', value: 350 },
              ] as const).map((option) => (
                <option key={option.key} value={option.value}>
                  {t(option.key)}
                </option>
              ))}
            </select>
            </label>
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
        <div className="heap-sort-stage-scene" aria-label="heap-sort-visualizer">
          <section className="heap-sort-tree-panel">
            <svg className="heap-sort-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {heapEdges.map(({ parent, child }) => {
                const isActive =
                  currentSnapshot?.pathIndices.includes(parent.index) && currentSnapshot?.pathIndices.includes(child.index);
                return (
                  <line
                    key={`${parent.index}-${child.index}`}
                    className={`heap-sort-edge${isActive ? ' heap-sort-edge-active' : ''}`}
                    x1={parent.x}
                    y1={parent.y}
                    x2={child.x}
                    y2={child.y}
                  />
                );
              })}
            </svg>

            {heapMotionPath ? (
              <svg className="heap-sort-motion-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path
                  className={`heap-sort-motion-path heap-sort-motion-path-${heapMotionPath.action}`}
                  d={heapMotionPath.path}
                />
                <circle
                  className={`heap-sort-motion-dot heap-sort-motion-dot-${heapMotionPath.action}`}
                  r={heapMotionPath.action === 'extractMax' ? 1.8 : 1.45}
                >
                  <animateMotion dur="0.86s" repeatCount="indefinite" path={heapMotionPath.path} />
                </circle>
                {heapMotionPath.action === 'swap' ? (
                  <circle className="heap-sort-motion-dot heap-sort-motion-dot-return" r="1.15">
                    <animateMotion dur="0.86s" begin="0.18s" repeatCount="indefinite" path={heapMotionPath.path} />
                  </circle>
                ) : null}
                <text
                  className="heap-sort-motion-value"
                  x={(heapMotionPath.from.x + heapMotionPath.to.x) / 2}
                  y={Math.max(8, Math.min(heapMotionPath.from.y, heapMotionPath.to.y) - 10)}
                >
                  {heapMotionPath.value}
                </text>
              </svg>
            ) : null}

            <div className="heap-sort-node-layer">
              {heapNodePositions.map((node) => {
                const value = arrayState[node.index];
                const frameHighlight = highlightMap.get(node.index);
                const isOnPath = currentSnapshot?.pathIndices.includes(node.index) ?? false;
                const stateClass =
                  frameHighlight === 'comparing'
                    ? ' heap-sort-node-comparing'
                    : frameHighlight === 'swapping'
                      ? ' heap-sort-node-swapping'
                      : isOnPath
                        ? ' heap-sort-node-path'
                        : '';

                return (
                  <div
                    key={node.index}
                    className={`heap-sort-node${stateClass}`}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    aria-label={`heap-index-${node.index}-value-${value}`}
                  >
                    <span className="heap-sort-node-index">#{node.index}</span>
                    <strong>{value}</strong>
                  </div>
                );
              })}
            </div>

            {hiddenHeapNodeCount > 0 ? (
              <div className="heap-sort-overflow-note">+{hiddenHeapNodeCount}</div>
            ) : null}
          </section>

          <div className="heap-sort-sorted-strip" aria-label="heap-sort-sorted-suffix">
            {arrayState.map((value, index) =>
              sortedIndexSet.has(index) ? (
                <span
                  key={index}
                  className={`heap-sort-sorted-chip${highlightMap.get(index) === 'sorted' ? ' heap-sort-sorted-chip-active' : ''}`}
                >
                  <small>#{index}</small>
                  <strong>{value}</strong>
                </span>
              ) : null,
            )}
          </div>

          <div
            className="heap-sort-array-panel"
            style={
              {
                '--shell-count': Math.max(barCount, 1),
                '--shell-front-slots': 0,
                '--shell-motion-duration': `${Math.max(140, Math.floor(speedMs * 0.72))}ms`,
              } as CSSProperties
            }
          >
            <div
              className={`array-bars shell-array-bars heap-sort-mini-bars${
                isCompactBarMode ? ' shell-array-bars-compact' : ''
              }`}
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
