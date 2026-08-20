import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import type { TranslationKey } from '../../i18n/translations';
import { getPlaybackStatusLabel, getTimelineProgressWidth } from './modulePageHelpers';
import {
  buildHuffmanTimeline,
  parseHuffmanInput,
  type HuffmanAction,
  type HuffmanInputItem,
  type HuffmanNode,
  type HuffmanStep,
} from '../../modules/tree/huffman';

const DEFAULT_ITEMS: HuffmanInputItem[] = [
  { label: 'A', weight: 7 },
  { label: 'B', weight: 5 },
  { label: 'C', weight: 2 },
  { label: 'D', weight: 4 },
];
const DEFAULT_LABELS = DEFAULT_ITEMS.map((item) => item.label).join(', ');
const DEFAULT_WEIGHTS = DEFAULT_ITEMS.map((item) => item.weight).join(', ');
const SPEED_OPTIONS = [
  { key: 'module.s01.speed.slow', value: 1200 },
  { key: 'module.s01.speed.normal', value: 700 },
  { key: 'module.s01.speed.fast', value: 350 },
] as const;
const CODE_LINE_KEYS = [
  'module.t07.code.line1',
  'module.t07.code.line2',
  'module.t07.code.line3',
  'module.t07.code.line4',
  'module.t07.code.line5',
  'module.t07.code.line6',
  'module.t07.code.line7',
] as const;
const ACTION_LABEL_KEYS: Record<HuffmanAction, TranslationKey> = {
  initial: 'module.t07.action.initial',
  select: 'module.t07.action.select',
  merge: 'module.t07.action.merge',
  code: 'module.t07.action.code',
  completed: 'module.t07.action.completed',
};
const STEP_DESCRIPTION_KEYS: Record<HuffmanAction, TranslationKey> = {
  initial: 'module.t07.step.initial',
  select: 'module.t07.step.select',
  merge: 'module.t07.step.merge',
  code: 'module.t07.step.code',
  completed: 'module.t07.step.completed',
};

type NodePosition = { x: number; y: number };
type TranslateFn = ReturnType<typeof useI18n>['t'];

function formatForest(step: HuffmanStep | undefined): string {
  if (!step) {
    return '-';
  }

  const nodeById = new Map(step.nodes.map((node) => [node.id, node]));
  return step.forestRoots
    .map((id) => nodeById.get(id))
    .filter((node): node is HuffmanNode => Boolean(node))
    .map((node) => `${node.label}(${node.weight})`)
    .join('  |  ');
}

function collectTreeIds(step: HuffmanStep | undefined, rootId: string): Set<string> {
  const ids = new Set<string>();
  if (!step) {
    return ids;
  }
  const nodeById = new Map(step.nodes.map((node) => [node.id, node]));

  const visit = (nodeId: string) => {
    if (ids.has(nodeId)) {
      return;
    }
    const node = nodeById.get(nodeId);
    if (!node) {
      return;
    }
    ids.add(nodeId);
    if (node.leftId) {
      visit(node.leftId);
    }
    if (node.rightId) {
      visit(node.rightId);
    }
  };

  visit(rootId);
  return ids;
}

function calculatePositions(step: HuffmanStep | undefined): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  if (!step || step.forestRoots.length === 0) {
    return positions;
  }

  const nodeById = new Map(step.nodes.map((node) => [node.id, node]));
  const maxDepth = (nodeId: string): number => {
    const node = nodeById.get(nodeId);
    if (!node || (!node.leftId && !node.rightId)) {
      return 0;
    }
    return 1 + Math.max(node.leftId ? maxDepth(node.leftId) : 0, node.rightId ? maxDepth(node.rightId) : 0);
  };
  const leafCount = (nodeId: string): number => {
    const node = nodeById.get(nodeId);
    if (!node || (!node.leftId && !node.rightId)) {
      return 1;
    }
    return (node.leftId ? leafCount(node.leftId) : 0) + (node.rightId ? leafCount(node.rightId) : 0);
  };

  const globalMaxDepth = Math.max(...step.forestRoots.map(maxDepth), 1);
  const totalLeaves = step.forestRoots.reduce((sum, rootId) => sum + leafCount(rootId), 0);
  const yStep = Math.min(20, 74 / Math.max(globalMaxDepth, 1));
  const gap = 2.4;
  const usableWidth = 92 - gap * Math.max(step.forestRoots.length - 1, 0);
  const unit = usableWidth / Math.max(totalLeaves, 1);
  let cursor = 4;

  const place = (nodeId: string, depth: number, minX: number, maxX: number) => {
    const node = nodeById.get(nodeId);
    if (!node) {
      return;
    }
    positions.set(nodeId, { x: (minX + maxX) / 2, y: 10 + depth * yStep });
    if (!node.leftId && !node.rightId) {
      return;
    }
    const leftLeaves = node.leftId ? leafCount(node.leftId) : 0;
    const rightLeaves = node.rightId ? leafCount(node.rightId) : 0;
    const total = Math.max(leftLeaves + rightLeaves, 1);
    let childCursor = minX;
    if (node.leftId) {
      const width = ((maxX - minX) * leftLeaves) / total;
      place(node.leftId, depth + 1, childCursor, childCursor + width);
      childCursor += width;
    }
    if (node.rightId) {
      const width = ((maxX - minX) * rightLeaves) / total;
      place(node.rightId, depth + 1, childCursor, childCursor + width);
    }
  };

  step.forestRoots.forEach((rootId) => {
    const width = leafCount(rootId) * unit;
    place(rootId, 0, cursor, cursor + width);
    cursor += width + gap;
  });

  return positions;
}

function getActionLabel(action: HuffmanAction, t: TranslateFn): string {
  return t(ACTION_LABEL_KEYS[action]);
}

function getStepDescription(step: HuffmanStep | undefined, t: TranslateFn): string {
  return step ? t(STEP_DESCRIPTION_KEYS[step.action]) : '-';
}

export function HuffmanTreePage() {
  const { t } = useI18n();
  const [labelsInput, setLabelsInput] = useState(DEFAULT_LABELS);
  const [weightsInput, setWeightsInput] = useState(DEFAULT_WEIGHTS);
  const [activeItems, setActiveItems] = useState<HuffmanInputItem[]>(DEFAULT_ITEMS);
  const [error, setError] = useState('');
  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } = useTimelinePlayer(0);

  const frames = useMemo(() => buildHuffmanTimeline(activeItems), [activeItems]);
  const steps = useMemo(() => frames.map((frame) => frame.payload), [frames]);
  const currentStep = steps[currentFrame] ?? steps[0];
  const nodeById = useMemo(() => new Map((currentStep?.nodes ?? []).map((node) => [node.id, node])), [currentStep]);
  const positions = useMemo(() => calculatePositions(currentStep), [currentStep]);
  const selectedIds = useMemo(() => new Set(currentStep?.selectedIds ?? []), [currentStep?.selectedIds]);
  const treeIds = useMemo(
    () => (currentStep?.mergedId ? collectTreeIds(currentStep, currentStep.mergedId) : new Set<string>()),
    [currentStep],
  );
  const activeCodeLines = useMemo(() => new Set(currentStep?.codeLines ?? []), [currentStep]);
  const currentForest = formatForest(currentStep);
  const codeLines = useMemo(() => CODE_LINE_KEYS.map((key) => t(key)), [t]);
  const isAtLastFrame = steps.length === 0 || currentFrame >= steps.length - 1;

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [reset, setTotalFrames, steps.length]);

  const applyInput = () => {
    const items = parseHuffmanInput(labelsInput, weightsInput);
    if (items.length < 2) {
      setError(t('module.t07.error.input'));
      return;
    }
    setActiveItems(items);
    setError('');
    reset();
  };

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page huffman-page"
      title={t('module.t07.title')}
      description={t('module.t07.body')}
      stageAriaLabel={t('module.t07.stage')}
      stageClassName="bst-stage huffman-stage"
      stageBodyClassName="workspace-stage-body-tree huffman-stage-body"
      controlsPanelClassName="workspace-drawer-xl workspace-drawer-scroll"
      stepPanelClassName="workspace-context-sheet-wide workspace-context-sheet-rich"
      defaultControlsPanelSize={{ width: 332, height: 540 }}
      defaultContextPanelSize={{ width: 330, height: 560 }}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getPlaybackStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">{t('module.t07.meta.round')}: {currentStep?.round ?? 0}</span>
          <span className="tree-workspace-pill">
            {t('module.t07.meta.action')}: {currentStep ? getActionLabel(currentStep.action, t) : '-'}
          </span>
          <span className="tree-workspace-pill">{t('module.t07.meta.forest')}: {currentStep?.forestRoots.length ?? 0}</span>
        </>
      }
      controlsContent={
        <>
          <label className="tree-workspace-field" htmlFor="huffman-labels-input">
            <span>{t('module.t07.input.labels')}</span>
            <input id="huffman-labels-input" type="text" value={labelsInput} onChange={(event) => { setLabelsInput(event.target.value); setError(''); }} />
          </label>
          <label className="tree-workspace-field" htmlFor="huffman-weights-input">
            <span>{t('module.t07.input.weights')}</span>
            <input id="huffman-weights-input" type="text" value={weightsInput} onChange={(event) => { setWeightsInput(event.target.value); setError(''); }} />
          </label>
          <div className="tree-workspace-field">
            <span>{t('module.s01.speed')}</span>
            <div className="tree-workspace-toggle-row">
              {SPEED_OPTIONS.map((option) => (
                <button key={option.value} type="button" className={`tree-workspace-toggle${speedMs === option.value ? ' tree-workspace-toggle-active' : ''}`} onClick={() => setSpeed(option.value)}>
                  {t(option.key)}
                </button>
              ))}
            </div>
          </div>
          {error ? <p className="form-error workspace-inline-feedback">{error}</p> : null}
          <div className="tree-workspace-drawer-actions">
            <button type="button" className="tree-workspace-ghost-button" onClick={() => { setLabelsInput(DEFAULT_LABELS); setWeightsInput(DEFAULT_WEIGHTS); setActiveItems(DEFAULT_ITEMS); setError(''); reset(); }}>
              {t('module.t07.resetSample')}
            </button>
            <button type="button" className="tree-workspace-ghost-button" onClick={applyInput}>{t('module.t07.apply')}</button>
          </div>
          <div className="tree-workspace-sample-block"><span>{t('module.t07.currentSample')}</span><code>{activeItems.map((item) => `${item.label}:${item.weight}`).join(', ')}</code></div>
          <div className="tree-workspace-sample-block"><span>{t('module.t07.prompt.label')}</span><code>{t('module.t07.prompt.body')}</code></div>
        </>
      }
      stepContent={
        <>
          <div className="tree-workspace-step-copy"><h3>{getStepDescription(currentStep, t)}</h3><p>{t('module.t07.meta.forestRoots')}: {currentForest}</p></div>
          <dl className="tree-workspace-kv">
            <div><dt>{t('module.t07.meta.round')}</dt><dd>{currentStep?.round ?? '-'}</dd></div>
            <div><dt>{t('module.t07.meta.action')}</dt><dd>{currentStep ? getActionLabel(currentStep.action, t) : '-'}</dd></div>
            <div><dt>{t('module.t07.meta.selected')}</dt><dd>{(currentStep?.selectedIds ?? []).map((id) => nodeById.get(id)).filter((node): node is HuffmanNode => Boolean(node)).map((node) => `${node.label}(${node.weight})`).join(', ') || '-'}</dd></div>
            <div><dt>{t('module.t07.meta.codes')}</dt><dd>{currentStep?.codes.length ? `${currentStep.codes.length} ${t('module.t07.meta.ready')}` : '-'}</dd></div>
          </dl>
          <div className="tree-workspace-code-block"><span className="tree-workspace-code-title">{t('module.t07.code.title')}</span><ol className="tree-workspace-code-list">{codeLines.map((line, index) => { const lineNumber = index + 1; return <li key={lineNumber} className={activeCodeLines.has(lineNumber) ? 'code-active' : undefined}><code>{line}</code></li>; })}</ol></div>
        </>
      }
      stageContent={
        <div className="huffman-stage-scene" aria-hidden="true">
          <svg className="tree-edge-layer huffman-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
            {(currentStep?.nodes ?? []).flatMap((node) => {
              const from = positions.get(node.id);
              if (!from) return [];
              return [node.leftId, node.rightId].flatMap((childId, childIndex) => {
                if (!childId) return [];
                const to = positions.get(childId);
                if (!to) return [];
                const isActiveEdge = selectedIds.has(childId) || treeIds.has(childId);
                return <g key={`${node.id}-${childId}`}><line className={`tree-edge huffman-edge${isActiveEdge ? ' huffman-edge-active' : ''}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} /><text className="huffman-edge-label" x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 - 1.2}>{childIndex === 0 ? '0' : '1'}</text></g>;
              });
            })}
          </svg>
          <div className="tree-node-layer huffman-node-layer">
            {(currentStep?.nodes ?? []).map((node) => {
              const position = positions.get(node.id);
              if (!position) return null;
              const isSelected = selectedIds.has(node.id);
              const isMerged = currentStep?.mergedId === node.id;
              const isTreeMember = treeIds.has(node.id);
              return <div key={node.id} className={`tree-node huffman-node${node.leaf ? ' huffman-node-leaf' : ' huffman-node-internal'}${isSelected ? ' bar-visiting' : ''}${isMerged ? ' bar-new-node' : ''}${isTreeMember ? ' huffman-node-active-tree' : ''}`} style={{ left: `${position.x}%`, top: `${position.y}%` }}><span className="huffman-node-label">{node.label}</span><span className="tree-node-index">w={node.weight}</span></div>;
            })}
          </div>
          <div className="huffman-forest-panel"><span>{t('module.t07.meta.forestRoots')}</span><strong>{currentForest}</strong></div>
          {currentStep?.codes.length ? <div className="huffman-code-panel"><span>{t('module.t07.meta.codes')}</span>{currentStep.codes.map((entry) => <code key={entry.label}>{entry.label}: {entry.code}</code>)}</div> : null}
        </div>
      }
      transportLeft={
        <>
          <button type="button" className="tree-workspace-transport-btn" onClick={prev} disabled={steps.length === 0 || currentFrame <= 0}>{t('playback.prev')}</button>
          <button type="button" className="tree-workspace-transport-btn tree-workspace-transport-btn-primary" onClick={status === 'playing' ? pause : play} disabled={steps.length === 0 || isAtLastFrame}>{status === 'playing' ? t('playback.pause') : t('playback.play')}</button>
          <button type="button" className="tree-workspace-transport-btn" onClick={next} disabled={steps.length === 0 || isAtLastFrame}>{t('playback.next')}</button>
          <button type="button" className="tree-workspace-transport-btn" onClick={reset} disabled={steps.length === 0}>{t('playback.reset')}</button>
          <div className="tree-workspace-transport-progress" aria-hidden="true"><div className="tree-workspace-transport-progress-fill" style={{ width: getTimelineProgressWidth(currentFrame, steps.length) }} /></div>
          <span className="tree-workspace-transport-step">{t('playback.step')} {steps.length === 0 ? 0 : currentFrame + 1}/{steps.length}</span>
        </>
      }
      transportRight={<div className="tree-workspace-legend-row"><span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">{t('module.t07.legend.selected')}</span><span className="tree-workspace-transport-chip">{t('module.t07.legend.forest')}</span><span className="tree-workspace-transport-chip">{t('module.t07.legend.codes')}</span></div>}
    />
  );
}
