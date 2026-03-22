import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { useI18n } from '../../i18n/useI18n';
import {
  buildBinaryTreeTraversalTimelineFromInput,
} from '../../modules/tree/binaryTreeTraversalTimelineAdapter';
import { buildOffsetEdgeSegment, pickAbsoluteSidePair } from '../../modules/tree/preorderTraceRules';
import type { HighlightType, PlaybackStatus } from '../../types/animation';
import type {
  BinaryTreeGuideEvent,
  BinaryTreeGuideNullHint,
  BinaryTreeInputValue,
  BinaryTreeTraversalMode,
  BinaryTreeTraversalStep,
} from '../../modules/tree/binaryTreeTraversal';

const DEFAULT_SIZE = 7;
const MIN_SIZE = 3;
const MAX_SIZE = 15;
const RECURSION_PANEL_STORAGE_KEY = 't01-recursion-panel-layout-v2';
const RECURSION_PANEL_MARGIN = 16;
const RECURSION_PANEL_MIN_WIDTH = 320;
const RECURSION_PANEL_MIN_HEIGHT = 280;
const RECURSION_PANEL_MAX_WIDTH = 560;
const RECURSION_PANEL_MAX_HEIGHT = 760;
const RECURSION_PANEL_DEFAULT_Y = 88;

type NodePoint = {
  x: number;
  y: number;
};

type ValueDisplayMode = 'number' | 'letter';
type BinaryTreeShapeMode = 'random' | 'complete';

type FloatingPanelRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ViewportSize = {
  width: number;
  height: number;
};

type RecursionPanelInteraction =
  | {
      kind: 'drag';
      pointerId: number;
      offsetX: number;
      offsetY: number;
    }
  | {
      kind: 'resize';
      pointerId: number;
      startX: number;
      startY: number;
      startWidth: number;
      startHeight: number;
      startPanelX: number;
      startPanelY: number;
    };

type RawTraversalTraceSegment = {
  key: string;
  d: string;
  length: number;
  isActive: boolean;
  fromPoint: NodePoint;
  toPoint: NodePoint;
  arrowFromPoint: NodePoint | null;
  arrowToPoint: NodePoint | null;
  targetIndex: number | null;
};

type TraversalTraceSegment = {
  key: string;
  d: string;
  length: number;
  isActive: boolean;
  roughPath: string;
  arrowPath: string | null;
  arrowIsCurrent: boolean;
};

type TraceEntryMarker = {
  key: string;
  nodeIndex: number;
  point: NodePoint;
  label: '1' | '2' | '3';
};

type TraceEntryMarkerReveal = TraceEntryMarker & {
  revealLength: number;
};

type MarkerOffset = {
  x: number;
  y: number;
};

type NodeVisitReveal = {
  nodeIndex: number;
  revealLength: number;
};

type TraceSegmentMetric = {
  length: number;
  start: number;
  end: number;
};

type RouteOrderSegment = {
  key: string;
  d: string;
  order: number;
  pathId: string;
};

type NullEdgePath = {
  key: string;
  d: string;
};

type ParallelGuideSegment = {
  key: string;
  d: string;
  directionMarkerPaths?: string[];
};

type ArcGuidePath = {
  d: string;
  start: NodePoint;
  end: NodePoint;
  direction: ArcDirection;
};

type GuideBranchEndpoint = {
  point: NodePoint;
  towardCenterDirection: NodePoint;
};

type TraceGeometry = {
  aspect: number;
  nodeRadius: number;
  nullRadius: number;
  nodeShellRadius: number;
  nullShellRadius: number;
  edgeOffset: number;
  guideEdgeOffset: number;
  guideNodeClearRadius: number;
  guideNullClearRadius: number;
  arrowSize: number;
  arrowWing: number;
  arrowTipBackoff: number;
};

const DEFAULT_STAGE_WIDTH = 1200;
const DEFAULT_STAGE_HEIGHT = 460;
const TREE_STAGE_TOP = 16;
const TREE_STAGE_BOTTOM = 92;
const TREE_NODE_DIAMETER_PX = 62;
const TREE_NULL_DIAMETER_PX = 24;
const TRACE_SHELL_GAP_PX = 4.5;
const TRACE_EDGE_OFFSET_PX = 4.5;
const TRACE_GUIDE_EDGE_OFFSET_PX = 10;
const TRACE_GUIDE_NODE_CLEAR_PX = 10;
const TRACE_ARROW_SIZE_PX = 8.5;
const TRACE_ARROW_WING_PX = 4.4;
const TRACE_ARROW_TIP_BACKOFF_PX = 1.3;
const TRACE_ENTRY_MARKER_MATCH_EPSILON = 0.08;
const DEFAULT_PAGE_SPEED_MS = 1000;
const TRACE_STEP_DRAW_MIN_MS = 750;
const TRACE_STEP_DRAW_MAX_MS = 1500;
const SHOW_LEGACY_GUIDE_OVERLAY = false;

function createShuffledNodeValues(size: number): number[] {
  const poolSize = Math.max(99, size);
  const values = Array.from({ length: poolSize }, (_, index) => index + 1);

  for (let index = values.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
  }

  return values.slice(0, size);
}

function trimTrailingNulls(values: BinaryTreeInputValue[]): BinaryTreeInputValue[] {
  let end = values.length;
  while (end > 0 && values[end - 1] === null) {
    end -= 1;
  }
  return values.slice(0, end);
}

function buildRandomBinaryTreeIndices(size: number): number[] {
  if (size <= 0) {
    return [];
  }

  const maxLevel = Math.max(1, Math.ceil(Math.log2(size + 1)));
  const indices = new Set<number>([0]);
  let slots = [1, 2];

  while (indices.size < size && slots.length > 0) {
    const eligibleSlots = slots.filter((index) => getNodeLevel(index) <= maxLevel);
    const slotPool = eligibleSlots.length > 0 ? eligibleSlots : slots;
    const slot = slotPool[Math.floor(Math.random() * slotPool.length)] ?? slots[0];
    slots = slots.filter((index) => index !== slot);
    indices.add(slot);

    const left = slot * 2 + 1;
    const right = slot * 2 + 2;
    if (getNodeLevel(left) <= maxLevel) {
      slots.push(left);
    }
    if (getNodeLevel(right) <= maxLevel) {
      slots.push(right);
    }
  }

  return [...indices].sort((left, right) => left - right);
}

function createCompleteBinaryTreeDataset(size: number): BinaryTreeInputValue[] {
  return createShuffledNodeValues(size);
}

function createRandomBinaryTreeDataset(size: number): BinaryTreeInputValue[] {
  const values = createShuffledNodeValues(size);
  const indices = buildRandomBinaryTreeIndices(size);

  if (indices.length === 0) {
    return [];
  }

  const tree = Array<BinaryTreeInputValue>(indices[indices.length - 1] + 1).fill(null);
  indices.forEach((index, valueIndex) => {
    tree[index] = values[valueIndex] ?? null;
  });
  return trimTrailingNulls(tree);
}

function createBinaryTreeDataset(size: number, shapeMode: BinaryTreeShapeMode): BinaryTreeInputValue[] {
  return shapeMode === 'random' ? createRandomBinaryTreeDataset(size) : createCompleteBinaryTreeDataset(size);
}

function hasTreeNode(tree: BinaryTreeInputValue[], index: number): boolean {
  return index >= 0 && index < tree.length && tree[index] !== null;
}

function findLastTreeNodeIndex(tree: BinaryTreeInputValue[]): number {
  for (let index = tree.length - 1; index >= 0; index -= 1) {
    if (tree[index] !== null) {
      return index;
    }
  }
  return -1;
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

function getModeLabel(mode: BinaryTreeTraversalMode, t: ReturnType<typeof useI18n>['t']): string {
  if (mode === 'preorder') {
    return t('module.t01.mode.preorder');
  }
  if (mode === 'inorder') {
    return t('module.t01.mode.inorder');
  }
  if (mode === 'postorder') {
    return t('module.t01.mode.postorder');
  }
  return t('module.t01.mode.levelorder');
}

type RecursiveCodeLine = {
  line: number;
  text: string;
};

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getViewportSize(): ViewportSize {
  if (typeof window === 'undefined') {
    return { width: 1280, height: 720 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

function clampRecursionPanelRect(rect: FloatingPanelRect, viewport: ViewportSize): FloatingPanelRect {
  const maxWidth = Math.max(
    RECURSION_PANEL_MIN_WIDTH,
    Math.min(RECURSION_PANEL_MAX_WIDTH, viewport.width - RECURSION_PANEL_MARGIN * 2),
  );
  const width = clampNumber(rect.width, RECURSION_PANEL_MIN_WIDTH, maxWidth);
  const maxHeight = Math.max(
    RECURSION_PANEL_MIN_HEIGHT,
    Math.min(RECURSION_PANEL_MAX_HEIGHT, viewport.height - RECURSION_PANEL_MARGIN * 2),
  );
  const height = clampNumber(rect.height, RECURSION_PANEL_MIN_HEIGHT, maxHeight);
  const maxX = Math.max(RECURSION_PANEL_MARGIN, viewport.width - width - RECURSION_PANEL_MARGIN);
  const maxY = Math.max(RECURSION_PANEL_MARGIN, viewport.height - height - RECURSION_PANEL_MARGIN);

  return {
    x: clampNumber(rect.x, RECURSION_PANEL_MARGIN, maxX),
    y: clampNumber(rect.y, RECURSION_PANEL_MARGIN, maxY),
    width,
    height,
  };
}

function getDefaultRecursionPanelRect(viewport: ViewportSize): FloatingPanelRect {
  const maxWidth = Math.max(
    RECURSION_PANEL_MIN_WIDTH,
    Math.min(RECURSION_PANEL_MAX_WIDTH, viewport.width - RECURSION_PANEL_MARGIN * 2),
  );
  const maxHeight = Math.max(
    RECURSION_PANEL_MIN_HEIGHT,
    Math.min(RECURSION_PANEL_MAX_HEIGHT, viewport.height - RECURSION_PANEL_MARGIN * 2),
  );
  const width = Math.min(440, maxWidth);
  const height = Math.min(560, maxHeight);

  return clampRecursionPanelRect(
    {
      x: viewport.width - width - RECURSION_PANEL_MARGIN,
      y: RECURSION_PANEL_DEFAULT_Y,
      width,
      height,
    },
    viewport,
  );
}

function readStoredRecursionPanelRect(viewport: ViewportSize): FloatingPanelRect | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(RECURSION_PANEL_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<FloatingPanelRect>;
    if (
      typeof parsed.x !== 'number' ||
      typeof parsed.y !== 'number' ||
      typeof parsed.width !== 'number' ||
      typeof parsed.height !== 'number'
    ) {
      return null;
    }

    return clampRecursionPanelRect(
      {
        x: parsed.x,
        y: parsed.y,
        width: parsed.width,
        height: parsed.height,
      },
      viewport,
    );
  } catch {
    return null;
  }
}

type RecursiveCodeVariant = 'preorder' | 'inorder' | 'postorder';

type RecursiveCodeSpec = {
  leftCallLine: number;
  visitLine: number;
  rightCallLine: number;
  returnLine: number;
};

type AlgorithmCodeVariant = RecursiveCodeVariant | 'levelorder';

const RECURSIVE_CODE_LINE_KEYS = {
  preorder: [
    'module.t01.recursion.code.preorder.line1',
    'module.t01.recursion.code.preorder.line2',
    'module.t01.recursion.code.preorder.line3',
    'module.t01.recursion.code.preorder.line4',
    'module.t01.recursion.code.preorder.line5',
    'module.t01.recursion.code.preorder.line6',
  ],
  inorder: [
    'module.t01.recursion.code.inorder.line1',
    'module.t01.recursion.code.inorder.line2',
    'module.t01.recursion.code.inorder.line3',
    'module.t01.recursion.code.inorder.line4',
    'module.t01.recursion.code.inorder.line5',
    'module.t01.recursion.code.inorder.line6',
  ],
  postorder: [
    'module.t01.recursion.code.postorder.line1',
    'module.t01.recursion.code.postorder.line2',
    'module.t01.recursion.code.postorder.line3',
    'module.t01.recursion.code.postorder.line4',
    'module.t01.recursion.code.postorder.line5',
    'module.t01.recursion.code.postorder.line6',
  ],
} as const;

const LEVELORDER_CODE_LINE_KEYS = [
  'module.t01.levelorder.code.line1',
  'module.t01.levelorder.code.line2',
  'module.t01.levelorder.code.line3',
  'module.t01.levelorder.code.line4',
  'module.t01.levelorder.code.line5',
  'module.t01.levelorder.code.line6',
  'module.t01.levelorder.code.line7',
  'module.t01.levelorder.code.line8',
] as const;

function getAlgorithmCodeVariant(mode: BinaryTreeTraversalMode): AlgorithmCodeVariant {
  if (mode === 'levelorder') {
    return 'levelorder';
  }

  return getRecursiveCodeVariant(mode);
}

function getRecursiveCodeVariant(mode: BinaryTreeTraversalMode): RecursiveCodeVariant {
  if (mode === 'inorder' || mode === 'postorder') {
    return mode;
  }

  return 'preorder';
}

function buildRecursiveCodeLines(
  mode: BinaryTreeTraversalMode,
  t: ReturnType<typeof useI18n>['t'],
): RecursiveCodeLine[] {
  const variant = getRecursiveCodeVariant(mode);

  return RECURSIVE_CODE_LINE_KEYS[variant].map((key, index) => ({
    line: index + 1,
    text: t(key),
  }));
}

function buildAlgorithmCodeLines(
  mode: BinaryTreeTraversalMode,
  t: ReturnType<typeof useI18n>['t'],
): RecursiveCodeLine[] {
  const variant = getAlgorithmCodeVariant(mode);

  if (variant === 'levelorder') {
    return LEVELORDER_CODE_LINE_KEYS.map((key, index) => ({
      line: index + 1,
      text: t(key),
    }));
  }

  return buildRecursiveCodeLines(mode, t);
}

function getRecursiveCodeSpec(mode: BinaryTreeTraversalMode): RecursiveCodeSpec {
  if (mode === 'inorder') {
    return {
      leftCallLine: 3,
      visitLine: 4,
      rightCallLine: 5,
      returnLine: 6,
    };
  }

  if (mode === 'postorder') {
    return {
      leftCallLine: 3,
      visitLine: 5,
      rightCallLine: 4,
      returnLine: 6,
    };
  }

  return {
    leftCallLine: 4,
    visitLine: 3,
    rightCallLine: 5,
    returnLine: 6,
  };
}

function getBacktrackSourceSide(step: BinaryTreeTraversalStep | undefined): 'L' | 'R' | null {
  if (!step) {
    return null;
  }

  if (step.action === 'backtrackFromNull') {
    return step.guideNull?.side ?? step.recursionNullSide;
  }

  if (step.action !== 'backtrack' || step.activeGuideEventIndex === null) {
    return null;
  }

  const event = step.guideEvents[step.activeGuideEventIndex];
  if (!event || event.type !== 'move' || event.side !== 'UP') {
    return null;
  }

  return event.fromIndex === getChildIndex(event.toIndex, 'L') ? 'L' : 'R';
}

function getRecursiveCodeActiveLines(
  step: BinaryTreeTraversalStep | undefined,
  mode: BinaryTreeTraversalMode,
): number[] {
  if (!step) {
    return [];
  }

  const codeSpec = getRecursiveCodeSpec(mode);

  if (step.action === 'guideStart' || step.action === 'descendLeft' || step.action === 'descendRight') {
    return mode === 'preorder' ? [codeSpec.visitLine, codeSpec.leftCallLine] : [codeSpec.leftCallLine];
  }

  if (step.action === 'nullLeft') {
    return [codeSpec.leftCallLine, 2];
  }

  if (step.action === 'nullRight') {
    return [codeSpec.rightCallLine, 2];
  }

  if (step.action === 'visit') {
    if (mode === 'inorder') {
      return [codeSpec.visitLine, codeSpec.rightCallLine];
    }

    if (mode === 'postorder') {
      return [codeSpec.visitLine, codeSpec.returnLine];
    }

    return [codeSpec.visitLine, codeSpec.leftCallLine];
  }

  if (step.action === 'backtrack' || step.action === 'backtrackFromNull') {
    const side = getBacktrackSourceSide(step);
    if (side === 'L') {
      return mode === 'inorder' ? [codeSpec.visitLine] : [codeSpec.rightCallLine];
    }
    if (side === 'R') {
      return mode === 'postorder' ? [codeSpec.visitLine] : [codeSpec.returnLine];
    }
  }

  if (step.action === 'traversalDone' || step.action === 'completed') {
    return [codeSpec.returnLine];
  }

  return [];
}

function getLevelorderCodeActiveLines(step: BinaryTreeTraversalStep | undefined, treeState: BinaryTreeInputValue[]): number[] {
  if (!step) {
    return [];
  }

  if (step.action === 'initial') {
    return step.queueState.length > 0 ? [1, 2, 3] : [1];
  }

  if (step.action === 'visit' && step.currentIndex !== null) {
    const currentIndex = step.currentIndex;
    const codeLines = [3, 4, 5];
    if (hasTreeNode(treeState, currentIndex * 2 + 1)) {
      codeLines.push(6);
    }
    if (hasTreeNode(treeState, currentIndex * 2 + 2)) {
      codeLines.push(7);
    }
    return codeLines;
  }

  if (step.action === 'traversalDone' || step.action === 'completed') {
    return [8];
  }

  return [];
}

function getAlgorithmCodeActiveLines(
  step: BinaryTreeTraversalStep | undefined,
  mode: BinaryTreeTraversalMode,
  treeState: BinaryTreeInputValue[],
): number[] {
  if (mode === 'levelorder') {
    return getLevelorderCodeActiveLines(step, treeState);
  }

  return getRecursiveCodeActiveLines(step, mode);
}

function getRecursionCheckpointText(
  checkpoint: TraceEntryMarker['label'] | null,
  t: ReturnType<typeof useI18n>['t'],
): string | null {
  if (checkpoint === '1') {
    return t('module.t01.recursion.point1');
  }

  if (checkpoint === '2') {
    return t('module.t01.recursion.point2');
  }

  if (checkpoint === '3') {
    return t('module.t01.recursion.point3');
  }

  return null;
}

function getRecursionStatusText(
  step: BinaryTreeTraversalStep | undefined,
  t: ReturnType<typeof useI18n>['t'],
): string {
  if (!step || step.action === 'initial') {
    return t('module.t01.recursion.status.idle');
  }

  if (step.action === 'nullLeft') {
    return t('module.t01.recursion.status.nullLeft');
  }

  if (step.action === 'nullRight') {
    return t('module.t01.recursion.status.nullRight');
  }

  if (step.action === 'traversalDone' || step.action === 'completed') {
    return t('module.t01.recursion.status.complete');
  }

  return getRecursionCheckpointText(step.recursionCheckpoint, t) ?? t('module.t01.recursion.status.idle');
}

function getLevelorderStatusText(
  step: BinaryTreeTraversalStep | undefined,
  t: ReturnType<typeof useI18n>['t'],
  formatValue: (value: number | null | undefined) => string,
): string {
  if (!step || step.action === 'initial') {
    return step?.queueState.length ? t('module.t01.levelorder.status.ready') : t('module.t01.levelorder.status.idle');
  }

  if (step.action === 'visit') {
    const currentLabel = formatValue(step.currentValue);
    return `${t('module.t01.levelorder.status.processing')} ${currentLabel} · ${t('module.t01.levelorder.status.queueSize')} ${step.queueState.length}`;
  }

  if (step.action === 'traversalDone' || step.action === 'completed') {
    return t('module.t01.levelorder.status.complete');
  }

  return t('module.t01.levelorder.status.ready');
}

function getAlgorithmStatusText(
  step: BinaryTreeTraversalStep | undefined,
  mode: BinaryTreeTraversalMode,
  t: ReturnType<typeof useI18n>['t'],
  formatValue: (value: number | null | undefined) => string,
): string {
  if (mode === 'levelorder') {
    return getLevelorderStatusText(step, t, formatValue);
  }

  return getRecursionStatusText(step, t);
}

function isRecursionVisitStep(
  step: BinaryTreeTraversalStep | undefined,
  mode: BinaryTreeTraversalMode,
): boolean {
  if (!step) {
    return false;
  }

  if (mode === 'preorder') {
    return step.action === 'guideStart' || step.action === 'descendLeft' || step.action === 'descendRight';
  }

  if (mode === 'inorder' || mode === 'postorder') {
    return step.action === 'visit';
  }

  return false;
}

function getStepDescription(
  step: BinaryTreeTraversalStep | undefined,
  t: ReturnType<typeof useI18n>['t'],
  formatValue: (value: number | null) => string,
): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.t01.step.initial');
  }
  if (step.action === 'guideStart') {
    return t('module.t01.step.guideStart');
  }
  if (step.action === 'visit') {
    return `${t('module.t01.step.visit')} ${step.currentIndex} (${formatValue(step.currentValue)})`;
  }
  if (step.action === 'descendLeft') {
    return t('module.t01.step.descendLeft');
  }
  if (step.action === 'descendRight') {
    return t('module.t01.step.descendRight');
  }
  if (step.action === 'nullLeft') {
    return t('module.t01.step.nullLeft');
  }
  if (step.action === 'nullRight') {
    return t('module.t01.step.nullRight');
  }
  if (step.action === 'backtrack') {
    return t('module.t01.step.backtrack');
  }
  if (step.action === 'backtrackFromNull') {
    return t('module.t01.step.backtrackFromNull');
  }
  if (step.action === 'traversalDone') {
    return t('module.t01.step.done');
  }

  return t('module.t01.step.completed');
}

function getHighlightLabel(type: HighlightType, t: ReturnType<typeof useI18n>['t']): string {
  if (type === 'visiting') {
    return t('module.sr01.highlight.visited');
  }
  if (type === 'matched') {
    return t('module.sr01.highlight.found');
  }
  return t('module.s01.highlight.default');
}

function formatTreePreviewValue(value: BinaryTreeInputValue): string {
  return value === null ? 'null' : String(value);
}

function formatArrayPreview(values: BinaryTreeInputValue[], maxVisible = 24): string {
  if (values.length <= maxVisible) {
    return values.map((value) => formatTreePreviewValue(value)).join(', ');
  }
  const leftCount = Math.floor(maxVisible / 2);
  const rightCount = maxVisible - leftCount;
  const leftPart = values.slice(0, leftCount).map((value) => formatTreePreviewValue(value)).join(', ');
  const rightPart = values.slice(-rightCount).map((value) => formatTreePreviewValue(value)).join(', ');
  return `${leftPart}, ..., ${rightPart} (n=${values.length})`;
}

function clampPoint(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function toAlphabetLabel(index: number): string {
  let label = '';
  let cursor = index;

  do {
    const remainder = cursor % 26;
    label = String.fromCharCode(65 + remainder) + label;
    cursor = Math.floor(cursor / 26) - 1;
  } while (cursor >= 0);

  return label;
}

function getChildIndex(parentIndex: number, side: 'L' | 'R'): number {
  return parentIndex * 2 + (side === 'L' ? 1 : 2);
}

function getNodeLevel(index: number): number {
  return Math.floor(Math.log2(index + 1));
}

function getTreePointByIndex(index: number, top: number, yStep: number): NodePoint {
  const level = getNodeLevel(index);
  const firstIndexOfLevel = 2 ** level - 1;
  const positionInLevel = index - firstIndexOfLevel;
  const nodesInLevel = 2 ** level;
  const x = ((positionInLevel + 1) / (nodesInLevel + 1)) * 100;
  const y = clampPoint(top + level * yStep, 2, 98);
  return { x, y };
}

function getNodeCenter(nodePositions: NodePoint[], nodeIndex: number): NodePoint | null {
  const node = nodePositions[nodeIndex];
  if (!node) {
    return null;
  }
  return { ...node };
}

function getNullPoint(parentIndex: number, side: 'L' | 'R', top: number, yStep: number): NodePoint {
  const childIndex = getChildIndex(parentIndex, side);
  return getTreePointByIndex(childIndex, top, yStep);
}

function normalizeDirection(dx: number, dy: number, fallbackX: number, fallbackY: number): NodePoint {
  const length = Math.hypot(dx, dy);
  if (length <= 0.0001) {
    return { x: fallbackX, y: fallbackY };
  }
  return {
    x: dx / length,
    y: dy / length,
  };
}

function formatPoint(point: NodePoint): string {
  return `${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
}

function clampTracePoint(point: NodePoint): NodePoint {
  return {
    x: clampPoint(point.x, 2, 98),
    y: clampPoint(point.y, 2, 98),
  };
}

function toMetricPoint(point: NodePoint, aspect: number): NodePoint {
  return {
    x: point.x * aspect,
    y: point.y,
  };
}

function fromMetricPoint(point: NodePoint, aspect: number): NodePoint {
  return clampTracePoint({
    x: point.x / aspect,
    y: point.y,
  });
}

function metricDistance(from: NodePoint, to: NodePoint, aspect: number): number {
  const fromMetric = toMetricPoint(from, aspect);
  const toMetric = toMetricPoint(to, aspect);
  return Math.hypot(toMetric.x - fromMetric.x, toMetric.y - fromMetric.y);
}

function pointOnMetricCircle(center: NodePoint, radius: number, angle: number, aspect: number): NodePoint {
  const centerMetric = toMetricPoint(center, aspect);
  return fromMetricPoint(
    {
      x: centerMetric.x + Math.cos(angle) * radius,
      y: centerMetric.y + Math.sin(angle) * radius,
    },
    aspect,
  );
}

function normalizePositiveAngle(angle: number): number {
  let normalized = angle;
  while (normalized < 0) {
    normalized += Math.PI * 2;
  }
  while (normalized >= Math.PI * 2) {
    normalized -= Math.PI * 2;
  }
  return normalized;
}

type ArcDirection = 'cw' | 'ccw';

function resolveArcDelta(
  startAngle: number,
  endAngle: number,
  preferredDirection: ArcDirection,
  longArc: boolean,
): number {
  const clockwiseDelta = normalizePositiveAngle(endAngle - startAngle);
  const counterClockwiseDelta = clockwiseDelta - Math.PI * 2;
  const preferred = preferredDirection === 'cw' ? clockwiseDelta : counterClockwiseDelta;
  const shortDelta = Math.abs(clockwiseDelta) <= Math.abs(counterClockwiseDelta) ? clockwiseDelta : counterClockwiseDelta;
  const longDelta = Math.abs(clockwiseDelta) > Math.abs(counterClockwiseDelta) ? clockwiseDelta : counterClockwiseDelta;

  if (longArc) {
    if (Math.abs(preferred) > Math.PI + 0.0001) {
      return preferred;
    }
    return longDelta;
  }

  if (Math.abs(preferred) <= Math.PI + 0.0001) {
    return preferred;
  }
  return shortDelta;
}

function getPointAngleAroundCenter(point: NodePoint, center: NodePoint, aspect: number): number {
  const centerMetric = toMetricPoint(center, aspect);
  const pointMetric = toMetricPoint(point, aspect);
  return Math.atan2(pointMetric.y - centerMetric.y, pointMetric.x - centerMetric.x);
}

type MutableTracePath = {
  commands: string[];
  cursor: NodePoint;
  length: number;
  aspect: number;
};

function createTracePath(start: NodePoint, aspect: number): MutableTracePath {
  return {
    commands: [`M ${formatPoint(start)}`],
    cursor: start,
    length: 0,
    aspect,
  };
}

function appendTraceLine(path: MutableTracePath, to: NodePoint): void {
  const target = clampTracePoint(to);
  const distance = metricDistance(path.cursor, target, path.aspect);
  if (distance <= 0.02) {
    path.cursor = target;
    return;
  }
  path.commands.push(`L ${formatPoint(target)}`);
  path.length += distance;
  path.cursor = target;
}

function appendTraceArc(
  path: MutableTracePath,
  config: {
    center: NodePoint;
    radius: number;
    to: NodePoint;
    preferredDirection: ArcDirection;
    longArc?: boolean;
  },
): void {
  const target = clampTracePoint(config.to);
  if (metricDistance(path.cursor, target, path.aspect) <= 0.02) {
    path.cursor = target;
    return;
  }

  const centerMetric = toMetricPoint(config.center, path.aspect);
  const startMetric = toMetricPoint(path.cursor, path.aspect);
  const endMetric = toMetricPoint(target, path.aspect);
  const startRadius = Math.hypot(startMetric.x - centerMetric.x, startMetric.y - centerMetric.y);
  const endRadius = Math.hypot(endMetric.x - centerMetric.x, endMetric.y - centerMetric.y);
  const expectedRadius = Math.max(config.radius, 0.08);

  if (Math.abs(startRadius - expectedRadius) > 0.9 || Math.abs(endRadius - expectedRadius) > 0.9) {
    appendTraceLine(path, target);
    return;
  }

  const startAngle = Math.atan2(startMetric.y - centerMetric.y, startMetric.x - centerMetric.x);
  const endAngle = Math.atan2(endMetric.y - centerMetric.y, endMetric.x - centerMetric.x);
  const delta = resolveArcDelta(startAngle, endAngle, config.preferredDirection, config.longArc ?? false);

  if (Math.abs(delta) <= 0.035) {
    appendTraceLine(path, target);
    return;
  }

  const radiusX = expectedRadius / path.aspect;
  const largeArcFlag = Math.abs(delta) > Math.PI ? 1 : 0;
  const sweepFlag = delta > 0 ? 1 : 0;
  path.commands.push(
    `A ${radiusX.toFixed(2)} ${expectedRadius.toFixed(2)} 0 ${largeArcFlag} ${sweepFlag} ${formatPoint(target)}`,
  );
  path.length += Math.abs(delta) * expectedRadius;
  path.cursor = target;
}

function buildTraceGeometry(stageWidth: number, stageHeight: number): TraceGeometry {
  const width = Math.max(stageWidth, 1);
  const height = Math.max(stageHeight, 1);
  const unitY = 100 / height;
  const nodeRadius = (TREE_NODE_DIAMETER_PX / 2) * unitY;
  const nullRadius = (TREE_NULL_DIAMETER_PX / 2) * unitY;
  const nodeShellRadius = (TREE_NODE_DIAMETER_PX / 2 + TRACE_SHELL_GAP_PX) * unitY;
  const nullShellRadius = (TREE_NULL_DIAMETER_PX / 2 + TRACE_SHELL_GAP_PX) * unitY;
  const edgeOffsetCap = Math.max(Math.min(nodeShellRadius, nullShellRadius) - 0.12, 0.1);
  const edgeOffset = Math.min(TRACE_EDGE_OFFSET_PX * unitY, edgeOffsetCap);
  const guideNodeClearRadius = nodeRadius + TRACE_GUIDE_NODE_CLEAR_PX * unitY;
  const guideNullClearRadius = nullRadius + TRACE_GUIDE_NODE_CLEAR_PX * unitY;
  const guideOffsetCap = Math.max(guideNodeClearRadius - 0.08, 0.08);
  const guideEdgeOffset = Math.min(TRACE_GUIDE_EDGE_OFFSET_PX * unitY, guideOffsetCap);

  return {
    aspect: width / height,
    nodeRadius,
    nullRadius,
    nodeShellRadius,
    nullShellRadius,
    edgeOffset,
    guideEdgeOffset,
    guideNodeClearRadius,
    guideNullClearRadius,
    arrowSize: TRACE_ARROW_SIZE_PX * unitY,
    arrowWing: TRACE_ARROW_WING_PX * unitY,
    arrowTipBackoff: TRACE_ARROW_TIP_BACKOFF_PX * unitY,
  };
}

function getRootTraceEntry(rootCenter: NodePoint, geometry: TraceGeometry): NodePoint {
  const entryAngle = Math.PI * 0.82;
  return pointOnMetricCircle(rootCenter, geometry.guideNodeClearRadius, entryAngle, geometry.aspect);
}

function getRootTopEntryAnchor(rootCenter: NodePoint, geometry: TraceGeometry): NodePoint {
  return pointOnMetricCircle(rootCenter, geometry.guideNodeClearRadius, -Math.PI / 2, geometry.aspect);
}

function getRootTopEntryStart(rootEntryAnchor: NodePoint, geometry: TraceGeometry): NodePoint {
  const pxToUnitY = geometry.nodeRadius / (TREE_NODE_DIAMETER_PX / 2);
  return {
    x: rootEntryAnchor.x,
    y: clampPoint(rootEntryAnchor.y - 30 * pxToUnitY, 0.35, 98),
  };
}

function buildGuideAbsoluteLanePair(config: {
  from: NodePoint;
  to: NodePoint;
  fromRadius: number;
  toRadius: number;
  geometry: TraceGeometry;
}) {
  return pickAbsoluteSidePair({
    from: config.from,
    to: config.to,
    fromRadius: config.fromRadius,
    toRadius: config.toRadius,
    edgeOffset: config.geometry.guideEdgeOffset,
    aspect: config.geometry.aspect,
  });
}

function resolveRootRouteStartFromGuideEvents(
  rootIndex: number,
  eventIndex: number,
  guideEvents: BinaryTreeGuideEvent[],
  nodePositions: NodePoint[],
  top: number,
  yStep: number,
  geometry: TraceGeometry,
): NodePoint | null {
  const rootCenter = getNodeCenter(nodePositions, rootIndex);
  if (!rootCenter) {
    return null;
  }

  for (let nextIndex = eventIndex + 1; nextIndex < guideEvents.length; nextIndex += 1) {
    const nextEvent = guideEvents[nextIndex];
    if (!nextEvent) {
      continue;
    }

    if (nextEvent.type === 'move' && nextEvent.fromIndex === rootIndex) {
      const childCenter = getNodeCenter(nodePositions, nextEvent.toIndex);
      if (!childCenter) {
        return null;
      }
      const lanes = buildGuideAbsoluteLanePair({
        from: rootCenter,
        to: childCenter,
        fromRadius: geometry.guideNodeClearRadius,
        toRadius: geometry.guideNodeClearRadius,
        geometry,
      });
      return lanes.left.start;
    }

    if (nextEvent.type === 'toNull' && nextEvent.fromIndex === rootIndex) {
      const nullCenter = getNullPoint(rootIndex, nextEvent.side, top, yStep);
      const lanes = buildGuideAbsoluteLanePair({
        from: rootCenter,
        to: nullCenter,
        fromRadius: geometry.guideNodeClearRadius,
        toRadius: geometry.guideNullClearRadius,
        geometry,
      });
      return lanes.left.start;
    }
  }

  return null;
}

function buildDirectedArcPath(
  center: NodePoint,
  radius: number,
  fromPoint: NodePoint,
  toPoint: NodePoint,
  aspect: number,
  preferredDirection: ArcDirection,
  longArc = false,
): ArcGuidePath | null {
  const path = createTracePath(fromPoint, aspect);
  appendTraceArc(path, {
    center,
    radius,
    to: toPoint,
    preferredDirection,
    longArc,
  });

  if (path.commands.length <= 1) {
    return null;
  }

  return {
    d: path.commands.join(' '),
    start: fromPoint,
    end: toPoint,
    direction: preferredDirection,
  };
}

function buildTraceNodeArrowPath(from: NodePoint, to: NodePoint, geometry: TraceGeometry): string {
  const fromMetric = toMetricPoint(from, geometry.aspect);
  const toMetric = toMetricPoint(to, geometry.aspect);
  const direction = normalizeDirection(toMetric.x - fromMetric.x, toMetric.y - fromMetric.y, 1, 0);
  const perpendicular = { x: -direction.y, y: direction.x };
  const tipMetric = {
    x: toMetric.x - direction.x * geometry.arrowTipBackoff,
    y: toMetric.y - direction.y * geometry.arrowTipBackoff,
  };
  const baseMetric = {
    x: tipMetric.x - direction.x * geometry.arrowSize,
    y: tipMetric.y - direction.y * geometry.arrowSize,
  };
  const leftMetric = {
    x: baseMetric.x + perpendicular.x * geometry.arrowWing,
    y: baseMetric.y + perpendicular.y * geometry.arrowWing,
  };
  const rightMetric = {
    x: baseMetric.x - perpendicular.x * geometry.arrowWing,
    y: baseMetric.y - perpendicular.y * geometry.arrowWing,
  };

  return `M ${formatPoint(fromMetricPoint(leftMetric, geometry.aspect))} L ${formatPoint(fromMetricPoint(tipMetric, geometry.aspect))} L ${formatPoint(fromMetricPoint(rightMetric, geometry.aspect))} Z`;
}

function buildHandDrawnTracePath(_key: string, d: string): string {
  // Keep exact geometry for shell-style routing; rough perturbation breaks fixed-offset constraints.
  return d;
}

function buildLineLikeTraceSegment(config: {
  key: string;
  isActive: boolean;
  targetIndex: number | null;
  penPoint: NodePoint | null;
  pivotCenter: NodePoint;
  pivotRadius: number;
  lineStart: NodePoint;
  lineEnd: NodePoint;
  geometry: TraceGeometry;
  connectorDirection: ArcDirection;
  connectorLongArc?: boolean;
}): RawTraversalTraceSegment {
  const pathStart = config.penPoint ?? config.lineStart;
  const path = createTracePath(pathStart, config.geometry.aspect);
  const connectorDistance = config.penPoint
    ? metricDistance(config.penPoint, config.lineStart, config.geometry.aspect)
    : 0;

  if (config.penPoint && connectorDistance > 0.03) {
    appendTraceArc(path, {
      center: config.pivotCenter,
      radius: config.pivotRadius,
      to: config.lineStart,
      preferredDirection: config.connectorDirection,
      longArc: config.connectorLongArc ?? false,
    });
  } else if (config.penPoint && connectorDistance > 0.003) {
    appendTraceLine(path, config.lineStart);
  }

  appendTraceLine(path, config.lineStart);
  appendTraceLine(path, config.lineEnd);

  return {
    key: config.key,
    d: path.commands.join(' '),
    length: Math.max(path.length, 1),
    isActive: config.isActive,
    fromPoint: pathStart,
    toPoint: config.lineEnd,
    arrowFromPoint: config.lineStart,
    arrowToPoint: config.lineEnd,
    targetIndex: config.targetIndex,
  };
}

function createRawLineTraceSegment(config: {
  key: string;
  fromPoint: NodePoint;
  toPoint: NodePoint;
  isActive: boolean;
  targetIndex: number | null;
  geometry: TraceGeometry;
}): RawTraversalTraceSegment {
  return {
    key: config.key,
    d: `M ${formatPoint(config.fromPoint)} L ${formatPoint(config.toPoint)}`,
    length: Math.max(metricDistance(config.fromPoint, config.toPoint, config.geometry.aspect), 1),
    isActive: config.isActive,
    fromPoint: config.fromPoint,
    toPoint: config.toPoint,
    arrowFromPoint: config.fromPoint,
    arrowToPoint: config.toPoint,
    targetIndex: config.targetIndex,
  };
}

function createRawArcTraceSegment(config: {
  key: string;
  center: NodePoint;
  radius: number;
  fromPoint: NodePoint;
  toPoint: NodePoint;
  preferredDirection: ArcDirection;
  longArc?: boolean;
  isActive: boolean;
  targetIndex: number | null;
  geometry: TraceGeometry;
}): RawTraversalTraceSegment | null {
  const arcPath = buildDirectedArcPath(
    config.center,
    config.radius,
    config.fromPoint,
    config.toPoint,
    config.geometry.aspect,
    config.preferredDirection,
    config.longArc ?? false,
  );
  if (!arcPath) {
    return null;
  }

  return {
    key: config.key,
    d: arcPath.d,
    length: Math.max(metricDistance(config.fromPoint, config.toPoint, config.geometry.aspect), 1),
    isActive: config.isActive,
    fromPoint: arcPath.start,
    toPoint: arcPath.end,
    arrowFromPoint: null,
    arrowToPoint: null,
    targetIndex: config.targetIndex,
  };
}

function hasTraceArrowAnchor(
  segment: RawTraversalTraceSegment,
): segment is RawTraversalTraceSegment & { arrowFromPoint: NodePoint; arrowToPoint: NodePoint } {
  return segment.arrowFromPoint !== null && segment.arrowToPoint !== null;
}

function getTraversalLaneForTreeMove(_side: 'L' | 'R', isUpMove: boolean): 'L' | 'R' {
  if (isUpMove) {
    return 'R';
  }
  return 'L';
}

function inferEdgeSide(fromIndex: number, toIndex: number): 'L' | 'R' {
  if (toIndex === getChildIndex(fromIndex, 'L') || fromIndex === getChildIndex(toIndex, 'L')) {
    return 'L';
  }
  return 'R';
}

function buildGuideRawTraceSegments(
  guideEvents: BinaryTreeGuideEvent[],
  activeGuideEventIndex: number | null,
  nodePositions: NodePoint[],
  top: number,
  yStep: number,
  geometry: TraceGeometry,
  rootGuideEvents: BinaryTreeGuideEvent[] = guideEvents,
): RawTraversalTraceSegment[] {
  const segments: RawTraversalTraceSegment[] = [];
  let penPoint: NodePoint | null = null;

  guideEvents.forEach((event, index) => {
    if (event.type === 'start') {
      const root = getNodeCenter(nodePositions, event.toIndex);
      if (!root) {
        return;
      }
      const rootEntryAnchor = getRootTopEntryAnchor(root, geometry);
      const rootEntryStart = getRootTopEntryStart(rootEntryAnchor, geometry);
      const rootEntry =
        resolveRootRouteStartFromGuideEvents(event.toIndex, index, rootGuideEvents, nodePositions, top, yStep, geometry) ??
        getRootTraceEntry(root, geometry);

      segments.push(
        createRawLineTraceSegment({
          key: `guide-root-entry-line-${index}`,
          fromPoint: rootEntryStart,
          toPoint: rootEntryAnchor,
          isActive: false,
          targetIndex: event.toIndex,
          geometry,
        }),
      );

      const rootArc = createRawArcTraceSegment({
        key: `guide-root-entry-arc-${index}`,
        center: root,
        radius: geometry.guideNodeClearRadius,
        fromPoint: rootEntryAnchor,
        toPoint: rootEntry,
        preferredDirection: 'ccw',
        isActive: activeGuideEventIndex === index,
        targetIndex: event.toIndex,
        geometry,
      });
      if (rootArc) {
        segments.push(rootArc);
      }

      penPoint = rootEntry;
      return;
    }

    if (event.type === 'move') {
      if (event.side === 'UP') {
        const childCenter = getNodeCenter(nodePositions, event.fromIndex);
        const parentCenter = getNodeCenter(nodePositions, event.toIndex);
        if (!childCenter || !parentCenter) {
          return;
        }
        const lanes = buildGuideAbsoluteLanePair({
          from: parentCenter,
          to: childCenter,
          fromRadius: geometry.guideNodeClearRadius,
          toRadius: geometry.guideNodeClearRadius,
          geometry,
        });
        const segment = buildLineLikeTraceSegment({
          key: `guide-move-${index}`,
          isActive: activeGuideEventIndex === index,
          targetIndex: event.toIndex,
          penPoint,
          pivotCenter: childCenter,
          pivotRadius: geometry.guideNodeClearRadius,
          lineStart: lanes.right.end,
          lineEnd: lanes.right.start,
          geometry,
          connectorDirection: 'ccw',
        });
        segments.push(segment);
        penPoint = segment.toPoint;
        return;
      }

      const parentCenter = getNodeCenter(nodePositions, event.fromIndex);
      const childCenter = getNodeCenter(nodePositions, event.toIndex);
      if (!parentCenter || !childCenter) {
        return;
      }
      const lanes = buildGuideAbsoluteLanePair({
        from: parentCenter,
        to: childCenter,
        fromRadius: geometry.guideNodeClearRadius,
        toRadius: geometry.guideNodeClearRadius,
        geometry,
      });
      const segment = buildLineLikeTraceSegment({
        key: `guide-move-${index}`,
        isActive: activeGuideEventIndex === index,
        targetIndex: event.toIndex,
        penPoint,
        pivotCenter: parentCenter,
        pivotRadius: geometry.guideNodeClearRadius,
        lineStart: lanes.left.start,
        lineEnd: lanes.left.end,
        geometry,
        connectorDirection: 'ccw',
      });
      segments.push(segment);
      penPoint = segment.toPoint;
      return;
    }

    if (event.type === 'toNull') {
      const parentCenter = getNodeCenter(nodePositions, event.fromIndex);
      if (!parentCenter) {
        return;
      }
      const nullCenter = getNullPoint(event.fromIndex, event.side, top, yStep);
      const lanes = buildGuideAbsoluteLanePair({
        from: parentCenter,
        to: nullCenter,
        fromRadius: geometry.guideNodeClearRadius,
        toRadius: geometry.guideNullClearRadius,
        geometry,
      });
      const segment = buildLineLikeTraceSegment({
        key: `guide-null-enter-${index}`,
        isActive: activeGuideEventIndex === index,
        targetIndex: null,
        penPoint,
        pivotCenter: parentCenter,
        pivotRadius: geometry.guideNodeClearRadius,
        lineStart: lanes.left.start,
        lineEnd: lanes.left.end,
        geometry,
        connectorDirection: 'ccw',
      });
      segments.push(segment);
      penPoint = segment.toPoint;
      return;
    }

    const parentCenter = getNodeCenter(nodePositions, event.toIndex);
    if (!parentCenter) {
      return;
    }
    const nullCenter = getNullPoint(event.toIndex, event.side, top, yStep);
    const lanes = buildGuideAbsoluteLanePair({
      from: parentCenter,
      to: nullCenter,
      fromRadius: geometry.guideNodeClearRadius,
      toRadius: geometry.guideNullClearRadius,
      geometry,
    });
    const segment = buildLineLikeTraceSegment({
      key: `guide-null-return-${index}`,
      isActive: activeGuideEventIndex === index,
      targetIndex: event.toIndex,
      penPoint,
      pivotCenter: nullCenter,
      pivotRadius: geometry.guideNullClearRadius,
      lineStart: lanes.right.end,
      lineEnd: lanes.right.start,
      geometry,
      connectorDirection: 'ccw',
      connectorLongArc: true,
    });
    segments.push(segment);
    penPoint = segment.toPoint;
  });

  return segments;
}

function buildNodeShellLineSegment(
  fromCenter: NodePoint,
  toCenter: NodePoint,
  geometry: TraceGeometry,
): { start: NodePoint; end: NodePoint } {
  const fromMetric = toMetricPoint(fromCenter, geometry.aspect);
  const toMetric = toMetricPoint(toCenter, geometry.aspect);
  const direction = normalizeDirection(toMetric.x - fromMetric.x, toMetric.y - fromMetric.y, 0, 1);

  const startMetric = {
    x: fromMetric.x + direction.x * geometry.nodeShellRadius,
    y: fromMetric.y + direction.y * geometry.nodeShellRadius,
  };
  const endMetric = {
    x: toMetric.x - direction.x * geometry.nodeShellRadius,
    y: toMetric.y - direction.y * geometry.nodeShellRadius,
  };

  return {
    start: fromMetricPoint(startMetric, geometry.aspect),
    end: fromMetricPoint(endMetric, geometry.aspect),
  };
}

function pickShortArcDirection(center: NodePoint, fromPoint: NodePoint, toPoint: NodePoint, aspect: number): ArcDirection {
  const fromAngle = getPointAngleAroundCenter(fromPoint, center, aspect);
  const toAngle = getPointAngleAroundCenter(toPoint, center, aspect);
  const ccwDelta = normalizePositiveAngle(fromAngle - toAngle);
  const cwDelta = normalizePositiveAngle(toAngle - fromAngle);
  return ccwDelta <= cwDelta ? 'ccw' : 'cw';
}

function buildLevelorderRawTraceSegments(
  step: BinaryTreeTraversalStep,
  nodePositions: NodePoint[],
  geometry: TraceGeometry,
): RawTraversalTraceSegment[] {
  const visitedIndices = step.visitedIndices.filter((index) => hasTreeNode(step.treeState, index));
  if (visitedIndices.length === 0) {
    return [];
  }

  const firstCenter = getNodeCenter(nodePositions, visitedIndices[0]);
  if (!firstCenter) {
    return [];
  }

  const segments: RawTraversalTraceSegment[] = [];
  const rootEntryAnchor = getRootTopEntryAnchor(firstCenter, geometry);
  const rootEntryStart = getRootTopEntryStart(rootEntryAnchor, geometry);
  segments.push(
    createRawLineTraceSegment({
      key: 'levelorder-entry',
      fromPoint: rootEntryStart,
      toPoint: rootEntryAnchor,
      isActive: step.action === 'visit' && visitedIndices.length === 1,
      targetIndex: visitedIndices[0],
      geometry,
    }),
  );

  let penPoint = rootEntryAnchor;

  for (let index = 1; index < visitedIndices.length; index += 1) {
    const fromIndex = visitedIndices[index - 1];
    const toIndex = visitedIndices[index];
    const fromCenter = getNodeCenter(nodePositions, fromIndex);
    const toCenter = getNodeCenter(nodePositions, toIndex);

    if (!fromCenter || !toCenter) {
      continue;
    }

    const line = buildNodeShellLineSegment(fromCenter, toCenter, geometry);
    const connectorDirection = pickShortArcDirection(fromCenter, penPoint, line.start, geometry.aspect);

    const segment = buildLineLikeTraceSegment({
      key: `levelorder-${fromIndex}-${toIndex}-${index}`,
      isActive: step.action === 'visit' && index === visitedIndices.length - 1,
      targetIndex: toIndex,
      penPoint,
      pivotCenter: fromCenter,
      pivotRadius: geometry.nodeShellRadius,
      lineStart: line.start,
      lineEnd: line.end,
      geometry,
      connectorDirection,
    });
    segments.push(segment);
    penPoint = segment.toPoint;
  }

  return segments;
}

function buildFallbackRawTraceSegments(
  visitedIndices: number[],
  active: boolean,
  nodePositions: NodePoint[],
  geometry: TraceGeometry,
): RawTraversalTraceSegment[] {
  const segments: RawTraversalTraceSegment[] = [];
  let penPoint: NodePoint | null = null;

  if (visitedIndices.length === 0) {
    return segments;
  }

  const rootIndex = visitedIndices[0];
  const rootCenter = getNodeCenter(nodePositions, rootIndex);
  if (rootCenter) {
    penPoint = getRootTraceEntry(rootCenter, geometry);
  }

  for (let index = 1; index < visitedIndices.length; index += 1) {
    const fromIndex = visitedIndices[index - 1];
    const toIndex = visitedIndices[index];
    const fromAnchor = getNodeCenter(nodePositions, fromIndex);
    const toAnchor = getNodeCenter(nodePositions, toIndex);

    if (!fromAnchor || !toAnchor) {
      continue;
    }

    const isUpMove =
      fromIndex === toIndex * 2 + 1 || fromIndex === toIndex * 2 + 2 || toAnchor.y < fromAnchor.y - 0.01;
    const moveSide = inferEdgeSide(fromIndex, toIndex);
    const lane = getTraversalLaneForTreeMove(moveSide, isUpMove);
    const line = buildOffsetEdgeSegment({
      from: fromAnchor,
      to: toAnchor,
      fromRadius: geometry.nodeShellRadius,
      toRadius: geometry.nodeShellRadius,
      lane,
      edgeOffset: geometry.edgeOffset,
      aspect: geometry.aspect,
    });
    const segment = buildLineLikeTraceSegment({
      key: `fallback-${fromIndex}-${toIndex}-${index}`,
      isActive: active && index === visitedIndices.length - 1,
      targetIndex: toIndex,
      penPoint,
      pivotCenter: fromAnchor,
      pivotRadius: geometry.nodeShellRadius,
      lineStart: line.start,
      lineEnd: line.end,
      geometry,
      connectorDirection: isUpMove ? 'cw' : 'ccw',
    });
    segments.push(segment);
    penPoint = segment.toPoint;
  }

  return segments;
}

function buildRawTraceSegments(
  step: BinaryTreeTraversalStep | undefined,
  nodePositions: NodePoint[],
  top: number,
  yStep: number,
  geometry: TraceGeometry,
  canonicalGuideEvents?: BinaryTreeGuideEvent[],
): RawTraversalTraceSegment[] {
  if (!step || nodePositions.length === 0) {
    return [];
  }

  if (step.mode === 'levelorder') {
    return buildLevelorderRawTraceSegments(step, nodePositions, geometry);
  }

  return step.guideEvents.length > 0
    ? buildGuideRawTraceSegments(
      step.guideEvents,
      step.activeGuideEventIndex,
      nodePositions,
      top,
      yStep,
      geometry,
      canonicalGuideEvents ?? step.guideEvents,
    )
    : buildFallbackRawTraceSegments(step.visitedIndices, step.action === 'visit', nodePositions, geometry);
}

function buildTraceSegments(rawSegments: RawTraversalTraceSegment[], geometry: TraceGeometry): TraversalTraceSegment[] {
  if (rawSegments.length === 0) {
    return [];
  }

  return rawSegments.map((segment) => ({
    key: segment.key,
    d: segment.d,
    length: segment.length,
    isActive: segment.isActive,
    roughPath: buildHandDrawnTracePath(segment.key, segment.d),
    arrowPath: hasTraceArrowAnchor(segment) ? buildTraceNodeArrowPath(segment.arrowFromPoint, segment.arrowToPoint, geometry) : null,
    arrowIsCurrent: segment.isActive,
  }));
}

function buildTraceMetrics(rawSegments: RawTraversalTraceSegment[]): TraceSegmentMetric[] {
  let cursor = 0;

  return rawSegments.map((segment) => {
    const start = cursor;
    cursor += segment.length;
    return {
      length: segment.length,
      start,
      end: cursor,
    };
  });
}

function buildCanonicalTraceEntryMarkers(
  treeState: BinaryTreeInputValue[],
  nodePositions: NodePoint[],
  top: number,
  yStep: number,
  geometry: TraceGeometry,
): TraceEntryMarker[] {
  const rootCenter = getNodeCenter(nodePositions, 0);
  if (!rootCenter) {
    return [];
  }

  type EdgeLanePair = { left: { start: NodePoint; end: NodePoint }; right: { start: NodePoint; end: NodePoint } };
  type ChildTraceContext = {
    childIndex: number;
    childCenter: NodePoint;
    childIsReal: boolean;
    lanes: EdgeLanePair;
  };

  const entryMarkers: TraceEntryMarker[] = [];
  let markerOrder = 1;
  const nextMarkerKey = (label: '1' | '2' | '3', nodeIndex: number) => `trace-entry-${markerOrder++}-${label}-node-${nodeIndex}`;

  const pushEntryMarker = (nodeIndex: number, label: '1' | '2' | '3', point: NodePoint): void => {
    entryMarkers.push({
      key: nextMarkerKey(label, nodeIndex),
      nodeIndex,
      point,
      label,
    });
  };

  const buildChildTraceContext = (parentIndex: number, parentCenter: NodePoint, side: 'L' | 'R'): ChildTraceContext => {
    const childIndex = getChildIndex(parentIndex, side);
    const childIsReal = hasTreeNode(treeState, childIndex);
    const childCenter = childIsReal
      ? getNodeCenter(nodePositions, childIndex) ?? getNullPoint(parentIndex, side, top, yStep)
      : getNullPoint(parentIndex, side, top, yStep);
    const childRadius = childIsReal ? geometry.guideNodeClearRadius : geometry.guideNullClearRadius;

    return {
      childIndex,
      childCenter,
      childIsReal,
      lanes: buildGuideAbsoluteLanePair({
        from: parentCenter,
        to: childCenter,
        fromRadius: geometry.guideNodeClearRadius,
        toRadius: childRadius,
        geometry,
      }),
    };
  };

  function traceChild(context: ChildTraceContext): NodePoint {
    if (context.childIsReal) {
      return traceDataNode(context.childIndex, context.childCenter, context.lanes);
    }
    return context.lanes.right.start;
  }

  function traceDataNode(nodeIndex: number, nodeCenter: NodePoint, incoming: EdgeLanePair): NodePoint {
    pushEntryMarker(nodeIndex, '1', incoming.left.end);

    const leftContext = buildChildTraceContext(nodeIndex, nodeCenter, 'L');
    const leftReturnPoint = traceChild(leftContext);
    pushEntryMarker(nodeIndex, '2', leftReturnPoint);

    const rightContext = buildChildTraceContext(nodeIndex, nodeCenter, 'R');
    const rightReturnPoint = traceChild(rightContext);
    pushEntryMarker(nodeIndex, '3', rightReturnPoint);

    return incoming.right.start;
  }

  const rootEntryAnchor = getRootTopEntryAnchor(rootCenter, geometry);
  pushEntryMarker(0, '1', rootEntryAnchor);

  const rootLeftContext = buildChildTraceContext(0, rootCenter, 'L');
  const rootLeftReturnPoint = traceChild(rootLeftContext);
  pushEntryMarker(0, '2', rootLeftReturnPoint);

  const rootRightContext = buildChildTraceContext(0, rootCenter, 'R');
  const rootRightReturnPoint = traceChild(rootRightContext);
  pushEntryMarker(0, '3', rootRightReturnPoint);

  return entryMarkers;
}

function getGuideVisitMarkerLabel(mode: BinaryTreeTraversalMode): TraceEntryMarker['label'] | null {
  if (mode === 'preorder') {
    return '1';
  }

  if (mode === 'inorder') {
    return '2';
  }

  if (mode === 'postorder') {
    return '3';
  }

  return null;
}

function buildTraceEntryMarkersWithReveal(
  entryMarkers: TraceEntryMarker[],
  rawSegments: RawTraversalTraceSegment[],
  aspect: number,
): TraceEntryMarkerReveal[] {
  if (entryMarkers.length === 0 || rawSegments.length === 0) {
    return [];
  }

  let totalLength = 0;
  const metrics = rawSegments.map((segment) => {
    const start = totalLength;
    totalLength += segment.length;
    return {
      start,
      end: totalLength,
      fromPoint: segment.fromPoint,
      toPoint: segment.toPoint,
    };
  });

  return entryMarkers.map((marker, markerIndex) => {
    let revealLength: number | null = null;

    metrics.forEach((metric) => {
      const endDistance = metricDistance(metric.toPoint, marker.point, aspect);
      if (endDistance <= TRACE_ENTRY_MARKER_MATCH_EPSILON) {
        revealLength = revealLength === null ? metric.end : Math.min(revealLength, metric.end);
      }
    });

    if (revealLength === null) {
      metrics.forEach((metric) => {
        const startDistance = metricDistance(metric.fromPoint, marker.point, aspect);
        if (startDistance <= TRACE_ENTRY_MARKER_MATCH_EPSILON) {
          revealLength = revealLength === null ? metric.start : Math.min(revealLength, metric.start);
        }
      });
    }

    const fallbackReveal = totalLength > 0 ? ((markerIndex + 1) / (entryMarkers.length + 1)) * totalLength : 0;
    return {
      ...marker,
      revealLength: revealLength ?? fallbackReveal,
    };
  });
}

function getTraceEntryMarkerOffset(marker: TraceEntryMarker): MarkerOffset {
  if (marker.label === '1') {
    if (marker.nodeIndex === 0) {
      return { x: -18, y: -18 };
    }

    if (marker.nodeIndex % 2 === 1) {
      return { x: 0, y: -18 };
    }

    return { x: -18, y: 16 };
  }

  if (marker.label === '2') {
    return { x: 0, y: 16 };
  }

  return { x: 18, y: 0 };
}

function buildNodeVisitReveals(
  entryMarkers: TraceEntryMarkerReveal[],
  visitLabel: TraceEntryMarker['label'] | null,
): NodeVisitReveal[] {
  if (visitLabel === null) {
    return [];
  }

  const revealByNode = new Map<number, number>();

  entryMarkers.forEach((marker) => {
    if (marker.label !== visitLabel) {
      return;
    }

    const currentReveal = revealByNode.get(marker.nodeIndex);
    if (currentReveal === undefined || marker.revealLength < currentReveal) {
      revealByNode.set(marker.nodeIndex, marker.revealLength);
    }
  });

  return [...revealByNode.entries()].map(([nodeIndex, revealLength]) => ({
    nodeIndex,
    revealLength,
  }));
}

function buildCounterClockwiseNodeArc(
  center: NodePoint,
  radius: number,
  firstPoint: NodePoint,
  secondPoint: NodePoint,
  aspect: number,
): ArcGuidePath | null {
  const firstAngle = getPointAngleAroundCenter(firstPoint, center, aspect);
  const secondAngle = getPointAngleAroundCenter(secondPoint, center, aspect);
  const firstToSecondCcw = normalizePositiveAngle(firstAngle - secondAngle);
  const useFirstAsStart = firstToSecondCcw <= Math.PI;
  const start = useFirstAsStart ? firstPoint : secondPoint;
  const end = useFirstAsStart ? secondPoint : firstPoint;
  const path = createTracePath(start, aspect);

  appendTraceArc(path, {
    center,
    radius,
    to: end,
    preferredDirection: 'ccw',
    longArc: false,
  });

  if (path.commands.length <= 1) {
    return null;
  }

  return {
    d: path.commands.join(' '),
    start,
    end,
    direction: 'ccw',
  };
}

type NodeGuideBranchPoints = {
  first: GuideBranchEndpoint;
  second: GuideBranchEndpoint;
};

function pickGuideEndpointBySide(points: NodeGuideBranchPoints, side: 'left' | 'right' | 'down'): GuideBranchEndpoint {
  const candidates = [points.first, points.second];
  if (side === 'left') {
    return candidates.sort((a, b) => (a.point.x === b.point.x ? b.point.y - a.point.y : a.point.x - b.point.x))[0];
  }
  if (side === 'right') {
    return candidates.sort((a, b) => (a.point.x === b.point.x ? b.point.y - a.point.y : b.point.x - a.point.x))[0];
  }
  return candidates.sort((a, b) => (a.point.y === b.point.y ? a.point.x - b.point.x : b.point.y - a.point.y))[0];
}

function getMetricDirection(
  from: NodePoint,
  to: NodePoint,
  aspect: number,
): NodePoint {
  const fromMetric = toMetricPoint(from, aspect);
  const toMetric = toMetricPoint(to, aspect);
  return normalizeDirection(toMetric.x - fromMetric.x, toMetric.y - fromMetric.y, 1, 0);
}

function buildGuideDirectionMarkerPath(
  point: NodePoint,
  lineDirection: NodePoint,
  geometry: TraceGeometry,
): string {
  const markerLength = geometry.arrowSize * 0.64;
  const markerSpread = geometry.arrowWing * 0.78;
  const directionUnit = normalizeDirection(lineDirection.x, lineDirection.y, 1, 0);
  const perpendicular = { x: -directionUnit.y, y: directionUnit.x };
  const pointMetric = toMetricPoint(point, geometry.aspect);
  const leftMetric = {
    x: pointMetric.x - directionUnit.x * markerLength + perpendicular.x * markerSpread,
    y: pointMetric.y - directionUnit.y * markerLength + perpendicular.y * markerSpread,
  };
  const rightMetric = {
    x: pointMetric.x - directionUnit.x * markerLength - perpendicular.x * markerSpread,
    y: pointMetric.y - directionUnit.y * markerLength - perpendicular.y * markerSpread,
  };

  return `M ${formatPoint(fromMetricPoint(leftMetric, geometry.aspect))} L ${formatPoint(point)} L ${formatPoint(fromMetricPoint(rightMetric, geometry.aspect))}`;
}

function pickArcStartEndpoint(
  arc: ArcGuidePath,
  endpoints: NodeGuideBranchPoints,
  geometry: TraceGeometry,
): GuideBranchEndpoint {
  const firstDistance = metricDistance(arc.start, endpoints.first.point, geometry.aspect);
  const secondDistance = metricDistance(arc.start, endpoints.second.point, geometry.aspect);
  return firstDistance <= secondDistance ? endpoints.first : endpoints.second;
}

function buildArcStartMarkerPath(
  arc: ArcGuidePath,
  startEndpoint: GuideBranchEndpoint,
  geometry: TraceGeometry,
): string {
  return buildGuideDirectionMarkerPath(arc.start, startEndpoint.towardCenterDirection, geometry);
}

function buildEndpointMarkerPath(endpoint: GuideBranchEndpoint, geometry: TraceGeometry): string {
  return buildGuideDirectionMarkerPath(endpoint.point, endpoint.towardCenterDirection, geometry);
}

function buildLongConcaveNullArc(
  center: NodePoint,
  radius: number,
  firstPoint: NodePoint,
  secondPoint: NodePoint,
  aspect: number,
  side: 'L' | 'R',
): ArcGuidePath | null {
  const endpoints: [NodePoint, NodePoint][] = [
    [firstPoint, secondPoint],
    [secondPoint, firstPoint],
  ];
  const directions: ArcDirection[] = ['cw', 'ccw'];
  const targetDelta = Math.PI * 1.24;

  let best:
    | {
        start: NodePoint;
        end: NodePoint;
        direction: ArcDirection;
        score: number;
      }
    | null = null;

  for (const [startPoint, endPoint] of endpoints) {
    const startAngle = getPointAngleAroundCenter(startPoint, center, aspect);
    const endAngle = getPointAngleAroundCenter(endPoint, center, aspect);

    for (const direction of directions) {
      const delta = resolveArcDelta(startAngle, endAngle, direction, true);
      if (Math.abs(delta) <= Math.PI + 0.0001) {
        continue;
      }

      const midAngle = startAngle + delta / 2;
      const downConcave = Math.sin(midAngle) > 0;
      const leftBias = Math.cos(midAngle) < 0;
      const horizontalMatch = side === 'L' ? leftBias : !leftBias;
      const score =
        (downConcave ? 0 : 1000) +
        (horizontalMatch ? 0 : 100) +
        Math.abs(Math.abs(delta) - targetDelta);

      if (!best || score < best.score) {
        best = {
          start: startPoint,
          end: endPoint,
          direction,
          score,
        };
      }
    }
  }

  if (!best) {
    return null;
  }

  const path = createTracePath(best.start, aspect);
  appendTraceArc(path, {
    center,
    radius,
    to: best.end,
    preferredDirection: best.direction,
    longArc: true,
  });

  if (path.commands.length <= 1) {
    return null;
  }

  return {
    d: path.commands.join(' '),
    start: best.start,
    end: best.end,
    direction: best.direction,
  };
}

function buildParallelGuideSegments(
  edges: Array<{ from: number; to: number }>,
  treeState: BinaryTreeInputValue[],
  nodePositions: NodePoint[],
  top: number,
  yStep: number,
  geometry: TraceGeometry,
): ParallelGuideSegment[] {
  const segments: ParallelGuideSegment[] = [];
  const parentBranchByNode = new Map<number, NodeGuideBranchPoints>();
  const leftBranchByNode = new Map<number, NodeGuideBranchPoints>();
  const rightBranchByNode = new Map<number, NodeGuideBranchPoints>();
  const nullBranchByKey = new Map<string, { center: NodePoint; side: 'L' | 'R'; endpoints: NodeGuideBranchPoints }>();
  const pushParallelPair = (config: {
    keyBase: string;
    from: NodePoint;
    to: NodePoint;
    fromRadius: number;
    toRadius: number;
  }): { left: { start: NodePoint; end: NodePoint }; right: { start: NodePoint; end: NodePoint } } => {
    const left = buildOffsetEdgeSegment({
      from: config.from,
      to: config.to,
      fromRadius: config.fromRadius,
      toRadius: config.toRadius,
      lane: 'L',
      edgeOffset: geometry.guideEdgeOffset,
      aspect: geometry.aspect,
    });
    const right = buildOffsetEdgeSegment({
      from: config.from,
      to: config.to,
      fromRadius: config.fromRadius,
      toRadius: config.toRadius,
      lane: 'R',
      edgeOffset: geometry.guideEdgeOffset,
      aspect: geometry.aspect,
    });

    segments.push({
      key: `${config.keyBase}-line-L`,
      d: `M ${formatPoint(left.start)} L ${formatPoint(left.end)}`,
    });
    segments.push({
      key: `${config.keyBase}-line-R`,
      d: `M ${formatPoint(right.start)} L ${formatPoint(right.end)}`,
    });
    return { left, right };
  };
  const toBranchPoints = (first: GuideBranchEndpoint, second: GuideBranchEndpoint): NodeGuideBranchPoints => ({ first, second });
  const toGuideEndpoint = (point: NodePoint, towardCenterDirection: NodePoint): GuideBranchEndpoint => ({
    point,
    towardCenterDirection,
  });
  const registerChildBranch = (
    map: Map<number, NodeGuideBranchPoints>,
    nodeIndex: number,
    first: GuideBranchEndpoint,
    second: GuideBranchEndpoint,
  ) => {
    map.set(nodeIndex, toBranchPoints(first, second));
  };
  const pushNodeArc = (key: string, center: NodePoint, firstEndpoint: GuideBranchEndpoint, secondEndpoint: GuideBranchEndpoint) => {
    if (metricDistance(firstEndpoint.point, secondEndpoint.point, geometry.aspect) <= 0.02) {
      return;
    }
    const arc = buildCounterClockwiseNodeArc(
      center,
      geometry.guideNodeClearRadius,
      firstEndpoint.point,
      secondEndpoint.point,
      geometry.aspect,
    );
    if (arc) {
      const startEndpoint = pickArcStartEndpoint(arc, toBranchPoints(firstEndpoint, secondEndpoint), geometry);
      segments.push({
        key,
        d: arc.d,
        directionMarkerPaths: [buildArcStartMarkerPath(arc, startEndpoint, geometry)],
      });
    }
  };

  edges.forEach((edge) => {
    const from = nodePositions[edge.from];
    const to = nodePositions[edge.to];
    if (!from || !to) {
      return;
    }

    const pair = pushParallelPair({
      keyBase: `edge-${edge.from}-${edge.to}`,
      from,
      to,
      fromRadius: geometry.guideNodeClearRadius,
      toRadius: geometry.guideNodeClearRadius,
    });

    parentBranchByNode.set(
      edge.to,
      toBranchPoints(
        toGuideEndpoint(pair.left.end, getMetricDirection(pair.left.start, pair.left.end, geometry.aspect)),
        toGuideEndpoint(pair.right.end, getMetricDirection(pair.right.start, pair.right.end, geometry.aspect)),
      ),
    );
    if (edge.to === getChildIndex(edge.from, 'L')) {
      registerChildBranch(
        leftBranchByNode,
        edge.from,
        toGuideEndpoint(pair.left.start, getMetricDirection(pair.left.end, pair.left.start, geometry.aspect)),
        toGuideEndpoint(pair.right.start, getMetricDirection(pair.right.end, pair.right.start, geometry.aspect)),
      );
    } else {
      registerChildBranch(
        rightBranchByNode,
        edge.from,
        toGuideEndpoint(pair.left.start, getMetricDirection(pair.left.end, pair.left.start, geometry.aspect)),
        toGuideEndpoint(pair.right.start, getMetricDirection(pair.right.end, pair.right.start, geometry.aspect)),
      );
    }
  });

  for (let parentIndex = 0; parentIndex < treeState.length; parentIndex += 1) {
    const parentCenter = nodePositions[parentIndex];
    if (!parentCenter || !hasTreeNode(treeState, parentIndex)) {
      continue;
    }

    (['L', 'R'] as const).forEach((side) => {
      const childIndex = getChildIndex(parentIndex, side);
      if (hasTreeNode(treeState, childIndex)) {
        return;
      }

      const nullPoint = getNullPoint(parentIndex, side, top, yStep);
      const pair = pushParallelPair({
        keyBase: `null-${parentIndex}-${side}`,
        from: parentCenter,
        to: nullPoint,
        fromRadius: geometry.guideNodeClearRadius,
        toRadius: geometry.guideNullClearRadius,
      });
      if (side === 'L') {
        registerChildBranch(
          leftBranchByNode,
          parentIndex,
          toGuideEndpoint(pair.left.start, getMetricDirection(pair.left.end, pair.left.start, geometry.aspect)),
          toGuideEndpoint(pair.right.start, getMetricDirection(pair.right.end, pair.right.start, geometry.aspect)),
        );
      } else {
        registerChildBranch(
          rightBranchByNode,
          parentIndex,
          toGuideEndpoint(pair.left.start, getMetricDirection(pair.left.end, pair.left.start, geometry.aspect)),
          toGuideEndpoint(pair.right.start, getMetricDirection(pair.right.end, pair.right.start, geometry.aspect)),
        );
      }

      nullBranchByKey.set(`${parentIndex}-${side}`, {
        center: nullPoint,
        side,
        endpoints: toBranchPoints(
          toGuideEndpoint(pair.left.end, getMetricDirection(pair.left.start, pair.left.end, geometry.aspect)),
          toGuideEndpoint(pair.right.end, getMetricDirection(pair.right.start, pair.right.end, geometry.aspect)),
        ),
      });
    });
  }

  for (let nodeIndex = 0; nodeIndex < treeState.length; nodeIndex += 1) {
    const center = nodePositions[nodeIndex];
    if (!center || !hasTreeNode(treeState, nodeIndex)) {
      continue;
    }

    const parentBranch = parentBranchByNode.get(nodeIndex);
    const leftBranch = leftBranchByNode.get(nodeIndex);
    const rightBranch = rightBranchByNode.get(nodeIndex);

    if (parentBranch && leftBranch) {
      pushNodeArc(
        `node-${nodeIndex}-arc-left`,
        center,
        pickGuideEndpointBySide(parentBranch, 'left'),
        pickGuideEndpointBySide(leftBranch, 'left'),
      );
    }

    if (parentBranch && rightBranch) {
      pushNodeArc(
        `node-${nodeIndex}-arc-right`,
        center,
        pickGuideEndpointBySide(parentBranch, 'right'),
        pickGuideEndpointBySide(rightBranch, 'right'),
      );
    }

    if (leftBranch && rightBranch) {
      pushNodeArc(
        `node-${nodeIndex}-arc-down`,
        center,
        pickGuideEndpointBySide(leftBranch, 'down'),
        pickGuideEndpointBySide(rightBranch, 'down'),
      );
    }
  }

  nullBranchByKey.forEach((branch, key) => {
    const capArc = buildLongConcaveNullArc(
      branch.center,
      geometry.guideNullClearRadius,
      branch.endpoints.first.point,
      branch.endpoints.second.point,
      geometry.aspect,
      branch.side,
    );
    if (capArc) {
      const leftEndpoint = pickGuideEndpointBySide(branch.endpoints, 'left');
      segments.push({
        key: `null-cap-${key}`,
        d: capArc.d,
        directionMarkerPaths: [buildEndpointMarkerPath(leftEndpoint, geometry)],
      });
    }
  });

  const rootCenter = getNodeCenter(nodePositions, 0);
  if (rootCenter) {
    const rootEntryAnchor = getRootTopEntryAnchor(rootCenter, geometry);
    const rootEntryStart = getRootTopEntryStart(rootEntryAnchor, geometry);
    const rootLeftBranch = leftBranchByNode.get(0);
    const rootEntry = rootLeftBranch
      ? pickGuideEndpointBySide(rootLeftBranch, 'left').point
      : getRootTraceEntry(rootCenter, geometry);

    segments.push({
      key: 'root-entry-line',
      d: `M ${formatPoint(rootEntryStart)} L ${formatPoint(rootEntryAnchor)}`,
    });

    const rootEntryArc = buildDirectedArcPath(
      rootCenter,
      geometry.guideNodeClearRadius,
      rootEntryAnchor,
      rootEntry,
      geometry.aspect,
      'ccw',
      false,
    );
    if (rootEntryArc) {
      segments.push({
        key: 'root-entry-arc',
        d: rootEntryArc.d,
        directionMarkerPaths: [
          buildEndpointMarkerPath(
            {
              point: rootEntryAnchor,
              towardCenterDirection: getMetricDirection(rootEntryStart, rootEntryAnchor, geometry.aspect),
            },
            geometry,
          ),
        ],
      });
    }

    const rootRightBranch = rightBranchByNode.get(0);
    if (rootRightBranch) {
      const rootExitEndpoint = pickGuideEndpointBySide(rootRightBranch, 'right');
      segments.push({
        key: 'root-exit-marker',
        d: `M ${formatPoint(rootExitEndpoint.point)} L ${formatPoint(rootExitEndpoint.point)}`,
        directionMarkerPaths: [buildEndpointMarkerPath(rootExitEndpoint, geometry)],
      });
    }

  }

  return segments;
}


function buildRoleLabelMap(step: BinaryTreeTraversalStep | undefined, treeState: BinaryTreeInputValue[]): Map<number, string[]> {
  const map = new Map<number, string[]>();

  if (step?.mode === 'levelorder') {
    return map;
  }

  const addRole = (index: number | null, role: string) => {
    if (index === null || !hasTreeNode(treeState, index)) {
      return;
    }
    const roles = map.get(index) ?? [];
    if (!roles.includes(role)) {
      roles.push(role);
    }
    map.set(index, roles);
  };

  addRole(step?.guideRoleD ?? null, 'D');
  addRole(step?.guideRoleL ?? null, 'L');
  addRole(step?.guideRoleR ?? null, 'R');

  if (map.size === 0 && step && step.currentIndex !== null) {
    const currentIndex = step.currentIndex;
    const leftIndex = currentIndex * 2 + 1;
    const rightIndex = currentIndex * 2 + 2;
    addRole(currentIndex, 'D');
    addRole(leftIndex, 'L');
    addRole(rightIndex, 'R');
  }

  return map;
}

function buildNullHints(step: BinaryTreeTraversalStep | undefined, treeState: BinaryTreeInputValue[]): BinaryTreeGuideNullHint[] {
  if (!step || step.action === 'initial' || step.mode === 'levelorder') {
    return [];
  }

  const hints: BinaryTreeGuideNullHint[] = [];

  for (let parentIndex = 0; parentIndex < treeState.length; parentIndex += 1) {
    if (!hasTreeNode(treeState, parentIndex)) {
      continue;
    }
    const left = parentIndex * 2 + 1;
    const right = parentIndex * 2 + 2;
    if (!hasTreeNode(treeState, left)) {
      hints.push({ parentIndex, side: 'L' });
    }
    if (!hasTreeNode(treeState, right)) {
      hints.push({ parentIndex, side: 'R' });
    }
  }

  const dedup = new Map<string, BinaryTreeGuideNullHint>();
  hints.forEach((hint) => {
    dedup.set(`${hint.parentIndex}-${hint.side}`, hint);
  });

  return [...dedup.values()];
}

export function BinaryTreeTraversalPage() {
  const { t } = useI18n();
  const currentModule = useCurrentModule();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const routeOrderIdPrefix = useId().replace(/:/g, '');
  const initialViewport = useMemo(() => getViewportSize(), []);

  const [datasetSize, setDatasetSize] = useState(DEFAULT_SIZE);
  const [treeShapeMode, setTreeShapeMode] = useState<BinaryTreeShapeMode>('complete');
  const [mode, setMode] = useState<BinaryTreeTraversalMode>('preorder');
  const [valueDisplayMode, setValueDisplayMode] = useState<ValueDisplayMode>('number');
  const [showRecursionView, setShowRecursionView] = useState(false);
  const [viewportSize, setViewportSize] = useState<ViewportSize>(initialViewport);
  const [recursionPanelRect, setRecursionPanelRect] = useState<FloatingPanelRect>(
    () => readStoredRecursionPanelRect(initialViewport) ?? getDefaultRecursionPanelRect(initialViewport),
  );
  const [recursionPanelInteraction, setRecursionPanelInteraction] = useState<RecursionPanelInteraction | null>(null);
  const [inputData, setInputData] = useState<BinaryTreeInputValue[]>(() => createBinaryTreeDataset(DEFAULT_SIZE, 'complete'));
  const [stageSize, setStageSize] = useState({ width: DEFAULT_STAGE_WIDTH, height: DEFAULT_STAGE_HEIGHT });
  const [traceVisibleLength, setTraceVisibleLength] = useState(0);

  const { status, speedMs, currentFrame, setTotalFrames, setSpeed, play, pause, next, prev, reset } = useTimelinePlayer(0);

  const timelineFrames = useMemo(() => buildBinaryTreeTraversalTimelineFromInput(inputData, mode), [inputData, mode]);
  const steps = useMemo(() => timelineFrames.map((frame) => frame.payload), [timelineFrames]);
  const currentStep = currentFrame;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const treeState = currentSnapshot?.treeState ?? inputData;
  const lastTreeNodeIndex = useMemo(() => findLastTreeNodeIndex(treeState), [treeState]);
  const guideTraceSourceStep = useMemo(() => {
    for (let index = steps.length - 1; index >= 0; index -= 1) {
      const step = steps[index];
      if (step && step.guideEvents.length > 0) {
        return step;
      }
    }

    return undefined;
  }, [steps]);
  const canonicalGuideEvents = guideTraceSourceStep?.guideEvents;
  const guideVisitMarkerLabel = useMemo(() => {
    if (!guideTraceSourceStep) {
      return null;
    }
    return getGuideVisitMarkerLabel(mode);
  }, [guideTraceSourceStep, mode]);

  const treeLayout = useMemo(() => {
    const top = TREE_STAGE_TOP;
    const bottom = TREE_STAGE_BOTTOM;
    const maxNodeLevel = lastTreeNodeIndex >= 0 ? getNodeLevel(lastTreeNodeIndex) : 0;
    const maxDisplayLevel = maxNodeLevel + 1;
    const yStep = (bottom - top) / Math.max(maxDisplayLevel, 1);
    return { top, yStep };
  }, [lastTreeNodeIndex]);
  const traceGeometry = useMemo(() => buildTraceGeometry(stageSize.width, stageSize.height), [stageSize.height, stageSize.width]);

  const nodePositions = useMemo(
    () => treeState.map((_, index) => getTreePointByIndex(index, treeLayout.top, treeLayout.yStep)),
    [treeLayout.top, treeLayout.yStep, treeState],
  );

  const edges = useMemo(() => {
    const allEdges: Array<{ from: number; to: number }> = [];

    for (let index = 0; index < treeState.length; index += 1) {
      if (!hasTreeNode(treeState, index)) {
        continue;
      }
      const leftChild = index * 2 + 1;
      const rightChild = index * 2 + 2;
      if (hasTreeNode(treeState, leftChild)) {
        allEdges.push({ from: index, to: leftChild });
      }
      if (hasTreeNode(treeState, rightChild)) {
        allEdges.push({ from: index, to: rightChild });
      }
    }

    return allEdges;
  }, [treeState]);

  const currentRawTraceSegments = useMemo(
    () =>
      buildRawTraceSegments(
        currentSnapshot,
        nodePositions,
        treeLayout.top,
        treeLayout.yStep,
        traceGeometry,
        canonicalGuideEvents,
      ),
    [canonicalGuideEvents, currentSnapshot, nodePositions, traceGeometry, treeLayout.top, treeLayout.yStep],
  );
  const currentTraceMetrics = useMemo(() => buildTraceMetrics(currentRawTraceSegments), [currentRawTraceSegments]);
  const currentTraceTargetLength = currentTraceMetrics[currentTraceMetrics.length - 1]?.end ?? 0;
  const currentTraceActiveStartLength = useMemo(() => {
    const activeIndex = currentRawTraceSegments.findIndex((segment) => segment.isActive);
    if (activeIndex < 0) {
      return currentTraceTargetLength;
    }
    return currentTraceMetrics[activeIndex]?.start ?? currentTraceTargetLength;
  }, [currentRawTraceSegments, currentTraceMetrics, currentTraceTargetLength]);
  const currentTraceVisibleLengths = useMemo(
    () =>
      currentTraceMetrics.map((metric) => {
        const visible = traceVisibleLength - metric.start;
        return Math.max(0, Math.min(metric.length, visible));
      }),
    [currentTraceMetrics, traceVisibleLength],
  );
  const traceSegments = useMemo(
    () => buildTraceSegments(currentRawTraceSegments, traceGeometry),
    [currentRawTraceSegments, traceGeometry],
  );
  const parallelGuideSegments = useMemo(
    () => buildParallelGuideSegments(edges, treeState, nodePositions, treeLayout.top, treeLayout.yStep, traceGeometry),
    [edges, nodePositions, traceGeometry, treeLayout.top, treeLayout.yStep, treeState],
  );
  const routeOrderSegments = useMemo<RouteOrderSegment[]>(() => {
    if (mode !== 'preorder' || !guideTraceSourceStep || nodePositions.length === 0) {
      return [];
    }

    const orderedRawSegments = buildGuideRawTraceSegments(
      guideTraceSourceStep.guideEvents,
      null,
      nodePositions,
      treeLayout.top,
      treeLayout.yStep,
      traceGeometry,
      guideTraceSourceStep.guideEvents,
    );

    return orderedRawSegments
      .filter(hasTraceArrowAnchor)
      .map((segment, index) => ({
        key: `${segment.key}-order-${index}`,
        d: `M ${formatPoint(segment.arrowFromPoint)} L ${formatPoint(segment.arrowToPoint)}`,
        order: index + 1,
        pathId: `${routeOrderIdPrefix}-route-order-${index}`,
      }));
  }, [guideTraceSourceStep, mode, nodePositions, routeOrderIdPrefix, traceGeometry, treeLayout.top, treeLayout.yStep]);
  const fullGuideRawTraceSegments = useMemo(
    () =>
      guideTraceSourceStep
        ? buildRawTraceSegments(
          guideTraceSourceStep,
          nodePositions,
          treeLayout.top,
          treeLayout.yStep,
          traceGeometry,
          guideTraceSourceStep.guideEvents,
        )
        : [],
    [guideTraceSourceStep, nodePositions, traceGeometry, treeLayout.top, treeLayout.yStep],
  );
  const traceEntryMarkers = useMemo(
    () =>
      guideTraceSourceStep
        ? buildCanonicalTraceEntryMarkers(treeState, nodePositions, treeLayout.top, treeLayout.yStep, traceGeometry)
        : [],
    [guideTraceSourceStep, nodePositions, traceGeometry, treeLayout.top, treeLayout.yStep, treeState],
  );
  const traceEntryMarkersWithReveal = useMemo(
    () => buildTraceEntryMarkersWithReveal(traceEntryMarkers, fullGuideRawTraceSegments, traceGeometry.aspect),
    [fullGuideRawTraceSegments, traceEntryMarkers, traceGeometry.aspect],
  );
  const guideNodeVisitReveals = useMemo(
    () => buildNodeVisitReveals(traceEntryMarkersWithReveal, guideVisitMarkerLabel),
    [guideVisitMarkerLabel, traceEntryMarkersWithReveal],
  );
  const guideVisitedNodeSet = useMemo(() => {
    const visited = new Set<number>();

    guideNodeVisitReveals.forEach((entry) => {
      if (traceVisibleLength >= entry.revealLength - 0.001) {
        visited.add(entry.nodeIndex);
      }
    });

    return visited;
  }, [guideNodeVisitReveals, traceVisibleLength]);

  const visitedSet = useMemo(() => new Set(currentSnapshot?.visitedIndices ?? []), [currentSnapshot?.visitedIndices]);
  const modeLabel = getModeLabel(mode, t);
  const roleLabelMap = useMemo(() => buildRoleLabelMap(currentSnapshot, treeState), [currentSnapshot, treeState]);
  const isLevelorderMode = mode === 'levelorder';
  const supportsAlgorithmWindow = true;
  const isAlgorithmWindowOpen = supportsAlgorithmWindow && showRecursionView;
  const algorithmCodeLines = useMemo(() => buildAlgorithmCodeLines(mode, t), [mode, t]);
  const algorithmCodeActiveLines = useMemo(
    () => getAlgorithmCodeActiveLines(currentSnapshot, mode, treeState),
    [currentSnapshot, mode, treeState],
  );
  const valueLabelMap = useMemo(() => {
    const sortedUnique = Array.from(
      new Set(inputData.filter((value): value is number => value !== null)),
    ).sort((left, right) => left - right);
    return new Map(sortedUnique.map((value, index) => [value, toAlphabetLabel(index)]));
  }, [inputData]);

  const formatDisplayValue = useCallback(
    (value: number | null | undefined): string => {
      if (value === null || value === undefined) {
        return '-';
      }
      if (valueDisplayMode === 'number') {
        return String(value);
      }
      return valueLabelMap.get(value) ?? String(value);
    },
    [valueDisplayMode, valueLabelMap],
  );

  const guideOutputOrder = useMemo(() => {
    if (guideVisitMarkerLabel === null) {
      return null;
    }

    return traceEntryMarkersWithReveal
      .filter((marker) => marker.label === guideVisitMarkerLabel)
      .sort((left, right) => left.revealLength - right.revealLength)
      .filter((marker) => traceVisibleLength >= marker.revealLength - 0.001)
      .map((marker) => treeState[marker.nodeIndex])
      .filter((value): value is number => value !== null);
  }, [guideVisitMarkerLabel, traceEntryMarkersWithReveal, traceVisibleLength, treeState]);

  const outputSequence = useMemo(
    () =>
      (guideOutputOrder ?? currentSnapshot?.outputOrder ?? []).map((value) =>
        valueDisplayMode === 'number' ? String(value) : (valueLabelMap.get(value) ?? String(value)),
      ),
    [currentSnapshot?.outputOrder, guideOutputOrder, valueDisplayMode, valueLabelMap],
  );
  const algorithmStatusText = useMemo(
    () => getAlgorithmStatusText(currentSnapshot, mode, t, formatDisplayValue),
    [currentSnapshot, formatDisplayValue, mode, t],
  );
  const recursionVisitPointText = useMemo(
    () => getRecursionCheckpointText(guideVisitMarkerLabel, t),
    [guideVisitMarkerLabel, t],
  );
  const algorithmCodeNote = (() => {
    const notes = [`${t('module.t01.meta.mode')}: ${modeLabel}`];
    if (!isLevelorderMode && recursionVisitPointText) {
      notes.push(recursionVisitPointText);
    }
    if (isLevelorderMode && currentSnapshot?.queueState) {
      notes.push(`${t('module.t01.levelorder.queue.count')}: ${currentSnapshot.queueState.length}`);
    }
    return notes.join(' · ');
  })();
  const recursionStackEntries = useMemo(
    () =>
      !isLevelorderMode
        ? (currentSnapshot?.recursionStack ?? []).map((nodeIndex, depth) => ({
          nodeIndex,
          depth,
          value: treeState[nodeIndex],
        }))
        : [],
    [currentSnapshot?.recursionStack, isLevelorderMode, treeState],
  );
  const levelorderQueueEntries = useMemo(
    () =>
      isLevelorderMode
        ? (currentSnapshot?.queueState ?? []).map((nodeIndex) => ({
          nodeIndex,
          value: treeState[nodeIndex],
        }))
        : [],
    [currentSnapshot?.queueState, isLevelorderMode, treeState],
  );
  const levelorderEnqueuedEntries = useMemo(() => {
    if (!isLevelorderMode || currentSnapshot?.action !== 'visit' || currentSnapshot.currentIndex === null) {
      return [];
    }

    const currentIndex = currentSnapshot.currentIndex;
    const childIndices = [currentIndex * 2 + 1, currentIndex * 2 + 2].filter((index) => hasTreeNode(treeState, index));
    return childIndices.map((nodeIndex) => ({
      nodeIndex,
      value: treeState[nodeIndex],
    }));
  }, [currentSnapshot, isLevelorderMode, treeState]);
  const levelorderQueueSummary = useMemo(() => {
    if (!isLevelorderMode) {
      return null;
    }

    if (!currentSnapshot || currentSnapshot.action === 'initial') {
      return {
        dequeue: null,
        enqueue: [] as typeof levelorderEnqueuedEntries,
      };
    }

    if (currentSnapshot.action !== 'visit' || currentSnapshot.currentIndex === null) {
      return {
        dequeue: null,
        enqueue: [] as typeof levelorderEnqueuedEntries,
      };
    }

    return {
      dequeue: {
        nodeIndex: currentSnapshot.currentIndex,
        value: currentSnapshot.currentValue,
      },
      enqueue: levelorderEnqueuedEntries,
    };
  }, [currentSnapshot, isLevelorderMode, levelorderEnqueuedEntries]);
  const levelorderActionText = useMemo(() => {
    if (!isLevelorderMode || !levelorderQueueSummary?.dequeue) {
      return t('module.t01.levelorder.summary.idle');
    }

    const currentLabel = formatDisplayValue(levelorderQueueSummary.dequeue.value);
    if (levelorderQueueSummary.enqueue.length === 0) {
      return `${t('module.t01.levelorder.summary.dequeuePrefix')} ${currentLabel} · ${t('module.t01.levelorder.summary.noEnqueue')}`;
    }

    const enqueueLabels = levelorderQueueSummary.enqueue.map((entry) => formatDisplayValue(entry.value)).join(', ');
    return `${t('module.t01.levelorder.summary.dequeuePrefix')} ${currentLabel} · ${t('module.t01.levelorder.summary.enqueuePrefix')} ${enqueueLabels}`;
  }, [formatDisplayValue, isLevelorderMode, levelorderQueueSummary, t]);
  const algorithmWindowBody = useMemo(
    () => (isLevelorderMode ? t('module.t01.window.body.levelorder') : t('module.t01.window.body.recursion')),
    [isLevelorderMode, t],
  );
  const algorithmCodeTitle = useMemo(
    () => (isLevelorderMode ? t('module.t01.levelorder.code.title') : t('module.t01.recursion.code.title')),
    [isLevelorderMode, t],
  );
  const nullHints = useMemo(() => buildNullHints(currentSnapshot, treeState), [currentSnapshot, treeState]);
  const nullEdges = useMemo(() => {
    const nextEdges: NullEdgePath[] = [];

    nullHints.forEach((hint) => {
      const parent = getNodeCenter(nodePositions, hint.parentIndex);
      if (!parent) {
        return;
      }

      const nullPoint = getNullPoint(hint.parentIndex, hint.side, treeLayout.top, treeLayout.yStep);

      nextEdges.push({
        key: `${hint.parentIndex}-${hint.side}`,
        d: `M ${parent.x} ${parent.y} L ${nullPoint.x} ${nullPoint.y}`,
      });
    });

    return nextEdges;
  }, [nodePositions, nullHints, treeLayout.top, treeLayout.yStep]);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [setTotalFrames, reset, steps.length]);

  useEffect(() => {
    setSpeed(DEFAULT_PAGE_SPEED_MS);
  }, [setSpeed]);

  useEffect(() => {
    const handleViewportResize = () => {
      const nextViewport = getViewportSize();
      setViewportSize(nextViewport);
      setRecursionPanelRect((previous) => clampRecursionPanelRect(previous, nextViewport));
    };

    handleViewportResize();
    window.addEventListener('resize', handleViewportResize);
    return () => window.removeEventListener('resize', handleViewportResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(RECURSION_PANEL_STORAGE_KEY, JSON.stringify(recursionPanelRect));
  }, [recursionPanelRect]);

  useEffect(() => {
    if (!recursionPanelInteraction) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      setRecursionPanelRect((previous) => {
        if (recursionPanelInteraction.kind === 'drag') {
          return clampRecursionPanelRect(
            {
              ...previous,
              x: event.clientX - recursionPanelInteraction.offsetX,
              y: event.clientY - recursionPanelInteraction.offsetY,
            },
            viewportSize,
          );
        }

        const nextWidth = recursionPanelInteraction.startWidth + (event.clientX - recursionPanelInteraction.startX);
        const nextHeight = recursionPanelInteraction.startHeight + (event.clientY - recursionPanelInteraction.startY);
        return clampRecursionPanelRect(
          {
            x: recursionPanelInteraction.startPanelX,
            y: recursionPanelInteraction.startPanelY,
            width: nextWidth,
            height: nextHeight,
          },
          viewportSize,
        );
      });
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (event.pointerId === recursionPanelInteraction.pointerId) {
        setRecursionPanelInteraction(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, [recursionPanelInteraction, viewportSize]);

  useEffect(() => {
    if (!recursionPanelInteraction) {
      return;
    }

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = recursionPanelInteraction.kind === 'drag' ? 'grabbing' : 'nwse-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [recursionPanelInteraction]);

  useEffect(() => {
    let rafId = 0;
    let startTime: number | null = null;
    const durationMs = Math.max(
      TRACE_STEP_DRAW_MIN_MS,
      Math.min(TRACE_STEP_DRAW_MAX_MS, speedMs * 0.92),
    );
    const hasAnimatedTail = currentTraceTargetLength - currentTraceActiveStartLength > 0.001;
    const initialLength = hasAnimatedTail ? currentTraceActiveStartLength : currentTraceTargetLength;

    const tick = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const progress = Math.min(1, (timestamp - startTime) / durationMs);
      const nextLength =
        currentTraceActiveStartLength + (currentTraceTargetLength - currentTraceActiveStartLength) * progress;
      setTraceVisibleLength(nextLength);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame((timestamp) => {
      setTraceVisibleLength(initialLength);

      if (currentTraceTargetLength <= 0 || !hasAnimatedTail) {
        return;
      }

      startTime = timestamp;
      rafId = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(rafId);
  }, [currentStep, currentTraceActiveStartLength, currentTraceTargetLength, speedMs]);

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

      setStageSize((previous) => {
        if (
          Math.abs(previous.width - rect.width) < 0.5 &&
          Math.abs(previous.height - rect.height) < 0.5
        ) {
          return previous;
        }
        return {
          width: rect.width,
          height: rect.height,
        };
      });
    };

    updateSize();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(stageElement);
    return () => observer.disconnect();
  }, []);

  const regenerateData = () => {
    setInputData(createBinaryTreeDataset(datasetSize, treeShapeMode));
    reset();
  };

  const toggleRecursionView = () => {
    if (!supportsAlgorithmWindow) {
      return;
    }

    if (isAlgorithmWindowOpen) {
      setRecursionPanelInteraction(null);
      setShowRecursionView(false);
      return;
    }

    const currentViewport = getViewportSize();
    setViewportSize(currentViewport);
    setRecursionPanelRect((previous) => clampRecursionPanelRect(previous, currentViewport));
    setShowRecursionView(true);
  };

  const resetRecursionPanel = () => {
    const currentViewport = getViewportSize();
    setViewportSize(currentViewport);
    setRecursionPanelRect(getDefaultRecursionPanelRect(currentViewport));
  };

  const startRecursionPanelDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest('button')) {
      return;
    }

    event.preventDefault();
    setRecursionPanelInteraction({
      kind: 'drag',
      pointerId: event.pointerId,
      offsetX: event.clientX - recursionPanelRect.x,
      offsetY: event.clientY - recursionPanelRect.y,
    });
  };

  const startRecursionPanelResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setRecursionPanelInteraction({
      kind: 'resize',
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: recursionPanelRect.width,
      startHeight: recursionPanelRect.height,
      startPanelX: recursionPanelRect.x,
      startPanelY: recursionPanelRect.y,
    });
  };

  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1800 },
    { key: 'module.s01.speed.normal', value: 1000 },
    { key: 'module.s01.speed.fast', value: 600 },
  ] as const;

  const modeOptions: BinaryTreeTraversalMode[] = ['preorder', 'inorder', 'postorder', 'levelorder'];
  const treeShapeOptions: BinaryTreeShapeMode[] = ['random', 'complete'];

  return (
    <section className="array-page tree-page">
      <h2>{t('module.t01.title')}</h2>
      <p>{t('module.t01.body')}</p>

      <div className="bubble-toolbar">
        <label htmlFor="dataset-size-t01" className="control-inline">
          <span>{t('module.s01.dataSize')}</span>
          <input
            id="dataset-size-t01"
            type="range"
            min={MIN_SIZE}
            max={MAX_SIZE}
            value={datasetSize}
            onChange={(event) => setDatasetSize(Number(event.target.value))}
          />
          <strong>{datasetSize}</strong>
        </label>
        <div className="speed-group">
          <button type="button" onClick={regenerateData}>
            {t('module.s01.regenerate')}
          </button>
        </div>
      </div>

      <div className="bubble-toolbar">
        <span>{t('module.t01.treeKind.label')}</span>
        <div className="speed-group">
          {treeShapeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={treeShapeMode === option ? 'speed-active' : ''}
              onClick={() => {
                setTreeShapeMode(option);
                setInputData(createBinaryTreeDataset(datasetSize, option));
                reset();
              }}
            >
              {t(`module.t01.treeKind.${option}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="bubble-toolbar">
        <span>{t('module.t01.mode.label')}</span>
        <div className="speed-group">
          {modeOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={mode === option ? 'speed-active' : ''}
              onClick={() => {
                setMode(option);
                reset();
              }}
            >
              {getModeLabel(option, t)}
            </button>
          ))}
        </div>
      </div>

      <div className="bubble-toolbar">
        <span>{t('module.t01.valueMode.label')}</span>
        <div className="speed-group">
          <button
            type="button"
            className={valueDisplayMode === 'number' ? 'speed-active' : ''}
            onClick={() => setValueDisplayMode('number')}
          >
            {t('module.t01.valueMode.number')}
          </button>
          <button
            type="button"
            className={valueDisplayMode === 'letter' ? 'speed-active' : ''}
            onClick={() => setValueDisplayMode('letter')}
          >
            {t('module.t01.valueMode.letter')}
          </button>
        </div>
      </div>

      <div className="bubble-toolbar">
        <span>{t('module.s01.speed')}</span>
        <div className="speed-group">
          {speedOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={speedMs === option.value ? 'speed-active' : ''}
              onClick={() => setSpeed(option.value)}
            >
              {t(option.key)}
            </button>
          ))}
        </div>
      </div>

      <div className="module-status-block">
        <p className="module-status-line">
          {t('module.s01.moduleLabel')}: {currentModule?.id ?? '-'} | {t('playback.step')}: {currentStep}/
          {Math.max(steps.length - 1, 0)} | {t('playback.status')}: {getStatusLabel(status, t)}
        </p>
        <p className="module-status-line">{getStepDescription(currentSnapshot, t, (value) => formatDisplayValue(value))}</p>
        <p className="module-status-line">
          {t('module.t01.meta.mode')}: {modeLabel} | {t('module.t01.meta.currentNode')}:{' '}
          {currentSnapshot?.currentIndex ?? '-'} | {t('module.t01.meta.currentValue')}:{' '}
          {formatDisplayValue(currentSnapshot?.currentValue)}
        </p>
        <p className="module-status-line">{t('module.t01.meta.output')}: [{outputSequence.join(', ')}]</p>
        <p className="module-status-line">
          {t('module.t01.meta.structure')}: {t(`module.t01.meta.structure.${treeShapeMode}`)}
        </p>
      </div>

      <p className="array-preview">
        {t('module.s01.sample')}: [{formatArrayPreview(inputData)}]
      </p>

      <VisualizationCanvas title={t('module.t01.title')} subtitle={t('module.t01.stage')} stageClassName="viz-canvas-stage-tree">
        <div ref={stageRef} className="tree-stage" aria-label="binary-tree-stage">
          <svg className="tree-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {edges.map((edge) => {
              const from = nodePositions[edge.from];
              const to = nodePositions[edge.to];
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

          {SHOW_LEGACY_GUIDE_OVERLAY ? (
            <svg className="tree-shell-guide-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {parallelGuideSegments.map((segment) => (
                <g key={segment.key}>
                  <path className="tree-shell-guide" d={segment.d} />
                  {segment.directionMarkerPaths?.map((markerPath, markerIndex) => (
                    <path key={`${segment.key}-marker-${markerIndex}`} className="tree-shell-guide-direction" d={markerPath} />
                  ))}
                </g>
              ))}
            </svg>
          ) : null}

          {SHOW_LEGACY_GUIDE_OVERLAY ? (
            <svg className="tree-route-order-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {routeOrderSegments.map((segment) => (
                <g key={segment.key}>
                  <path id={segment.pathId} className="tree-route-order-path-anchor" d={segment.d} />
                  <text className="tree-route-order-label">
                    <textPath href={`#${segment.pathId}`} startOffset="50%" textAnchor="middle">
                      {segment.order}
                    </textPath>
                  </text>
                </g>
              ))}
            </svg>
          ) : null}

          <svg className="tree-trace-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {traceSegments.map((segment, index) => {
              const segmentKey = segment.isActive ? `${segment.key}-${currentStep}` : segment.key;
              const segmentLength = currentTraceMetrics[index]?.length ?? segment.length;
              const visibleLength = currentTraceVisibleLengths[index] ?? 0;
              const hiddenLength = Math.max(segmentLength - visibleLength, 0) + 0.01;
              const isPending = segmentLength <= 0.001 || visibleLength <= 0.001;
              const isCompleted = visibleLength >= segmentLength - 0.001;
              return (
                <path
                  key={segmentKey}
                  className={`tree-trace${segment.isActive ? ' tree-trace-active' : ''}`}
                  d={segment.roughPath}
                  style={
                    isPending
                      ? { opacity: 0 }
                      : isCompleted
                        ? undefined
                        : {
                          strokeDasharray: `${visibleLength.toFixed(3)} ${hiddenLength.toFixed(3)}`,
                          strokeDashoffset: 0,
                        }
                  }
                />
              );
            })}
          </svg>

          {!isLevelorderMode ? (
            <>
              <svg className="tree-null-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                {nullEdges.map((edge) => (
                  <path key={edge.key} className="tree-null-edge" d={edge.d} />
                ))}
              </svg>

              <div className="tree-null-layer" aria-hidden="true">
                {nullHints.map((hint) => {
                  const point = getNullPoint(hint.parentIndex, hint.side, treeLayout.top, treeLayout.yStep);

                  const isActiveNull =
                    currentSnapshot?.guideNull?.parentIndex === hint.parentIndex && currentSnapshot?.guideNull?.side === hint.side;

                  return (
                    <div
                      key={`${hint.parentIndex}-${hint.side}`}
                      className={`tree-null-node${isActiveNull ? ' tree-null-active' : ''}`}
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    >
                      <span className="tree-null-value">null</span>
                      <span className="tree-null-side">{hint.side}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : null}

          <div className="tree-trace-entry-marker-layer" aria-hidden="true">
            {traceEntryMarkersWithReveal.map((marker) => {
              const visible = traceVisibleLength >= marker.revealLength - 0.001;
              if (!visible) {
                return null;
              }
              const markerOffset = getTraceEntryMarkerOffset(marker);
              const isVisitMarker = guideVisitMarkerLabel !== null && marker.label === guideVisitMarkerLabel;
              return (
                <span
                  key={marker.key}
                  className={`tree-trace-entry-marker${isVisitMarker ? ' tree-trace-entry-marker-entered tree-trace-entry-marker-entered-pulse' : ''}`}
                  style={{
                    left: `${marker.point.x}%`,
                    top: `${marker.point.y}%`,
                    transform: `translate(-50%, -50%) translate(${markerOffset.x}px, ${markerOffset.y}px)`,
                  }}
                >
                  {marker.label}
                </span>
              );
            })}
          </div>

          <div className="tree-node-layer" aria-hidden="true">
            {treeState.map((value, index) => {
              if (value === null) {
                return null;
              }
              const shouldMarkVisitedOnArrive =
                currentSnapshot?.currentIndex === index &&
                (currentSnapshot.action === 'guideStart' ||
                  currentSnapshot.action === 'descendLeft' ||
                  currentSnapshot.action === 'descendRight' ||
                  currentSnapshot.action === 'visit');
              const isGuideVisited = guideTraceSourceStep ? guideVisitedNodeSet.has(index) : false;
              const isLevelorderCurrent =
                isLevelorderMode &&
                currentSnapshot?.currentIndex === index &&
                currentSnapshot.action === 'visit';
              const isVisited =
                guideTraceSourceStep
                  ? isGuideVisited
                  : visitedSet.has(index) || (!isLevelorderCurrent && shouldMarkVisitedOnArrive);
              const isCurrent =
                currentSnapshot?.currentIndex === index &&
                currentSnapshot.action !== 'traversalDone' &&
                currentSnapshot.action !== 'completed' &&
                (!isVisited || isLevelorderCurrent);
              const stateClass = isCurrent ? ' bar-visiting' : isVisited ? ' bar-matched' : '';
              const markerRoles = roleLabelMap.get(index) ?? [];

              return (
                <div
                  key={`${index}-${value}`}
                  className={`tree-node${stateClass}`}
                  style={{ left: `${nodePositions[index]?.x ?? 0}%`, top: `${nodePositions[index]?.y ?? 0}%` }}
                >
                  {markerRoles.length > 0 ? <span className="tree-node-tag">{markerRoles.join('/')}</span> : null}
                  <span className="tree-node-value">{formatDisplayValue(value)}</span>
                  <span className="tree-node-index">#{index}</span>
                </div>
              );
            })}
          </div>

          <svg className="tree-trace-arrow-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {traceSegments.map((segment, index) => {
              if (!segment.arrowPath) {
                return null;
              }

              const segmentLength = currentTraceMetrics[index]?.length ?? segment.length;
              const visibleLength = currentTraceVisibleLengths[index] ?? 0;
              if (visibleLength < segmentLength - 0.001) {
                return null;
              }

              const arrowKey = segment.isActive ? `${segment.key}-arrow-${currentStep}` : `${segment.key}-arrow`;
              return (
                <path
                  key={arrowKey}
                  className={`tree-trace-node-arrow${segment.arrowIsCurrent ? ' tree-trace-node-arrow-current' : ''}`}
                  d={segment.arrowPath}
                />
              );
            })}
          </svg>
        </div>
      </VisualizationCanvas>

      <div className="tree-sequence-block" aria-live="polite">
        <span className="tree-sequence-label">{t('module.t01.meta.output')}</span>
        <div className="tree-sequence-list">
          {outputSequence.length === 0 ? (
            <span className="tree-sequence-empty">{t('module.t01.sequence.empty')}</span>
          ) : (
            outputSequence.map((value, index) => (
              <span
                key={`${value}-${index}`}
                className={`tree-sequence-chip${index === outputSequence.length - 1 ? ' tree-sequence-chip-active' : ''}`}
              >
                {value}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="legend-row">
        <span className="legend-item legend-visiting">{t('module.t01.legend.visiting')}</span>
        <span className="legend-item legend-matched">{t('module.t01.legend.visited')}</span>
        <span className="legend-item legend-moving">{t('module.t01.legend.path')}</span>
        {!isLevelorderMode ? <span className="legend-item legend-default">{t('module.t01.legend.null')}</span> : null}
      </div>

      <p>
        {t('module.s01.highlight')}:{' '}
        {(currentSnapshot?.highlights ?? []).map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`).join(' | ') ||
          t('module.s01.none')}
      </p>

      <div className="playback-actions">
        <button type="button" onClick={play} disabled={status === 'playing' || steps.length === 0}>
          {t('playback.play')}
        </button>
        <button type="button" onClick={pause} disabled={status !== 'playing'}>
          {t('playback.pause')}
        </button>
        <button type="button" onClick={prev} disabled={steps.length === 0}>
          {t('playback.prev')}
        </button>
        <button type="button" onClick={next} disabled={steps.length === 0}>
          {t('playback.next')}
        </button>
        <button type="button" onClick={reset} disabled={steps.length === 0}>
          {t('playback.reset')}
        </button>
        <button type="button" onClick={toggleRecursionView} disabled={!supportsAlgorithmWindow}>
          {isAlgorithmWindowOpen ? t('module.t01.recursion.toggle.hide') : t('module.t01.recursion.toggle.show')}
        </button>
      </div>

      {isAlgorithmWindowOpen ? (
        <div className="tree-recursion-floating-shell" aria-live="polite">
          <aside
            className={`tree-recursion-panel tree-recursion-panel-floating${
              recursionPanelInteraction?.kind === 'drag' ? ' tree-recursion-panel-dragging' : ''
            }`}
            style={{
              left: recursionPanelRect.x,
              top: recursionPanelRect.y,
              width: recursionPanelRect.width,
              height: recursionPanelRect.height,
            }}
          >
            <div className="tree-recursion-header tree-recursion-window-bar" onPointerDown={startRecursionPanelDrag}>
              <div className="tree-recursion-window-title-group">
                <h3>{t('module.t01.recursion.title')}</h3>
                <p>{algorithmWindowBody}</p>
              </div>
              <div className="tree-recursion-window-controls">
                <button
                  type="button"
                  className="tree-recursion-window-btn"
                  onClick={resetRecursionPanel}
                  aria-label={t('module.t01.recursion.window.reset')}
                  title={t('module.t01.recursion.window.reset')}
                >
                  ↺
                </button>
                <button
                  type="button"
                  className="tree-recursion-window-btn"
                  onClick={() => {
                    setRecursionPanelInteraction(null);
                    setShowRecursionView(false);
                  }}
                  aria-label={t('module.t01.recursion.toggle.hide')}
                  title={t('module.t01.recursion.toggle.hide')}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="tree-recursion-window-content">
              <div className="tree-recursion-tip" role="note">
                {t('module.t01.recursion.tip')}
              </div>

              <div className="tree-recursion-status-block">
                <span className="tree-recursion-status-label">{t('module.t01.recursion.status.label')}</span>
                <strong>{algorithmStatusText}</strong>
                {!isLevelorderMode &&
                isRecursionVisitStep(currentSnapshot, mode) &&
                currentSnapshot?.recursionCheckpoint !== null &&
                currentSnapshot?.recursionCheckpoint === guideVisitMarkerLabel ? (
                  <span className="tree-recursion-visit-now">{t('module.t01.recursion.status.visitNow')}</span>
                ) : null}
              </div>

              {!isLevelorderMode ? (
                <div className="tree-recursion-points" aria-hidden="true">
                  {(['1', '2', '3'] as const).map((checkpoint) => {
                    const pointText = getRecursionCheckpointText(checkpoint, t) ?? checkpoint;
                    const isCurrent = currentSnapshot?.recursionCheckpoint === checkpoint;
                    const isVisitPoint = guideVisitMarkerLabel === checkpoint;
                    return (
                      <span
                        key={checkpoint}
                        className={`tree-recursion-point${isCurrent ? ' tree-recursion-point-current' : ''}${isVisitPoint ? ' tree-recursion-point-visit' : ''}`}
                      >
                        <strong>{checkpoint}</strong>
                        <span>{pointText}</span>
                      </span>
                    );
                  })}
                </div>
              ) : null}

              <div className="tree-recursion-grid">
                <div className="tree-recursion-card">
                  <div className="tree-recursion-card-head">
                    <span>{algorithmCodeTitle}</span>
                    <span className="tree-recursion-card-note">{algorithmCodeNote}</span>
                  </div>
                  <ol className="tree-recursion-code-list">
                    {algorithmCodeLines.map((item) => (
                      <li key={item.line} className={algorithmCodeActiveLines.includes(item.line) ? 'code-active' : ''}>
                        {item.text}
                      </li>
                    ))}
                  </ol>
                </div>

                {isLevelorderMode ? (
                  <div className="tree-recursion-card">
                    <div className="tree-recursion-card-head">
                      <span>{t('module.t01.levelorder.queue.title')}</span>
                      <span className="tree-recursion-card-note">{t('module.t01.levelorder.queue.subtitle')}</span>
                    </div>

                    <div className="tree-levelorder-flow">
                      <div className="tree-levelorder-current">
                        <span className="tree-levelorder-label">{t('module.t01.levelorder.queue.current')}</span>
                        {currentSnapshot?.currentValue !== null && currentSnapshot?.currentValue !== undefined ? (
                          <span className="tree-levelorder-current-chip">
                            <span className="tree-levelorder-current-state">{t('module.t01.levelorder.queue.dequeued')}</span>
                            <span className="tree-levelorder-current-value">{formatDisplayValue(currentSnapshot.currentValue)}</span>
                            {currentSnapshot.currentIndex !== null ? (
                              <span className="tree-levelorder-node-index">#{currentSnapshot.currentIndex}</span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="tree-levelorder-empty">{t('module.t01.levelorder.queue.currentEmpty')}</span>
                        )}
                      </div>

                      <div className="tree-levelorder-summary" role="note">
                        <span className="tree-levelorder-summary-label">{t('module.t01.levelorder.summary.title')}</span>
                        <strong>{levelorderActionText}</strong>
                        <div className="tree-levelorder-summary-flow" aria-hidden="true">
                          <span>{t('module.t01.levelorder.summary.stepDequeue')}</span>
                          <span>→</span>
                          <span>{t('module.t01.levelorder.summary.stepVisit')}</span>
                          <span>→</span>
                          <span>{t('module.t01.levelorder.summary.stepEnqueue')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="tree-levelorder-queue-section">
                      <div className="tree-levelorder-queue-head">
                        <span className="tree-levelorder-label">{t('module.t01.levelorder.queue.waiting')}</span>
                        <span className="tree-levelorder-queue-count">
                          {t('module.t01.levelorder.queue.count')}: {levelorderQueueEntries.length}
                        </span>
                      </div>

                      {levelorderQueueEntries.length === 0 ? (
                        <p className="tree-recursion-stack-empty">{t('module.t01.levelorder.queue.empty')}</p>
                      ) : (
                        <div className="tree-levelorder-queue-lane">
                          <span className="tree-levelorder-queue-end">{t('module.t01.levelorder.queue.front')}</span>
                          <div className="tree-levelorder-queue-list" role="list" aria-label={t('module.t01.levelorder.queue.waiting')}>
                            {levelorderQueueEntries.map((entry, index) => {
                              const isFront = index === 0;
                              const isRear = index === levelorderQueueEntries.length - 1;
                              const isNewlyEnqueued = levelorderEnqueuedEntries.some((item) => item.nodeIndex === entry.nodeIndex);
                              return (
                                <span
                                  key={`${entry.nodeIndex}-${index}`}
                                  className={`tree-levelorder-queue-chip${isFront ? ' tree-levelorder-queue-chip-front' : ''}${isRear ? ' tree-levelorder-queue-chip-rear' : ''}${isNewlyEnqueued ? ' tree-levelorder-queue-chip-new' : ''}`}
                                  role="listitem"
                                >
                                  <span className="tree-levelorder-queue-value">{formatDisplayValue(entry.value)}</span>
                                  <span className="tree-levelorder-queue-index">#{entry.nodeIndex}</span>
                                  {isNewlyEnqueued ? (
                                    <span className="tree-levelorder-queue-badge tree-levelorder-queue-badge-new">
                                      {t('module.t01.levelorder.queue.new')}
                                    </span>
                                  ) : null}
                                </span>
                              );
                            })}
                          </div>
                          <span className="tree-levelorder-queue-end">{t('module.t01.levelorder.queue.rear')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="tree-recursion-card">
                    <div className="tree-recursion-card-head">
                      <span>{t('module.t01.recursion.stack.title')}</span>
                      <span className="tree-recursion-card-note">{t('module.t01.recursion.stack.subtitle')}</span>
                    </div>
                    {recursionStackEntries.length === 0 ? (
                      <p className="tree-recursion-stack-empty">{t('module.t01.recursion.stack.empty')}</p>
                    ) : (
                      <ol className="tree-recursion-stack-list">
                        {recursionStackEntries.map((entry, index) => {
                          const isCurrentFrame = index === recursionStackEntries.length - 1;
                          return (
                            <li
                              key={`${entry.nodeIndex}-${entry.depth}`}
                              className={`tree-recursion-stack-item${isCurrentFrame ? ' tree-recursion-stack-item-current' : ''}`}
                            >
                              <span className="tree-recursion-stack-depth">
                                {t('module.t01.recursion.stack.depth')} {entry.depth}
                              </span>
                              <span className="tree-recursion-stack-call">
                                traverse({formatDisplayValue(entry.value)})
                                <span className="tree-recursion-stack-index">#{entry.nodeIndex}</span>
                              </span>
                              {isCurrentFrame ? (
                                <span className="tree-recursion-stack-current">{t('module.t01.recursion.stack.current')}</span>
                              ) : null}
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="tree-recursion-resize-handle"
              onPointerDown={startRecursionPanelResize}
              aria-label={t('module.t01.recursion.window.resize')}
              title={t('module.t01.recursion.window.resize')}
            />
          </aside>
        </div>
      ) : null}

      <div className="pseudocode-block">
        <h3>{t('module.s01.pseudocode')}</h3>
        <ol>
          <li className={currentSnapshot?.codeLines.includes(1) ? 'code-active' : ''}>{t('module.t01.code.line1')}</li>
          <li className={currentSnapshot?.codeLines.includes(2) ? 'code-active' : ''}>{t('module.t01.code.line2')}</li>
          <li className={currentSnapshot?.codeLines.includes(3) ? 'code-active' : ''}>{t('module.t01.code.line3')}</li>
          <li className={currentSnapshot?.codeLines.includes(4) ? 'code-active' : ''}>{t('module.t01.code.line4')}</li>
          <li className={currentSnapshot?.codeLines.includes(5) ? 'code-active' : ''}>{t('module.t01.code.line5')}</li>
          <li className={currentSnapshot?.codeLines.includes(6) ? 'code-active' : ''}>{t('module.t01.code.line6')}</li>
          <li className={currentSnapshot?.codeLines.includes(7) ? 'code-active' : ''}>{t('module.t01.code.line7')}</li>
          <li className={currentSnapshot?.codeLines.includes(8) ? 'code-active' : ''}>{t('module.t01.code.line8')}</li>
          <li className={currentSnapshot?.codeLines.includes(9) ? 'code-active' : ''}>{t('module.t01.code.line9')}</li>
        </ol>
      </div>
    </section>
  );
}
