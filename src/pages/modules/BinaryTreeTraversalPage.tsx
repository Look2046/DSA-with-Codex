import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { useI18n } from '../../i18n/useI18n';
import {
  buildBinaryTreeTraversalTimelineFromInput,
} from '../../modules/tree/binaryTreeTraversalTimelineAdapter';
import type { HighlightType, PlaybackStatus } from '../../types/animation';
import type {
  BinaryTreeGuideEvent,
  BinaryTreeGuideNullHint,
  BinaryTreeTraversalMode,
  BinaryTreeTraversalStep,
} from '../../modules/tree/binaryTreeTraversal';

const DEFAULT_SIZE = 7;
const MIN_SIZE = 3;
const MAX_SIZE = 15;

type NodePoint = {
  x: number;
  y: number;
};

type ValueDisplayMode = 'number' | 'letter';

type TraversalTraceSegment = {
  key: string;
  d: string;
  length: number;
  isActive: boolean;
};

type NullEdgePath = {
  key: string;
  d: string;
};

function createRandomDataset(size: number): number[] {
  const poolSize = Math.max(99, size);
  const values = Array.from({ length: poolSize }, (_, index) => index + 1);

  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }

  return values.slice(0, size);
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

function getModeLabel(mode: BinaryTreeTraversalMode, t: ReturnType<typeof useI18n>['t']): string {
  if (mode === 'preorder') {
    return t('module.t01.mode.preorder');
  }
  if (mode === 'inorder') {
    return t('module.t01.mode.inorder');
  }
  if (mode === 'postorder') {
    return t('module.t01.mode.postorder');
  }
  return t('module.t01.mode.levelorder');
}

function getStepDescription(
  step: BinaryTreeTraversalStep | undefined,
  t: ReturnType<typeof useI18n>['t'],
  formatValue: (value: number | null) => string,
): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.t01.step.initial');
  }
  if (step.action === 'guideStart') {
    return t('module.t01.step.guideStart');
  }
  if (step.action === 'visit') {
    return `${t('module.t01.step.visit')} ${step.currentIndex} (${formatValue(step.currentValue)})`;
  }
  if (step.action === 'descendLeft') {
    return t('module.t01.step.descendLeft');
  }
  if (step.action === 'descendRight') {
    return t('module.t01.step.descendRight');
  }
  if (step.action === 'nullLeft') {
    return t('module.t01.step.nullLeft');
  }
  if (step.action === 'nullRight') {
    return t('module.t01.step.nullRight');
  }
  if (step.action === 'backtrack') {
    return t('module.t01.step.backtrack');
  }
  if (step.action === 'backtrackFromNull') {
    return t('module.t01.step.backtrackFromNull');
  }
  if (step.action === 'traversalDone') {
    return t('module.t01.step.done');
  }

  return t('module.t01.step.completed');
}

function getHighlightLabel(type: HighlightType, t: ReturnType<typeof useI18n>['t']): string {
  if (type === 'visiting') {
    return t('module.sr01.highlight.visited');
  }
  if (type === 'matched') {
    return t('module.sr01.highlight.found');
  }
  return t('module.s01.highlight.default');
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

function clampPoint(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toAlphabetLabel(index: number): string {
  let label = '';
  let cursor = index;

  do {
    const remainder = cursor % 26;
    label = String.fromCharCode(65 + remainder) + label;
    cursor = Math.floor(cursor / 26) - 1;
  } while (cursor >= 0);

  return label;
}

function getChildIndex(parentIndex: number, side: 'L' | 'R'): number {
  return parentIndex * 2 + (side === 'L' ? 1 : 2);
}

function getNodeLevel(index: number): number {
  return Math.floor(Math.log2(index + 1));
}

function getTreePointByIndex(index: number, top: number, yStep: number): NodePoint {
  const level = getNodeLevel(index);
  const firstIndexOfLevel = 2 ** level - 1;
  const positionInLevel = index - firstIndexOfLevel;
  const nodesInLevel = 2 ** level;
  const x = ((positionInLevel + 1) / (nodesInLevel + 1)) * 100;
  const y = clampPoint(top + level * yStep, 2, 98);
  return { x, y };
}

function getNodeCenter(nodePositions: NodePoint[], nodeIndex: number): NodePoint | null {
  const node = nodePositions[nodeIndex];
  if (!node) {
    return null;
  }
  return { ...node };
}

function getNullPoint(parentIndex: number, side: 'L' | 'R', top: number, yStep: number): NodePoint {
  const childIndex = getChildIndex(parentIndex, side);
  return getTreePointByIndex(childIndex, top, yStep);
}

function getParallelEdgePath(
  from: NodePoint,
  to: NodePoint,
  lane: 'L' | 'R',
  curveStrength = 0.72,
): { d: string; length: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const rawLength = Math.max(Math.sqrt(dx * dx + dy * dy), 0.001);
  const ux = dx / rawLength;
  const uy = dy / rawLength;
  const laneSign = lane === 'L' ? -1 : 1;

  const startPad = 4.15;
  const endPad = 4.15;
  const laneOffsetX = 1.35;
  const laneOffsetY = 0.2;

  const start = {
    x: from.x + ux * startPad + laneOffsetX * laneSign,
    y: from.y + uy * startPad + laneOffsetY * laneSign,
  };

  const end = {
    x: to.x - ux * endPad + laneOffsetX * laneSign,
    y: to.y - uy * endPad + laneOffsetY * laneSign,
  };

  const control = {
    x: (start.x + end.x) / 2 + laneOffsetX * curveStrength * laneSign,
    y: (start.y + end.y) / 2 + laneOffsetY * curveStrength * laneSign,
  };

  const d = `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`;
  const length = Math.max(Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2) * 1.08, 1);
  return { d, length };
}

function buildGuideTraceSegments(
  guideEvents: BinaryTreeGuideEvent[],
  activeGuideEventIndex: number | null,
  nodePositions: NodePoint[],
  top: number,
  yStep: number,
): TraversalTraceSegment[] {
  const segments: TraversalTraceSegment[] = [];

  guideEvents.forEach((event, index) => {
    let from: NodePoint | null = null;
    let to: NodePoint | null = null;
    let lane: 'L' | 'R' = 'L';

    if (event.type === 'start') {
      const rootCenter = getNodeCenter(nodePositions, event.toIndex);
      if (!rootCenter) {
        return;
      }
      to = rootCenter;
      from = {
        x: clampPoint(rootCenter.x - 12, 2, 98),
        y: clampPoint(rootCenter.y, 2, 98),
      };
      lane = 'L';
    }

    if (event.type === 'move') {
      if (event.side === 'UP') {
        from = getNodeCenter(nodePositions, event.fromIndex);
        to = getNodeCenter(nodePositions, event.toIndex);
        lane = 'R';
      } else {
        from = getNodeCenter(nodePositions, event.fromIndex);
        to = getNodeCenter(nodePositions, event.toIndex);
        lane = 'L';
      }
    }

    if (event.type === 'toNull') {
      from = getNodeCenter(nodePositions, event.fromIndex);
      to = getNullPoint(event.fromIndex, event.side, top, yStep);
      lane = 'L';
    }

    if (event.type === 'fromNull') {
      from = getNullPoint(event.toIndex, event.side, top, yStep);
      to = getNodeCenter(nodePositions, event.toIndex);
      lane = 'R';
    }

    if (!from || !to) {
      return;
    }

    const pathGeometry = getParallelEdgePath(from, to, lane);

    segments.push({
      key: `${event.type}-${index}`,
      d: pathGeometry.d,
      length: pathGeometry.length,
      isActive: activeGuideEventIndex === index,
    });
  });

  return segments;
}

function buildFallbackTraceSegments(
  visitedIndices: number[],
  active: boolean,
  nodePositions: NodePoint[],
): TraversalTraceSegment[] {
  const segments: TraversalTraceSegment[] = [];

  for (let index = 1; index < visitedIndices.length; index += 1) {
    const fromIndex = visitedIndices[index - 1];
    const toIndex = visitedIndices[index];
    const from = getNodeCenter(nodePositions, fromIndex);
    const to = getNodeCenter(nodePositions, toIndex);

    if (!from || !to) {
      continue;
    }

    const lane: 'L' | 'R' = to.y >= from.y ? 'L' : 'R';
    const pathGeometry = getParallelEdgePath(from, to, lane);

    segments.push({
      key: `${fromIndex}-${toIndex}-${index}`,
      d: pathGeometry.d,
      length: pathGeometry.length,
      isActive: active && index === visitedIndices.length - 1,
    });
  }

  return segments;
}

function buildRoleLabelMap(step: BinaryTreeTraversalStep | undefined, treeLength: number): Map<number, string[]> {
  const map = new Map<number, string[]>();

  const addRole = (index: number | null, role: string) => {
    if (index === null || index < 0 || index >= treeLength) {
      return;
    }
    const roles = map.get(index) ?? [];
    if (!roles.includes(role)) {
      roles.push(role);
    }
    map.set(index, roles);
  };

  addRole(step?.guideRoleD ?? null, 'D');
  addRole(step?.guideRoleL ?? null, 'L');
  addRole(step?.guideRoleR ?? null, 'R');

  if (map.size === 0 && step && step.currentIndex !== null) {
    const currentIndex = step.currentIndex;
    const leftIndex = currentIndex * 2 + 1;
    const rightIndex = currentIndex * 2 + 2;
    addRole(currentIndex, 'D');
    addRole(leftIndex < treeLength ? leftIndex : null, 'L');
    addRole(rightIndex < treeLength ? rightIndex : null, 'R');
  }

  return map;
}

function buildNullHints(step: BinaryTreeTraversalStep | undefined, treeLength: number): BinaryTreeGuideNullHint[] {
  if (!step || step.action === 'initial') {
    return [];
  }

  const hints: BinaryTreeGuideNullHint[] = [];

  for (let parentIndex = 0; parentIndex < treeLength; parentIndex += 1) {
    const left = parentIndex * 2 + 1;
    const right = parentIndex * 2 + 2;
    if (left >= treeLength) {
      hints.push({ parentIndex, side: 'L' });
    }
    if (right >= treeLength) {
      hints.push({ parentIndex, side: 'R' });
    }
  }

  const dedup = new Map<string, BinaryTreeGuideNullHint>();
  hints.forEach((hint) => {
    dedup.set(`${hint.parentIndex}-${hint.side}`, hint);
  });

  return [...dedup.values()];
}

export function BinaryTreeTraversalPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();

  const [datasetSize, setDatasetSize] = useState(DEFAULT_SIZE);
  const [mode, setMode] = useState<BinaryTreeTraversalMode>('preorder');
  const [valueDisplayMode, setValueDisplayMode] = useState<ValueDisplayMode>('number');
  const [inputData, setInputData] = useState<number[]>(() => createRandomDataset(DEFAULT_SIZE));

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } = useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildBinaryTreeTraversalTimelineFromInput(inputData, mode), [inputData, mode]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const treeState = currentSnapshot?.treeState ?? inputData;

  const treeLayout = useMemo(() => {
    const top = 12;
    const bottom = 92;
    const maxNodeLevel = treeState.length > 0 ? getNodeLevel(treeState.length - 1) : 0;
    const maxDisplayLevel = maxNodeLevel + 1;
    const yStep = (bottom - top) / Math.max(maxDisplayLevel, 1);
    return { top, yStep };
  }, [treeState.length]);

  const nodePositions = useMemo(
    () => treeState.map((_, index) => getTreePointByIndex(index, treeLayout.top, treeLayout.yStep)),
    [treeLayout.top, treeLayout.yStep, treeState],
  );

  const edges = useMemo(() => {
    const allEdges: Array<{ from: number; to: number }> = [];

    for (let index = 0; index < treeState.length; index += 1) {
      const leftChild = index * 2 + 1;
      const rightChild = index * 2 + 2;
      if (leftChild < treeState.length) {
        allEdges.push({ from: index, to: leftChild });
      }
      if (rightChild < treeState.length) {
        allEdges.push({ from: index, to: rightChild });
      }
    }

    return allEdges;
  }, [treeState.length]);

  const guideTraceSegments = useMemo(
    () =>
      buildGuideTraceSegments(
        currentSnapshot?.guideEvents ?? [],
        currentSnapshot?.activeGuideEventIndex ?? null,
        nodePositions,
        treeLayout.top,
        treeLayout.yStep,
      ),
    [currentSnapshot?.activeGuideEventIndex, currentSnapshot?.guideEvents, nodePositions, treeLayout.top, treeLayout.yStep],
  );

  const fallbackTraceSegments = useMemo(
    () => buildFallbackTraceSegments(currentSnapshot?.visitedIndices ?? [], currentSnapshot?.action === 'visit', nodePositions),
    [currentSnapshot?.action, currentSnapshot?.visitedIndices, nodePositions],
  );

  const traceSegments = guideTraceSegments.length > 0 ? guideTraceSegments : fallbackTraceSegments;

  const visitedSet = useMemo(() => new Set(currentSnapshot?.visitedIndices ?? []), [currentSnapshot?.visitedIndices]);
  const modeLabel = getModeLabel(mode, t);
  const roleLabelMap = useMemo(() => buildRoleLabelMap(currentSnapshot, treeState.length), [currentSnapshot, treeState.length]);
  const valueLabelMap = useMemo(() => {
    const sortedUnique = Array.from(new Set(inputData)).sort((left, right) => left - right);
    return new Map(sortedUnique.map((value, index) => [value, toAlphabetLabel(index)]));
  }, [inputData]);

  const formatDisplayValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined) {
      return '-';
    }
    if (valueDisplayMode === 'number') {
      return String(value);
    }
    return valueLabelMap.get(value) ?? String(value);
  };

  const outputSequence = useMemo(
    () =>
      (currentSnapshot?.outputOrder ?? []).map((value) =>
        valueDisplayMode === 'number' ? String(value) : (valueLabelMap.get(value) ?? String(value)),
      ),
    [currentSnapshot?.outputOrder, valueDisplayMode, valueLabelMap],
  );
  const nullHints = useMemo(() => buildNullHints(currentSnapshot, treeState.length), [currentSnapshot, treeState.length]);
  const nullEdges = useMemo(() => {
    const nextEdges: NullEdgePath[] = [];

    nullHints.forEach((hint) => {
      const parent = getNodeCenter(nodePositions, hint.parentIndex);
      if (!parent) {
        return;
      }

      const nullPoint = getNullPoint(hint.parentIndex, hint.side, treeLayout.top, treeLayout.yStep);

      nextEdges.push({
        key: `${hint.parentIndex}-${hint.side}`,
        d: `M ${parent.x} ${parent.y} L ${nullPoint.x} ${nullPoint.y}`,
      });
    });

    return nextEdges;
  }, [nodePositions, nullHints, treeLayout.top, treeLayout.yStep]);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [setTotalFrames, reset, steps.length]);

  const regenerateData = () => {
    setInputData(createRandomDataset(datasetSize));
    reset();
  };

  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1200 },
    { key: 'module.s01.speed.normal', value: 700 },
    { key: 'module.s01.speed.fast', value: 350 },
  ] as const;

  const modeOptions: BinaryTreeTraversalMode[] = ['preorder', 'inorder', 'postorder', 'levelorder'];

  return (
    <section className="array-page tree-page">
      <h2>{t('module.t01.title')}</h2>
      <p>{t('module.t01.body')}</p>

      <div className="bubble-toolbar">
        <label htmlFor="dataset-size-t01" className="control-inline">
          <span>{t('module.s01.dataSize')}</span>
          <input
            id="dataset-size-t01"
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={datasetSize}
            onChange={(event) => setDatasetSize(Number(event.target.value))}
          />
          <strong>{datasetSize}</strong>
        </label>
        <div className="speed-group">
          <button type="button" onClick={regenerateData}>
            {t('module.s01.regenerate')}
          </button>
        </div>
      </div>

      <div className="bubble-toolbar">
        <span>{t('module.t01.mode.label')}</span>
        <div className="speed-group">
          {modeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={mode === option ? 'speed-active' : ''}
              onClick={() => {
                setMode(option);
                reset();
              }}
            >
              {getModeLabel(option, t)}
            </button>
          ))}
        </div>
      </div>

      <div className="bubble-toolbar">
        <span>{t('module.t01.valueMode.label')}</span>
        <div className="speed-group">
          <button
            type="button"
            className={valueDisplayMode === 'number' ? 'speed-active' : ''}
            onClick={() => setValueDisplayMode('number')}
          >
            {t('module.t01.valueMode.number')}
          </button>
          <button
            type="button"
            className={valueDisplayMode === 'letter' ? 'speed-active' : ''}
            onClick={() => setValueDisplayMode('letter')}
          >
            {t('module.t01.valueMode.letter')}
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

      <div className="module-status-block">
        <p className="module-status-line">
          {t('module.s01.moduleLabel')}: {currentModule?.id ?? '-'} | {t('playback.step')}: {currentStep}/
          {Math.max(steps.length - 1, 0)} | {t('playback.status')}: {getStatusLabel(status, t)}
        </p>
        <p className="module-status-line">{getStepDescription(currentSnapshot, t, (value) => formatDisplayValue(value))}</p>
        <p className="module-status-line">
          {t('module.t01.meta.mode')}: {modeLabel} | {t('module.t01.meta.currentNode')}:{' '}
          {currentSnapshot?.currentIndex ?? '-'} | {t('module.t01.meta.currentValue')}:{' '}
          {formatDisplayValue(currentSnapshot?.currentValue)}
        </p>
        <p className="module-status-line">{t('module.t01.meta.output')}: [{outputSequence.join(', ')}]</p>
        <p className="module-status-line">
          {t('module.t01.meta.structure')}: {t('module.t01.meta.structure.complete')}
        </p>
      </div>

      <p className="array-preview">
        {t('module.s01.sample')}: [{formatArrayPreview(inputData)}]
      </p>

      <VisualizationCanvas title={t('module.t01.title')} subtitle={t('module.t01.stage')} stageClassName="viz-canvas-stage-tree">
        <div className="tree-stage" aria-label="binary-tree-stage">
          <svg className="tree-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {edges.map((edge) => {
              const from = nodePositions[edge.from];
              const to = nodePositions[edge.to];
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  className="tree-edge"
                  x1={from?.x ?? 0}
                  y1={from?.y ?? 0}
                  x2={to?.x ?? 0}
                  y2={to?.y ?? 0}
                />
              );
            })}
          </svg>

          <svg className="tree-trace-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <marker
                id="tree-trace-arrow"
                viewBox="0 0 6 6"
                refX="5"
                refY="3"
                markerWidth="1.8"
                markerHeight="1.8"
                orient="auto-start-reverse"
              >
                <path d="M 0.9 0.9 L 4.9 3 L 0.9 5.1" fill="none" stroke="#2b70b5" strokeWidth="0.72" />
              </marker>
            </defs>
            {traceSegments.map((segment) => {
              const traceKey = segment.isActive ? `${segment.key}-${currentStep}` : segment.key;
              return (
                <path
                  key={traceKey}
                  className={`tree-trace${segment.isActive ? ' tree-trace-active' : ''}`}
                  d={segment.d}
                  markerEnd="url(#tree-trace-arrow)"
                  style={{ '--tree-trace-length': `${segment.length}` } as CSSProperties}
                />
              );
            })}
          </svg>

          <svg className="tree-null-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {nullEdges.map((edge) => (
              <path key={edge.key} className="tree-null-edge" d={edge.d} />
            ))}
          </svg>

          <div className="tree-null-layer" aria-hidden="true">
            {nullHints.map((hint) => {
              const point = getNullPoint(hint.parentIndex, hint.side, treeLayout.top, treeLayout.yStep);

              const isActiveNull =
                currentSnapshot?.guideNull?.parentIndex === hint.parentIndex && currentSnapshot?.guideNull?.side === hint.side;

              return (
                <div
                  key={`${hint.parentIndex}-${hint.side}`}
                  className={`tree-null-node${isActiveNull ? ' tree-null-active' : ''}`}
                  style={{ left: `${point.x}%`, top: `${point.y}%` }}
                >
                  <span className="tree-null-value">null</span>
                  <span className="tree-null-side">{hint.side}</span>
                </div>
              );
            })}
          </div>

          <div className="tree-node-layer" aria-hidden="true">
            {treeState.map((value, index) => {
              const shouldMarkVisitedOnArrive =
                currentSnapshot?.currentIndex === index &&
                (currentSnapshot.action === 'guideStart' ||
                  currentSnapshot.action === 'descendLeft' ||
                  currentSnapshot.action === 'descendRight' ||
                  currentSnapshot.action === 'visit');
              const isVisited = visitedSet.has(index) || shouldMarkVisitedOnArrive;
              const isCurrent =
                currentSnapshot?.currentIndex === index &&
                currentSnapshot.action !== 'traversalDone' &&
                currentSnapshot.action !== 'completed' &&
                !isVisited;
              const stateClass = isCurrent ? ' bar-visiting' : isVisited ? ' bar-matched' : '';
              const markerRoles = roleLabelMap.get(index) ?? [];

              return (
                <div
                  key={`${index}-${value}`}
                  className={`tree-node${stateClass}`}
                  style={{ left: `${nodePositions[index]?.x ?? 0}%`, top: `${nodePositions[index]?.y ?? 0}%` }}
                >
                  {markerRoles.length > 0 ? <span className="tree-node-tag">{markerRoles.join('/')}</span> : null}
                  <span className="tree-node-value">{formatDisplayValue(value)}</span>
                  <span className="tree-node-index">#{index}</span>
                </div>
              );
            })}
          </div>
        </div>
      </VisualizationCanvas>

      <div className="tree-sequence-block" aria-live="polite">
        <span className="tree-sequence-label">{t('module.t01.meta.output')}</span>
        <div className="tree-sequence-list">
          {outputSequence.length === 0 ? (
            <span className="tree-sequence-empty">{t('module.t01.sequence.empty')}</span>
          ) : (
            outputSequence.map((value, index) => (
              <span
                key={`${value}-${index}`}
                className={`tree-sequence-chip${index === outputSequence.length - 1 ? ' tree-sequence-chip-active' : ''}`}
              >
                {value}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="legend-row">
        <span className="legend-item legend-visiting">{t('module.t01.legend.visiting')}</span>
        <span className="legend-item legend-matched">{t('module.t01.legend.visited')}</span>
        <span className="legend-item legend-moving">{t('module.t01.legend.path')}</span>
        <span className="legend-item legend-default">{t('module.t01.legend.null')}</span>
      </div>

      <p>
        {t('module.s01.highlight')}:{' '}
        {(currentSnapshot?.highlights ?? []).map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`).join(' | ') ||
          t('module.s01.none')}
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
          <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.t01.code.line1')}</li>
          <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.t01.code.line2')}</li>
          <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.t01.code.line3')}</li>
          <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.t01.code.line4')}</li>
          <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.t01.code.line5')}</li>
          <li className={currentSnapshot?.codeLines.includes(6) ? 'code-active' : ''}>{t('module.t01.code.line6')}</li>
          <li className={currentSnapshot?.codeLines.includes(7) ? 'code-active' : ''}>{t('module.t01.code.line7')}</li>
          <li className={currentSnapshot?.codeLines.includes(8) ? 'code-active' : ''}>{t('module.t01.code.line8')}</li>
          <li className={currentSnapshot?.codeLines.includes(9) ? 'code-active' : ''}>{t('module.t01.code.line9')}</li>
        </ol>
      </div>
    </section>
  );
}
