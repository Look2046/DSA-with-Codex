import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { buildAvlTimelineFromInput } from '../../modules/tree/avlTimelineAdapter';
import type { AvlRotationCase, AvlOutcome, AvlStep } from '../../modules/tree/avl';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

const DEFAULT_DATASET = [50, 20, 70, 10, 30];
const DEFAULT_TARGET = 25;
const MIN_SIZE = 4;
const MAX_SIZE = 9;
const CODE_LINE_KEYS = [
  'module.t03.code.line1',
  'module.t03.code.line2',
  'module.t03.code.line3',
  'module.t03.code.line4',
  'module.t03.code.line5',
  'module.t03.code.line6',
  'module.t03.code.line7',
  'module.t03.code.line8',
  'module.t03.code.line9',
  'module.t03.code.line10',
  'module.t03.code.line11',
] as const;

type TranslateFn = ReturnType<typeof useI18n>['t'];

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

function getRotationCaseLabel(rotationCase: AvlRotationCase, t: TranslateFn): string {
  if (rotationCase === 'll') {
    return t('module.t03.case.ll');
  }
  if (rotationCase === 'lr') {
    return t('module.t03.case.lr');
  }
  if (rotationCase === 'rr') {
    return t('module.t03.case.rr');
  }
  if (rotationCase === 'rl') {
    return t('module.t03.case.rl');
  }
  return t('module.t03.case.none');
}

function getOutcomeLabel(outcome: AvlOutcome, t: TranslateFn): string {
  if (outcome === 'inserted') {
    return t('module.t03.outcome.inserted');
  }
  if (outcome === 'duplicate') {
    return t('module.t03.outcome.duplicate');
  }
  if (outcome === 'rebalanced') {
    return t('module.t03.outcome.rebalanced');
  }
  return t('module.t03.outcome.ongoing');
}

function getStepDescription(step: AvlStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.t03.step.initial');
  }
  if (step.action === 'visit') {
    return t('module.t03.step.visit');
  }
  if (step.action === 'duplicate') {
    return t('module.t03.step.duplicate');
  }
  if (step.action === 'inserted') {
    return t('module.t03.step.inserted');
  }
  if (step.action === 'rebalanceCheck') {
    return t('module.t03.step.rebalanceCheck');
  }
  if (step.action === 'imbalance') {
    return t('module.t03.step.imbalance');
  }
  if (step.action === 'rotateLeft') {
    return t('module.t03.step.rotateLeft');
  }
  if (step.action === 'rotateRight') {
    return t('module.t03.step.rotateRight');
  }
  if (step.action === 'rebalanced') {
    return t('module.t03.step.rebalanced');
  }
  return t('module.t03.step.completed');
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

export function AvlTreePage() {
  const { t } = useI18n();
  const [datasetSize, setDatasetSize] = useState(DEFAULT_DATASET.length);
  const [seedData, setSeedData] = useState<number[]>(DEFAULT_DATASET);
  const [targetInput, setTargetInput] = useState(String(DEFAULT_TARGET));
  const [error, setError] = useState('');
  const [activeTarget, setActiveTarget] = useState(DEFAULT_TARGET);

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } = useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildAvlTimelineFromInput(seedData, activeTarget), [activeTarget, seedData]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const nodeMap = useMemo(
    () => new Map((currentSnapshot?.treeState ?? []).map((node) => [node.id, node])),
    [currentSnapshot?.treeState],
  );

  const positionMap = useMemo(() => {
    const positions = new Map<number, { x: number; y: number }>();

    if (!currentSnapshot || currentSnapshot.rootId === null) {
      return positions;
    }

    const depthOf = (nodeId: number | null): number => {
      if (nodeId === null) {
        return 0;
      }
      const node = nodeMap.get(nodeId);
      if (!node) {
        return 0;
      }
      return Math.max(depthOf(node.left), depthOf(node.right)) + 1;
    };

    const maxDepth = Math.max(depthOf(currentSnapshot.rootId), 1);
    const yStep = maxDepth > 1 ? 76 / (maxDepth - 1) : 0;

    const placeNode = (nodeId: number | null, depth: number, minX: number, maxX: number) => {
      if (nodeId === null) {
        return;
      }

      const node = nodeMap.get(nodeId);
      if (!node) {
        return;
      }

      const x = (minX + maxX) / 2;
      const y = 12 + depth * yStep;
      positions.set(nodeId, { x, y });

      placeNode(node.left, depth + 1, minX, x);
      placeNode(node.right, depth + 1, x, maxX);
    };

    placeNode(currentSnapshot.rootId, 0, 4, 96);
    return positions;
  }, [currentSnapshot, nodeMap]);

  const edges = useMemo(() => {
    if (!currentSnapshot) {
      return [] as Array<{ from: number; to: number }>;
    }

    const nextEdges: Array<{ from: number; to: number }> = [];
    currentSnapshot.treeState.forEach((node) => {
      if (node.left !== null) {
        nextEdges.push({ from: node.id, to: node.left });
      }
      if (node.right !== null) {
        nextEdges.push({ from: node.id, to: node.right });
      }
    });
    return nextEdges;
  }, [currentSnapshot]);

  const highlightMap = useMemo(() => {
    const map = new Map<number, HighlightType>();
    (currentSnapshot?.highlights ?? []).forEach((entry) => {
      map.set(entry.index, entry.type);
    });
    return map;
  }, [currentSnapshot]);

  const pathSet = useMemo(() => new Set(currentSnapshot?.pathIds ?? []), [currentSnapshot?.pathIds]);
  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1200 },
    { key: 'module.s01.speed.normal', value: 700 },
    { key: 'module.s01.speed.fast', value: 350 },
  ] as const;
  const codeLines = useMemo(() => CODE_LINE_KEYS.map((key) => t(key)), [t]);

  const handleRegenerate = () => {
    const nextData = createRandomUniqueDataset(datasetSize);
    const nextTarget = createRandomInsertTarget(nextData);
    setSeedData(nextData);
    setTargetInput(String(nextTarget));
    setActiveTarget(nextTarget);
    setError('');
    reset();
  };

  const handleApply = () => {
    const parsedTarget = Number(targetInput);

    if (!Number.isInteger(parsedTarget)) {
      setError(t('module.t03.input.targetInvalid'));
      return;
    }

    setError('');
    setActiveTarget(parsedTarget);
    reset();
  };

  const currentRotationCaseLabel = getRotationCaseLabel(currentSnapshot?.rotationCase ?? 'none', t);
  const currentOutcomeLabel = getOutcomeLabel(currentSnapshot?.outcome ?? 'ongoing', t);
  const currentStepDescription = getStepDescription(currentSnapshot, t);
  const currentNodeValue = currentSnapshot?.currentId !== null && currentSnapshot?.currentId !== undefined
    ? (nodeMap.get(currentSnapshot.currentId)?.value ?? '-')
    : '-';
  const currentImbalanceValue =
    currentSnapshot?.imbalanceId !== null && currentSnapshot?.imbalanceId !== undefined
      ? (nodeMap.get(currentSnapshot.imbalanceId)?.value ?? '-')
      : '-';
  const currentPathValues = useMemo(
    () =>
      (currentSnapshot?.pathIds ?? [])
        .map((nodeId) => nodeMap.get(nodeId)?.value)
        .filter((value): value is number => value !== undefined),
    [currentSnapshot?.pathIds, nodeMap],
  );
  const currentTargetValue = currentSnapshot?.target ?? activeTarget;
  const stepDetailText = `${t('module.t03.meta.target')}: ${currentTargetValue} · ${t('module.t03.meta.outcome')}: ${currentOutcomeLabel}`;
  const focusNodeId = currentSnapshot?.currentId ?? currentSnapshot?.imbalanceId ?? currentSnapshot?.insertedId ?? null;
  const focusPoint = useMemo(() => (focusNodeId === null ? null : (positionMap.get(focusNodeId) ?? null)), [focusNodeId, positionMap]);
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={t('module.t03.title')}
      description={t('module.t03.body')}
      stageAriaLabel={t('module.t03.stage')}
      stageClassName="bst-stage avl-stage"
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
            {t('module.t03.meta.target')}: {currentTargetValue}
          </span>
          <span className="tree-workspace-pill">
            {t('module.t03.meta.case')}: {currentRotationCaseLabel}
          </span>
          <span className="tree-workspace-pill">
            {t('module.t03.meta.outcome')}: {currentOutcomeLabel}
          </span>
        </>
      }
      controlsContent={
        <>
          <label className="tree-workspace-field" htmlFor="dataset-size-t03">
            <span>{t('module.s01.dataSize')}</span>
            <input
              id="dataset-size-t03"
              type="range"
              min={MIN_SIZE}
              max={MAX_SIZE}
              value={datasetSize}
              onChange={(event) => setDatasetSize(Number(event.target.value))}
            />
            <strong>{datasetSize}</strong>
          </label>

          <label className="tree-workspace-field" htmlFor="avl-target-input">
            <span>{t('module.t03.input.target')}</span>
            <input
              id="avl-target-input"
              type="number"
              value={targetInput}
              onChange={(event) => {
                setTargetInput(event.target.value);
                setError('');
                reset();
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

          {error ? <p className="form-error workspace-inline-feedback">{error}</p> : null}

          <div className="tree-workspace-drawer-actions">
            <button type="button" className="tree-workspace-ghost-button" onClick={handleRegenerate}>
              {t('module.s01.regenerate')}
            </button>
            <button type="button" className="tree-workspace-ghost-button" onClick={handleApply}>
              {t('module.t03.apply')}
            </button>
          </div>

          <div className="tree-workspace-sample-block">
            <span>{t('module.t03.seed')}</span>
            <code>[{formatArrayPreview(seedData)}]</code>
          </div>
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
              <dt>{t('module.t03.meta.target')}</dt>
              <dd>{currentTargetValue}</dd>
            </div>
            <div>
              <dt>{t('module.t03.meta.current')}</dt>
              <dd>{currentNodeValue}</dd>
            </div>
            <div>
              <dt>{t('module.t03.meta.imbalance')}</dt>
              <dd>{currentImbalanceValue}</dd>
            </div>
            <div>
              <dt>{t('module.t03.meta.case')}</dt>
              <dd>{currentRotationCaseLabel}</dd>
            </div>
            <div>
              <dt>{t('module.t03.meta.outcome')}</dt>
              <dd>{currentOutcomeLabel}</dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{t('module.t03.code.title')}</span>
            <ol className="tree-workspace-code-list">
              {codeLines.map((line, index) => {
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
        <div className="avl-stage-scene" aria-hidden="true">
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

          <div className="tree-node-layer">
            {(currentSnapshot?.treeState ?? []).map((node) => {
              const highlightType = highlightMap.get(node.id);
              const isPath = pathSet.has(node.id);
              const stateClass =
                highlightType === 'matched'
                  ? ' bar-matched'
                  : highlightType === 'new-node'
                    ? ' bar-new-node'
                    : highlightType === 'comparing' || highlightType === 'visiting'
                      ? ' bar-visiting'
                      : '';
              const pathClass = isPath ? ' bst-node-path' : '';
              const marker: string[] = [];

              if (currentSnapshot?.currentId === node.id) {
                marker.push('C');
              }
              if (currentSnapshot?.insertedId === node.id) {
                marker.push('N');
              }
              if (currentSnapshot?.imbalanceId === node.id) {
                marker.push('Z');
              }

              const balanceClass =
                Math.abs(node.balance) > 1 ? ' avl-node-balance-badge-imbalanced' : node.balance < 0 ? ' avl-node-balance-badge-negative' : '';

              return (
                <div
                  key={node.id}
                  className={`tree-node avl-node${stateClass}${pathClass}`}
                  style={{
                    left: `${positionMap.get(node.id)?.x ?? 0}%`,
                    top: `${positionMap.get(node.id)?.y ?? 0}%`,
                  }}
                >
                  {marker.length > 0 ? <span className="tree-node-tag">{marker.join('/')}</span> : null}
                  <span className={`tree-node-badge avl-node-balance-badge${balanceClass}`}>BF {node.balance}</span>
                  <span className="tree-node-value">{node.value}</span>
                  <span className="avl-node-metrics">h{node.height}</span>
                </div>
              );
            })}
          </div>

          {(currentSnapshot?.treeState.length ?? 0) === 0 ? <p className="array-preview bst-empty">{t('module.t03.empty')}</p> : null}
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
        currentPathValues.length === 0 ? (
          <span className="tree-workspace-transport-empty">{t('module.t03.legend.path')}: -</span>
        ) : (
          <>
            <span className="tree-workspace-transport-empty">{t('module.t03.legend.path')}</span>
            {currentPathValues.map((value, index) => (
              <span
                key={`${value}-${index}`}
                className={`tree-workspace-transport-chip${index === currentPathValues.length - 1 ? ' tree-workspace-transport-chip-active' : ''}`}
              >
                {value}
              </span>
            ))}
          </>
        )
      }
    />
  );
}
