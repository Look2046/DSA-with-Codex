import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import { buildBTreeComparisonTimelineFromInput } from '../../modules/tree/btreeComparisonTimelineAdapter';
import type {
  BTreeComparisonStep,
  MultiwayNodeSnapshot,
} from '../../modules/tree/btreeComparison';
import type { HighlightEntry, HighlightType, PlaybackStatus } from '../../types/animation';

type BTreePreset = {
  key: 'leafSplit' | 'rootSplit';
  seedKeys: number[];
  target: number;
};

type BTreeConfig = {
  seedKeys: number[];
  target: number;
};

const PRESETS: BTreePreset[] = [
  {
    key: 'leafSplit',
    seedKeys: [10, 20, 5, 6, 12, 30],
    target: 7,
  },
  {
    key: 'rootSplit',
    seedKeys: [10, 20, 30],
    target: 40,
  },
] ;
const SPEED_OPTIONS = [
  { key: 'module.s01.speed.slow', value: 1200 },
  { key: 'module.s01.speed.normal', value: 700 },
  { key: 'module.s01.speed.fast', value: 350 },
] as const;
const CODE_LINE_KEYS = [
  'module.t05.code.line1',
  'module.t05.code.line2',
  'module.t05.code.line3',
  'module.t05.code.line4',
  'module.t05.code.line5',
  'module.t05.code.line6',
  'module.t05.code.line7',
  'module.t05.code.line8',
  'module.t05.code.line9',
] as const;

type PresetKey = BTreePreset['key'];
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

function getStepDescription(step: BTreeComparisonStep | undefined, t: TranslateFn): string {
  if (!step) {
    return '-';
  }
  if (step.action === 'initial') {
    return t('module.t05.step.initial');
  }
  if (step.action === 'descend') {
    return t('module.t05.step.descend');
  }
  if (step.action === 'insertLeaf') {
    return t('module.t05.step.insertLeaf');
  }
  if (step.action === 'splitLeaf') {
    return t('module.t05.step.splitLeaf');
  }
  if (step.action === 'splitInternal') {
    return t('module.t05.step.splitInternal');
  }
  if (step.action === 'promote') {
    return t('module.t05.step.promote');
  }
  if (step.action === 'linkLeaves') {
    return t('module.t05.step.linkLeaves');
  }
  return t('module.t05.step.completed');
}

function getOutcomeLabel(outcome: BTreeComparisonStep['outcome'], t: TranslateFn): string {
  return outcome === 'inserted' ? t('module.t05.outcome.inserted') : t('module.t05.outcome.ongoing');
}

function getActiveTreeLabel(activeTree: BTreeComparisonStep['activeTree'], t: TranslateFn): string {
  if (activeTree === 'btree') {
    return t('module.t05.meta.activeTree.btree');
  }
  if (activeTree === 'bplus') {
    return t('module.t05.meta.activeTree.bplus');
  }
  return t('module.t05.meta.activeTree.both');
}

function getPresetLabel(presetKey: PresetKey, t: TranslateFn): string {
  return presetKey === 'leafSplit' ? t('module.t05.preset.leafSplit') : t('module.t05.preset.rootSplit');
}

function formatKeys(values: number[]): string {
  return values.join(', ');
}

function computePositions(rootId: number | null, nodes: MultiwayNodeSnapshot[]) {
  const positions = new Map<number, { x: number; y: number }>();
  if (rootId === null) {
    return positions;
  }

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const leafCount = (nodeId: number): number => {
    const node = nodeMap.get(nodeId);
    if (!node || node.children.length === 0) {
      return 1;
    }
    return node.children.reduce((sum, childId) => sum + leafCount(childId), 0);
  };

  const maxDepth = nodes.reduce((max, node) => Math.max(max, node.depth), 0);
  const yStep = maxDepth > 0 ? 68 / maxDepth : 0;

  const placeNode = (nodeId: number, depth: number, minX: number, maxX: number) => {
    const node = nodeMap.get(nodeId);
    if (!node) {
      return;
    }

    positions.set(nodeId, { x: (minX + maxX) / 2, y: 14 + depth * yStep });
    if (node.children.length === 0) {
      return;
    }

    const totalLeaves = node.children.reduce((sum, childId) => sum + leafCount(childId), 0);
    let offset = minX;
    node.children.forEach((childId) => {
      const childLeaves = leafCount(childId);
      const width = ((maxX - minX) * childLeaves) / totalLeaves;
      placeNode(childId, depth + 1, offset, offset + width);
      offset += width;
    });
  };

  placeNode(rootId, 0, 4, 96);
  return positions;
}

function createHighlightMap(entries: HighlightEntry[]): Map<number, HighlightType> {
  const map = new Map<number, HighlightType>();
  entries.forEach((entry) => map.set(entry.index, entry.type));
  return map;
}

function MultiwayTreePanel({
  title,
  label,
  nodes,
  rootId,
  highlights,
  pathIds,
}: {
  title: string;
  label: string;
  nodes: MultiwayNodeSnapshot[];
  rootId: number | null;
  highlights: HighlightEntry[];
  pathIds: number[];
}) {
  const positions = useMemo(() => computePositions(rootId, nodes), [nodes, rootId]);
  const highlightMap = useMemo(() => createHighlightMap(highlights), [highlights]);
  const pathSet = useMemo(() => new Set(pathIds), [pathIds]);
  const edges = useMemo(
    () => nodes.flatMap((node) => node.children.map((childId) => ({ from: node.id, to: childId }))),
    [nodes],
  );

  return (
    <div className="btree-stage-panel">
      <div className="btree-stage-panel-head">
        <span className="btree-stage-panel-label">{label}</span>
        <strong>{title}</strong>
      </div>
      <div className="btree-stage-panel-canvas">
        <svg className="tree-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
          {edges.map((edge) => {
            const from = positions.get(edge.from);
            const to = positions.get(edge.to);
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

        <div className="tree-node-layer btree-node-layer">
          {nodes.map((node) => {
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

            return (
              <div
                key={node.id}
                className={`btree-node${stateClass}${pathClass}${node.leaf ? ' btree-node-leaf' : ''}`}
                style={{
                  left: `${positions.get(node.id)?.x ?? 0}%`,
                  top: `${positions.get(node.id)?.y ?? 0}%`,
                }}
              >
                <span className="btree-node-index">#{node.id}</span>
                <div className="btree-node-keys">
                  {node.keys.map((key) => (
                    <span key={`${node.id}-${key}`} className="btree-node-key">
                      {key}
                    </span>
                  ))}
                </div>
                <span className="btree-node-kind">{node.leaf ? 'leaf' : 'internal'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function BTreePage() {
  const { t } = useI18n();
  const [presetKey, setPresetKey] = useState<PresetKey>(PRESETS[0].key);
  const [targetInput, setTargetInput] = useState(String(PRESETS[0].target));
  const [error, setError] = useState('');
  const [activeConfig, setActiveConfig] = useState<BTreeConfig>(() => ({
    seedKeys: PRESETS[0].seedKeys,
    target: PRESETS[0].target,
  }));

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } =
    useTimelinePlayer(0);

  const timelineFrames = useMemo(
    () => buildBTreeComparisonTimelineFromInput(activeConfig.seedKeys, activeConfig.target),
    [activeConfig],
  );
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const codeLines = useMemo(() => CODE_LINE_KEYS.map((key) => t(key)), [t]);
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const currentOutcomeLabel = getOutcomeLabel(currentSnapshot?.outcome ?? 'ongoing', t);
  const currentStepDescription = getStepDescription(currentSnapshot, t);
  const currentActiveTreeLabel = getActiveTreeLabel(currentSnapshot?.activeTree ?? 'both', t);

  const applyPreset = (nextPresetKey: PresetKey) => {
    const preset = PRESETS.find((item) => item.key === nextPresetKey) ?? PRESETS[0];
    setPresetKey(nextPresetKey);
    setTargetInput(String(preset.target));
    setActiveConfig({
      seedKeys: preset.seedKeys,
      target: preset.target,
    });
    setError('');
    reset();
  };

  const handleApply = () => {
    const parsedTarget = Number(targetInput);
    if (!Number.isInteger(parsedTarget)) {
      setError(t('module.t05.error.target'));
      return;
    }

    const preset = PRESETS.find((item) => item.key === presetKey) ?? PRESETS[0];
    setActiveConfig({
      seedKeys: preset.seedKeys,
      target: parsedTarget,
    });
    setError('');
    reset();
  };

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page"
      title={t('module.t05.title')}
      description={t('module.t05.body')}
      stageAriaLabel={t('module.t05.stage')}
      stageClassName="bst-stage btree-stage"
      stageBodyClassName="workspace-stage-body-tree"
      controlsPanelClassName="workspace-drawer-xl workspace-drawer-scroll"
      stepPanelClassName="workspace-context-sheet-wide workspace-context-sheet-rich"
      defaultControlsPanelSize={{ width: 332, height: 580 }}
      defaultContextPanelSize={{ width: 320, height: 560 }}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('module.t05.meta.activeTree.label')}: {currentActiveTreeLabel}
          </span>
          <span className="tree-workspace-pill">
            {t('module.t05.meta.target')}: {activeConfig.target}
          </span>
          <span className="tree-workspace-pill">
            {t('module.t05.meta.promoted')}: {currentSnapshot?.promotedKey ?? '-'}
          </span>
          <span className="tree-workspace-pill">
            {t('module.t05.meta.outcome')}: {currentOutcomeLabel}
          </span>
        </>
      }
      controlsContent={
        <>
          <div className="tree-workspace-field">
            <span>{t('module.t05.input.preset')}</span>
            <div className="tree-workspace-toggle-row">
              {PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  className={`tree-workspace-toggle${presetKey === preset.key ? ' tree-workspace-toggle-active' : ''}`}
                  onClick={() => applyPreset(preset.key)}
                >
                  {getPresetLabel(preset.key, t)}
                </button>
              ))}
            </div>
          </div>

          <label className="tree-workspace-field" htmlFor="btree-target-input">
            <span>{t('module.t05.input.target')}</span>
            <input
              id="btree-target-input"
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

          {error ? <p className="form-error workspace-inline-feedback">{error}</p> : null}

          <div className="tree-workspace-drawer-actions">
            <button type="button" className="tree-workspace-ghost-button" onClick={() => applyPreset(presetKey)}>
              {t('module.t05.resetPreset')}
            </button>
            <button type="button" className="tree-workspace-ghost-button" onClick={handleApply}>
              {t('module.t05.apply')}
            </button>
          </div>

          <div className="tree-workspace-sample-block">
            <span>{t('module.t05.seed')}</span>
            <code>[{formatKeys(activeConfig.seedKeys)}]</code>
          </div>
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy">
            <h3>{currentStepDescription}</h3>
            <p>
              {t('module.t05.meta.activeTree.label')}: {currentActiveTreeLabel} · {t('module.t05.meta.outcome')}:{' '}
              {currentOutcomeLabel}
            </p>
          </div>

          <dl className="tree-workspace-kv">
            <div>
              <dt>{t('playback.status')}</dt>
              <dd>{getStatusLabel(status, t)}</dd>
            </div>
            <div>
              <dt>{t('module.t05.meta.activeTree.label')}</dt>
              <dd>{currentActiveTreeLabel}</dd>
            </div>
            <div>
              <dt>{t('module.t05.meta.target')}</dt>
              <dd>{activeConfig.target}</dd>
            </div>
            <div>
              <dt>{t('module.t05.meta.promoted')}</dt>
              <dd>{currentSnapshot?.promotedKey ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.t05.meta.btreeRoot')}</dt>
              <dd>{currentSnapshot?.bTreeRootId ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.t05.meta.bplusRoot')}</dt>
              <dd>{currentSnapshot?.bPlusRootId ?? '-'}</dd>
            </div>
            <div>
              <dt>{t('module.t05.meta.leafChain')}</dt>
              <dd>{currentSnapshot?.leafChain.join(' -> ') || '-'}</dd>
            </div>
            <div>
              <dt>{t('module.t05.meta.outcome')}</dt>
              <dd>{currentOutcomeLabel}</dd>
            </div>
          </dl>

          <div className="tree-workspace-code-block">
            <span className="tree-workspace-code-title">{t('module.t05.code.title')}</span>
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
        <div className="btree-compare-stage" aria-hidden="true">
          <MultiwayTreePanel
            title={t('module.t05.view.btree')}
            label={t('module.t05.view.classic')}
            nodes={currentSnapshot?.bTreeNodes ?? []}
            rootId={currentSnapshot?.bTreeRootId ?? null}
            highlights={currentSnapshot?.bTreeHighlights ?? []}
            pathIds={currentSnapshot?.bTreePathIds ?? []}
          />
          <MultiwayTreePanel
            title={t('module.t05.view.bplus')}
            label={t('module.t05.view.linkedLeaves')}
            nodes={currentSnapshot?.bPlusNodes ?? []}
            rootId={currentSnapshot?.bPlusRootId ?? null}
            highlights={currentSnapshot?.bPlusHighlights ?? []}
            pathIds={currentSnapshot?.bPlusPathIds ?? []}
          />

          <div className="bplus-leaf-strip">
            <span className="bplus-leaf-strip-label">{t('module.t05.meta.leafChain')}</span>
            {(currentSnapshot?.leafChain ?? []).length === 0 ? (
              <span className="tree-workspace-transport-empty">-</span>
            ) : (
              currentSnapshot?.leafChain.map((key, index) => (
                <span key={`${key}-${index}`} className="tree-workspace-transport-chip">
                  {key}
                </span>
              ))
            )}
          </div>
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
          <span className="tree-workspace-transport-empty">{t('module.t05.meta.activeTree.label')}</span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">{currentActiveTreeLabel}</span>
          {currentSnapshot?.promotedKey !== null && currentSnapshot?.promotedKey !== undefined ? (
            <span className="tree-workspace-transport-chip">{t('module.t05.meta.promoted')}: {currentSnapshot.promotedKey}</span>
          ) : null}
        </>
      }
    />
  );
}
