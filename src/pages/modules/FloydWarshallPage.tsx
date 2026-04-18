import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { buildFloydWarshallTimelineFromPreset } from '../../modules/graph/floydWarshallTimelineAdapter';
import type { FloydWarshallStep } from '../../modules/graph/floydWarshall';
import {
  getWeightedGraphEdgeKey,
  getWeightedGraphPresetIds,
  type WeightedGraphDefinition,
  type WeightedGraphPresetId,
} from '../../modules/graph/weightedGraph';
import type { PlaybackStatus } from '../../types/animation';

const DEFAULT_PRESET: WeightedGraphPresetId = 'floydDirected';
const CODE_LINE_KEYS = [
  'module.g06.code.line1',
  'module.g06.code.line2',
  'module.g06.code.line3',
  'module.g06.code.line4',
  'module.g06.code.line5',
  'module.g06.code.line6',
  'module.g06.code.line7',
  'module.g06.code.line8',
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
  return presetId === 'floydDirected' ? t('module.g06.preset.floydDirected') : presetId;
}

function formatDistance(distance: number | null): string {
  return distance === null ? '∞' : String(distance);
}

function getNodeLabel(graph: WeightedGraphDefinition | null, index: number | null | undefined): string {
  if (!graph || index === null || index === undefined) {
    return '-';
  }
  return graph.nodes[index]?.id ?? '-';
}

function getPairLabel(
  graph: WeightedGraphDefinition | null,
  sourceIndex: number | null | undefined,
  targetIndex: number | null | undefined,
): string {
  const left = getNodeLabel(graph, sourceIndex);
  const right = getNodeLabel(graph, targetIndex);
  return left === '-' || right === '-' ? '-' : `${left} -> ${right}`;
}

function formatEdgeList(graph: WeightedGraphDefinition): string {
  return graph.edges
    .map((edge) => `${graph.nodes[edge.from]?.id ?? '?'} -> ${graph.nodes[edge.to]?.id ?? '?'} (${edge.weight})`)
    .join(', ');
}

function getStepDescription(step: FloydWarshallStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }

  switch (step.action) {
    case 'initial':
      return t('module.g06.step.initial');
    case 'seedMatrix':
      return t('module.g06.step.seedMatrix');
    case 'selectVia':
      return t('module.g06.step.selectVia');
    case 'inspectPair':
      return t('module.g06.step.inspectPair');
    case 'updateDistance':
      return t('module.g06.step.updateDistance');
    case 'keepDistance':
      return t('module.g06.step.keepDistance');
    case 'completeVia':
      return t('module.g06.step.completeVia');
    case 'completed':
      return t('module.g06.step.completed');
    default:
      return '-';
  }
}

export function FloydWarshallPage() {
  const { t } = useI18n();
  const [presetId, setPresetId] = useState<WeightedGraphPresetId>(DEFAULT_PRESET);
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildFloydWarshallTimelineFromPreset(presetId), [presetId]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const graph = currentSnapshot?.graph ?? null;
  const distanceMatrix = currentSnapshot?.distanceMatrix ?? [];
  const codeLines = useMemo(() => CODE_LINE_KEYS.map((key) => t(key)), [t]);
  const presetOptions = useMemo(() => getWeightedGraphPresetIds('floydWarshall'), []);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const focusPoint = useMemo(() => {
    if (!graph || currentSnapshot?.viaNodeIndex === null || currentSnapshot?.viaNodeIndex === undefined) {
      return null;
    }

    const node = graph.nodes[currentSnapshot.viaNodeIndex];
    return node ? { x: node.x, y: node.y } : null;
  }, [currentSnapshot, graph]);

  const activePathEdgeSet = useMemo(
    () => new Set(currentSnapshot?.activePathEdgeKeys ?? []),
    [currentSnapshot?.activePathEdgeKeys],
  );
  const changedPairSet = useMemo(
    () => new Set(currentSnapshot?.changedPairKeys ?? []),
    [currentSnapshot?.changedPairKeys],
  );
  const completedViaSet = useMemo(
    () => new Set(currentSnapshot?.completedViaNodeIndices ?? []),
    [currentSnapshot?.completedViaNodeIndices],
  );

  const viaLabel = getNodeLabel(graph, currentSnapshot?.viaNodeIndex);
  const sourceLabel = getNodeLabel(graph, currentSnapshot?.activeSourceIndex);
  const targetLabel = getNodeLabel(graph, currentSnapshot?.activeTargetIndex);
  const activePairLabel = getPairLabel(graph, currentSnapshot?.activeSourceIndex, currentSnapshot?.activeTargetIndex);
  const completedViaLabels = (currentSnapshot?.completedViaNodeIndices ?? []).map(
    (index) => graph?.nodes[index]?.id ?? '?',
  );
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;

  const detailParts = [
    `${t('module.g06.meta.via')}: ${viaLabel}`,
    `${t('module.g06.meta.updatedInVia')}: ${currentSnapshot?.updatedInViaCount ?? 0}`,
    `${t('module.g06.meta.finiteCount')}: ${currentSnapshot?.finiteDistanceCount ?? 0}`,
  ];

  if (activePairLabel !== '-') {
    detailParts.push(`${t('module.g06.meta.activePair')}: ${activePairLabel}`);
  }
  if (currentSnapshot?.candidateDistance !== null) {
    detailParts.push(`${t('module.g06.meta.candidateDistance')}: ${formatDistance(currentSnapshot.candidateDistance)}`);
  }

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={t('module.g06.title')}
      description={t('module.g06.body')}
      stageAriaLabel={t('module.g06.stage')}
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
            {t('module.g06.meta.preset')}: {graph ? getPresetLabel(graph.presetId, t) : '-'}
          </span>
          <span className="tree-workspace-pill">
            {t('module.g06.meta.via')}: {viaLabel}
          </span>
          <span className="tree-workspace-pill">
            {t('module.g06.meta.updatedInVia')}: {currentSnapshot?.updatedInViaCount ?? 0}
          </span>
          <span className="tree-workspace-pill">{getStepDescription(currentSnapshot, t)}</span>
        </>
      }
      controlsContent={
        <>
          <div className="tree-workspace-field">
            <span>{t('module.g06.input.preset')}</span>
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
                <code>{t('module.g06.sample.goal')}</code>
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
              <dt>{t('module.g06.meta.preset')}</dt>
              <dd>{graph ? getPresetLabel(graph.presetId, t) : '-'}</dd>
            </div>
            <div>
              <dt>{t('module.g06.meta.via')}</dt>
              <dd>{viaLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g06.meta.source')}</dt>
              <dd>{sourceLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g06.meta.target')}</dt>
              <dd>{targetLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g06.meta.activePair')}</dt>
              <dd>{activePairLabel}</dd>
            </div>
            <div>
              <dt>{t('module.g06.meta.leftDistance')}</dt>
              <dd>{formatDistance(currentSnapshot?.candidateLeftDistance ?? null)}</dd>
            </div>
            <div>
              <dt>{t('module.g06.meta.rightDistance')}</dt>
              <dd>{formatDistance(currentSnapshot?.candidateRightDistance ?? null)}</dd>
            </div>
            <div>
              <dt>{t('module.g06.meta.candidateDistance')}</dt>
              <dd>{formatDistance(currentSnapshot?.candidateDistance ?? null)}</dd>
            </div>
            <div>
              <dt>{t('module.g06.meta.currentDistance')}</dt>
              <dd>{formatDistance(currentSnapshot?.currentDistance ?? null)}</dd>
            </div>
            <div>
              <dt>{t('module.g06.meta.updatedInVia')}</dt>
              <dd>{currentSnapshot?.updatedInViaCount ?? 0}</dd>
            </div>
            <div>
              <dt>{t('module.g06.meta.completedVia')}</dt>
              <dd>
                {currentSnapshot?.completedViaCount ?? 0}/{graph?.nodes.length ?? 0}
              </dd>
            </div>
            <div>
              <dt>{t('module.g06.meta.finiteCount')}</dt>
              <dd>{currentSnapshot?.finiteDistanceCount ?? 0}</dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{t('module.g06.code.title')}</span>
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
                    id="graph-floyd-edge-arrow"
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
                    id="graph-floyd-edge-arrow-active"
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
                  const isActive = activePathEdgeSet.has(edgeKey);
                  const midX = ((from?.x ?? 0) + (to?.x ?? 0)) / 2;
                  const midY = ((from?.y ?? 0) + (to?.y ?? 0)) / 2 - 2;

                  return (
                    <g key={edgeKey}>
                      <line
                        className={`graph-edge${isActive ? ' graph-edge-active' : ''}`}
                        x1={from?.x ?? 0}
                        y1={from?.y ?? 0}
                        x2={to?.x ?? 0}
                        y2={to?.y ?? 0}
                        markerEnd={isActive ? 'url(#graph-floyd-edge-arrow-active)' : 'url(#graph-floyd-edge-arrow)'}
                      />
                      <text x={midX} y={midY} className={`graph-edge-weight${isActive ? ' graph-edge-weight-active' : ''}`}>
                        {edge.weight}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="tree-node-layer graph-node-layer">
                {graph.nodes.map((node, index) => {
                  const isCompletedVia = completedViaSet.has(index);
                  const isVia = currentSnapshot?.viaNodeIndex === index;
                  const isSource = currentSnapshot?.activeSourceIndex === index;
                  const isTarget = currentSnapshot?.activeTargetIndex === index;

                  let stateLabel = t('module.g06.node.idle');
                  if (isSource) {
                    stateLabel = t('module.g06.node.source');
                  } else if (isTarget) {
                    stateLabel = t('module.g06.node.target');
                  } else if (isVia) {
                    stateLabel = t('module.g06.node.via');
                  } else if (isCompletedVia) {
                    stateLabel = t('module.g06.node.completedVia');
                  }

                  return (
                    <div
                      key={node.id}
                      className={`tree-node graph-node${isCompletedVia ? ' graph-node-completed' : ''}${
                        isVia ? ' graph-node-via' : ''
                      }${isSource ? ' graph-node-active' : ''}${isTarget ? ' graph-node-neighbor' : ''}`}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      <span className="tree-node-tag">{`v${index}`}</span>
                      {isVia ? (
                        <span className="tree-node-badge graph-node-badge-visited">{`K${index}`}</span>
                      ) : null}
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
                  <strong>{t('module.g06.view.matrix')}</strong>
                  <span>{t('module.g06.view.matrixHint')}</span>
                </div>

                <div className="graph-matrix-scroll">
                  <table className="graph-matrix">
                    <thead>
                      <tr>
                        <th aria-label={t('module.g01.matrix.corner')} />
                        {graph.nodes.map((node, index) => (
                          <th
                            key={`head-${node.id}`}
                            className={currentSnapshot?.viaNodeIndex === index ? 'graph-matrix-header-via' : undefined}
                          >
                            {node.id}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {distanceMatrix.map((row, rowIndex) => {
                        const isActiveRow = currentSnapshot?.activeSourceIndex === rowIndex;
                        const isViaRow = currentSnapshot?.viaNodeIndex === rowIndex;
                        const isCompletedViaRow = completedViaSet.has(rowIndex);

                        return (
                          <tr
                            key={`row-${graph.nodes[rowIndex]?.id ?? rowIndex}`}
                            className={`${isActiveRow ? ' graph-matrix-row-active' : ''}${
                              isViaRow ? ' graph-matrix-row-via' : ''
                            }${isCompletedViaRow ? ' graph-matrix-row-completed' : ''}`}
                          >
                            <th>{graph.nodes[rowIndex]?.id ?? '?'}</th>
                            {row.map((value, colIndex) => {
                              const isActiveCell =
                                currentSnapshot?.activeSourceIndex === rowIndex &&
                                currentSnapshot.activeTargetIndex === colIndex;
                              const isViaCell =
                                (currentSnapshot?.activeSourceIndex === rowIndex &&
                                  currentSnapshot.viaNodeIndex === colIndex) ||
                                (currentSnapshot?.viaNodeIndex === rowIndex &&
                                  currentSnapshot.activeTargetIndex === colIndex);
                              const isChangedCell = changedPairSet.has(`${rowIndex}-${colIndex}`);

                              return (
                                <td
                                  key={`${rowIndex}-${colIndex}`}
                                  className={`${isActiveCell ? ' graph-matrix-cell-active' : ''}${
                                    isViaCell ? ' graph-matrix-cell-via' : ''
                                  }${isChangedCell ? ' graph-matrix-cell-improved' : ''}`}
                                >
                                  {formatDistance(value)}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="graph-stage-view-card">
                <div className="graph-stage-view-head">
                  <strong>{t('module.g06.view.evaluation')}</strong>
                  <span>{t('module.g06.view.evaluationHint')}</span>
                </div>

                <div className="graph-distance-rows">
                  <div className="graph-distance-row graph-distance-row-active">
                    <strong>{t('module.g06.meta.activePair')}</strong>
                    <span>{activePairLabel}</span>
                    <span>{`${t('module.g06.meta.currentDistance')}: ${formatDistance(
                      currentSnapshot?.currentDistance ?? null,
                    )}`}</span>
                  </div>

                  <div
                    className={`graph-distance-row${
                      currentSnapshot?.action === 'updateDistance' ? ' graph-distance-row-relaxed' : ''
                    }`}
                  >
                    <strong>{t('module.g06.view.candidate')}</strong>
                    <span>{`${t('module.g06.meta.leftDistance')}: ${formatDistance(
                      currentSnapshot?.candidateLeftDistance ?? null,
                    )}`}</span>
                    <span>{`${t('module.g06.meta.rightDistance')}: ${formatDistance(
                      currentSnapshot?.candidateRightDistance ?? null,
                    )}`}</span>
                    <span>{`${t('module.g06.meta.candidateDistance')}: ${formatDistance(
                      currentSnapshot?.candidateDistance ?? null,
                    )}`}</span>
                  </div>

                  <div className="graph-distance-row">
                    <strong>{t('module.g06.view.progress')}</strong>
                    <span>{`${t('module.g06.meta.via')}: ${viaLabel}`}</span>
                    <span>{`${t('module.g06.meta.updatedInVia')}: ${currentSnapshot?.updatedInViaCount ?? 0}`}</span>
                    <span>{`${t('module.g06.meta.finiteCount')}: ${currentSnapshot?.finiteDistanceCount ?? 0}`}</span>
                  </div>

                  <div className="graph-distance-row">
                    <strong>{t('module.g06.view.completedVia')}</strong>
                    <div className="graph-floyd-chip-row">
                      {completedViaLabels.length === 0 ? (
                        <span className="graph-list-empty">{t('module.g06.view.completedViaEmpty')}</span>
                      ) : (
                        completedViaLabels.map((label, index) => (
                          <span key={`${label}-${index}`} className="graph-floyd-chip">
                            {label}
                          </span>
                        ))
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
            {t('module.g06.meta.via')}: {viaLabel}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.g06.meta.updatedInVia')}: {currentSnapshot?.updatedInViaCount ?? 0}
          </span>
          <span className="tree-workspace-transport-chip">
            {t('module.g06.meta.finiteCount')}: {currentSnapshot?.finiteDistanceCount ?? 0}
          </span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {t('module.g06.meta.completedVia')}: {currentSnapshot?.completedViaCount ?? 0}/{graph?.nodes.length ?? 0}
          </span>
        </>
      }
    />
  );
}
