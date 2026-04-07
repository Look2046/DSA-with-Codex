import { useEffect, useMemo, useRef, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { buildHeapTimelineFromInput } from '../../modules/tree/heapTimelineAdapter';
import {
  buildMaxHeapArray,
  type HeapOperation,
  type HeapOutcome,
  type HeapStep,
} from '../../modules/tree/heap';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

const DEFAULT_DATASET = [30, 10, 50, 20, 40, 35];
const DEFAULT_TARGET = 55;
const DEFAULT_OPERATION: HeapOperation = 'build';
const MIN_SIZE = 5;
const MAX_SIZE = 10;
const HEAP_NODE_DIAMETER_PX = 70;
const HEAP_NODE_RADIUS_PX = HEAP_NODE_DIAMETER_PX / 2;
const HEAP_TREE_TOP_PERCENT = 14;
const HEAP_TREE_BOTTOM_PERCENT = 12;
const BUILD_CODE_LINE_KEYS = [
  'module.t04.code.build.line1',
  'module.t04.code.build.line2',
  'module.t04.code.build.line3',
  'module.t04.code.build.line4',
  'module.t04.code.build.line5',
  'module.t04.code.build.line6',
] as const;
const INSERT_CODE_LINE_KEYS = [
  'module.t04.code.insert.line1',
  'module.t04.code.insert.line2',
  'module.t04.code.insert.line3',
  'module.t04.code.insert.line4',
  'module.t04.code.insert.line5',
] as const;
const EXTRACT_CODE_LINE_KEYS = [
  'module.t04.code.extract.line1',
  'module.t04.code.extract.line2',
  'module.t04.code.extract.line3',
  'module.t04.code.extract.line4',
  'module.t04.code.extract.line5',
  'module.t04.code.extract.line6',
  'module.t04.code.extract.line7',
] as const;
type TranslateFn = ReturnType<typeof useI18n>['t'];
type HeapConfig = {
  operation: HeapOperation;
  target: number | null;
};
type HeapPoint = {
  x: number;
  y: number;
};
type HeapTreeRegionSize = {
  width: number;
  height: number;
};

function createRandomUniqueDataset(size: number): number[] {
  const pool = Array.from({ length: 99 }, (_, index) => index + 1);

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, size);
}

function createRandomInsertTarget(existing: number[]): number {
  const taken = new Set(existing);
  const candidates = Array.from({ length: 99 }, (_, index) => index + 1).filter((value) => !taken.has(value));
  return candidates[Math.floor(Math.random() * candidates.length)] ?? 1;
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

function getStatusLabel(status: PlaybackStatus, t: TranslateFn): string {
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

function getOperationLabel(operation: HeapOperation, t: TranslateFn): string {
  if (operation === 'build') {
    return t('module.t04.operation.build');
  }
  if (operation === 'insert') {
    return t('module.t04.operation.insert');
  }
  return t('module.t04.operation.extractRoot');
}

function getOutcomeLabel(outcome: HeapOutcome, t: TranslateFn): string {
  if (outcome === 'heapBuilt') {
    return t('module.t04.outcome.heapBuilt');
  }
  if (outcome === 'inserted') {
    return t('module.t04.outcome.inserted');
  }
  if (outcome === 'extracted') {
    return t('module.t04.outcome.extracted');
  }
  return t('module.t04.outcome.ongoing');
}

function getStepDescription(step: HeapStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }

  if (step.operation === 'build') {
    if (step.action === 'initial') {
      return t('module.t04.step.build.initial');
    }
    if (step.action === 'heapify') {
      return t('module.t04.step.build.heapify');
    }
    if (step.action === 'compare') {
      return t('module.t04.step.build.compare');
    }
    if (step.action === 'swap') {
      return t('module.t04.step.build.swap');
    }
    return t('module.t04.step.build.completed');
  }

  if (step.operation === 'insert') {
    if (step.action === 'initial') {
      return t('module.t04.step.insert.initial');
    }
    if (step.action === 'append') {
      return t('module.t04.step.insert.append');
    }
    if (step.action === 'compare') {
      return t('module.t04.step.insert.compare');
    }
    if (step.action === 'swap') {
      return t('module.t04.step.insert.swap');
    }
    return t('module.t04.step.insert.completed');
  }

  if (step.action === 'initial') {
    return t('module.t04.step.extract.initial');
  }
  if (step.action === 'extractRoot') {
    return t('module.t04.step.extract.extractRoot');
  }
  if (step.action === 'compare') {
    return t('module.t04.step.extract.compare');
  }
  if (step.action === 'swap') {
    return t('module.t04.step.extract.swap');
  }
  if (step.action === 'removeLast') {
    return t('module.t04.step.extract.removeLast');
  }
  return t('module.t04.step.extract.completed');
}

function getCodeTitle(operation: HeapOperation, t: TranslateFn): string {
  if (operation === 'build') {
    return t('module.t04.code.build.title');
  }
  if (operation === 'insert') {
    return t('module.t04.code.insert.title');
  }
  return t('module.t04.code.extract.title');
}

function getCodeLineKeys(operation: HeapOperation) {
  if (operation === 'build') {
    return BUILD_CODE_LINE_KEYS;
  }
  if (operation === 'insert') {
    return INSERT_CODE_LINE_KEYS;
  }
  return EXTRACT_CODE_LINE_KEYS;
}

function getParentIndex(index: number): number | null {
  if (index <= 0) {
    return null;
  }
  return Math.floor((index - 1) / 2);
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getHeapNodeLevel(index: number): number {
  return Math.floor(Math.log2(index + 1));
}

function getHeapTreeHorizontalInset(regionWidth: number, maxDisplayLevel: number): number {
  const safeRegionWidth = Math.max(regionWidth, 1);
  const unitX = 100 / safeRegionWidth;
  const baseInset = clampNumber((HEAP_NODE_RADIUS_PX + 12) * unitX, 3.5, 7.5);
  const deepestSlotCount = 2 ** Math.max(maxDisplayLevel, 1);
  const minDeepestGapPercent = ((HEAP_NODE_DIAMETER_PX + 20) * deepestSlotCount * unitX) / 2;
  const maxInsetForDeepestGap = Math.max((100 - minDeepestGapPercent) / 2, 1.2);
  return clampNumber(Math.min(baseInset, maxInsetForDeepestGap), 1.2, 7.5);
}

function getHeapTreePointByIndex(index: number, top: number, yStep: number, xInset: number): HeapPoint {
  const level = getHeapNodeLevel(index);
  const firstIndexOfLevel = 2 ** level - 1;
  const positionInLevel = index - firstIndexOfLevel;
  const nodesInLevel = 2 ** level;
  const ratio = (positionInLevel + 0.5) / nodesInLevel;
  const usableWidth = Math.max(100 - xInset * 2, 1);
  return {
    x: clampNumber(xInset + ratio * usableWidth, 2, 98),
    y: clampNumber(top + level * yStep, 6, 94),
  };
}

function getHeapEdgeSegment(from: HeapPoint, to: HeapPoint, regionSize: HeapTreeRegionSize) {
  const safeWidth = Math.max(regionSize.width, 1);
  const safeHeight = Math.max(regionSize.height, 1);
  const fromPx = { x: (from.x / 100) * safeWidth, y: (from.y / 100) * safeHeight };
  const toPx = { x: (to.x / 100) * safeWidth, y: (to.y / 100) * safeHeight };
  const dx = toPx.x - fromPx.x;
  const dy = toPx.y - fromPx.y;
  const length = Math.hypot(dx, dy);

  if (length < 0.001) {
    return {
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
    };
  }

  const unitX = dx / length;
  const unitY = dy / length;
  const clipDistance = Math.min(HEAP_NODE_RADIUS_PX - 2, Math.max(length / 2 - 1, 0));

  if (clipDistance <= 0) {
    return {
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
    };
  }

  const start = {
    x: fromPx.x + unitX * clipDistance,
    y: fromPx.y + unitY * clipDistance,
  };
  const end = {
    x: toPx.x - unitX * clipDistance,
    y: toPx.y - unitY * clipDistance,
  };

  return {
    x1: clampNumber((start.x / safeWidth) * 100, 0, 100),
    y1: clampNumber((start.y / safeHeight) * 100, 0, 100),
    x2: clampNumber((end.x / safeWidth) * 100, 0, 100),
    y2: clampNumber((end.y / safeHeight) * 100, 0, 100),
  };
}

function getHeapVisualPriority(
  highlightType: HighlightType | undefined,
  isPath: boolean,
  isSelected: boolean,
): number {
  if (highlightType === 'swapping') {
    return 5;
  }
  if (isSelected) {
    return 4;
  }
  if (highlightType === 'matched' || highlightType === 'new-node') {
    return 3;
  }
  if (highlightType === 'comparing' || highlightType === 'visiting' || isPath) {
    return 2;
  }
  return 1;
}

export function HeapPage() {
  const { t } = useI18n();
  const treeRegionRef = useRef<HTMLDivElement | null>(null);
  const [datasetSize, setDatasetSize] = useState(DEFAULT_DATASET.length);
  const [seedData, setSeedData] = useState<number[]>(DEFAULT_DATASET);
  const [operationInput, setOperationInput] = useState<HeapOperation>(DEFAULT_OPERATION);
  const [targetInput, setTargetInput] = useState(String(DEFAULT_TARGET));
  const [error, setError] = useState('');
  const [treeRegionSize, setTreeRegionSize] = useState<HeapTreeRegionSize>({
    width: 0,
    height: 0,
  });
  const [activeConfig, setActiveConfig] = useState<HeapConfig>({
    operation: DEFAULT_OPERATION,
    target: null,
  });

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(
    () =>
      buildHeapTimelineFromInput(
        seedData,
        activeConfig.operation,
        activeConfig.operation === 'insert' ? activeConfig.target : null,
      ),
    [activeConfig.operation, activeConfig.target, seedData],
  );
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  useEffect(() => {
    const element = treeRegionRef.current;
    if (!element) {
      return;
    }

    const syncSize = (width: number, height: number) => {
      setTreeRegionSize((current) => {
        if (Math.abs(current.width - width) < 0.5 && Math.abs(current.height - height) < 0.5) {
          return current;
        }
        return { width, height };
      });
    };

    const rect = element.getBoundingClientRect();
    syncSize(rect.width, rect.height);

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }
      syncSize(entry.contentRect.width, entry.contentRect.height);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const heapPreview = useMemo(() => buildMaxHeapArray(seedData), [seedData]);
  const currentArray = useMemo(() => currentSnapshot?.arrayState ?? [], [currentSnapshot?.arrayState]);
  const currentItemIds = useMemo(
    () => currentSnapshot?.itemIds ?? currentArray.map((_, index) => `slot-${index}`),
    [currentArray, currentSnapshot?.itemIds],
  );
  const currentItems = useMemo(
    () =>
      currentArray.map((value, index) => ({
        id: currentItemIds[index] ?? `slot-${index}`,
        index,
        value,
      })),
    [currentArray, currentItemIds],
  );
  const arrayCellWidthPercent = useMemo(() => {
    if (currentArray.length === 0) {
      return 0;
    }

    return Math.min(14, Math.max(8.2, 84 / currentArray.length));
  }, [currentArray.length]);

  const { positionMap, edgeSegments } = useMemo(() => {
    const positions = new Map<number, HeapPoint>();
    const segments: Array<{ key: string; x1: number; y1: number; x2: number; y2: number }> = [];

    if (currentArray.length === 0) {
      return {
        positionMap: positions,
        edgeSegments: segments,
      };
    }

    const maxDisplayLevel = getHeapNodeLevel(currentArray.length - 1);
    const effectiveRegionSize = {
      width: treeRegionSize.width > 0 ? treeRegionSize.width : 1180,
      height: treeRegionSize.height > 0 ? treeRegionSize.height : 420,
    };
    const xInset = getHeapTreeHorizontalInset(effectiveRegionSize.width, maxDisplayLevel);
    const top = maxDisplayLevel === 0 ? 50 : HEAP_TREE_TOP_PERCENT;
    const yStep = maxDisplayLevel === 0 ? 0 : (100 - HEAP_TREE_TOP_PERCENT - HEAP_TREE_BOTTOM_PERCENT) / maxDisplayLevel;

    currentArray.forEach((_, index) => {
      positions.set(index, getHeapTreePointByIndex(index, top, yStep, xInset));
    });

    currentArray.forEach((_, index) => {
      const from = positions.get(index);
      if (!from) {
        return;
      }

      [index * 2 + 1, index * 2 + 2].forEach((childIndex) => {
        if (childIndex >= currentArray.length) {
          return;
        }

        const to = positions.get(childIndex);
        if (!to) {
          return;
        }

        const segment = getHeapEdgeSegment(from, to, effectiveRegionSize);
        segments.push({
          key: `${index}-${childIndex}`,
          ...segment,
        });
      });
    });

    return {
      positionMap: positions,
      edgeSegments: segments,
    };
  }, [currentArray, treeRegionSize.height, treeRegionSize.width]);
  const arrayPositionMap = useMemo(() => {
    const positions = new Map<number, number>();

    if (currentArray.length === 0) {
      return positions;
    }

    const minCenter = arrayCellWidthPercent / 2 + 1;
    const maxCenter = 100 - minCenter;
    const gap = currentArray.length === 1 ? 0 : (maxCenter - minCenter) / (currentArray.length - 1);

    currentArray.forEach((_, index) => {
      positions.set(index, currentArray.length === 1 ? 50 : minCenter + gap * index);
    });

    return positions;
  }, [arrayCellWidthPercent, currentArray]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, HighlightType>();
    (currentSnapshot?.highlights ?? []).forEach((entry) => {
      map.set(entry.index, entry.type);
    });
    return map;
  }, [currentSnapshot?.highlights]);

  const pathSet = useMemo(() => new Set(currentSnapshot?.pathIndices ?? []), [currentSnapshot?.pathIndices]);
  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1200 },
    { key: 'module.s01.speed.normal', value: 700 },
    { key: 'module.s01.speed.fast', value: 350 },
  ] as const;
  const operationOptions: HeapOperation[] = ['build', 'insert', 'extractRoot'];
  const currentOperation = currentSnapshot?.operation ?? activeConfig.operation;
  const currentOperationLabel = getOperationLabel(currentOperation, t);
  const currentOutcomeLabel = getOutcomeLabel(currentSnapshot?.outcome ?? 'ongoing', t);
  const currentStepDescription = getStepDescription(currentSnapshot, t);
  const currentActiveValue =
    currentSnapshot?.activeIndex !== null && currentSnapshot?.activeIndex !== undefined
      ? (currentArray[currentSnapshot.activeIndex] ?? '-')
      : '-';
  const currentCompareValue =
    currentSnapshot?.compareIndex !== null && currentSnapshot?.compareIndex !== undefined
      ? (currentArray[currentSnapshot.compareIndex] ?? '-')
      : '-';
  const currentRootValue = currentArray[0] ?? '-';
  const currentTargetValue = currentSnapshot?.target ?? activeConfig.target;
  const currentCodeTitle = getCodeTitle(currentOperation, t);
  const currentCodeLines = useMemo(
    () => getCodeLineKeys(currentOperation).map((key) => t(key)),
    [currentOperation, t],
  );
  const currentPathValues = useMemo(
    () =>
      (currentSnapshot?.pathIndices ?? [])
        .map((index) => currentArray[index])
        .filter((value): value is number => value !== undefined),
    [currentArray, currentSnapshot?.pathIndices],
  );
  const detailParts = [
    `${t('module.t04.meta.operation')}: ${currentOperationLabel}`,
    `${t('module.t04.meta.outcome')}: ${currentOutcomeLabel}`,
  ];
  if (currentSnapshot?.extractedValue !== null && currentSnapshot?.extractedValue !== undefined) {
    detailParts.push(`${t('module.t04.meta.extracted')}: ${currentSnapshot.extractedValue}`);
  } else if (currentTargetValue !== null && currentTargetValue !== undefined && currentOperation === 'insert') {
    detailParts.push(`${t('module.t04.meta.target')}: ${currentTargetValue}`);
  }
  const stepDetailText = detailParts.join(' · ');
  const focusIndex =
    currentSnapshot?.activeIndex ?? currentSnapshot?.compareIndex ?? currentSnapshot?.selectedIndex ?? null;
  const focusPoint = useMemo(
    () => (focusIndex === null ? null : (positionMap.get(focusIndex) ?? null)),
    [focusIndex, positionMap],
  );
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  const handleOperationChange = (operation: HeapOperation) => {
    setOperationInput(operation);
    setError('');
    reset();

    if (operation === 'insert' && (targetInput.trim() === '' || !Number.isInteger(Number(targetInput)))) {
      setTargetInput(String(createRandomInsertTarget(seedData)));
    }
  };

  const handleRegenerate = () => {
    const nextData = createRandomUniqueDataset(datasetSize);
    const nextTarget = createRandomInsertTarget(nextData);

    setSeedData(nextData);
    setTargetInput(String(nextTarget));
    setActiveConfig({
      operation: operationInput,
      target: operationInput === 'insert' ? nextTarget : null,
    });
    setError('');
    reset();
  };

  const handleApply = () => {
    if (operationInput === 'insert') {
      const parsedTarget = Number(targetInput);

      if (!Number.isInteger(parsedTarget)) {
        setError(t('module.t04.input.targetInvalid'));
        return;
      }

      setActiveConfig({
        operation: 'insert',
        target: parsedTarget,
      });
      setError('');
      reset();
      return;
    }

    setActiveConfig({
      operation: operationInput,
      target: null,
    });
    setError('');
    reset();
  };

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={t('module.t04.title')}
      description={t('module.t04.body')}
      stageAriaLabel={t('module.t04.stage')}
      stageClassName="bst-stage heap-stage"
      stageBodyClassName="workspace-stage-body-tree"
      controlsPanelClassName="workspace-drawer-xl workspace-drawer-scroll"
      stepPanelClassName="workspace-context-sheet-wide workspace-context-sheet-rich"
      defaultControlsPanelSize={{ width: 332, height: 620 }}
      defaultContextPanelSize={{ width: 320, height: 560 }}
      focusPoint={focusPoint}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('module.t04.meta.operation')}: {currentOperationLabel}
          </span>
          <span className="tree-workspace-pill">
            {t('module.t04.meta.root')}: {currentRootValue}
          </span>
          <span className="tree-workspace-pill">
            {t('module.t04.meta.outcome')}: {currentOutcomeLabel}
          </span>
        </>
      }
      controlsContent={
        <>
          <label className="tree-workspace-field" htmlFor="dataset-size-t04">
            <span>{t('module.s01.dataSize')}</span>
            <input
              id="dataset-size-t04"
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={datasetSize}
              onChange={(event) => setDatasetSize(Number(event.target.value))}
            />
            <strong>{datasetSize}</strong>
          </label>

          <div className="tree-workspace-field">
            <span>{t('module.t04.meta.operation')}</span>
            <div className="tree-workspace-toggle-row">
              {operationOptions.map((operation) => (
                <button
                  key={operation}
                  type="button"
                  className={`tree-workspace-toggle${
                    operationInput === operation ? ' tree-workspace-toggle-active' : ''
                  }`}
                  onClick={() => handleOperationChange(operation)}
                >
                  {getOperationLabel(operation, t)}
                </button>
              ))}
            </div>
          </div>

          {operationInput === 'insert' ? (
            <label className="tree-workspace-field" htmlFor="heap-target-input">
              <span>{t('module.t04.input.target')}</span>
              <input
                id="heap-target-input"
                type="number"
                value={targetInput}
                onChange={(event) => {
                  setTargetInput(event.target.value);
                  setError('');
                  reset();
                }}
              />
            </label>
          ) : null}

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

          {error ? <p className="form-error workspace-inline-feedback">{error}</p> : null}

          <div className="tree-workspace-drawer-actions">
            <button type="button" className="tree-workspace-ghost-button" onClick={handleRegenerate}>
              {t('module.s01.regenerate')}
            </button>
            <button type="button" className="tree-workspace-ghost-button" onClick={handleApply}>
              {t('module.t04.apply')}
            </button>
          </div>

          <div className="tree-workspace-sample-block">
            <span>{t('module.t04.seed')}</span>
            <code>[{formatArrayPreview(seedData)}]</code>
          </div>

          {operationInput !== 'build' ? (
            <div className="tree-workspace-sample-block">
              <span>{t('module.t04.heapBase')}</span>
              <code>[{formatArrayPreview(heapPreview)}]</code>
            </div>
          ) : null}
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy">
            <h3>{currentStepDescription}</h3>
            <p>{stepDetailText}</p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{t('module.t04.meta.operation')}</dt>
              <dd>{currentOperationLabel}</dd>
            </div>
            <div>
              <dt>{t('module.t04.meta.root')}</dt>
              <dd>{currentRootValue}</dd>
            </div>
            <div>
              <dt>{t('module.t04.meta.active')}</dt>
              <dd>{currentActiveValue}</dd>
            </div>
            <div>
              <dt>{t('module.t04.meta.compare')}</dt>
              <dd>{currentCompareValue}</dd>
            </div>
            <div>
              <dt>{t('module.t04.meta.size')}</dt>
              <dd>{currentArray.length}</dd>
            </div>
            {currentOperation === 'insert' ? (
              <div>
                <dt>{t('module.t04.meta.target')}</dt>
                <dd>{currentTargetValue ?? '-'}</dd>
              </div>
            ) : null}
            {currentSnapshot?.extractedValue !== null && currentSnapshot?.extractedValue !== undefined ? (
              <div>
                <dt>{t('module.t04.meta.extracted')}</dt>
                <dd>{currentSnapshot.extractedValue}</dd>
              </div>
            ) : null}
            <div>
              <dt>{t('module.t04.meta.outcome')}</dt>
              <dd>{currentOutcomeLabel}</dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{currentCodeTitle}</span>
            <ol className="tree-workspace-code-list">
              {currentCodeLines.map((line, index) => {
                const lineNumber = index + 1;
                const isActive = currentSnapshot?.codeLines.includes(lineNumber) ?? false;
                return (
                  <li key={lineNumber} className={isActive ? 'code-active' : undefined}>
                    <code>{line}</code>
                  </li>
                );
              })}
            </ol>
          </div>
        </>
      }
      stageContent={
        <div className="heap-stage-scene" aria-hidden="true">
          {currentArray.length > 0 ? (
            <>
              <span className="heap-stage-label heap-stage-label-tree">{t('module.t04.view.tree')}</span>
              <div ref={treeRegionRef} className="heap-tree-region">
                <svg className="tree-edge-layer heap-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {edgeSegments.map((edge) => (
                    <line
                      key={edge.key}
                      className="tree-edge"
                      x1={edge.x1}
                      y1={edge.y1}
                      x2={edge.x2}
                      y2={edge.y2}
                    />
                  ))}
                </svg>

                <div className="tree-node-layer heap-node-layer">
                  {currentItems.map(({ id, index, value }) => {
                    const highlightType = highlightMap.get(index);
                    const isPath = pathSet.has(index);
                    const isSelected = currentSnapshot?.selectedIndex === index;
                    const stateClass =
                      highlightType === 'matched'
                        ? ' bar-matched'
                        : highlightType === 'new-node'
                          ? ' bar-new-node'
                          : highlightType === 'swapping'
                            ? ' bar-swapping'
                            : highlightType === 'comparing' || highlightType === 'visiting'
                              ? ' bar-visiting'
                              : '';
                    const pathClass = isPath ? ' bst-node-path' : '';
                    const selectedClass = isSelected ? ' heap-focus-selected' : '';
                    const parent = getParentIndex(index);
                    const position = positionMap.get(index);

                    return (
                      <div
                        key={id}
                        className={`tree-node heap-node${stateClass}${pathClass}${selectedClass}`}
                        style={{
                          left: `${position?.x ?? 0}%`,
                          top: `${position?.y ?? 0}%`,
                          zIndex: getHeapVisualPriority(highlightType, isPath, isSelected),
                        }}
                      >
                        <span className="tree-node-tag">i{index}</span>
                        <span className="tree-node-value">{value}</span>
                        <span className="tree-node-index">{parent === null ? 'root' : `p${parent}`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <span className="heap-stage-label heap-stage-label-array">{t('module.t04.view.array')}</span>
              <div className="heap-array-strip">
                {currentItems.map(({ id, index, value }) => {
                  const highlightType = highlightMap.get(index);
                  const isPath = pathSet.has(index);
                  const isSelected = currentSnapshot?.selectedIndex === index;
                  const stateClass =
                    highlightType === 'matched'
                      ? ' bar-matched'
                      : highlightType === 'new-node'
                        ? ' bar-new-node'
                        : highlightType === 'swapping'
                          ? ' bar-swapping'
                          : highlightType === 'comparing' || highlightType === 'visiting'
                            ? ' bar-visiting'
                            : '';
                  const pathClass = isPath ? ' heap-array-cell-path' : '';
                  const selectedClass = isSelected ? ' heap-focus-selected' : '';
                  const cellLeft = arrayPositionMap.get(index) ?? 50;

                  return (
                    <div
                      key={`${id}-array`}
                      className={`heap-array-cell${stateClass}${pathClass}${selectedClass}`}
                      style={{
                        left: `${cellLeft}%`,
                        width: `min(${arrayCellWidthPercent}%, 118px)`,
                        zIndex: getHeapVisualPriority(highlightType, isPath, isSelected),
                      }}
                    >
                      <span className="heap-array-cell-label">i{index}</span>
                      <strong className="heap-array-cell-value">{value}</strong>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="array-preview bst-empty">{t('module.t04.empty')}</p>
          )}
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
          {currentSnapshot?.extractedValue !== null && currentSnapshot?.extractedValue !== undefined ? (
            <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
              {t('module.t04.meta.extracted')}: {currentSnapshot.extractedValue}
            </span>
          ) : null}
          {currentPathValues.length === 0 ? (
            <span className="tree-workspace-transport-empty">{t('module.t04.legend.chain')}: -</span>
          ) : (
            <>
              <span className="tree-workspace-transport-empty">{t('module.t04.legend.chain')}</span>
              {currentPathValues.map((value, index) => (
                <span
                  key={`${value}-${index}`}
                  className={`tree-workspace-transport-chip${
                    index === currentPathValues.length - 1 ? ' tree-workspace-transport-chip-active' : ''
                  }`}
                >
                  {value}
                </span>
              ))}
            </>
          )}
        </>
      }
    />
  );
}
