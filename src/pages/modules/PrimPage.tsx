import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { buildPrimTimelineFromPreset } from '../../modules/graph/primTimelineAdapter';
import type { PrimFrontierEntry, PrimStep } from '../../modules/graph/prim';
import {
  getWeightedGraphEdgeKey,
  getWeightedGraphPresetIds,
  type WeightedGraphDefinition,
  type WeightedGraphEdge,
  type WeightedGraphPresetId,
} from '../../modules/graph/weightedGraph';
import type { PlaybackStatus } from '../../types/animation';

const DEFAULT_PRESET: WeightedGraphPresetId = 'mstUndirected';
const CODE_LINE_KEYS = [
  'module.g08.code.line1',
  'module.g08.code.line2',
  'module.g08.code.line3',
  'module.g08.code.line4',
  'module.g08.code.line5',
  'module.g08.code.line6',
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
  return presetId === 'mstUndirected' ? t('module.g08.preset.mstUndirected') : presetId;
}

function getEdgeLabel(graph: WeightedGraphDefinition, edge: WeightedGraphEdge | null): string {
  if (!edge) {
    return '-';
  }

  const left = graph.nodes[edge.from]?.id ?? '?';
  const right = graph.nodes[edge.to]?.id ?? '?';
  return `${left} - ${right}`;
}

function getEntryLabel(graph: WeightedGraphDefinition, entry: PrimFrontierEntry): string {
  return getEdgeLabel(graph, { from: entry.from, to: entry.to, weight: entry.weight });
}

function formatEdgeList(graph: WeightedGraphDefinition): string {
  return graph.edges.map((edge) => `${getEdgeLabel(graph, edge)} (${edge.weight})`).join(', ');
}

function getStepDescription(step: PrimStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }

  switch (step.action) {
    case 'initial':
      return t('module.g08.step.initial');
    case 'seedStart':
      return t('module.g08.step.seedStart');
    case 'inspectEdge':
      return t('module.g08.step.inspectEdge');
    case 'chooseEdge':
      return t('module.g08.step.chooseEdge');
    case 'skipEdge':
      return t('module.g08.step.skipEdge');
    case 'completed':
      return t('module.g08.step.completed');
    default:
      return '-';
  }
}

function formatEdgeKeyList(
  graph: WeightedGraphDefinition,
  edgeKeys: string[],
): Array<{ key: string; label: string }> {
  return edgeKeys.map((edgeKey) => {
    const edge = graph.edges.find((candidate) => getWeightedGraphEdgeKey(graph, candidate.from, candidate.to) === edgeKey);
    return {
      key: edgeKey,
      label: edge ? `${getEdgeLabel(graph, edge)} (${edge.weight})` : edgeKey,
    };
  });
}

export function PrimPage() {
  const { t } = useI18n();
  const [presetId, setPresetId] = useState<WeightedGraphPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildPrimTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const graph = currentSnapshot?.graph ?? null;
  const codeLines = useMemo(() => CODE_LINE_KEYS.map((key) => t(key)), [t]);
  const presetOptions = useMemo(() => getWeightedGraphPresetIds('mst'), []);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const focusPoint = useMemo(() => {
    if (!graph || !currentSnapshot?.activeEdge) {
      return null;
    }

    const from = graph.nodes[currentSnapshot.activeEdge.from];
    const to = graph.nodes[currentSnapshot.activeEdge.to];
    if (!from || !to) {
      return null;
    }

    return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  }, [currentSnapshot, graph]);

  const frontierEdgeSet = useMemo(
    () => new Set(currentSnapshot?.frontierQueue.map((entry) => entry.key) ?? []),
    [currentSnapshot?.frontierQueue],
  );
  const treeNodeSet = useMemo(() => new Set(currentSnapshot?.treeNodeIndices ?? []), [currentSnapshot?.treeNodeIndices]);
  const frontierNodeSet = useMemo(
    () => new Set(currentSnapshot?.frontierNodeIndices ?? []),
    [currentSnapshot?.frontierNodeIndices],
  );
  const selectedEdgeSet = useMemo(
    () => new Set(currentSnapshot?.selectedEdgeKeys ?? []),
    [currentSnapshot?.selectedEdgeKeys],
  );
  const rejectedEdgeSet = useMemo(
    () => new Set(currentSnapshot?.rejectedEdgeKeys ?? []),
    [currentSnapshot?.rejectedEdgeKeys],
  );
  const treeOrderIndexMap = useMemo(
    () => new Map((currentSnapshot?.treeNodeOrder ?? []).map((nodeIndex, index) => [nodeIndex, index + 1] as const)),
    [currentSnapshot?.treeNodeOrder],
  );

  const activeEdge = currentSnapshot?.activeEdge ?? null;
  const activeEdgeKey = graph && activeEdge ? getWeightedGraphEdgeKey(graph, activeEdge.from, activeEdge.to) : null;
  const startNodeLabel = graph ? (graph.nodes[currentSnapshot?.startNodeIndex ?? 0]?.id ?? '-') : '-';
  const sourceLabel =
    graph && currentSnapshot?.activeSourceIndex !== null && currentSnapshot?.activeSourceIndex !== undefined
      ? (graph.nodes[currentSnapshot.activeSourceIndex]?.id ?? '-')
      : '-';
  const targetLabel =
    graph && currentSnapshot?.activeTargetIndex !== null && currentSnapshot?.activeTargetIndex !== undefined
      ? (graph.nodes[currentSnapshot.activeTargetIndex]?.id ?? '-')
      : '-';
  const activeEdgeLabel = graph ? getEdgeLabel(graph, activeEdge) : '-';
  const frontierSize = currentSnapshot?.frontierQueue.length ?? 0;
  const treeSize = currentSnapshot?.treeNodeIndices.length ?? 0;
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  const detailParts = [
    `${t('module.g08.meta.treeSize')}: ${treeSize}/${graph?.nodes.length ?? 0}`,
    `${t('module.g08.meta.frontierSize')}: ${frontierSize}`,
    `${t('module.g08.meta.totalWeight')}: ${currentSnapshot?.totalWeight ?? 0}`,
  ];

  if (activeEdgeLabel !== '-') {
    detailParts.push(`${t('module.g08.meta.activeEdge')}: ${activeEdgeLabel}`);
  }

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={t('module.g08.title')}
      description={t('module.g08.body')}
      stageAriaLabel={t('module.g08.stage')}
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
            {t('module.g08.meta.preset')}: {graph ? getPresetLabel(graph.presetId, t) : '-'}
          </span>
          <span className="tree-workspace-pill">
            {t('module.g08.meta.treeSize')}: {treeSize}/{graph?.nodes.length ?? 0}
          </span>
          <span className="tree-workspace-pill">
            {t('module.g08.meta.frontierSize')}: {frontierSize}
          </span>
          <span className="tree-workspace-pill">{getStepDescription(currentSnapshot, t)}</span>
        </>
      }
      controlsContent={
        <>
          <div className="tree-workspace-field">
            <span>{t('module.g08.input.preset')}</span>
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
                <code>{t('module.g08.sample.goal')}</code>
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
              <dt>{t('module.g08.meta.preset')}</dt>
              <dd>{graph ? getPresetLabel(graph.presetId, t) : '-'}</dd>
            </div>
            <div>
              <dt>{t('module.g08.meta.start')}</dt>
              <dd>{startNodeLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g08.meta.activeEdge')}</dt>
              <dd>{activeEdgeLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g08.meta.source')}</dt>
              <dd>{sourceLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g08.meta.target')}</dt>
              <dd>{targetLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g08.meta.treeSize')}</dt>
              <dd>
                {treeSize}/{graph?.nodes.length ?? 0}
              </dd>
            </div>
            <div>
              <dt>{t('module.g08.meta.frontierSize')}</dt>
              <dd>{frontierSize}</dd>
            </div>
            <div>
              <dt>{t('module.g08.meta.totalWeight')}</dt>
              <dd>{currentSnapshot?.totalWeight ?? 0}</dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{t('module.g08.code.title')}</span>
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
                {graph.edges.map((edge) => {
                  const from = graph.nodes[edge.from];
                  const to = graph.nodes[edge.to];
                  const edgeKey = getWeightedGraphEdgeKey(graph, edge.from, edge.to);
                  const isActive = activeEdgeKey === edgeKey;
                  const isSelected = selectedEdgeSet.has(edgeKey);
                  const isRejected = rejectedEdgeSet.has(edgeKey);
                  const isFrontier = frontierEdgeSet.has(edgeKey);
                  const midX = ((from?.x ?? 0) + (to?.x ?? 0)) / 2;
                  const midY = ((from?.y ?? 0) + (to?.y ?? 0)) / 2 - 2;

                  return (
                    <g key={edgeKey}>
                      <line
                        className={`graph-edge${isSelected ? ' graph-edge-selected' : ''}${
                          isRejected ? ' graph-edge-rejected' : ''
                        }${isFrontier ? ' graph-edge-frontier' : ''}${isActive ? ' graph-edge-active' : ''}`}
                        x1={from?.x ?? 0}
                        y1={from?.y ?? 0}
                        x2={to?.x ?? 0}
                        y2={to?.y ?? 0}
                      />
                      <text
                        x={midX}
                        y={midY}
                        className={`graph-edge-weight${isSelected ? ' graph-edge-weight-selected' : ''}${
                          isRejected ? ' graph-edge-weight-rejected' : ''
                        }${isFrontier ? ' graph-edge-weight-frontier' : ''}${
                          isActive ? ' graph-edge-weight-active' : ''
                        }`}
                      >
                        {edge.weight}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="tree-node-layer graph-node-layer">
                {graph.nodes.map((node, index) => {
                  const isInTree = treeNodeSet.has(index);
                  const isSource = currentSnapshot?.activeSourceIndex === index;
                  const isTarget = currentSnapshot?.activeTargetIndex === index;
                  const isFrontierNode = frontierNodeSet.has(index);
                  const treeOrder = treeOrderIndexMap.get(index);

                  let stateLabel = t('module.g08.node.idle');
                  if (isSource) {
                    stateLabel = t('module.g08.node.source');
                  } else if (isTarget) {
                    stateLabel = t('module.g08.node.target');
                  } else if (isInTree) {
                    stateLabel = t('module.g08.node.inTree');
                  } else if (isFrontierNode) {
                    stateLabel = t('module.g08.node.frontier');
                  }

                  return (
                    <div
                      key={node.id}
                      className={`tree-node graph-node${isInTree ? ' graph-node-completed' : ''}${
                        isSource ? ' graph-node-active' : ''
                      }${isTarget ? ' graph-node-neighbor' : ''}${isFrontierNode ? ' graph-node-frontier' : ''}`}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      {treeOrder ? <span className="tree-node-tag">{`#${treeOrder}`}</span> : null}
                      <span className="tree-node-value">{node.id}</span>
                      <span className="tree-node-index">{stateLabel}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <div className="graph-stage-views">
              <section className="graph-stage-view-card">
                <div className="graph-stage-view-head">
                  <strong>{t('module.g08.view.frontier')}</strong>
                  <span>{t('module.g08.view.frontierHint')}</span>
                </div>

                <div className="graph-distance-rows">
                  {currentSnapshot.frontierQueue.length > 0 ? (
                    currentSnapshot.frontierQueue.map((entry) => (
                      <div
                        key={entry.key}
                        className={`graph-distance-row${entry.key === activeEdgeKey ? ' graph-distance-row-active' : ''}${
                          entry.key !== activeEdgeKey ? ' graph-distance-row-frontier' : ''
                        }`}
                      >
                        <strong>{`${getEntryLabel(graph, entry)} (${entry.weight})`}</strong>
                        <span>{`${t('module.g08.meta.source')}: ${graph.nodes[entry.from]?.id ?? '?'}`}</span>
                        <span>{`${t('module.g08.meta.target')}: ${graph.nodes[entry.to]?.id ?? '?'}`}</span>
                      </div>
                    ))
                  ) : (
                    <div className="graph-distance-row">
                      <strong>{t('module.g08.view.frontierEmpty')}</strong>
                      <span>{t('module.g08.view.frontierEmptyHint')}</span>
                    </div>
                  )}
                </div>
              </section>

              <section className="graph-stage-view-card">
                <div className="graph-stage-view-head">
                  <strong>{t('module.g08.view.tree')}</strong>
                  <span>{t('module.g08.view.treeHint')}</span>
                </div>

                <div className="graph-distance-rows">
                  <div className="graph-distance-row graph-distance-row-active">
                    <strong>{t('module.g08.view.summary')}</strong>
                    <span>{`${t('module.g08.meta.treeSize')}: ${treeSize}/${graph.nodes.length}`}</span>
                    <span>{`${t('module.g08.meta.totalWeight')}: ${currentSnapshot.totalWeight}`}</span>
                    <span>{`${t('module.g08.meta.chosenEdges')}: ${currentSnapshot.chosenEdgeCount}/${currentSnapshot.edgesNeeded}`}</span>
                  </div>

                  <div className="graph-distance-row">
                    <strong>{t('module.g08.view.order')}</strong>
                    <div className="graph-stage-summary-row">
                      {currentSnapshot.treeNodeOrder.map((nodeIndex) => (
                        <span key={`tree-${nodeIndex}`} className="graph-floyd-chip">
                          {graph.nodes[nodeIndex]?.id ?? '?'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="graph-distance-row graph-distance-row-relaxed">
                    <strong>{t('module.g08.view.chosenEdges')}</strong>
                    <div className="graph-stage-summary-row">
                      {formatEdgeKeyList(graph, currentSnapshot.selectedEdgeKeys).map((entry) => (
                        <span key={entry.key} className="graph-floyd-chip">
                          {entry.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className={`graph-distance-row${currentSnapshot.rejectedEdgeKeys.length > 0 ? ' graph-distance-row-rejected' : ''}`}>
                    <strong>{t('module.g08.view.rejectedEdges')}</strong>
                    <div className="graph-stage-summary-row">
                      {currentSnapshot.rejectedEdgeKeys.length > 0 ? (
                        formatEdgeKeyList(graph, currentSnapshot.rejectedEdgeKeys).map((entry) => (
                          <span key={entry.key} className="graph-floyd-chip">
                            {entry.label}
                          </span>
                        ))
                      ) : (
                        <span>{t('module.g08.view.rejectedEdgesEmpty')}</span>
                      )}
                    </div>
                  </div>
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
            {t('module.g08.meta.activeEdge')}: {activeEdgeLabel}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.g08.meta.treeSize')}: {treeSize}/{graph?.nodes.length ?? 0}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.g08.meta.frontierSize')}: {frontierSize}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {t('module.g08.meta.totalWeight')}: {currentSnapshot?.totalWeight ?? 0}
          </span>
        </>
      }
    />
  );
}
