import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { getGraphEdgeKey, type GraphDefinition } from '../../modules/graph/graphRepresentation';
import { buildTopologicalSortTimelineFromPreset } from '../../modules/graph/topologicalSortTimelineAdapter';
import {
  getTopologicalSortPresetIds,
  type TopologicalSortPresetId,
  type TopologicalSortStep,
} from '../../modules/graph/topologicalSort';
import type { PlaybackStatus } from '../../types/animation';

const DEFAULT_PRESET: TopologicalSortPresetId = 'dag';
const CODE_LINE_KEYS = [
  'module.g09.code.line1',
  'module.g09.code.line2',
  'module.g09.code.line3',
  'module.g09.code.line4',
  'module.g09.code.line5',
  'module.g09.code.line6',
  'module.g09.code.line7',
  'module.g09.code.line8',
] as const;
const SPEED_OPTIONS = [
  { key: 'module.s01.speed.slow', value: 1200 },
  { key: 'module.s01.speed.normal', value: 700 },
  { key: 'module.s01.speed.fast', value: 350 },
] as const;

type TranslateFn = ReturnType<typeof useI18n>['t'];

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

function getPresetLabel(presetId: TopologicalSortPresetId, t: TranslateFn): string {
  return presetId === 'dag' ? t('module.g09.preset.dag') : presetId;
}

function getTopologyLabel(graph: GraphDefinition, t: TranslateFn): string {
  return graph.topology === 'directed' ? t('module.g01.topology.directed') : t('module.g01.topology.undirected');
}

function getRelationLabel(graph: GraphDefinition, fromIndex: number | null, toIndex: number | null): string {
  if (fromIndex === null || toIndex === null) {
    return '-';
  }

  const left = graph.nodes[fromIndex]?.id ?? '?';
  const right = graph.nodes[toIndex]?.id ?? '?';
  return graph.topology === 'directed' ? `${left} -> ${right}` : `${left} - ${right}`;
}

function formatNeighborRow(graph: GraphDefinition, neighborRow: number[]): string {
  if (neighborRow.length === 0) {
    return '∅';
  }
  return neighborRow.map((index) => graph.nodes[index]?.id ?? '?').join(', ');
}

function formatVertexList(graph: GraphDefinition): string {
  return graph.nodes.map((node) => node.id).join(', ');
}

function formatEdgeList(graph: GraphDefinition): string {
  return graph.edges.map((edge) => getRelationLabel(graph, edge.from, edge.to)).join(', ');
}

function getStepDescription(step: TopologicalSortStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }

  switch (step.action) {
    case 'initial':
      return t('module.g09.step.initial');
    case 'countIndegree':
      return t('module.g09.step.countIndegree');
    case 'enqueueZero':
      return t('module.g09.step.enqueueZero');
    case 'dequeue':
      return t('module.g09.step.dequeue');
    case 'emit':
      return t('module.g09.step.emit');
    case 'inspectEdge':
      return t('module.g09.step.inspectEdge');
    case 'decreaseIndegree':
      return t('module.g09.step.decreaseIndegree');
    case 'enqueueNeighbor':
      return t('module.g09.step.enqueueNeighbor');
    case 'completeNode':
      return t('module.g09.step.completeNode');
    case 'completed':
      return t('module.g09.step.completed');
    case 'cycleDetected':
      return t('module.g09.step.cycleDetected');
    default:
      return '-';
  }
}

function getOutcomeLabel(step: TopologicalSortStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }
  if (step.outcome === 'completed') {
    return t('module.g09.outcome.completed');
  }
  if (step.outcome === 'cycleDetected') {
    return t('module.g09.outcome.cycleDetected');
  }
  return t('module.g09.outcome.ongoing');
}

export function TopologicalSortPage() {
  const { t } = useI18n();
  const [presetId, setPresetId] = useState<TopologicalSortPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildTopologicalSortTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const graph = currentSnapshot?.graph ?? null;
  const adjacencyList = currentSnapshot?.adjacencyList ?? [];
  const codeLines = useMemo(() => CODE_LINE_KEYS.map((key) => t(key)), [t]);
  const presetOptions = useMemo(() => getTopologicalSortPresetIds(), []);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const focusPoint = useMemo(() => {
    if (!graph || currentSnapshot?.activeNodeIndex === null || currentSnapshot?.activeNodeIndex === undefined) {
      return null;
    }

    const node = graph.nodes[currentSnapshot.activeNodeIndex];
    if (!node) {
      return null;
    }

    return { x: node.x, y: node.y };
  }, [currentSnapshot, graph]);

  const processedNodeSet = useMemo(
    () => new Set(currentSnapshot?.processedNodeIndices ?? []),
    [currentSnapshot?.processedNodeIndices],
  );
  const inspectedEdgeSet = useMemo(
    () => new Set(currentSnapshot?.inspectedEdgeKeys ?? []),
    [currentSnapshot?.inspectedEdgeKeys],
  );
  const queueSet = useMemo(() => new Set(currentSnapshot?.queueNodeIndices ?? []), [currentSnapshot?.queueNodeIndices]);
  const outputOrderIndexMap = useMemo(
    () => new Map((currentSnapshot?.outputOrder ?? []).map((nodeIndex, index) => [nodeIndex, index + 1] as const)),
    [currentSnapshot?.outputOrder],
  );

  const activeEdgeKey =
    graph && currentSnapshot?.activeEdge
      ? getGraphEdgeKey(graph, currentSnapshot.activeEdge.from, currentSnapshot.activeEdge.to)
      : null;
  const activeNodeLabel =
    graph && currentSnapshot?.activeNodeIndex !== null && currentSnapshot?.activeNodeIndex !== undefined
      ? (graph.nodes[currentSnapshot.activeNodeIndex]?.id ?? '-')
      : '-';
  const activeNeighborLabel =
    graph && currentSnapshot?.activeNeighborIndex !== null && currentSnapshot?.activeNeighborIndex !== undefined
      ? (graph.nodes[currentSnapshot.activeNeighborIndex]?.id ?? '-')
      : '-';
  const activeRelationLabel =
    graph && currentSnapshot
      ? currentSnapshot.activeEdge
        ? getRelationLabel(graph, currentSnapshot.activeEdge.from, currentSnapshot.activeEdge.to)
        : getRelationLabel(graph, currentSnapshot.activeNodeIndex, currentSnapshot.activeNeighborIndex)
      : '-';
  const currentRowText =
    graph && currentSnapshot?.activeNodeIndex !== null && currentSnapshot?.activeNodeIndex !== undefined
      ? formatNeighborRow(graph, adjacencyList[currentSnapshot.activeNodeIndex] ?? [])
      : '-';
  const queueText =
    graph && (currentSnapshot?.queueNodeIndices.length ?? 0) > 0
      ? currentSnapshot?.queueNodeIndices.map((index) => graph.nodes[index]?.id ?? '?').join(' -> ') ?? '-'
      : '-';
  const outputText =
    graph && (currentSnapshot?.outputOrder.length ?? 0) > 0
      ? currentSnapshot?.outputOrder.map((index) => graph.nodes[index]?.id ?? '?').join(', ') ?? '-'
      : '-';
  const processedCount = currentSnapshot?.processedNodeIndices.length ?? 0;
  const queueSize = currentSnapshot?.queueNodeIndices.length ?? 0;
  const totalNodes = graph?.nodes.length ?? 0;
  const remainingNodeCount = currentSnapshot?.remainingNodeCount ?? totalNodes;
  const activeNeighborIndegree =
    currentSnapshot?.activeNeighborIndex !== null && currentSnapshot?.activeNeighborIndex !== undefined
      ? currentSnapshot.indegreeByNode[currentSnapshot.activeNeighborIndex] ?? null
      : null;
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  const detailParts = [
    `${t('module.g09.meta.topology')}: ${graph ? getTopologyLabel(graph, t) : '-'}`,
    `${t('module.g09.meta.processedCount')}: ${processedCount}/${totalNodes}`,
    `${t('module.g09.meta.queueSize')}: ${queueSize}`,
    `${t('module.g09.meta.remaining')}: ${remainingNodeCount}`,
  ];

  if (activeRelationLabel !== '-') {
    detailParts.push(`${t('module.g09.meta.activeRelation')}: ${activeRelationLabel}`);
  }

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={t('module.g09.title')}
      description={t('module.g09.body')}
      stageAriaLabel={t('module.g09.stage')}
      stageClassName="bst-stage graph-stage"
      stageBodyClassName="workspace-stage-body-tree"
      controlsPanelClassName="workspace-drawer-xl workspace-drawer-scroll"
      stepPanelClassName="workspace-context-sheet-wide workspace-context-sheet-rich"
      defaultControlsPanelSize={{ width: 332, height: 560 }}
      defaultContextPanelSize={{ width: 320, height: 560 }}
      focusPoint={focusPoint}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('module.g09.meta.preset')}: {getPresetLabel(presetId, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('module.g09.meta.current')}: {activeNodeLabel}
          </span>
          <span className="tree-workspace-pill">
            {t('module.g09.meta.queueSize')}: {queueSize}
          </span>
          <span className="tree-workspace-pill">{getStepDescription(currentSnapshot, t)}</span>
        </>
      }
      controlsContent={
        <>
          <div className="tree-workspace-field">
            <span>{t('module.g09.input.preset')}</span>
            <div className="tree-workspace-toggle-row">
              {presetOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`tree-workspace-toggle${presetId === option ? ' tree-workspace-toggle-active' : ''}`}
                  onClick={() => {
                    setPresetId(option);
                    reset();
                  }}
                >
                  {getPresetLabel(option, t)}
                </button>
              ))}
            </div>
          </div>

          <div className="tree-workspace-field">
            <span>{t('module.s01.speed')}</span>
            <div className="tree-workspace-toggle-row">
              {SPEED_OPTIONS.map((option) => (
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

          {graph ? (
            <>
              <div className="tree-workspace-sample-block">
                <span>{t('module.g01.sample.vertices')}</span>
                <code>{`V = { ${formatVertexList(graph)} }`}</code>
              </div>

              <div className="tree-workspace-sample-block">
                <span>{t('module.g01.sample.edges')}</span>
                <code>{`E = { ${formatEdgeList(graph)} }`}</code>
              </div>

              <div className="tree-workspace-sample-block">
                <span>{t('module.g09.sample.goal')}</span>
                <code>{t('module.g09.sample.goalDetail')}</code>
              </div>
            </>
          ) : null}
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy">
            <h3>{getStepDescription(currentSnapshot, t)}</h3>
            <p>{detailParts.join(' · ')}</p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{t('module.g09.meta.preset')}</dt>
              <dd>{getPresetLabel(presetId, t)}</dd>
            </div>
            <div>
              <dt>{t('module.g09.meta.topology')}</dt>
              <dd>{graph ? getTopologyLabel(graph, t) : '-'}</dd>
            </div>
            <div>
              <dt>{t('module.g09.meta.current')}</dt>
              <dd>{activeNodeLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g09.meta.neighbor')}</dt>
              <dd>{activeNeighborLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g09.meta.activeRelation')}</dt>
              <dd>{activeRelationLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g09.meta.currentRow')}</dt>
              <dd>{currentRowText}</dd>
            </div>
            <div>
              <dt>{t('module.g09.meta.queue')}</dt>
              <dd>{queueText}</dd>
            </div>
            <div>
              <dt>{t('module.g09.meta.output')}</dt>
              <dd>{outputText}</dd>
            </div>
            <div>
              <dt>{t('module.g09.meta.processedCount')}</dt>
              <dd>
                {processedCount}/{totalNodes}
              </dd>
            </div>
            <div>
              <dt>{t('module.g09.meta.queueSize')}</dt>
              <dd>{queueSize}</dd>
            </div>
            <div>
              <dt>{t('module.g09.meta.remaining')}</dt>
              <dd>{remainingNodeCount}</dd>
            </div>
            <div>
              <dt>{t('module.g09.meta.indegree')}</dt>
              <dd>{activeNeighborIndegree === null ? '-' : activeNeighborIndegree}</dd>
            </div>
            <div>
              <dt>{t('module.g09.meta.outcome')}</dt>
              <dd>{getOutcomeLabel(currentSnapshot, t)}</dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{t('module.g09.code.title')}</span>
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
        graph ? (
          <div className="graph-bfs-stage-scene" aria-hidden="true">
            <section className="graph-stage-canvas-panel">
              <span className="graph-stage-label">{t('module.g01.view.canvas')}</span>

              <svg className="graph-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <marker
                    id="graph-topo-edge-arrow"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L8,4 L0,8 z" className="graph-edge-arrow" />
                  </marker>
                  <marker
                    id="graph-topo-edge-arrow-active"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L8,4 L0,8 z" className="graph-edge-arrow graph-edge-arrow-active" />
                  </marker>
                </defs>

                {graph.edges.map((edge) => {
                  const from = graph.nodes[edge.from];
                  const to = graph.nodes[edge.to];
                  const edgeKey = getGraphEdgeKey(graph, edge.from, edge.to);
                  const isActive = activeEdgeKey === edgeKey;
                  const isInspected = inspectedEdgeSet.has(edgeKey);
                  const fromProcessed = processedNodeSet.has(edge.from);
                  const edgeClassName = `graph-edge${isInspected ? ' graph-edge-completed' : ''}${
                    fromProcessed ? ' graph-edge-selected' : ''
                  }${isActive ? ' graph-edge-active' : ''}`;

                  return (
                    <line
                      key={edgeKey}
                      className={edgeClassName}
                      x1={from?.x ?? 0}
                      y1={from?.y ?? 0}
                      x2={to?.x ?? 0}
                      y2={to?.y ?? 0}
                      markerEnd={isActive ? 'url(#graph-topo-edge-arrow-active)' : 'url(#graph-topo-edge-arrow)'}
                    />
                  );
                })}
              </svg>

              <div className="tree-node-layer graph-node-layer">
                {graph.nodes.map((node, index) => {
                  const isProcessed = processedNodeSet.has(index);
                  const isActive = currentSnapshot?.activeNodeIndex === index;
                  const isNeighbor = currentSnapshot?.activeNeighborIndex === index;
                  const isOutput = outputOrderIndexMap.has(index);
                  const isQueued = queueSet.has(index);
                  const indegree = currentSnapshot?.indegreeByNode[index] ?? 0;

                  return (
                    <div
                      key={node.id}
                      className={`tree-node graph-node${isOutput ? ' graph-node-visited' : ''}${
                        isProcessed ? ' graph-node-completed-final' : ''
                      }${isActive ? ' graph-node-active' : ''}${isNeighbor ? ' graph-node-neighbor' : ''}${
                        isQueued ? ' graph-node-frontier' : ''
                      }`}
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                      }}
                    >
                      <span className="tree-node-tag">{`in=${indegree}`}</span>
                      {isOutput ? (
                        <span className="tree-node-badge graph-node-badge-visited">
                          {outputOrderIndexMap.get(index)}
                        </span>
                      ) : null}
                      <span className="tree-node-value">{node.id}</span>
                      <span className="tree-node-index">
                        {isProcessed
                          ? t('module.g09.node.processed')
                          : isActive
                            ? t('module.g09.node.current')
                            : isQueued
                              ? t('module.g09.node.frontier')
                              : isOutput
                                ? t('module.g09.node.output')
                                : t('module.g09.node.idle')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="graph-stage-views">
              <section className="graph-stage-view-card">
                <div className="graph-stage-view-head">
                  <strong>{t('module.g09.view.adjacency')}</strong>
                  <span>{t('module.g09.view.adjacencyHint')}</span>
                </div>

                <div className="graph-list-rows">
                  {adjacencyList.map((neighbors, rowIndex) => {
                    const isActiveRow = currentSnapshot?.activeNodeIndex === rowIndex;
                    const isCompletedRow = processedNodeSet.has(rowIndex);
                    const isOutputRow = outputOrderIndexMap.has(rowIndex);

                    return (
                      <div
                        key={graph.nodes[rowIndex]?.id ?? rowIndex}
                        className={`graph-list-row${isActiveRow ? ' graph-list-row-active' : ''}${
                          isCompletedRow ? ' graph-list-row-completed' : isOutputRow ? ' graph-list-row-visited' : ''
                        }`}
                      >
                        <span className="graph-list-row-label">{graph.nodes[rowIndex]?.id ?? '?'}</span>
                        <div className="graph-list-row-values">
                          {neighbors.length === 0 ? (
                            <span className="graph-list-empty">{t('module.g01.list.empty')}</span>
                          ) : (
                            neighbors.map((neighborIndex) => {
                              const isActiveNeighbor =
                                currentSnapshot?.activeNodeIndex === rowIndex &&
                                currentSnapshot.activeNeighborIndex === neighborIndex;
                              const neighborOutput = outputOrderIndexMap.has(neighborIndex);

                              return (
                                <span
                                  key={`${rowIndex}-${neighborIndex}`}
                                  className={`graph-list-chip${isActiveNeighbor ? ' graph-list-chip-active' : ''}${
                                    neighborOutput ? ' graph-list-chip-completed' : ''
                                  }`}
                                >
                                  {graph.nodes[neighborIndex]?.id ?? '?'}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="graph-stage-view-card">
                <div className="graph-stage-view-head">
                  <strong>{t('module.g09.view.indegree')}</strong>
                  <span>{t('module.g09.view.indegreeHint')}</span>
                </div>

                <div className="graph-distance-rows">
                  {graph.nodes.map((node, index) => {
                    const indegree = currentSnapshot?.indegreeByNode[index] ?? 0;
                    const isActiveRow = currentSnapshot?.activeNeighborIndex === index;
                    const isQueuedRow = queueSet.has(index);
                    const isProcessedRow = processedNodeSet.has(index);
                    const isReadyRow = indegree === 0 && !isProcessedRow;

                    return (
                      <article
                        key={`${node.id}-indegree`}
                        className={`graph-distance-row${isActiveRow ? ' graph-distance-row-active' : ''}${
                          isProcessedRow
                            ? ' graph-distance-row-settled'
                            : isQueuedRow
                              ? ' graph-distance-row-frontier'
                              : isReadyRow
                                ? ' graph-distance-row-relaxed'
                                : ''
                        }`}
                      >
                        <strong>{node.id}</strong>
                        <span>{`${t('module.g09.meta.indegree')}: ${indegree}`}</span>
                        <span>
                          {isProcessedRow
                            ? t('module.g09.state.processed')
                            : isQueuedRow
                              ? t('module.g09.state.inQueue')
                              : isReadyRow
                                ? t('module.g09.state.ready')
                                : t('module.g09.state.waiting')}
                        </span>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="graph-stage-view-card">
                <div className="graph-stage-view-head">
                  <strong>{t('module.g09.view.state')}</strong>
                  <span>{t('module.g09.view.stateHint')}</span>
                </div>

                <div className="graph-dfs-state-grid">
                  <section className="graph-dfs-state-block">
                    <span className="graph-dfs-block-title">{t('module.g09.view.output')}</span>
                    {graph && currentSnapshot && currentSnapshot.outputOrder.length > 0 ? (
                      <div className="tree-workspace-sequence-list">
                        {currentSnapshot.outputOrder.map((nodeIndex, index) => (
                          <span
                            key={`${nodeIndex}-${index}`}
                            className={`tree-workspace-sequence-chip${
                              index === currentSnapshot.outputOrder.length - 1
                                ? ' tree-workspace-sequence-chip-active'
                                : ''
                            }`}
                          >
                            {graph.nodes[nodeIndex]?.id ?? '?'}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="tree-workspace-sequence-empty">{t('module.g09.state.empty.output')}</span>
                    )}
                  </section>

                  <section className="graph-dfs-state-block">
                    <span className="graph-dfs-block-title">{t('module.g09.view.queue')}</span>
                    {graph && currentSnapshot && currentSnapshot.queueNodeIndices.length > 0 ? (
                      <div className="graph-dfs-stack-list">
                        {currentSnapshot.queueNodeIndices.map((nodeIndex, index) => (
                          <div
                            key={`${nodeIndex}-${index}`}
                            className={`graph-dfs-stack-item${index === 0 ? ' graph-dfs-stack-item-active' : ''}`}
                          >
                            <span className="graph-dfs-stack-depth">{`q${index}`}</span>
                            <strong>{graph.nodes[nodeIndex]?.id ?? '?'}</strong>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="graph-dfs-stack-empty">{t('module.g09.state.empty.queue')}</span>
                    )}
                  </section>
                </div>
              </section>
            </div>
          </div>
        ) : null
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
            {t('module.g09.meta.processedCount')}: {processedCount}/{totalNodes}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.g09.meta.queueSize')}: {queueSize}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.g09.meta.remaining')}: {remainingNodeCount}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {getOutcomeLabel(currentSnapshot, t)}
          </span>
        </>
      }
    />
  );
}
