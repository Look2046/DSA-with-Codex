import { useEffect, useMemo, useRef, useState } from 'react';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { createFocusCollisionRect, useStageAnchorPanel } from '../../hooks/useStageAnchorPanel';
import { useI18n } from '../../i18n/useI18n';
import { buildBstTimelineFromInput } from '../../modules/tree/bstTimelineAdapter';
import type { BstDeleteCase, BstOperation, BstOutcome, BstStep } from '../../modules/tree/bst';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

const DEFAULT_DATASET = [50, 30, 70, 20, 40, 60, 80, 65];
const MIN_SIZE = 5;
const MAX_SIZE = 15;
const DEFAULT_STAGE_SIZE = { width: 1200, height: 460 };
const WORKSPACE_PANEL_TOP = 118;
const WORKSPACE_PANEL_SIDE_MARGIN = 18;
const WORKSPACE_PANEL_GAP = 8;
const CONTROLS_TAB_FALLBACK_SIZE = { width: 48, height: 96 };
const CONTROLS_PANEL_FALLBACK_SIZE = { width: 226, height: 412 };
const CONTEXT_RAIL_FALLBACK_SIZE = { width: 54, height: 92 };
const CONTEXT_PANEL_FALLBACK_SIZE = { width: 286, height: 372 };

type BstOperationConfig = {
  operation: BstOperation;
  target: number;
};

type StageSize = {
  width: number;
  height: number;
};

type StagePoint = {
  x: number;
  y: number;
};

function createRandomUniqueDataset(size: number): number[] {
  const pool = Array.from({ length: 99 }, (_, index) => index + 1);

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, size);
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

function getOperationLabel(operation: BstOperation, t: ReturnType<typeof useI18n>['t']): string {
  if (operation === 'searchPath') {
    return t('module.t02.operation.searchPath');
  }
  if (operation === 'insert') {
    return t('module.t02.operation.insert');
  }
  return t('module.t02.operation.delete');
}

function getDeleteCaseLabel(deleteCase: BstDeleteCase, t: ReturnType<typeof useI18n>['t']): string {
  if (deleteCase === 'leaf') {
    return t('module.t02.case.leaf');
  }
  if (deleteCase === 'oneChild') {
    return t('module.t02.case.oneChild');
  }
  if (deleteCase === 'twoChildren') {
    return t('module.t02.case.twoChildren');
  }
  return t('module.t02.case.none');
}

function getOutcomeLabel(outcome: BstOutcome, t: ReturnType<typeof useI18n>['t']): string {
  if (outcome === 'found') {
    return t('module.t02.outcome.found');
  }
  if (outcome === 'inserted') {
    return t('module.t02.outcome.inserted');
  }
  if (outcome === 'deleted') {
    return t('module.t02.outcome.deleted');
  }
  if (outcome === 'notFound') {
    return t('module.t02.outcome.notFound');
  }
  if (outcome === 'duplicate') {
    return t('module.t02.outcome.duplicate');
  }
  return t('module.t02.outcome.ongoing');
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

function getStepDescription(step: BstStep | undefined, t: ReturnType<typeof useI18n>['t']): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.t02.step.initial');
  }

  if (step.action === 'visit') {
    return t('module.t02.step.visit');
  }

  if (step.action === 'found') {
    return t('module.t02.step.found');
  }

  if (step.action === 'notFound') {
    return t('module.t02.step.notFound');
  }

  if (step.action === 'inserted') {
    return t('module.t02.step.inserted');
  }

  if (step.action === 'duplicate') {
    return t('module.t02.step.duplicate');
  }

  if (step.action === 'deleteCase') {
    return t('module.t02.step.deleteCase');
  }

  if (step.action === 'successor') {
    return t('module.t02.step.successor');
  }

  if (step.action === 'deleted') {
    return t('module.t02.step.deleted');
  }

  return t('module.t02.step.completed');
}

function getControlsPanelDefaultAnchorPosition(
  _stageSize: StageSize,
  anchorSize: StageSize,
): StagePoint {
  return {
    x: WORKSPACE_PANEL_SIDE_MARGIN,
    y: WORKSPACE_PANEL_TOP + anchorSize.height + WORKSPACE_PANEL_GAP,
  };
}

function getContextPanelDefaultAnchorPosition(
  stageSize: StageSize,
  anchorSize: StageSize,
  panelSize: StageSize,
): StagePoint {
  return {
    x: stageSize.width - WORKSPACE_PANEL_SIDE_MARGIN - anchorSize.width - WORKSPACE_PANEL_GAP - panelSize.width,
    y: WORKSPACE_PANEL_TOP,
  };
}

export function BstPage() {
  const { t } = useI18n();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const controlsTabRef = useRef<HTMLButtonElement | null>(null);
  const controlsPanelRef = useRef<HTMLDivElement | null>(null);
  const contextRailRef = useRef<HTMLDivElement | null>(null);
  const contextPanelRef = useRef<HTMLElement | null>(null);

  const [datasetSize, setDatasetSize] = useState(DEFAULT_DATASET.length);
  const [seedData, setSeedData] = useState<number[]>(DEFAULT_DATASET);
  const [operationInput, setOperationInput] = useState<BstOperation>('searchPath');
  const [targetInput, setTargetInput] = useState(String(DEFAULT_DATASET[0] ?? 0));
  const [error, setError] = useState('');
  const [showStageControls, setShowStageControls] = useState(false);
  const [showContextSheet, setShowContextSheet] = useState(false);
  const [stageSize, setStageSize] = useState<StageSize>(DEFAULT_STAGE_SIZE);
  const [activeConfig, setActiveConfig] = useState<BstOperationConfig>({
    operation: 'searchPath',
    target: DEFAULT_DATASET[0] ?? 0,
  });

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } = useTimelinePlayer(0);

  const timelineFrames = useMemo(
    () => buildBstTimelineFromInput(seedData, activeConfig.operation, activeConfig.target),
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
    const stageElement = stageRef.current;
    if (!stageElement) {
      return;
    }

    const updateSize = () => {
      const rect = stageElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) {
        return;
      }

      setStageSize((previous) =>
        Math.abs(previous.width - rect.width) < 0.5 && Math.abs(previous.height - rect.height) < 0.5
          ? previous
          : {
            width: rect.width,
            height: rect.height,
          },
      );
    };

    updateSize();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(stageElement);
    return () => observer.disconnect();
  }, []);

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

  const operationOptions: BstOperation[] = ['searchPath', 'insert', 'delete'];

  const handleRegenerate = () => {
    const nextData = createRandomUniqueDataset(datasetSize);
    setSeedData(nextData);
    setTargetInput(String(nextData[0] ?? 0));
    setError('');
    reset();
  };

  const handleApply = () => {
    const parsedTarget = Number(targetInput);

    if (!Number.isInteger(parsedTarget)) {
      setError(t('module.t02.input.targetInvalid'));
      return;
    }

    setError('');
    setActiveConfig({ operation: operationInput, target: parsedTarget });
    reset();
  };

  const collapseWorkspacePanels = () => {
    setShowStageControls(false);
    setShowContextSheet(false);
  };

  const currentOperationLabel = getOperationLabel(currentSnapshot?.operation ?? activeConfig.operation, t);
  const currentDeleteCaseLabel = getDeleteCaseLabel(currentSnapshot?.deleteCase ?? 'none', t);
  const currentOutcomeLabel = getOutcomeLabel(currentSnapshot?.outcome ?? 'ongoing', t);
  const currentStepDescription = getStepDescription(currentSnapshot, t);
  const currentTargetValue = currentSnapshot?.target ?? activeConfig.target;
  const currentNodeLabel = currentSnapshot?.currentId ?? '-';
  const currentSuccessorLabel = currentSnapshot?.successorId ?? '-';
  const isDeleteFlow = (currentSnapshot?.operation ?? activeConfig.operation) === 'delete';
  const showDeleteCase = isDeleteFlow && (currentSnapshot?.deleteCase ?? 'none') !== 'none';
  const showSuccessor = isDeleteFlow && currentSnapshot?.successorId !== null;
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const pathValues = useMemo(
    () =>
      (currentSnapshot?.pathIds ?? [])
        .map((nodeId) => nodeMap.get(nodeId)?.value)
        .filter((value): value is number => value !== undefined),
    [currentSnapshot?.pathIds, nodeMap],
  );
  const stepDetailText = `${currentOperationLabel} · ${t('module.t02.meta.target')}: ${currentTargetValue} · ${
    t('module.t02.meta.outcome')
  }: ${currentOutcomeLabel}`;
  const floatingPanelsEnabled = stageSize.width >= 960;
  const focusNodeId = currentSnapshot?.currentId ?? currentSnapshot?.successorId ?? null;
  const focusPoint = useMemo(
    () => (focusNodeId === null ? null : (positionMap.get(focusNodeId) ?? null)),
    [focusNodeId, positionMap],
  );
  const focusCollisionRect = useMemo(
    () => createFocusCollisionRect(focusPoint, stageSize),
    [focusPoint, stageSize],
  );
  const controlsPanelAnchor = useStageAnchorPanel({
    stageRef,
    anchorRef: controlsTabRef,
    panelRef: controlsPanelRef,
    isOpen: showStageControls,
    defaultPanelPosition: getControlsPanelDefaultAnchorPosition,
    defaultAnchorSize: CONTROLS_TAB_FALLBACK_SIZE,
    defaultPanelSize: CONTROLS_PANEL_FALLBACK_SIZE,
    collisionTarget: focusCollisionRect,
    enabled: floatingPanelsEnabled,
  });
  const contextPanelAnchor = useStageAnchorPanel({
    stageRef,
    anchorRef: contextRailRef,
    panelRef: contextPanelRef,
    isOpen: showContextSheet,
    defaultPanelPosition: getContextPanelDefaultAnchorPosition,
    defaultAnchorSize: CONTEXT_RAIL_FALLBACK_SIZE,
    defaultPanelSize: CONTEXT_PANEL_FALLBACK_SIZE,
    collisionTarget: focusCollisionRect,
    enabled: floatingPanelsEnabled,
  });

  return (
    <section className="array-page tree-page bst-page">
      <div className="tree-workspace-header">
        <h2>{t('module.t02.title')}</h2>
        <p>{t('module.t02.body')}</p>
      </div>

      <section className="tree-workspace-shell">
        <div className="tree-workspace-controls-anchor">
          <div className="tree-workspace-controls-tab-pin">
            <button
              ref={controlsTabRef}
              type="button"
              className="tree-workspace-edge-tab"
              onClick={() => setShowStageControls((previous) => !previous)}
              aria-expanded={showStageControls}
            >
              {t('module.t01.workspace.controls')}
            </button>
          </div>

          {showStageControls ? (
            <div
              ref={controlsPanelRef}
              className="tree-workspace-drawer"
              style={controlsPanelAnchor.panelStyle}
              aria-label={t('module.t01.workspace.controls')}
            >
              <div
                className={`tree-workspace-drawer-head tree-workspace-panel-drag-handle${
                  controlsPanelAnchor.isDragging ? ' tree-workspace-panel-dragging' : ''
                }`}
                onPointerDown={controlsPanelAnchor.startDrag}
              >
                <strong>{t('module.t01.workspace.controls')}</strong>
                <span>{t('module.t01.workspace.onDemand')}</span>
              </div>

              <label className="tree-workspace-field" htmlFor="dataset-size-t02">
                <span>{t('module.s01.dataSize')}</span>
                <input
                  id="dataset-size-t02"
                  type="range"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  value={datasetSize}
                  onChange={(event) => setDatasetSize(Number(event.target.value))}
                />
                <strong>{datasetSize}</strong>
              </label>

              <div className="tree-workspace-field">
                <span>{t('module.t02.meta.operation')}</span>
                <div className="tree-workspace-toggle-row">
                  {operationOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`tree-workspace-toggle${operationInput === option ? ' tree-workspace-toggle-active' : ''}`}
                      onClick={() => {
                        setOperationInput(option);
                        reset();
                      }}
                    >
                      {getOperationLabel(option, t)}
                    </button>
                  ))}
                </div>
              </div>

              <label className="tree-workspace-field" htmlFor="bst-target-input">
                <span>{t('module.t02.input.target')}</span>
                <input
                  id="bst-target-input"
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

              {error ? <p className="form-error">{error}</p> : null}

              <div className="tree-workspace-drawer-actions">
                <button type="button" className="tree-workspace-ghost-button" onClick={handleRegenerate}>
                  {t('module.s01.regenerate')}
                </button>
                <button type="button" className="tree-workspace-ghost-button" onClick={handleApply}>
                  {t('module.t02.apply')}
                </button>
              </div>

              <div className="tree-workspace-sample-block">
                <span>{t('module.t02.seed')}</span>
                <code>[{formatArrayPreview(seedData)}]</code>
              </div>
            </div>
          ) : null}
        </div>

        <div className="tree-workspace-context-anchor">
          <div ref={contextRailRef} className="tree-workspace-context-rail">
            <button
              type="button"
              className={`tree-workspace-edge-tab tree-workspace-edge-tab-secondary${
                showContextSheet ? ' tree-workspace-context-tab-active' : ''
              }`}
              onClick={() => setShowContextSheet((previous) => !previous)}
              aria-pressed={showContextSheet}
            >
              {t('playback.step')}
            </button>
          </div>

          {showContextSheet ? (
            <aside
              ref={contextPanelRef}
              className="tree-workspace-context-sheet tree-workspace-context-sheet-step"
              style={contextPanelAnchor.panelStyle}
            >
              <div
                className={`tree-workspace-panel-drag-handle${
                  contextPanelAnchor.isDragging ? ' tree-workspace-panel-dragging' : ''
                }`}
                onPointerDown={contextPanelAnchor.startDrag}
              >
                <strong className="tree-workspace-step-label">{t('playback.step')}</strong>
              </div>
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
                  <dt>{t('module.t02.meta.operation')}</dt>
                  <dd>{currentOperationLabel}</dd>
                </div>
                <div>
                  <dt>{t('module.t02.meta.target')}</dt>
                  <dd>{currentTargetValue}</dd>
                </div>
                <div>
                  <dt>{t('module.t02.meta.current')}</dt>
                  <dd>{currentNodeLabel}</dd>
                </div>
                {showSuccessor ? (
                  <div>
                    <dt>{t('module.t02.meta.successor')}</dt>
                    <dd>{currentSuccessorLabel}</dd>
                  </div>
                ) : null}
                {showDeleteCase ? (
                  <div>
                    <dt>{t('module.t02.meta.case')}</dt>
                    <dd>{currentDeleteCaseLabel}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>{t('module.t02.meta.outcome')}</dt>
                  <dd>{currentOutcomeLabel}</dd>
                </div>
              </dl>
            </aside>
          ) : null}
        </div>

        <div ref={stageRef} className="tree-stage tree-stage-visual bst-stage" aria-label="bst-stage" onClick={collapseWorkspacePanels}>
          <div className="tree-workspace-stage-meta">
            <span className="tree-workspace-pill">{currentOperationLabel}</span>
            <span className="tree-workspace-pill tree-workspace-pill-active">
              {t('playback.status')}: {getStatusLabel(status, t)}
            </span>
            <span className="tree-workspace-pill">
              {t('module.t02.meta.target')}: {currentTargetValue}
            </span>
            <span className="tree-workspace-pill">
              {t('module.t02.meta.current')}: {currentNodeLabel}
            </span>
            <span className="tree-workspace-pill">
              {t('module.t02.meta.outcome')}: {currentOutcomeLabel}
            </span>
          </div>

          <svg className="tree-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
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

          <div className="tree-node-layer" aria-hidden="true">
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
              if (currentSnapshot?.successorId === node.id) {
                marker.push('S');
              }

              return (
                <div
                  key={node.id}
                  className={`tree-node bst-node${stateClass}${pathClass}`}
                  style={{
                    left: `${positionMap.get(node.id)?.x ?? 0}%`,
                    top: `${positionMap.get(node.id)?.y ?? 0}%`,
                  }}
                >
                  {marker.length > 0 ? <span className="tree-node-tag">{marker.join('/')}</span> : null}
                  <span className="tree-node-value">{node.value}</span>
                  <span className="tree-node-index">#{node.id}</span>
                </div>
              );
            })}
          </div>

          {(currentSnapshot?.treeState.length ?? 0) === 0 ? <p className="array-preview bst-empty">{t('module.t02.empty')}</p> : null}
          
          <div className="tree-workspace-transport" onClick={(event) => event.stopPropagation()}>
            <div className="tree-workspace-transport-left">
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
            </div>

            <div className="tree-workspace-transport-right" aria-live="polite">
              {pathValues.length === 0 ? (
                <span className="tree-workspace-transport-empty">{t('module.t02.legend.path')}: -</span>
              ) : (
                <>
                  <span className="tree-workspace-transport-empty">{t('module.t02.legend.path')}</span>
                  {pathValues.map((value, index) => (
                    <span
                      key={`${value}-${index}`}
                      className={`tree-workspace-transport-chip${index === pathValues.length - 1 ? ' tree-workspace-transport-chip-active' : ''}`}
                    >
                      {value}
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {error && !showStageControls ? <p className="form-error">{error}</p> : null}
    </section>
  );
}
