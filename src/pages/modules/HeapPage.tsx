import { useEffect, useMemo, useState } from 'react';
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

export function HeapPage() {
  const { t } = useI18n();
  const [datasetSize, setDatasetSize] = useState(DEFAULT_DATASET.length);
  const [seedData, setSeedData] = useState<number[]>(DEFAULT_DATASET);
  const [operationInput, setOperationInput] = useState<HeapOperation>(DEFAULT_OPERATION);
  const [targetInput, setTargetInput] = useState(String(DEFAULT_TARGET));
  const [error, setError] = useState('');
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

  const heapPreview = useMemo(() => buildMaxHeapArray(seedData), [seedData]);
  const currentArray = useMemo(() => currentSnapshot?.arrayState ?? [], [currentSnapshot?.arrayState]);

  const positionMap = useMemo(() => {
    const positions = new Map<number, { x: number; y: number }>();

    if (currentArray.length === 0) {
      return positions;
    }

    const maxDepth = Math.floor(Math.log2(currentArray.length));

    currentArray.forEach((_, index) => {
      const depth = Math.floor(Math.log2(index + 1));
      const levelStart = 2 ** depth - 1;
      const positionInLevel = index - levelStart;
      const nodesOnLevel = 2 ** depth;
      const x = 6 + ((positionInLevel + 1) * 88) / (nodesOnLevel + 1);
      const y = 16 + (maxDepth === 0 ? 18 : (depth / maxDepth) * 40);
      positions.set(index, { x, y });
    });

    return positions;
  }, [currentArray]);

  const edges = useMemo(() => {
    const nextEdges: Array<{ from: number; to: number }> = [];

    currentArray.forEach((_, index) => {
      const leftIndex = index * 2 + 1;
      const rightIndex = index * 2 + 2;

      if (leftIndex < currentArray.length) {
        nextEdges.push({ from: index, to: leftIndex });
      }

      if (rightIndex < currentArray.length) {
        nextEdges.push({ from: index, to: rightIndex });
      }
    });

    return nextEdges;
  }, [currentArray]);

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
              <svg className="tree-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
                {edges.map((edge) => {
                  const from = positionMap.get(edge.from);
                  const to = positionMap.get(edge.to);
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

              <div className="tree-node-layer heap-node-layer">
                {currentArray.map((value, index) => {
                  const highlightType = highlightMap.get(index);
                  const isPath = pathSet.has(index);
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
                  const selectedClass = currentSnapshot?.selectedIndex === index ? ' heap-focus-selected' : '';
                  const parent = getParentIndex(index);

                  return (
                    <div
                      key={`${index}-${value}`}
                      className={`tree-node heap-node${stateClass}${pathClass}${selectedClass}`}
                      style={{
                        left: `${positionMap.get(index)?.x ?? 0}%`,
                        top: `${positionMap.get(index)?.y ?? 0}%`,
                      }}
                    >
                      <span className="tree-node-tag">i{index}</span>
                      <span className="tree-node-value">{value}</span>
                      <span className="tree-node-index">{parent === null ? 'root' : `p${parent}`}</span>
                    </div>
                  );
                })}
              </div>

              <span className="heap-stage-label heap-stage-label-array">{t('module.t04.view.array')}</span>
              <div className="heap-array-strip">
                {currentArray.map((value, index) => {
                  const highlightType = highlightMap.get(index);
                  const isPath = pathSet.has(index);
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
                  const selectedClass = currentSnapshot?.selectedIndex === index ? ' heap-focus-selected' : '';

                  return (
                    <div key={`${index}-${value}-array`} className={`heap-array-cell${stateClass}${pathClass}${selectedClass}`}>
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
