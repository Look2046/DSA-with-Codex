import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { buildBellmanFordTimelineFromPreset } from '../../modules/graph/bellmanFordTimelineAdapter';
import type { BellmanFordStep } from '../../modules/graph/bellmanFord';
import {
  getWeightedGraphEdgeKey,
  getWeightedGraphPresetIds,
  type WeightedGraphDefinition,
  type WeightedGraphPresetId,
} from '../../modules/graph/weightedGraph';
import type { PlaybackStatus } from '../../types/animation';

const DEFAULT_PRESET: WeightedGraphPresetId = 'negativeDirected';
const CODE_LINE_KEYS = [
  'module.g05.code.line1',
  'module.g05.code.line2',
  'module.g05.code.line3',
  'module.g05.code.line4',
  'module.g05.code.line5',
  'module.g05.code.line6',
  'module.g05.code.line7',
  'module.g05.code.line8',
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

function getPresetLabel(presetId: WeightedGraphPresetId, t: TranslateFn): string {
  return presetId === 'negativeDirected' ? t('module.g05.preset.negativeDirected') : presetId;
}

function formatDistance(distance: number | null): string {
  return distance === null ? '∞' : String(distance);
}

function getRelationLabel(graph: WeightedGraphDefinition, fromIndex: number | null, toIndex: number | null): string {
  if (fromIndex === null || toIndex === null) {
    return '-';
  }

  const left = graph.nodes[fromIndex]?.id ?? '?';
  const right = graph.nodes[toIndex]?.id ?? '?';
  return `${left} -> ${right}`;
}

function formatEdgeList(graph: WeightedGraphDefinition): string {
  return graph.edges
    .map((edge) => `${graph.nodes[edge.from]?.id ?? '?'} -> ${graph.nodes[edge.to]?.id ?? '?'} (${edge.weight})`)
    .join(', ');
}

function getStepDescription(step: BellmanFordStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }

  switch (step.action) {
    case 'initial':
      return t('module.g05.step.initial');
    case 'seedStart':
      return t('module.g05.step.seedStart');
    case 'beginPass':
      return t('module.g05.step.beginPass');
    case 'inspectEdge':
      return t('module.g05.step.inspectEdge');
    case 'updateDistance':
      return t('module.g05.step.updateDistance');
    case 'keepDistance':
      return t('module.g05.step.keepDistance');
    case 'completePass':
      return t('module.g05.step.completePass');
    case 'earlyStop':
      return t('module.g05.step.earlyStop');
    case 'completed':
      return t('module.g05.step.completed');
    default:
      return '-';
  }
}

export function BellmanFordPage() {
  const { t } = useI18n();
  const [presetId, setPresetId] = useState<WeightedGraphPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildBellmanFordTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const graph = currentSnapshot?.graph ?? null;
  const adjacencyList = currentSnapshot?.adjacencyList ?? [];
  const codeLines = useMemo(() => CODE_LINE_KEYS.map((key) => t(key)), [t]);
  const presetOptions = useMemo(() => getWeightedGraphPresetIds('bellmanFord'), []);

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

  const inspectedEdgeSet = useMemo(
    () => new Set(currentSnapshot?.inspectedEdgeKeys ?? []),
    [currentSnapshot?.inspectedEdgeKeys],
  );
  const reachableNodeSet = useMemo(
    () => new Set(currentSnapshot?.reachableNodeIndices ?? []),
    [currentSnapshot?.reachableNodeIndices],
  );
  const changedNodeSet = useMemo(
    () => new Set(currentSnapshot?.changedNodeIndices ?? []),
    [currentSnapshot?.changedNodeIndices],
  );

  const activeEdgeKey =
    graph && currentSnapshot?.activeEdge
      ? getWeightedGraphEdgeKey(graph, currentSnapshot.activeEdge.from, currentSnapshot.activeEdge.to)
      : null;
  const startNodeLabel = graph ? (graph.nodes[currentSnapshot?.startNodeIndex ?? 0]?.id ?? '-') : '-';
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
        ? `${getRelationLabel(graph, currentSnapshot.activeEdge.from, currentSnapshot.activeEdge.to)} (${
            currentSnapshot.activeEdge.weight
          })`
        : getRelationLabel(graph, currentSnapshot.activeNodeIndex, currentSnapshot.activeNeighborIndex)
      : '-';
  const currentRowText =
    graph && currentSnapshot?.activeNodeIndex !== null && currentSnapshot?.activeNodeIndex !== undefined
      ? adjacencyList[currentSnapshot.activeNodeIndex]
          ?.map((edge) => `${graph.nodes[edge.to]?.id ?? '?'} (${edge.weight})`)
          .join(', ') || '∅'
      : '-';
  const activePassLabel =
    currentSnapshot?.activePassIndex === null || currentSnapshot?.activePassIndex === undefined
      ? '-'
      : `P${currentSnapshot.activePassIndex}/${currentSnapshot.totalPasses}`;
  const changedCount = currentSnapshot?.changedNodeIndices.length ?? 0;
  const reachableCount = currentSnapshot?.reachableNodeIndices.length ?? 0;
  const completedPassCount = currentSnapshot?.completedPassCount ?? 0;
  const totalPasses = currentSnapshot?.totalPasses ?? 0;
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  const detailParts = [
    `${t('module.g05.meta.pass')}: ${activePassLabel}`,
    `${t('module.g05.meta.updatedInPass')}: ${currentSnapshot?.updatedInPassCount ?? 0}`,
    `${t('module.g05.meta.reachableCount')}: ${reachableCount}/${graph?.nodes.length ?? 0}`,
  ];

  if (activeRelationLabel !== '-') {
    detailParts.push(`${t('module.g05.meta.activeRelation')}: ${activeRelationLabel}`);
  }
  if (currentSnapshot?.proposedDistance !== null) {
    detailParts.push(`${t('module.g05.meta.proposedDistance')}: ${formatDistance(currentSnapshot.proposedDistance)}`);
  }

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={t('module.g05.title')}
      description={t('module.g05.body')}
      stageAriaLabel={t('module.g05.stage')}
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
            {t('module.g05.meta.preset')}: {graph ? getPresetLabel(graph.presetId, t) : '-'}
          </span>
          <span className="tree-workspace-pill">
            {t('module.g05.meta.pass')}: {activePassLabel}
          </span>
          <span className="tree-workspace-pill">
            {t('module.g05.meta.updatedInPass')}: {currentSnapshot?.updatedInPassCount ?? 0}
          </span>
          <span className="tree-workspace-pill">{getStepDescription(currentSnapshot, t)}</span>
        </>
      }
      controlsContent={
        <>
          <div className="tree-workspace-field">
            <span>{t('module.g05.input.preset')}</span>
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
                <code>{`V = { ${graph.nodes.map((node) => node.id).join(', ')} }`}</code>
              </div>

              <div className="tree-workspace-sample-block">
                <span>{t('module.g01.sample.edges')}</span>
                <code>{`E = { ${formatEdgeList(graph)} }`}</code>
              </div>

              <div className="tree-workspace-sample-block">
                <span>{t('module.g01.sample.summary')}</span>
                <code>
                  {t('module.g05.meta.start')}: {startNodeLabel} · {t('module.g05.sample.goal')}
                </code>
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
              <dt>{t('module.g05.meta.preset')}</dt>
              <dd>{graph ? getPresetLabel(graph.presetId, t) : '-'}</dd>
            </div>
            <div>
              <dt>{t('module.g05.meta.start')}</dt>
              <dd>{startNodeLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g05.meta.pass')}</dt>
              <dd>{activePassLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g05.meta.current')}</dt>
              <dd>{activeNodeLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g05.meta.neighbor')}</dt>
              <dd>{activeNeighborLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g05.meta.activeRelation')}</dt>
              <dd>{activeRelationLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g05.meta.proposedDistance')}</dt>
              <dd>{formatDistance(currentSnapshot?.proposedDistance ?? null)}</dd>
            </div>
            <div>
              <dt>{t('module.g05.meta.previousDistance')}</dt>
              <dd>{formatDistance(currentSnapshot?.currentDistance ?? null)}</dd>
            </div>
            <div>
              <dt>{t('module.g05.meta.currentRow')}</dt>
              <dd>{currentRowText}</dd>
            </div>
            <div>
              <dt>{t('module.g05.meta.updatedInPass')}</dt>
              <dd>{currentSnapshot?.updatedInPassCount ?? 0}</dd>
            </div>
            <div>
              <dt>{t('module.g05.meta.changedCount')}</dt>
              <dd>{changedCount}</dd>
            </div>
            <div>
              <dt>{t('module.g05.meta.reachableCount')}</dt>
              <dd>
                {reachableCount}/{graph?.nodes.length ?? 0}
              </dd>
            </div>
            <div>
              <dt>{t('module.g05.meta.completedPasses')}</dt>
              <dd>
                {completedPassCount}/{totalPasses}
              </dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{t('module.g05.code.title')}</span>
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
                    id="graph-bellman-ford-edge-arrow"
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
                    id="graph-bellman-ford-edge-arrow-active"
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
                  const edgeKey = getWeightedGraphEdgeKey(graph, edge.from, edge.to);
                  const isActive = activeEdgeKey === edgeKey;
                  const isCompleted = inspectedEdgeSet.has(edgeKey);
                  const midX = ((from?.x ?? 0) + (to?.x ?? 0)) / 2;
                  const midY = ((from?.y ?? 0) + (to?.y ?? 0)) / 2 - 2;

                  return (
                    <g key={edgeKey}>
                      <line
                        className={`graph-edge${isCompleted ? ' graph-edge-completed' : ''}${
                          isActive ? ' graph-edge-active' : ''
                        }`}
                        x1={from?.x ?? 0}
                        y1={from?.y ?? 0}
                        x2={to?.x ?? 0}
                        y2={to?.y ?? 0}
                        markerEnd={
                          isActive ? 'url(#graph-bellman-ford-edge-arrow-active)' : 'url(#graph-bellman-ford-edge-arrow)'
                        }
                      />
                      <text
                        x={midX}
                        y={midY}
                        className={`graph-edge-weight${isActive ? ' graph-edge-weight-active' : ''}`}
                      >
                        {edge.weight}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="tree-node-layer graph-node-layer">
                {graph.nodes.map((node, index) => {
                  const isReachable = reachableNodeSet.has(index);
                  const isChanged = changedNodeSet.has(index);
                  const isActive = currentSnapshot?.activeNodeIndex === index;
                  const isNeighbor = currentSnapshot?.activeNeighborIndex === index;

                  return (
                    <div
                      key={node.id}
                      className={`tree-node graph-node${isReachable ? ' graph-node-frontier' : ''}${
                        isChanged ? ' graph-node-relaxed' : ''
                      }${isActive ? ' graph-node-active' : ''}${isNeighbor ? ' graph-node-neighbor' : ''}`}
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                      }}
                    >
                      <span className="tree-node-tag">{formatDistance(currentSnapshot?.distances[index] ?? null)}</span>
                      {isChanged && currentSnapshot?.activePassIndex ? (
                        <span className="tree-node-badge graph-node-badge-visited">{`P${currentSnapshot.activePassIndex}`}</span>
                      ) : null}
                      <span className="tree-node-value">{node.id}</span>
                      <span className="tree-node-index">
                        {isActive
                          ? t('module.g05.node.current')
                          : isChanged
                            ? t('module.g05.node.relaxed')
                            : isReachable
                              ? t('module.g05.node.reachable')
                              : t('module.g05.node.idle')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="graph-stage-views">
              <section className="graph-stage-view-card">
                <div className="graph-stage-view-head">
                  <strong>{t('module.g05.view.adjacency')}</strong>
                  <span>{t('module.g05.view.adjacencyHint')}</span>
                </div>

                <div className="graph-list-rows">
                  {adjacencyList.map((edges, rowIndex) => {
                    const isActiveRow = currentSnapshot?.activeNodeIndex === rowIndex;
                    const isReachableRow = reachableNodeSet.has(rowIndex);
                    const isChangedRow = changedNodeSet.has(rowIndex);

                    return (
                      <div
                        key={graph.nodes[rowIndex]?.id ?? rowIndex}
                        className={`graph-list-row${isActiveRow ? ' graph-list-row-active' : ''}${
                          isChangedRow ? ' graph-list-row-completed' : isReachableRow ? ' graph-list-row-visited' : ''
                        }`}
                      >
                        <span className="graph-list-row-label">{graph.nodes[rowIndex]?.id ?? '?'}</span>
                        <div className="graph-list-row-values">
                          {edges.length === 0 ? (
                            <span className="graph-list-empty">{t('module.g01.list.empty')}</span>
                          ) : (
                            edges.map((edge) => {
                              const isActiveNeighbor =
                                currentSnapshot?.activeNodeIndex === rowIndex &&
                                currentSnapshot.activeNeighborIndex === edge.to;

                              return (
                                <span
                                  key={`${rowIndex}-${edge.to}`}
                                  className={`graph-list-chip${isActiveNeighbor ? ' graph-list-chip-active' : ''}${
                                    changedNodeSet.has(edge.to) ? ' graph-list-chip-completed' : ''
                                  }`}
                                >
                                  {graph.nodes[edge.to]?.id ?? '?'} ({edge.weight})
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
                  <strong>{t('module.g05.view.distances')}</strong>
                  <span>{t('module.g05.view.distancesHint')}</span>
                </div>

                <div className="graph-distance-rows">
                  {graph.nodes.map((node, index) => {
                    const isActive = currentSnapshot?.activeNodeIndex === index;
                    const isChanged = changedNodeSet.has(index);
                    const previousIndex = currentSnapshot?.previousNodeIndices[index] ?? null;

                    return (
                      <div
                        key={node.id}
                        className={`graph-distance-row${isActive ? ' graph-distance-row-active' : ''}${
                          isChanged ? ' graph-distance-row-relaxed' : ''
                        }`}
                      >
                        <strong>{node.id}</strong>
                        <span>{`${t('module.g05.meta.currentDistance')}: ${formatDistance(
                          currentSnapshot?.distances[index] ?? null,
                        )}`}</span>
                        <span>{`${t('module.g05.meta.previous')}: ${
                          previousIndex === null ? '-' : (graph.nodes[previousIndex]?.id ?? '?')
                        }`}</span>
                      </div>
                    );
                  })}
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
            {t('module.g05.meta.pass')}: {activePassLabel}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.g05.meta.updatedInPass')}: {currentSnapshot?.updatedInPassCount ?? 0}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.g05.meta.reachableCount')}: {reachableCount}/{graph?.nodes.length ?? 0}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {t('module.g05.meta.completedPasses')}: {completedPassCount}/{totalPasses}
          </span>
        </>
      }
    />
  );
}
