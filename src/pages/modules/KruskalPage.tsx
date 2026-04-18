import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { buildKruskalTimelineFromPreset } from '../../modules/graph/kruskalTimelineAdapter';
import type { KruskalStep } from '../../modules/graph/kruskal';
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
  'module.g07.code.line1',
  'module.g07.code.line2',
  'module.g07.code.line3',
  'module.g07.code.line4',
  'module.g07.code.line5',
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
  return presetId === 'mstUndirected' ? t('module.g07.preset.mstUndirected') : presetId;
}

function getEdgeLabel(graph: WeightedGraphDefinition, edge: WeightedGraphEdge | null): string {
  if (!edge) {
    return '-';
  }

  const left = graph.nodes[edge.from]?.id ?? '?';
  const right = graph.nodes[edge.to]?.id ?? '?';
  return `${left} - ${right}`;
}

function formatEdgeList(graph: WeightedGraphDefinition): string {
  return graph.edges
    .map((edge) => `${getEdgeLabel(graph, edge)} (${edge.weight})`)
    .join(', ');
}

function getStepDescription(step: KruskalStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }

  switch (step.action) {
    case 'initial':
      return t('module.g07.step.initial');
    case 'sortEdges':
      return t('module.g07.step.sortEdges');
    case 'inspectEdge':
      return t('module.g07.step.inspectEdge');
    case 'chooseEdge':
      return t('module.g07.step.chooseEdge');
    case 'rejectEdge':
      return t('module.g07.step.rejectEdge');
    case 'completed':
      return t('module.g07.step.completed');
    default:
      return '-';
  }
}

function getEdgeDecision(
  graph: WeightedGraphDefinition,
  edge: WeightedGraphEdge,
  step: KruskalStep | undefined,
  t: TranslateFn,
): string {
  const edgeKey = getWeightedGraphEdgeKey(graph, edge.from, edge.to);
  if (step?.selectedEdgeKeys.includes(edgeKey)) {
    return t('module.g07.decision.choose');
  }
  if (step?.rejectedEdgeKeys.includes(edgeKey)) {
    return t('module.g07.decision.reject');
  }
  return t('module.g07.decision.pending');
}

export function KruskalPage() {
  const { t } = useI18n();
  const [presetId, setPresetId] = useState<WeightedGraphPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildKruskalTimelineFromPreset(presetId), [presetId]);
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

  const selectedEdgeSet = useMemo(
    () => new Set(currentSnapshot?.selectedEdgeKeys ?? []),
    [currentSnapshot?.selectedEdgeKeys],
  );
  const rejectedEdgeSet = useMemo(
    () => new Set(currentSnapshot?.rejectedEdgeKeys ?? []),
    [currentSnapshot?.rejectedEdgeKeys],
  );
  const selectedNodeSet = useMemo(
    () => new Set(currentSnapshot?.selectedNodeIndices ?? []),
    [currentSnapshot?.selectedNodeIndices],
  );

  const activeEdge = currentSnapshot?.activeEdge ?? null;
  const activeEdgeLabel = graph ? getEdgeLabel(graph, activeEdge) : '-';
  const leftComponent =
    activeEdge && currentSnapshot ? `C${(currentSnapshot.componentLabels[activeEdge.from] ?? 0) + 1}` : '-';
  const rightComponent =
    activeEdge && currentSnapshot ? `C${(currentSnapshot.componentLabels[activeEdge.to] ?? 0) + 1}` : '-';
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  const detailParts = [
    `${t('module.g07.meta.chosenEdges')}: ${currentSnapshot?.chosenEdgeCount ?? 0}/${currentSnapshot?.edgesNeeded ?? 0}`,
    `${t('module.g07.meta.totalWeight')}: ${currentSnapshot?.totalWeight ?? 0}`,
  ];

  if (activeEdgeLabel !== '-') {
    detailParts.push(`${t('module.g07.meta.activeEdge')}: ${activeEdgeLabel}`);
  }

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={t('module.g07.title')}
      description={t('module.g07.body')}
      stageAriaLabel={t('module.g07.stage')}
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
            {t('module.g07.meta.preset')}: {graph ? getPresetLabel(graph.presetId, t) : '-'}
          </span>
          <span className="tree-workspace-pill">
            {t('module.g07.meta.chosenEdges')}: {currentSnapshot?.chosenEdgeCount ?? 0}/{currentSnapshot?.edgesNeeded ?? 0}
          </span>
          <span className="tree-workspace-pill">
            {t('module.g07.meta.totalWeight')}: {currentSnapshot?.totalWeight ?? 0}
          </span>
          <span className="tree-workspace-pill">{getStepDescription(currentSnapshot, t)}</span>
        </>
      }
      controlsContent={
        <>
          <div className="tree-workspace-field">
            <span>{t('module.g07.input.preset')}</span>
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
                <code>{t('module.g07.sample.goal')}</code>
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
              <dt>{t('module.g07.meta.preset')}</dt>
              <dd>{graph ? getPresetLabel(graph.presetId, t) : '-'}</dd>
            </div>
            <div>
              <dt>{t('module.g07.meta.activeEdge')}</dt>
              <dd>{activeEdgeLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g07.meta.leftComponent')}</dt>
              <dd>{leftComponent}</dd>
            </div>
            <div>
              <dt>{t('module.g07.meta.rightComponent')}</dt>
              <dd>{rightComponent}</dd>
            </div>
            <div>
              <dt>{t('module.g07.meta.chosenEdges')}</dt>
              <dd>
                {currentSnapshot?.chosenEdgeCount ?? 0}/{currentSnapshot?.edgesNeeded ?? 0}
              </dd>
            </div>
            <div>
              <dt>{t('module.g07.meta.totalWeight')}</dt>
              <dd>{currentSnapshot?.totalWeight ?? 0}</dd>
            </div>
            <div>
              <dt>{t('module.g07.meta.components')}</dt>
              <dd>{currentSnapshot?.componentGroups.length ?? 0}</dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{t('module.g07.code.title')}</span>
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
                  const isActive = activeEdge ? edgeKey === getWeightedGraphEdgeKey(graph, activeEdge.from, activeEdge.to) : false;
                  const isSelected = selectedEdgeSet.has(edgeKey);
                  const isRejected = rejectedEdgeSet.has(edgeKey);
                  const midX = ((from?.x ?? 0) + (to?.x ?? 0)) / 2;
                  const midY = ((from?.y ?? 0) + (to?.y ?? 0)) / 2 - 2;

                  return (
                    <g key={edgeKey}>
                      <line
                        className={`graph-edge${isSelected ? ' graph-edge-selected' : ''}${
                          isRejected ? ' graph-edge-rejected' : ''
                        }${isActive ? ' graph-edge-active' : ''}`}
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
                        }${isActive ? ' graph-edge-weight-active' : ''}`}
                      >
                        {edge.weight}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="tree-node-layer graph-node-layer">
                {graph.nodes.map((node, index) => {
                  const isSelected = selectedNodeSet.has(index);
                  const isLeft = activeEdge?.from === index;
                  const isRight = activeEdge?.to === index;

                  let stateLabel = t('module.g07.node.idle');
                  if (isLeft) {
                    stateLabel = t('module.g07.node.currentLeft');
                  } else if (isRight) {
                    stateLabel = t('module.g07.node.currentRight');
                  } else if (isSelected) {
                    stateLabel = t('module.g07.node.connected');
                  }

                  return (
                    <div
                      key={node.id}
                      className={`tree-node graph-node${isSelected ? ' graph-node-completed' : ''}${
                        isLeft ? ' graph-node-active' : ''
                      }${isRight ? ' graph-node-neighbor' : ''}`}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      <span className="tree-node-tag">{`C${(currentSnapshot?.componentLabels[index] ?? 0) + 1}`}</span>
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
                  <strong>{t('module.g07.view.edgeOrder')}</strong>
                  <span>{t('module.g07.view.edgeOrderHint')}</span>
                </div>

                <div className="graph-distance-rows">
                  {currentSnapshot.sortedEdges.map((edge, index) => {
                    const edgeKey = getWeightedGraphEdgeKey(graph, edge.from, edge.to);
                    const isActive = currentSnapshot.activeEdgeIndex === index;
                    const isSelected = selectedEdgeSet.has(edgeKey);
                    const isRejected = rejectedEdgeSet.has(edgeKey);

                    return (
                      <div
                        key={`${edgeKey}-${index}`}
                        className={`graph-distance-row${isActive ? ' graph-distance-row-active' : ''}${
                          isSelected ? ' graph-distance-row-relaxed' : ''
                        }${isRejected ? ' graph-distance-row-rejected' : ''}`}
                      >
                        <strong>{`${index + 1}. ${getEdgeLabel(graph, edge)} (${edge.weight})`}</strong>
                        <span>{`${t('module.g07.meta.leftComponent')}: C${
                          (currentSnapshot.componentLabels[edge.from] ?? 0) + 1
                        }`}</span>
                        <span>{`${t('module.g07.meta.rightComponent')}: C${
                          (currentSnapshot.componentLabels[edge.to] ?? 0) + 1
                        }`}</span>
                        <span>{`${t('module.g07.view.decision')}: ${getEdgeDecision(graph, edge, currentSnapshot, t)}`}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="graph-stage-view-card">
                <div className="graph-stage-view-head">
                  <strong>{t('module.g07.view.components')}</strong>
                  <span>{t('module.g07.view.componentsHint')}</span>
                </div>

                <div className="graph-distance-rows">
                  <div className="graph-distance-row graph-distance-row-active">
                    <strong>{t('module.g07.view.summary')}</strong>
                    <span>{`${t('module.g07.meta.chosenEdges')}: ${currentSnapshot.chosenEdgeCount}/${currentSnapshot.edgesNeeded}`}</span>
                    <span>{`${t('module.g07.meta.totalWeight')}: ${currentSnapshot.totalWeight}`}</span>
                  </div>

                  {currentSnapshot.componentGroups.map((group, index) => (
                    <div key={`group-${index}`} className="graph-distance-row">
                      <strong>{`${t('module.g07.component.label')} ${index + 1}`}</strong>
                      <div className="graph-floyd-chip-row">
                        {group.map((nodeIndex) => (
                          <span key={`${index}-${nodeIndex}`} className="graph-floyd-chip">
                            {graph.nodes[nodeIndex]?.id ?? '?'}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
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
            {t('module.g07.meta.activeEdge')}: {activeEdgeLabel}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.g07.meta.chosenEdges')}: {currentSnapshot?.chosenEdgeCount ?? 0}/{currentSnapshot?.edgesNeeded ?? 0}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {t('module.g07.meta.totalWeight')}: {currentSnapshot?.totalWeight ?? 0}
          </span>
        </>
      }
    />
  );
}
