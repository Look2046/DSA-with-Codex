import { useEffect, useMemo, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import type { TranslationKey } from '../../i18n/translations';
import { getPlaybackStatusLabel, getTimelineProgressWidth } from './modulePageHelpers';
import {
  buildHuffmanCodeDetailSteps,
  buildHuffmanTimeline,
  buildHuffmanWplDetailSteps,
  collectHuffmanCodesFromStep,
  type HuffmanDetailMode,
  type HuffmanDetailStep,
  type HuffmanPathEdge,
  parseHuffmanInput,
  type HuffmanAction,
  type HuffmanCodeEntry,
  type HuffmanInputItem,
  type HuffmanStep,
} from '../../modules/tree/huffman';

const DEFAULT_ITEMS: HuffmanInputItem[] = [
  { label: 'A', weight: 7 },
  { label: 'B', weight: 5 },
  { label: 'C', weight: 2 },
  { label: 'D', weight: 4 },
];
const MIN_NODE_COUNT = 2;
const MAX_NODE_COUNT = 10;
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
  'module.t07.code.line8',
] as const;
const CODE_DETAIL_LINE_KEYS = [
  'module.t07.code.codes.line1',
  'module.t07.code.codes.line2',
  'module.t07.code.codes.line3',
  'module.t07.code.codes.line4',
  'module.t07.code.codes.line5',
] as const;
const WPL_DETAIL_LINE_KEYS = [
  'module.t07.code.wpl.line1',
  'module.t07.code.wpl.line2',
  'module.t07.code.wpl.line3',
  'module.t07.code.wpl.line4',
  'module.t07.code.wpl.line5',
] as const;
const BUILD_C_LINES = [
  'void HuffmanTree(HNodeType HuffNode[], int n) {',
  '    int i, j, x1, x2, m1, m2;',
  '    for (i = 0; i < 2 * n - 1; i++) {',
  '        HuffNode[i].weight = 0; HuffNode[i].parent = -1;',
  '        HuffNode[i].lchild = -1; HuffNode[i].rchild = -1;',
  '    }',
  '    for (i = 0; i < n; i++) readLeaf(HuffNode[i]);',
  '    for (i = 0; i < n - 1; i++) {',
  '        m1 = m2 = INF; x1 = x2 = -1;',
  '        for (j = 0; j < n + i; j++) selectTwoMinFreeNodes(j, &m1, &m2, &x1, &x2);',
  '        HuffNode[n + i].weight = HuffNode[x1].weight + HuffNode[x2].weight;',
  '        HuffNode[x1].parent = HuffNode[x2].parent = n + i;',
  '        HuffNode[n + i].lchild = x1; HuffNode[n + i].rchild = x2;',
  '    }',
  '}',
] as const;
const CODE_DETAIL_C_LINES = [
  'if (!treeComplete) return;',
  'for each leaf in tree {',
  '    code = pathFromRootToLeaf(leaf);',
  '    replace left edges with 0 and right edges with 1;',
  '    output code;',
  '}',
] as const;
const WPL_DETAIL_C_LINES = [
  'if (!treeComplete) return; int wpl = 0;',
  'for each leaf in tree {',
  '    length = pathLength(root, leaf);',
  '    wpl += leaf.weight * length;',
  '} return wpl;',
] as const;
const ACTION_LABEL_KEYS: Record<HuffmanAction, TranslationKey> = {
  initial: 'module.t07.action.initial',
  select: 'module.t07.action.select',
  lift: 'module.t07.action.lift',
  attach: 'module.t07.action.attach',
  return: 'module.t07.action.return',
  code: 'module.t07.action.code',
  completed: 'module.t07.action.completed',
};
const DETAIL_TITLE_KEYS: Record<'build' | HuffmanDetailMode, TranslationKey> = {
  build: 'module.t07.detail.buildTitle',
  codes: 'module.t07.detail.codesTitle',
  wpl: 'module.t07.detail.wplTitle',
};
const CODE_TITLE_KEYS: Record<'build' | HuffmanDetailMode, TranslationKey> = {
  build: 'module.t07.code.build.title',
  codes: 'module.t07.code.codes.title',
  wpl: 'module.t07.code.wpl.title',
};

const BUILD_CODE_LINE_MAP: Record<number, number[]> = {
  1: [1, 2, 3, 4, 5, 6],
  2: [7],
  3: [8],
  4: [9, 10],
  5: [11],
  6: [12, 13],
};

type NodePosition = { x: number; y: number };
type TranslateFn = ReturnType<typeof useI18n>['t'];

const FOREST_ROOT_Y = 30;
const FOREST_MIN_X = 8;
const FOREST_MAX_X = 92;
const FOREST_SLOT_GAP = 3;
const FOREST_LEVEL_HEIGHT = 12;
const FOREST_TREE_WIDTH = 18;
const LIFT_ROOT_Y = 48;
const LIFT_LEVEL_HEIGHT = 12;
const ATTACH_ROOT_Y = 36;
const FINAL_ROOT_Y = 20;
const FINAL_LEVEL_HEIGHT = 14;
const NODE_RADIUS = 1.4;

function computeWpl(codes: HuffmanCodeEntry[]): number {
  return codes.reduce((sum, entry) => sum + entry.weight * entry.pathLength, 0);
}

function edgeKey(edge: Pick<HuffmanPathEdge, 'fromId' | 'toId'>): string {
  return `${edge.fromId}->${edge.toId}`;
}

function buildCodeProgressMap(detailSteps: HuffmanDetailStep[] | undefined, activeIndex: number): Map<string, string> {
  const progress = new Map<string, string>();
  if (!detailSteps || activeIndex < 0) {
    return progress;
  }

  detailSteps.slice(0, activeIndex + 1).forEach((step) => {
    if (step.leafLabel && step.currentCode) {
      progress.set(step.leafLabel, step.currentCode);
    }
  });

  return progress;
}

function buildWplProgressMap(detailSteps: HuffmanDetailStep[] | undefined, activeIndex: number): Map<string, string> {
  const progress = new Map<string, string>();
  if (!detailSteps || activeIndex < 0) {
    return progress;
  }

  detailSteps.slice(0, activeIndex + 1).forEach((step) => {
    if (step.leafLabel && step.factorText) {
      progress.set(step.leafLabel, step.factorText);
    }
  });

  return progress;
}

function createRandomHuffmanItems(count: number): HuffmanInputItem[] {
  const normalizedCount = Math.max(MIN_NODE_COUNT, Math.min(MAX_NODE_COUNT, Math.floor(count)));
  const pool = Array.from({ length: 19 }, (_, index) => index + 1);
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  const weights = pool.slice(0, normalizedCount);
  return weights.map((weight, index) => ({
    label: String.fromCharCode(65 + index),
    weight,
  }));
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
  if (!step || (step.displayRoots.length === 0 && step.forestRoots.length === 0)) {
    return positions;
  }

  const nodeById = new Map(step.nodes.map((node) => [node.id, node]));

  const leafCount = (nodeId: string): number => {
    const node = nodeById.get(nodeId);
    if (!node || (!node.leftId && !node.rightId)) {
      return 1;
    }
    return (node.leftId ? leafCount(node.leftId) : 0) + (node.rightId ? leafCount(node.rightId) : 0);
  };

  const depthOf = (nodeId: string): number => {
    const node = nodeById.get(nodeId);
    if (!node || (!node.leftId && !node.rightId)) {
      return 0;
    }
    return 1 + Math.max(node.leftId ? depthOf(node.leftId) : 0, node.rightId ? depthOf(node.rightId) : 0);
  };

  const placeTree = (nodeId: string, minX: number, maxX: number, rootY: number, levelHeight: number) => {
    const place = (currentId: string, depth: number, leftX: number, rightX: number) => {
      const node = nodeById.get(currentId);
      if (!node) {
        return;
      }

      positions.set(currentId, {
        x: (leftX + rightX) / 2,
        y: rootY + depth * levelHeight,
      });

      if (!node.leftId && !node.rightId) {
        return;
      }

      const leftLeaves = node.leftId ? leafCount(node.leftId) : 0;
      const rightLeaves = node.rightId ? leafCount(node.rightId) : 0;
      const totalLeaves = Math.max(leftLeaves + rightLeaves, 1);
      let cursor = leftX;

      if (node.leftId) {
        const width = ((rightX - leftX) * leftLeaves) / totalLeaves;
        place(node.leftId, depth + 1, cursor, cursor + width);
        cursor += width;
      }

      if (node.rightId) {
        const width = ((rightX - leftX) * rightLeaves) / totalLeaves;
        place(node.rightId, depth + 1, cursor, cursor + width);
      }
    };

    place(nodeId, 0, minX, maxX);
  };

  const getForestSlots = (rootIds: string[], minX: number, maxX: number) => {
    const treeWidths = rootIds.map((rootId) => {
      const leaves = leafCount(rootId);
      return FOREST_TREE_WIDTH + Math.max(0, leaves - 1) * 6;
    });
    const availableWidth = Math.max(maxX - minX, 1);
    const baseGapTotal = FOREST_SLOT_GAP * Math.max(0, rootIds.length - 1);
    const rawTotalWidth = treeWidths.reduce((sum, width) => sum + width, 0) + baseGapTotal;
    const scale = rawTotalWidth > availableWidth ? availableWidth / rawTotalWidth : 1;
    const scaledTreeWidths = treeWidths.map((width) => width * scale);
    const gap = FOREST_SLOT_GAP * scale;
    const totalWidth =
      scaledTreeWidths.reduce((sum, width) => sum + width, 0) + gap * Math.max(0, rootIds.length - 1);
    const startX = minX + Math.max(0, (availableWidth - totalWidth) / 2);
    let cursor = startX;
    return rootIds.map((rootId, index) => {
      const slot = {
        rootId,
        minX: cursor,
        maxX: cursor + scaledTreeWidths[index],
      };
      cursor += scaledTreeWidths[index] + gap;
      return slot;
    });
  };

  const layoutForest = (
    rootIds: string[],
    rootY: number,
    minX: number,
    maxX: number,
    levelHeight: number,
  ) => {
    if (rootIds.length === 0) {
      return;
    }

    getForestSlots(rootIds, minX, maxX).forEach((slot) => {
      placeTree(slot.rootId, slot.minX, slot.maxX, rootY, levelHeight);
    });
  };

  const selectedSet = new Set(step.selectedIds);
  const nonSelectedRoots = step.displayRoots.filter((rootId) => !selectedSet.has(rootId));
  const selectedRoots = step.displayRoots.filter((rootId) => selectedSet.has(rootId));
  const maxDepth = Math.max(...(step.displayRoots.length ? step.displayRoots : step.forestRoots).map((rootId) => depthOf(rootId)), 0);
  const forestLevelHeight = Math.max(10, Math.min(FOREST_LEVEL_HEIGHT, 40 / Math.max(maxDepth || 1, 1)));

  switch (step.action) {
    case 'initial':
    case 'select':
      layoutForest(step.displayRoots, FOREST_ROOT_Y, FOREST_MIN_X, FOREST_MAX_X, forestLevelHeight);
      break;
    case 'lift':
      layoutForest(nonSelectedRoots, FOREST_ROOT_Y, FOREST_MIN_X, FOREST_MAX_X, forestLevelHeight);
      if (selectedRoots[0]) {
        placeTree(selectedRoots[0], 20, 42, LIFT_ROOT_Y, LIFT_LEVEL_HEIGHT);
      }
      if (selectedRoots[1]) {
        placeTree(selectedRoots[1], 58, 80, LIFT_ROOT_Y, LIFT_LEVEL_HEIGHT);
      }
      break;
    case 'attach':
      if (step.mergedId) {
        if (step.forestRoots.length === 1 && step.displayRoots.length === 0) {
          placeTree(step.mergedId, 20, 80, FINAL_ROOT_Y, FINAL_LEVEL_HEIGHT);
        } else {
          const attachSlots = getForestSlots(step.displayRoots, FOREST_MIN_X, FOREST_MAX_X);
          attachSlots.forEach((slot) => {
            if (slot.rootId === step.mergedId) {
              placeTree(slot.rootId, slot.minX, slot.maxX, ATTACH_ROOT_Y, forestLevelHeight);
            } else {
              placeTree(slot.rootId, slot.minX, slot.maxX, FOREST_ROOT_Y, forestLevelHeight);
            }
          });
        }
      } else {
        layoutForest(nonSelectedRoots, FOREST_ROOT_Y, FOREST_MIN_X, FOREST_MAX_X, forestLevelHeight);
      }
      break;
    case 'return':
      layoutForest(step.displayRoots, FOREST_ROOT_Y, FOREST_MIN_X, FOREST_MAX_X, forestLevelHeight);
      break;
    case 'code':
    case 'completed':
      if (step.forestRoots.length === 1) {
        placeTree(step.forestRoots[0], 20, 80, FINAL_ROOT_Y, FINAL_LEVEL_HEIGHT);
      } else {
        layoutForest(step.displayRoots, FOREST_ROOT_Y, FOREST_MIN_X, FOREST_MAX_X, forestLevelHeight);
      }
      break;
  }

  return positions;
}

function getActionLabel(action: HuffmanAction, t: TranslateFn): string {
  return t(ACTION_LABEL_KEYS[action]);
}

export function HuffmanTreePage() {
  const { t } = useI18n();
  const [detailMode, setDetailMode] = useState<'build' | HuffmanDetailMode>('build');
  const [nodeCount, setNodeCount] = useState(DEFAULT_ITEMS.length);
  const [labelsInput, setLabelsInput] = useState(DEFAULT_LABELS);
  const [weightsInput, setWeightsInput] = useState(DEFAULT_WEIGHTS);
  const [activeItems, setActiveItems] = useState<HuffmanInputItem[]>(DEFAULT_ITEMS);
  const [error, setError] = useState('');
  const {
    status,
    speedMs,
    currentFrame,
    setTotalFrames,
    setSpeed,
    play,
    pause,
    next,
    prev,
    reset,
  } = useTimelinePlayer(0);
  const {
    status: detailStatus,
    currentFrame: detailFrame,
    setTotalFrames: setDetailTotalFrames,
    play: playDetail,
    pause: pauseDetail,
    next: nextDetail,
    prev: prevDetail,
    reset: resetDetail,
  } = useTimelinePlayer(0);

  const frames = useMemo(() => buildHuffmanTimeline(activeItems), [activeItems]);
  const buildSteps = useMemo(() => frames.map((frame) => frame.payload), [frames]);
  const buildCurrentStep = buildSteps[currentFrame] ?? buildSteps[0];
  const finalBuildStep = buildSteps.at(-1);
  const codeDetailSteps = useMemo(() => buildHuffmanCodeDetailSteps(finalBuildStep), [finalBuildStep]);
  const wplDetailSteps = useMemo(() => buildHuffmanWplDetailSteps(finalBuildStep), [finalBuildStep]);
  const activeDetailSteps = detailMode === 'codes' ? codeDetailSteps : detailMode === 'wpl' ? wplDetailSteps : [];
  const activeDetailStep = detailMode === 'build' ? null : activeDetailSteps[detailFrame] ?? activeDetailSteps[0] ?? null;
  const currentStep = detailMode === 'build' ? buildCurrentStep : finalBuildStep;
  const positions = useMemo(() => calculatePositions(currentStep), [currentStep]);
  const selectedIds = useMemo(() => {
    if (detailMode !== 'build') {
      return new Set(activeDetailStep?.pathNodeIds ?? []);
    }
    return new Set(currentStep?.selectedIds ?? []);
  }, [activeDetailStep, currentStep?.selectedIds, detailMode]);
  const treeIds = useMemo(
    () => (currentStep?.mergedId ? collectTreeIds(currentStep, currentStep.mergedId) : new Set<string>()),
    [currentStep],
  );
  const activeEdgeKeys = useMemo(
    () => new Set((activeDetailStep?.pathEdges ?? []).map((edge) => edgeKey(edge))),
    [activeDetailStep],
  );
  const codeLines = useMemo(() => {
    if (detailMode === 'codes') {
      return CODE_DETAIL_LINE_KEYS.map((key) => t(key));
    }
    if (detailMode === 'wpl') {
      return WPL_DETAIL_LINE_KEYS.map((key) => t(key));
    }
    return CODE_LINE_KEYS.map((key) => t(key));
  }, [detailMode, t]);
  const cStyleCodeLines = useMemo(() => {
    if (detailMode === 'codes') {
      return [...CODE_DETAIL_C_LINES];
    }
    if (detailMode === 'wpl') {
      return [...WPL_DETAIL_C_LINES];
    }
    return [...BUILD_C_LINES];
  }, [detailMode]);
  const activeCodeLines = useMemo(() => {
    if (detailMode === 'codes') {
      return new Set(activeDetailStep?.codeLines ?? []);
    }
    if (detailMode === 'wpl') {
      return new Set(activeDetailStep?.codeLines ?? []);
    }
    return new Set(
      (buildCurrentStep?.codeLines ?? []).flatMap((line) => BUILD_CODE_LINE_MAP[line] ?? [line]),
    );
  }, [activeDetailStep?.codeLines, buildCurrentStep, detailMode]);
  const isDetailMode = detailMode !== 'build';
  const activeStatus = isDetailMode ? detailStatus : status;
  const activeFrame = isDetailMode ? detailFrame : currentFrame;
  const activeFrameCount = isDetailMode ? activeDetailSteps.length : buildSteps.length;
  const isAtLastFrame = activeFrameCount === 0 || activeFrame >= activeFrameCount - 1;
  const currentCodes = useMemo(
    () => (detailMode === 'build' ? collectHuffmanCodesFromStep(finalBuildStep) : collectHuffmanCodesFromStep(currentStep)),
    [currentStep, detailMode, finalBuildStep],
  );
  const codeProgressMap = useMemo(
    () => (detailMode === 'codes' ? buildCodeProgressMap(codeDetailSteps, detailFrame) : new Map<string, string>()),
    [codeDetailSteps, detailFrame, detailMode],
  );
  const wplProgressMap = useMemo(
    () => (detailMode === 'wpl' ? buildWplProgressMap(wplDetailSteps, detailFrame) : new Map<string, string>()),
    [detailFrame, detailMode, wplDetailSteps],
  );
  const currentWpl = currentCodes.length ? computeWpl(currentCodes) : null;
  const analysisReady = currentFrame >= Math.max(0, buildSteps.length - 1) && (buildCurrentStep?.forestRoots.length ?? 0) === 1;
  const showResultSummary = isDetailMode;

  useEffect(() => {
    setTotalFrames(buildSteps.length);
    reset();
    // Intentional: initialise detail mode when the built step set changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDetailMode('build');
  }, [reset, setTotalFrames, buildSteps.length]);

  useEffect(() => {
    setDetailTotalFrames(activeDetailSteps.length);
    resetDetail();
  }, [activeDetailSteps.length, detailMode, resetDetail, setDetailTotalFrames]);

  const applyInput = () => {
    const items = parseHuffmanInput(labelsInput, weightsInput);
    if (items.length < 2) {
      setError(t('module.t07.error.input'));
      return;
    }
    setActiveItems(items);
    setError('');
    setDetailMode('build');
    reset();
  };

  const resetSample = () => {
    setLabelsInput(DEFAULT_LABELS);
    setWeightsInput(DEFAULT_WEIGHTS);
    setNodeCount(DEFAULT_ITEMS.length);
    setActiveItems(DEFAULT_ITEMS);
    setError('');
    setDetailMode('build');
    reset();
  };

  const randomizeItems = () => {
    const items = createRandomHuffmanItems(nodeCount);
    setLabelsInput(items.map((item) => item.label).join(', '));
    setWeightsInput(items.map((item) => item.weight).join(', '));
    setActiveItems(items);
    setError('');
    setDetailMode('build');
    reset();
  };

  const startDetailMode = (mode: HuffmanDetailMode) => {
    if (!analysisReady) {
      return;
    }
    pause();
    setDetailMode(mode);
    resetDetail();
  };

  return (
    <WorkspaceShell
      pageClassName="array-page tree-page bst-page huffman-page"
      title={t('module.t07.title')}
      description={t('module.t07.body')}
      stageAriaLabel={t('module.t07.stage')}
      stageClassName="bst-stage huffman-stage"
      stageBodyClassName="workspace-stage-body-tree huffman-stage-body"
      controlsPanelClassName="workspace-drawer-xl workspace-drawer-scroll tree-controls-drawer-horizontal"
      stepPanelClassName="workspace-context-sheet-wide workspace-context-sheet-rich huffman-context-sheet"
      defaultControlsPanelSize={{ width: 760, height: 320 }}
      defaultContextPanelSize={{ width: 1180, height: 560 }}
      controlsPanelOverflowMargin={40}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getPlaybackStatusLabel(activeStatus, t)}
          </span>
          <span className="tree-workspace-pill">{t('module.t07.meta.round')}: {buildCurrentStep?.round ?? 0}</span>
          <span className="tree-workspace-pill">
            {t('module.t07.meta.action')}:{' '}
            {detailMode === 'build'
              ? buildCurrentStep
                ? getActionLabel(buildCurrentStep.action, t)
                : '-'
              : t(DETAIL_TITLE_KEYS[detailMode])}
          </span>
        </>
      }
      controlsContent={
        <div className="huffman-controls-grid tree-controls-workbench">
          <label className="tree-workspace-field" htmlFor="huffman-labels-input">
            <span>{t('module.t07.input.labels')}</span>
            <input
              id="huffman-labels-input"
              type="text"
              value={labelsInput}
              onChange={(event) => {
                setLabelsInput(event.target.value);
                setError('');
              }}
            />
          </label>
          <label className="tree-workspace-field" htmlFor="huffman-weights-input">
            <span>{t('module.t07.input.weights')}</span>
            <input
              id="huffman-weights-input"
              type="text"
              value={weightsInput}
              onChange={(event) => {
                setWeightsInput(event.target.value);
                setError('');
              }}
            />
          </label>
          <label className="tree-workspace-field" htmlFor="huffman-node-count-input">
            <span>{t('module.t07.input.nodeCount')}</span>
            <select
              id="huffman-node-count-input"
              value={nodeCount}
              onChange={(event) => {
                const nextValue = Number(event.target.value);
                setNodeCount(Number.isFinite(nextValue) ? Math.max(MIN_NODE_COUNT, Math.min(MAX_NODE_COUNT, Math.floor(nextValue))) : DEFAULT_ITEMS.length);
              }}
            >
              {Array.from({ length: MAX_NODE_COUNT - MIN_NODE_COUNT + 1 }, (_, optionIndex) => MIN_NODE_COUNT + optionIndex).map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
          <label className="tree-workspace-field" htmlFor="speed-select-HuffmanTreePage">
            <span>{t('module.s01.speed')}</span>
            <select
              id="speed-select-HuffmanTreePage"
              value={speedMs}
              onChange={(event) => setSpeed(Number(event.target.value))}
            >
              {SPEED_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.key)}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className="form-error workspace-inline-feedback">{error}</p> : null}
          <div className="tree-workspace-drawer-actions huffman-controls-actions">
            <button type="button" className="tree-workspace-ghost-button" onClick={resetSample}>
              {t('module.t07.resetSample')}
            </button>
            <button type="button" className="tree-workspace-ghost-button" onClick={applyInput}>
              {t('module.t07.apply')}
            </button>
            <button type="button" className="tree-workspace-ghost-button" onClick={randomizeItems}>
              {t('module.t07.randomize')}
            </button>
          </div>
        </div>
      }
      stepContent={
        <div className="workspace-panel-code-only workspace-panel-code-grid-double huffman-code-panel">
          <div className="workspace-panel-linear-code">
            <div className="pseudocode-block pseudocode-block-linear">
              <h3>{t(CODE_TITLE_KEYS[detailMode])}：中文式</h3>
              <ol>
                {codeLines.map((line, index) => {
                  const lineNumber = index + 1;
                  return (
                    <li key={`huffman-cn-${detailMode}-${lineNumber}`} className={activeCodeLines.has(lineNumber) ? 'code-active' : undefined}>
                      {line}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
          <div className="workspace-panel-linear-code huffman-code-panel-c">
            <div className="pseudocode-block pseudocode-block-linear">
              <h3>{t(CODE_TITLE_KEYS[detailMode])}：类 C 式</h3>
              <ol>
                {cStyleCodeLines.map((line, index) => {
                  const lineNumber = index + 1;
                  return (
                    <li key={`huffman-c-${detailMode}-${lineNumber}`} className={activeCodeLines.has(lineNumber) ? 'code-active' : undefined}>
                      <code>{line}</code>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      }
      stageContent={
        <div className="huffman-stage-scene" aria-hidden="true">
          <div className="huffman-stage-regions">
            <div className="huffman-stage-region huffman-stage-region-forest" />
            <div className="huffman-stage-region huffman-stage-region-merge" />
            <div className="huffman-stage-region huffman-stage-region-result" />
          </div>
          {analysisReady ? (
            <div className="huffman-stage-info-rail">
              <div className="huffman-stage-card huffman-stage-card-side">
                <span>{isDetailMode ? t(DETAIL_TITLE_KEYS[detailMode]) : t('module.t07.meta.codes')}</span>
                {detailMode === 'codes' && activeDetailStep ? (
                  <div className="huffman-stage-code-list">
                    {currentCodes.map((entry) => (
                      <code key={entry.label}>
                        {entry.label}: {codeProgressMap.get(entry.label) ?? '-'}
                      </code>
                    ))}
                  </div>
                ) : detailMode === 'wpl' && activeDetailStep ? (
                  <div className="huffman-stage-code-list">
                    {currentCodes.map((entry) => (
                      <code key={entry.label}>
                        {entry.label}: {wplProgressMap.get(entry.label) ?? '-'}
                      </code>
                    ))}
                    <strong>
                      {t('module.t07.meta.wpl')}:{' '}
                      {activeDetailStep.finalTotal ?? activeDetailStep.runningTotal ?? currentWpl ?? '-'}
                    </strong>
                  </div>
                ) : showResultSummary && currentCodes.length ? (
                  <div className="huffman-stage-code-list">
                    {currentCodes.map((entry) => (
                      <code key={entry.label}>
                        {entry.label}: {entry.code}
                      </code>
                    ))}
                    <strong>
                      {t('module.t07.meta.wpl')}: {currentWpl}
                    </strong>
                  </div>
                ) : (
                  <strong>{t('module.t07.meta.pending')}</strong>
                )}
              </div>
            </div>
          ) : null}
          <svg className="tree-edge-layer huffman-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
            {(currentStep?.nodes ?? []).flatMap((node) => {
              const from = positions.get(node.id);
              if (!from) {
                return [];
              }

              return [node.leftId, node.rightId].flatMap((childId, childIndex) => {
                if (!childId) {
                  return [];
                }

                const to = positions.get(childId);
                if (!to) {
                  return [];
                }

                const isActiveEdge =
                  detailMode === 'build'
                    ? currentStep?.mergedId === node.id ||
                      selectedIds.has(childId) ||
                      selectedIds.has(node.id) ||
                      treeIds.has(childId)
                    : activeEdgeKeys.has(edgeKey({ fromId: node.id, toId: childId }));

                const deltaX = to.x - from.x;
                const deltaY = to.y - from.y;
                const distance = Math.max(Math.hypot(deltaX, deltaY), 0.001);
                const startX = from.x + (deltaX / distance) * NODE_RADIUS;
                const startY = from.y + (deltaY / distance) * NODE_RADIUS;
                const endX = to.x - (deltaX / distance) * NODE_RADIUS;
                const endY = to.y - (deltaY / distance) * NODE_RADIUS;
                const midY = (startY + endY) / 2;
                const labelX = (startX + endX) / 2;

                return (
                  <g key={`${node.id}-${childId}`}>
                    <line
                      className={`tree-edge huffman-edge${isActiveEdge ? ' huffman-edge-active' : ''}`}
                      x1={startX}
                      y1={startY}
                      x2={endX}
                      y2={endY}
                    />
                    <text className="huffman-edge-label" x={labelX} y={midY - 0.9}>
                      {childIndex === 0 ? '0' : '1'}
                    </text>
                  </g>
                );
              });
            })}
          </svg>
          <svg className="huffman-node-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="huffman-leaf-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#eef7ff" />
              </linearGradient>
              <linearGradient id="huffman-internal-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f1fff6" />
                <stop offset="100%" stopColor="#ddf4e3" />
              </linearGradient>
            </defs>
            {(currentStep?.nodes ?? []).map((node) => {
              const position = positions.get(node.id);
              if (!position) {
                return null;
              }

              const isSelected = selectedIds.has(node.id);
              const isMerged = currentStep?.mergedId === node.id;
              const isTreeMember = treeIds.has(node.id);
              const nodeClassName = [
                'huffman-node-circle',
                node.leaf ? 'huffman-node-leaf' : 'huffman-node-internal',
                isSelected ? 'huffman-node-selected' : '',
                isMerged ? 'huffman-node-new-root' : '',
                isTreeMember ? 'huffman-node-active-tree' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <g key={node.id}>
                  <circle className={nodeClassName} cx={position.x} cy={position.y} r={NODE_RADIUS} />
                  <text className="huffman-node-text huffman-node-text-label" x={position.x} y={position.y - 0.35}>
                    {node.label}
                  </text>
                  <text className="huffman-node-text huffman-node-text-weight" x={position.x} y={position.y + 0.85}>
                    {`w=${node.weight}`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      }
      transportLeft={
        <>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={isDetailMode ? prevDetail : prev}
            disabled={activeFrameCount === 0 || activeFrame <= 0}
          >
            {t('playback.prev')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn tree-workspace-transport-btn-primary"
            onClick={activeStatus === 'playing' ? (isDetailMode ? pauseDetail : pause) : isDetailMode ? playDetail : play}
            disabled={activeFrameCount === 0 || isAtLastFrame}
          >
            {activeStatus === 'playing' ? t('playback.pause') : t('playback.play')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={isDetailMode ? nextDetail : next}
            disabled={activeFrameCount === 0 || isAtLastFrame}
          >
            {t('playback.next')}
          </button>
          {analysisReady ? (
            <div className="huffman-transport-detail-actions">
              <button
                type="button"
                className={`tree-workspace-ghost-button${detailMode === 'codes' ? ' huffman-stage-detail-button-active' : ''}`}
                onClick={() => startDetailMode('codes')}
              >
                {t('module.t07.generateCodes')}
              </button>
              <button
                type="button"
                className={`tree-workspace-ghost-button${detailMode === 'wpl' ? ' huffman-stage-detail-button-active' : ''}`}
                onClick={() => startDetailMode('wpl')}
              >
                {t('module.t07.generateWpl')}
              </button>
              <button
                type="button"
                className={`tree-workspace-ghost-button${detailMode === 'build' ? ' huffman-stage-detail-button-active' : ''}`}
                onClick={() => {
                  pauseDetail();
                  setDetailMode('build');
                }}
              >
                {t('module.t07.backToBuild')}
              </button>
            </div>
          ) : null}
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={isDetailMode ? resetDetail : reset}
            disabled={activeFrameCount === 0}
          >
            {t('playback.reset')}
          </button>
          <div className="tree-workspace-transport-progress" aria-hidden="true">
            <div
              className="tree-workspace-transport-progress-fill"
              style={{ width: getTimelineProgressWidth(activeFrame, activeFrameCount) }}
            />
          </div>
          <span className="tree-workspace-transport-step">
            {t('playback.step')} {activeFrameCount === 0 ? 0 : activeFrame + 1}/{activeFrameCount}
          </span>
        </>
      }
      transportRight={
        <div className="tree-workspace-legend-row">
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {t('module.t07.legend.selected')}
          </span>
          <span className="tree-workspace-transport-chip">{t('module.t07.legend.newRoot')}</span>
          <span className="tree-workspace-transport-chip">{t('module.t07.legend.codes')}</span>
        </div>
      }
    />
  );
}
