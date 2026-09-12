import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { WorkspaceShell } from '../../components/WorkspaceShell';
import { useTimelinePlayer } from '../../engine/timeline/useTimelinePlayer';
import { useI18n } from '../../i18n/useI18n';
import type { TranslationKey } from '../../i18n/translations';
import { generateLinkedListSteps } from '../../modules/linear/linkedListOps';
import type { LinkedListMode, LinkedListOperation, LinkedListStep } from '../../modules/linear/linkedListOps';
import {
  buildLogicalStepByIndex,
  getFindResultText,
  getLinkedListWorkspaceConfig,
  resolveLinkedListConfig,
  resolveLinkedListConfigFromJson,
  serializeLinkedListConfigAsJson,
  type LinkedListConfig,
} from './linkedListPageUtils';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

type ArrowSegment = {
  d: string;
  key: string;
  className?: string;
  markerId?: string;
};

type VisualNode = {
  id: string;
  label: string;
  nextId: string | null;
  prevId?: string | null;
  detached: boolean;
  highlight: HighlightType;
  indexLabel: string;
  floating: boolean;
};

const DEFAULT_CONFIG: LinkedListConfig = {
  mode: 'singly',
  list: [4, 7, 11],
  operation: {
    type: 'insertAt',
    index: 1,
    value: 9,
  },
};

const DEFAULT_OPERATION = DEFAULT_CONFIG.operation as Extract<LinkedListOperation, { type: 'insertAt' }>;
const HEAD_NODE_ID = '__head_node__';
const NODE_WIDTH = 148;
const NODE_GAP = 28;
const DOUBLY_NEXT_LINK_OFFSET_Y = 16;
const DOUBLY_PREV_LINK_OFFSET_Y = -16;
const DOUBLY_TRANSIENT_ENTRY_OFFSET_X = 24;
const LINKED_LIST_WORKSPACE_CONFIG = getLinkedListWorkspaceConfig();

function createRandomLinkedValue(): number {
  return Math.floor(Math.random() * 90) + 10;
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

function getStepDescription(step: LinkedListStep | undefined, t: ReturnType<typeof useI18n>['t']): string {
  if (!step) {
    return '-';
  }

  if (step.action === 'initial') {
    return t('module.l03.step.initial');
  }
  if (step.action === 'visit') {
    return t('module.l03.step.visit');
  }
  if (step.action === 'match') {
    return t('module.l03.step.match');
  }
  if (step.action === 'notFound') {
    return t('module.l03.step.notFound');
  }
  if (step.action === 'prepareInsert') {
    return t('module.l03.step.prepareInsert');
  }
  if (step.action === 'movePointerRoot') {
    return t('module.l03.step.movePointerRoot');
  }
  if (step.action === 'linkNewNode') {
    return t('module.l03.step.linkNewNode');
  }
  if (step.action === 'setPrevLink') {
    return t('module.l03.step.setPrevLink');
  }
  if (step.action === 'setNextLink') {
    return t('module.l03.step.setNextLink');
  }
  if (step.action === 'setBackLink') {
    return t('module.l03.step.setBackLink');
  }
  if (step.action === 'setForwardLink') {
    return t('module.l03.step.setForwardLink');
  }
  if (step.action === 'shiftForInsert') {
    return t('module.l03.step.shiftForInsert');
  }
  if (step.action === 'insert') {
    return t('module.l03.step.insert');
  }
  if (step.action === 'prepareDelete') {
    return t('module.l03.step.prepareDelete');
  }
  if (step.action === 'delete') {
    return t('module.l03.step.delete');
  }
  return t('module.l03.step.completed');
}

function getHighlightLabel(type: HighlightType, t: ReturnType<typeof useI18n>['t']): string {
  if (type === 'visiting') {
    return t('module.l03.highlight.visiting');
  }
  if (type === 'matched') {
    return t('module.l03.highlight.matched');
  }
  if (type === 'new-node') {
    return t('module.l03.highlight.newNode');
  }
  if (type === 'swapping') {
    return t('module.l03.highlight.swapping');
  }
  return t('module.s01.highlight.default');
}

function getOperationCodeLines(mode: LinkedListMode, operation: LinkedListOperation['type']): TranslationKey[] {
  const modePrefix =
    mode === 'doubly'
      ? 'module.l03.code.doubly'
      : mode === 'circular'
        ? 'module.l03.code.circular'
        : 'module.l03.code';

  if (operation === 'find') {
    return [
      `${modePrefix}.find.line1`,
      `${modePrefix}.find.line2`,
      `${modePrefix}.find.line3`,
      `${modePrefix}.find.line4`,
      `${modePrefix}.find.line5`,
    ] as TranslationKey[];
  }

  if (operation === 'insertAt') {
    return [
      `${modePrefix}.insert.line1`,
      `${modePrefix}.insert.line2`,
      `${modePrefix}.insert.line3`,
      `${modePrefix}.insert.line4`,
      `${modePrefix}.insert.line5`,
      `${modePrefix}.insert.line6`,
      `${modePrefix}.insert.line7`,
      `${modePrefix}.insert.line8`,
    ] as TranslationKey[];
  }

  return [
    `${modePrefix}.delete.line1`,
    `${modePrefix}.delete.line2`,
    `${modePrefix}.delete.line3`,
    `${modePrefix}.delete.line4`,
    `${modePrefix}.delete.line5`,
  ] as TranslationKey[];
}

function getOperationCStyleLines(mode: LinkedListMode, operation: LinkedListOperation['type']): readonly string[] {
  if (mode === 'doubly') {
    if (operation === 'find') {
      return [
        'DNode *p = head;',
        'while (p != NULL) {',
        '    if (p->data == target) return p;',
        '    p = p->next;',
        '} return NULL;',
      ] as const;
    }
    if (operation === 'insertAt') {
      return [
        'DNode *s = createNode(value);',
        'DNode *prev = locatePrev(head, index);',
        'DNode *next = prev ? prev->next : head;',
        's->prior = prev; s->next = next;',
        'if (next) next->prior = s;',
        'if (prev) prev->next = s; else head = s;',
        'return OK;',
        'check bidirectional links;',
      ] as const;
    }
    return [
      'DNode *target = locate(head, index);',
      'DNode *prev = target->prior;',
      'DNode *next = target->next;',
      'if (prev) prev->next = next; else head = next;',
      'if (next) next->prior = prev;',
    ] as const;
  }

  if (mode === 'circular') {
    if (operation === 'find') {
      return [
        'if (head == NULL) return NULL;',
        'Node *p = head;',
        'do {',
        '    if (p->data == target) return p;',
        '    p = p->next;',
        '} while (p != head); return NULL;',
      ] as const;
    }
    if (operation === 'insertAt') {
      return [
        'Node *s = createNode(value);',
        'if (head == NULL) s->next = s;',
        'Node *prev = locatePrevCircular(head, index);',
        's->next = prev ? prev->next : head;',
        'if (prev) prev->next = s;',
        'if (index == 1) head = s;',
        'tail->next = head;',
        'return OK;',
      ] as const;
    }
    return [
      'if (head == NULL) return OK;',
      'Node *target = locateCircular(head, index);',
      'Node *prev = locatePrevCircular(head, index);',
      'if (target == head) head = target->next;',
      'prev->next = target->next; free(target);',
    ] as const;
  }

  if (operation === 'find') {
    return [
      'Node *p = head;',
      'while (p != NULL) {',
      '    if (p->data == target) return p;',
      '    p = p->next;',
      '} return NULL;',
    ] as const;
  }

  if (operation === 'insertAt') {
    return [
      'if (index < 1 || index > length + 1) return ERROR;',
      'Node *prev = locatePrev(head, index);',
      'Node *s = createNode(value);',
      's->next = prev->next;',
      'prev->next = s;',
      'return OK;',
    ] as const;
  }

  return [
    'if (index < 1 || index > length) return ERROR;',
    'Node *prev = locatePrev(head, index);',
    'Node *target = prev->next;',
    'prev->next = target->next;',
    'free(target); return OK;',
  ] as const;
}

function collectMainChainOrder(snapshot: LinkedListStep | undefined): string[] {
  if (!snapshot) {
    return [];
  }

  const map = new Map(snapshot.nodes.map((node) => [node.id, node]));
  const result: string[] = [];
  const visited = new Set<string>();

  let cursor = snapshot.headId;
  while (cursor) {
    if (visited.has(cursor)) {
      break;
    }
    visited.add(cursor);
    result.push(cursor);
    cursor = map.get(cursor)?.nextId ?? null;
  }

  return result;
}

function collectChainValues(snapshot: LinkedListStep | undefined): number[] {
  if (!snapshot) {
    return [];
  }

  const map = new Map(snapshot.nodes.map((node) => [node.id, node]));
  const values: number[] = [];
  const visited = new Set<string>();

  let cursor = snapshot.headId;
  while (cursor) {
    if (visited.has(cursor)) {
      break;
    }
    visited.add(cursor);

    const node = map.get(cursor);
    if (!node) {
      break;
    }
    values.push(node.value);
    cursor = node.nextId;
  }

  return values;
}

function normalizeListText(text: string): string {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .join(',');
}

function getRightCenter(
  rect: DOMRect,
  containerRect: DOMRect,
  offsetX = 0,
  offsetY = 0,
  scale = 1,
): { x: number; y: number } {
  return {
    x: (rect.right - containerRect.left) / scale + offsetX,
    y: (rect.top + rect.height / 2 - containerRect.top) / scale + offsetY,
  };
}

function getLeftCenter(
  rect: DOMRect,
  containerRect: DOMRect,
  offsetX = 0,
  offsetY = 0,
  scale = 1,
): { x: number; y: number } {
  return {
    x: (rect.left - containerRect.left) / scale + offsetX,
    y: (rect.top + rect.height / 2 - containerRect.top) / scale + offsetY,
  };
}

function getCenterOfPointerField(
  rect: DOMRect,
  containerRect: DOMRect,
  offsetX = 0,
  offsetY = 0,
  scale = 1,
): { x: number; y: number } {
  return {
    x: (rect.left + rect.width / 2 - containerRect.left) / scale + offsetX,
    y: (rect.top + rect.height / 2 - containerRect.top) / scale + offsetY,
  };
}

function getWorkspaceStageZoom(container: HTMLElement): number {
  const stageBody = container.closest<HTMLElement>('.workspace-stage-body');
  if (!stageBody) {
    return 1;
  }

  const computedStyle = window.getComputedStyle(stageBody);
  const customZoom = Number.parseFloat(computedStyle.getPropertyValue('--workspace-stage-zoom'));
  if (Number.isFinite(customZoom) && customZoom > 0) {
    return customZoom;
  }

  const cssZoom = Number.parseFloat(computedStyle.zoom);
  return Number.isFinite(cssZoom) && cssZoom > 0 ? cssZoom : 1;
}

function getHeadArrowPolylinePoints(arrow: ArrowSegment): string {
  return arrow.d;
}

function buildLinePath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

function buildCurvePath(from: { x: number; y: number }, to: { x: number; y: number }): string {
  const controlX = from.x + (to.x - from.x) * 0.45;
  const controlY = from.y + (to.y - from.y) * 0.55;
  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

export function LinkedListPage() {
  const { t } = useI18n();

  const [mode, setMode] = useState<LinkedListMode>(DEFAULT_CONFIG.mode);
  const [listInput, setListInput] = useState(DEFAULT_CONFIG.list.join(', '));
  const [operationType, setOperationType] = useState<LinkedListOperation['type']>(DEFAULT_CONFIG.operation.type);
  const [valueInput, setValueInput] = useState(String(DEFAULT_OPERATION.value));
  const [indexInput, setIndexInput] = useState(String(DEFAULT_OPERATION.index + 1));
  const [hasHeadNode, setHasHeadNode] = useState(true);
  const [displayConfig, setDisplayConfig] = useState<LinkedListConfig>(DEFAULT_CONFIG);
  const [error, setError] = useState('');
  const [hasValidConfig, setHasValidConfig] = useState(true);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonFeedback, setJsonFeedback] = useState('');
  const [hasJsonError, setHasJsonError] = useState(false);

  const [linkArrows, setLinkArrows] = useState<ArrowSegment[]>([]);
  const [headArrow, setHeadArrow] = useState<ArrowSegment | null>(null);
  const [movingRootProgress, setMovingRootProgress] = useState(1);
  const [linkDrawProgress, setLinkDrawProgress] = useState(1);
  const [arrowFrameTick, setArrowFrameTick] = useState(0);
  const diagramRef = useRef<HTMLDivElement | null>(null);
  const nodeWrapRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevNodeRects = useRef<Map<string, DOMRect>>(new Map());
  const skipNextLayoutAnimationRef = useRef(false);

  const { status, speedMs, currentFrame, setSpeed, setTotalFrames, play, pause, next, prev, reset } = useTimelinePlayer(0);
  const currentStep = currentFrame;

  const recomputeInputState = useCallback(
    (
      nextMode: LinkedListMode,
      nextListInput: string,
      nextOperationType: LinkedListOperation['type'],
      nextValueInput: string,
      nextIndexInput: string,
    ) => {
      const resolved = resolveLinkedListConfig(nextMode, nextListInput, nextOperationType, nextValueInput, nextIndexInput, t);
      setError(resolved.error);
      setHasValidConfig(resolved.config !== null);
      if (resolved.config) {
        setDisplayConfig(resolved.config);
      }
    },
    [t],
  );

  const steps = useMemo(
    () => generateLinkedListSteps(displayConfig.list, displayConfig.operation, displayConfig.mode),
    [displayConfig],
  );
  const activeOperationType = displayConfig.operation.type;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const activeMode = currentSnapshot?.mode ?? displayConfig.mode;
  const completedListText = useMemo(() => {
    const lastStep = steps[steps.length - 1];
    return collectChainValues(lastStep).join(', ');
  }, [steps]);

  const logicalStepByIndex = useMemo(() => buildLogicalStepByIndex(steps), [steps]);
  const currentLogicalStep = logicalStepByIndex[currentStep] ?? 0;
  const totalLogicalSteps = logicalStepByIndex[logicalStepByIndex.length - 1] ?? 0;

  const syncInputToCompletedList = useCallback((nextValueInput = valueInput) => {
    if (!hasValidConfig || steps.length === 0) {
      return;
    }

    if (normalizeListText(listInput) === normalizeListText(completedListText)) {
      return;
    }

    let nextIndexInput = indexInput;
    if (operationType === 'deleteAt') {
      const newLength = completedListText.length === 0 ? 0 : completedListText.split(',').length;
      const rawIndex = Number.parseInt(indexInput, 10);
      nextIndexInput = String(Math.max(1, Math.min(Number.isNaN(rawIndex) ? 1 : rawIndex, Math.max(newLength, 1))));
    }

    // Clear FLIP baseline before swapping to the next operation input,
    // so stale rects do not cause artificial jump animations.
    prevNodeRects.current = new Map();
    // Skip exactly one layout animation pass right after auto-sync.
    skipNextLayoutAnimationRef.current = true;
    // Prepare for a clean next-round step-0 state.
    reset();
    setListInput(completedListText);
    setIndexInput(nextIndexInput);
    recomputeInputState(mode, completedListText, operationType, nextValueInput, nextIndexInput);
  }, [completedListText, hasValidConfig, listInput, steps, reset, recomputeInputState, mode, operationType, valueInput, indexInput]);

  const handleResetToInitialState = useCallback(() => {
    reset();
    prevNodeRects.current = new Map();
    skipNextLayoutAnimationRef.current = true;
    setListInput(DEFAULT_CONFIG.list.join(', '));
    setMode(DEFAULT_CONFIG.mode);
    setOperationType(DEFAULT_CONFIG.operation.type);
    setValueInput(String(DEFAULT_OPERATION.value));
    setIndexInput(String(DEFAULT_OPERATION.index + 1));
    setHasHeadNode(true);
    setDisplayConfig({
      mode: DEFAULT_CONFIG.mode,
      list: [...DEFAULT_CONFIG.list],
      operation: {
        type: 'insertAt',
        index: DEFAULT_OPERATION.index,
        value: DEFAULT_OPERATION.value,
      },
    });
    setError('');
    setHasValidConfig(true);
    setJsonInput('');
    setJsonFeedback('');
    setHasJsonError(false);
  }, [reset]);

  useEffect(() => {
    setTotalFrames(steps.length);
    reset();
  }, [setTotalFrames, reset, steps]);

  const handleNextStep = useCallback(() => {
    const willComplete = currentStep >= steps.length - 2;
    next();
    if (willComplete) {
      if (operationType === 'insertAt') {
        const nextValueInput = String(createRandomLinkedValue());
        setValueInput(nextValueInput);
        syncInputToCompletedList(nextValueInput);
        return;
      }
      syncInputToCompletedList();
    }
  }, [currentStep, next, operationType, steps.length, syncInputToCompletedList]);

  const handlePlay = useCallback(() => {
    play();
  }, [play]);

  const handleExportJson = useCallback(() => {
    setJsonInput(serializeLinkedListConfigAsJson(displayConfig));
    setHasJsonError(false);
    setJsonFeedback(t('module.l03.json.exported'));
  }, [displayConfig, t]);

  const handleImportJson = useCallback(() => {
    const resolved = resolveLinkedListConfigFromJson(jsonInput, t);
    if (!resolved.config) {
      setHasJsonError(true);
      setJsonFeedback(resolved.error);
      return;
    }

    const nextOperationType = resolved.config.operation.type;
    const nextMode = resolved.config.mode;
    const nextListInput = resolved.config.list.join(', ');
    const nextValueInput =
      resolved.config.operation.type === 'find' || resolved.config.operation.type === 'insertAt'
        ? String(resolved.config.operation.value)
        : valueInput;
    const nextIndexInput =
      resolved.config.operation.type === 'insertAt' || resolved.config.operation.type === 'deleteAt'
        ? String(resolved.config.operation.index + 1)
        : indexInput;

    reset();
    prevNodeRects.current = new Map();
    skipNextLayoutAnimationRef.current = true;
    setMode(nextMode);
    setListInput(nextListInput);
    setOperationType(nextOperationType);
    setValueInput(nextValueInput);
    setIndexInput(nextIndexInput);
    recomputeInputState(nextMode, nextListInput, nextOperationType, nextValueInput, nextIndexInput);
    setHasJsonError(false);
    setJsonFeedback(t('module.l03.json.imported'));
  }, [indexInput, jsonInput, recomputeInputState, reset, t, valueInput]);

  useEffect(() => {
    if (status === 'playing') {
      return;
    }
    if (!currentSnapshot) {
      return;
    }

    if (currentSnapshot.operation === 'insertAt' && currentSnapshot.action === 'shiftForInsert') {
      const timer = window.setTimeout(() => {
        next();
      }, 420);
      return () => window.clearTimeout(timer);
    }

    if (currentSnapshot.operation === 'deleteAt' && currentSnapshot.action === 'delete') {
      const timer = window.setTimeout(() => {
        next();
      }, 420);
      return () => window.clearTimeout(timer);
    }

    if (
      currentSnapshot.action === 'completed' &&
      (currentSnapshot.operation === 'insertAt' || currentSnapshot.operation === 'deleteAt')
    ) {
      if (normalizeListText(listInput) === normalizeListText(completedListText)) {
        return;
      }

      const timer = window.setTimeout(() => {
        if (currentSnapshot.operation === 'insertAt') {
          const nextValueInput = String(createRandomLinkedValue());
          setValueInput(nextValueInput);
          syncInputToCompletedList(nextValueInput);
          return;
        }

        syncInputToCompletedList();
      }, 260);
      return () => window.clearTimeout(timer);
    }
  }, [completedListText, currentSnapshot, listInput, next, status, syncInputToCompletedList]);

  useEffect(() => {
    if (currentSnapshot?.action !== 'movePointerRoot') {
      const raf = window.requestAnimationFrame(() => setMovingRootProgress(0));
      return () => window.cancelAnimationFrame(raf);
    }

    const start = performance.now();
    let rafId = 0;
    let initialized = false;

    const tick = (now: number) => {
      if (!initialized) {
        initialized = true;
        setMovingRootProgress(0);
      }
      const progress = Math.max(0, Math.min((now - start) / 700, 1));
      setMovingRootProgress(progress);
      setArrowFrameTick(now);
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [currentSnapshot?.action, currentStep]);

  useEffect(() => {
    const hasAnimatedNewLink = currentSnapshot?.transientLinks.some((link) => link.style === 'new-link') ?? false;
    if (!hasAnimatedNewLink) {
      const raf = window.requestAnimationFrame(() => setLinkDrawProgress(0));
      return () => window.cancelAnimationFrame(raf);
    }

    const start = performance.now();
    let rafId = 0;
    let initialized = false;

    const tick = (now: number) => {
      if (!initialized) {
        initialized = true;
        setLinkDrawProgress(0);
      }
      const progress = Math.max(0, Math.min((now - start) / 620, 1));
      setLinkDrawProgress(progress);
      setArrowFrameTick(now);
      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [currentSnapshot?.action, currentStep]);

  useEffect(() => {
    if (currentSnapshot?.action !== 'shiftForInsert' && currentSnapshot?.action !== 'insert') {
      return;
    }

    let rafId = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setArrowFrameTick(now);
      if (now - start < 920) {
        rafId = window.requestAnimationFrame(tick);
      }
    };
    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [currentSnapshot?.action, currentStep]);

  const speedOptions = [
    { key: 'module.s01.speed.slow', value: 1200 },
    { key: 'module.s01.speed.normal', value: 700 },
    { key: 'module.s01.speed.fast', value: 350 },
  ] as const;

  const highlightByNodeId = useMemo(() => {
    const map = new Map<string, HighlightType>();
    const order = currentSnapshot?.renderOrder ?? [];
    (currentSnapshot?.highlights ?? []).forEach((entry) => {
      const nodeId = order[entry.index];
      if (nodeId) {
        map.set(nodeId, entry.type);
      }
    });
    return map;
  }, [currentSnapshot]);

  const nodeMap = useMemo(() => {
    return new Map((currentSnapshot?.nodes ?? []).map((node) => [node.id, node]));
  }, [currentSnapshot]);

  const mainChainOrder = useMemo(() => collectMainChainOrder(currentSnapshot), [currentSnapshot]);
  const floatingNodeIds = useMemo(() => new Set(currentSnapshot?.floatingNodeIds ?? []), [currentSnapshot]);

  const currentChainValues = useMemo(() => {
    return mainChainOrder.map((id) => nodeMap.get(id)?.value).filter((value): value is number => value !== undefined);
  }, [mainChainOrder, nodeMap]);

  const chainVisualNodes = useMemo<VisualNode[]>(() => {
    const list: VisualNode[] = [];

    if (hasHeadNode) {
      list.push({
        id: HEAD_NODE_ID,
        label: '',
        nextId: currentSnapshot?.headId ?? null,
        prevId: null,
        detached: false,
        highlight: 'default',
        indexLabel: 'H',
        floating: false,
      });
    }

    mainChainOrder.forEach((nodeId) => {
      if (floatingNodeIds.has(nodeId)) {
        return;
      }

      const node = nodeMap.get(nodeId);
      if (!node) {
        return;
      }

      const dataIndex = hasHeadNode ? list.length : list.length + 1;
      list.push({
        id: node.id,
        label: String(node.value),
        nextId: node.nextId,
        prevId: node.prevId,
        detached: false,
        highlight: highlightByNodeId.get(node.id) ?? 'default',
        indexLabel: String(dataIndex),
        floating: false,
      });
    });

    return list;
  }, [currentSnapshot, floatingNodeIds, hasHeadNode, highlightByNodeId, mainChainOrder, nodeMap]);

  const floatingVisualNodes = useMemo<VisualNode[]>(() => {
    const nodes: VisualNode[] = [];

    (currentSnapshot?.renderOrder ?? []).forEach((nodeId) => {
      if (!floatingNodeIds.has(nodeId)) {
        return;
      }
      const node = nodeMap.get(nodeId);
      if (!node) {
        return;
      }

      nodes.push({
        id: node.id,
        label: String(node.value),
        nextId: node.nextId,
        prevId: node.prevId,
        detached: true,
        highlight:
          highlightByNodeId.get(node.id) ?? (activeOperationType === 'deleteAt' ? 'swapping' : 'new-node'),
        indexLabel: activeOperationType === 'deleteAt' ? t('module.l03.index.removed') : t('module.l03.index.new'),
        floating: true,
      });
    });

    return nodes;
  }, [currentSnapshot, floatingNodeIds, highlightByNodeId, nodeMap, activeOperationType, t]);

  const operationCodeLines = useMemo(() => getOperationCodeLines(activeMode, activeOperationType), [activeMode, activeOperationType]);
  const operationCStyleLines = useMemo(() => getOperationCStyleLines(activeMode, activeOperationType), [activeMode, activeOperationType]);
  const targetIndex =
    typeof currentSnapshot?.targetIndex === 'number'
      ? currentSnapshot.targetIndex
      : displayConfig.operation.type === 'insertAt'
        ? displayConfig.operation.index
        : null;
  const floatingSlotIndex =
    typeof targetIndex === 'number' ? Math.max(0, targetIndex + (hasHeadNode ? 1 : 0)) : null;

  const showInsertSlot =
    floatingVisualNodes.length > 0 &&
    (currentSnapshot?.action === 'shiftForInsert' ||
      (currentSnapshot?.mode === 'doubly' && currentSnapshot?.action === 'setForwardLink'));
  const renderNodes = useMemo(() => [...chainVisualNodes, ...floatingVisualNodes], [chainVisualNodes, floatingVisualNodes]);
  const findResultText = useMemo(
    () => getFindResultText(displayConfig.operation, displayConfig.list, currentSnapshot, t),
    [displayConfig, currentSnapshot, t],
  );
  const isAtLastFrame = steps.length === 0 || currentStep >= steps.length - 1;
  const focusPoint = useMemo(() => {
    const totalSlots = Math.max(chainVisualNodes.length + (floatingVisualNodes.length > 0 ? 1 : 0), 1);
    const focusSlot =
      floatingSlotIndex ??
      (typeof targetIndex === 'number' ? Math.max(0, targetIndex + (hasHeadNode ? 1 : 0)) : Math.max(totalSlots - 1, 0));
    return {
      x: ((focusSlot + 0.5) / totalSlots) * 100,
      y: floatingVisualNodes.length > 0 ? 64 : 46,
    };
  }, [chainVisualNodes.length, floatingSlotIndex, floatingVisualNodes.length, hasHeadNode, targetIndex]);
  const highlightSummary =
    (currentSnapshot?.highlights ?? [])
      .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
      .join(' | ') || t('module.s01.none');
  const operationLabel =
    activeOperationType === 'find'
      ? t('module.l03.operation.find')
      : activeOperationType === 'insertAt'
        ? t('module.l03.operation.insertAt')
        : t('module.l03.operation.deleteAt');
  const modeLabel =
    activeMode === 'doubly'
      ? t('module.l03.mode.doubly')
      : activeMode === 'circular'
        ? t('module.l03.mode.circular')
        : t('module.l03.mode.singly');
  const stepDescription = getStepDescription(currentSnapshot, t);

  const setNodeWrapRef = useCallback((id: string) => {
    return (el: HTMLDivElement | null) => {
      if (el) {
        nodeWrapRefs.current.set(id, el);
      } else {
        nodeWrapRefs.current.delete(id);
      }
    };
  }, []);

  useLayoutEffect(() => {
    const nextRects = new Map<string, DOMRect>();
    let hasMovement = false;
    const transitionMs = currentSnapshot?.action === 'shiftForInsert' ? 920 : 320;
    const skipLayoutAnimation =
      skipNextLayoutAnimationRef.current || (activeOperationType === 'deleteAt' && currentSnapshot?.action === 'completed');

    renderNodes.forEach((node) => {
      const el = nodeWrapRefs.current.get(node.id);
      if (!el) {
        return;
      }
      const nextRect = el.getBoundingClientRect();
      nextRects.set(node.id, nextRect);

      const prevRect = prevNodeRects.current.get(node.id);
      if (!prevRect) {
        return;
      }
      if (skipLayoutAnimation) {
        return;
      }

      const dx = prevRect.left - nextRect.left;
      const dy = node.floating ? prevRect.top - nextRect.top : 0;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
        return;
      }
      hasMovement = true;

      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px, ${dy}px)`;

      window.requestAnimationFrame(() => {
        el.style.transition = `transform ${transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`;
        el.style.transform = 'translate(0, 0)';
      });
    });

    prevNodeRects.current = nextRects;
    if (skipNextLayoutAnimationRef.current) {
      skipNextLayoutAnimationRef.current = false;
    }

    if (hasMovement) {
      let rafId = 0;
      const start = performance.now();
      const tick = (now: number) => {
        setArrowFrameTick(now);
        if (now - start < transitionMs + 60) {
          rafId = window.requestAnimationFrame(tick);
        }
      };
      rafId = window.requestAnimationFrame(tick);
      return () => window.cancelAnimationFrame(rafId);
    }
  }, [renderNodes, currentStep, currentSnapshot?.action, activeOperationType]);

  useLayoutEffect(() => {
    const container = diagramRef.current;
    const updateArrows = () => {
      if (!container) {
        setLinkArrows([]);
        setHeadArrow(null);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const stageZoom = getWorkspaceStageZoom(container);
      const arrows: ArrowSegment[] = [];
      const hiddenFromIds = new Set(currentSnapshot?.hiddenLinkFromIds ?? []);
      const defaultNodes = [...chainVisualNodes, ...floatingVisualNodes];

      defaultNodes.forEach((node) => {
        if (!node.nextId) {
          return;
        }
        if (hiddenFromIds.has(node.id)) {
          return;
        }
        if (currentSnapshot?.action === 'prepareInsert' && node.floating) {
          return;
        }

        const fromEl = container.querySelector<HTMLElement>(`[data-pointer-id="${node.id}"]`);
        const toEl = container.querySelector<HTMLElement>(`[data-node-id="${node.nextId}"]`);
        if (!fromEl || !toEl) {
          return;
        }

        const nextOffsetY = activeMode === 'doubly' ? DOUBLY_NEXT_LINK_OFFSET_Y : 0;
        const fromPoint = getCenterOfPointerField(fromEl.getBoundingClientRect(), containerRect, 0, nextOffsetY, stageZoom);
        const isCircularReturn =
          activeMode === 'circular' && node.id !== HEAD_NODE_ID && node.nextId === currentSnapshot?.headId;
        const isSelfLoop = activeMode === 'circular' && node.id === node.nextId;

        if (isSelfLoop) {
          const nodeRect = toEl.getBoundingClientRect();
          const x = (nodeRect.left + nodeRect.width / 2 - containerRect.left) / stageZoom;
          const y = (nodeRect.top - containerRect.top) / stageZoom;
          arrows.push({
            d: `M ${x + 28} ${y + 4} C ${x + 78} ${y - 42}, ${x - 78} ${y - 42}, ${x - 28} ${y + 4}`,
            key: `circular-self-${node.id}`,
            className: 'linked-node-arrow linked-node-arrow-circular',
            markerId: 'linked-arrow-head-circular',
          });
          return;
        }

        if (isCircularReturn) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          const fromReturn = {
            x: (fromRect.left + fromRect.width / 2 - containerRect.left) / stageZoom,
            y: (fromRect.bottom - containerRect.top) / stageZoom + 8,
          };
          const toReturn = {
            x: (toRect.left + toRect.width / 2 - containerRect.left) / stageZoom,
            y: (toRect.bottom - containerRect.top) / stageZoom + 8,
          };
          const controlY = Math.max(fromReturn.y, toReturn.y) + 74;
          arrows.push({
            d: `M ${fromReturn.x} ${fromReturn.y} C ${fromReturn.x} ${controlY}, ${toReturn.x} ${controlY}, ${toReturn.x} ${toReturn.y}`,
            key: `circular-return-${node.id}-${node.nextId}`,
            className: 'linked-node-arrow linked-node-arrow-circular',
            markerId: 'linked-arrow-head-circular',
          });
          return;
        }

        const toPoint = getLeftCenter(toEl.getBoundingClientRect(), containerRect, 0, nextOffsetY, stageZoom);

        arrows.push({
          d: buildLinePath(fromPoint, toPoint),
          key: `default-${node.id}-${node.nextId}`,
          className: 'linked-node-arrow',
          markerId: 'linked-arrow-head-next',
        });
      });

      if (activeMode === 'doubly') {
        defaultNodes.forEach((node) => {
          if (!node.prevId) {
            return;
          }
          const fromEl = container.querySelector<HTMLElement>(`[data-prev-pointer-id="${node.id}"]`);
          const toEl = container.querySelector<HTMLElement>(`[data-node-id="${node.prevId}"]`);
          if (!fromEl || !toEl) {
            return;
          }
          const fromPoint = getCenterOfPointerField(fromEl.getBoundingClientRect(), containerRect, 0, DOUBLY_PREV_LINK_OFFSET_Y, stageZoom);
          const toPoint = getRightCenter(toEl.getBoundingClientRect(), containerRect, 0, DOUBLY_PREV_LINK_OFFSET_Y, stageZoom);
          arrows.push({
            d: buildLinePath(fromPoint, toPoint),
            key: `prev-${node.id}-${node.prevId}`,
            className: 'linked-node-arrow linked-node-arrow-prev',
            markerId: 'linked-arrow-head-prev',
          });
        });
      }

      (currentSnapshot?.transientLinks ?? []).forEach((link) => {
        const fromEl = container.querySelector<HTMLElement>(`[data-pointer-id="${link.fromId}"]`);
        const toEl = container.querySelector<HTMLElement>(`[data-node-id="${link.toId}"]`);
        if (!fromEl || !toEl) {
          return;
        }

        const transientOffsetY = activeMode === 'doubly' && link.style === 'new-link' ? DOUBLY_NEXT_LINK_OFFSET_Y : 0;
        let fromPoint = getCenterOfPointerField(fromEl.getBoundingClientRect(), containerRect, 0, transientOffsetY, stageZoom);
        const toPoint =
          activeMode === 'doubly' && link.style === 'new-link'
            ? getLeftCenter(
                toEl.getBoundingClientRect(),
                containerRect,
                DOUBLY_TRANSIENT_ENTRY_OFFSET_X,
                transientOffsetY,
                stageZoom,
              )
            : getLeftCenter(toEl.getBoundingClientRect(), containerRect, 0, transientOffsetY, stageZoom);
        if (link.style === 'moving-root' && link.moveToPointerId) {
          const moveToEl = container.querySelector<HTMLElement>(`[data-pointer-id="${link.moveToPointerId}"]`);
          if (moveToEl) {
            const moveToPoint = getCenterOfPointerField(moveToEl.getBoundingClientRect(), containerRect, 0, 0, stageZoom);
            fromPoint = {
              x: fromPoint.x + (moveToPoint.x - fromPoint.x) * movingRootProgress,
              y: fromPoint.y + (moveToPoint.y - fromPoint.y) * movingRootProgress,
            };
          }
        }

        const animatedTo =
          link.style === 'new-link'
            ? {
                x: fromPoint.x + (toPoint.x - fromPoint.x) * linkDrawProgress,
                y: fromPoint.y + (toPoint.y - fromPoint.y) * linkDrawProgress,
              }
            : toPoint;

        arrows.push({
          d: buildCurvePath(fromPoint, animatedTo),
          key: `transient-${link.style}-${link.fromId}-${link.toId}-${currentStep}`,
          className: (() => {
            if (link.style === 'moving-root') {
              return 'linked-node-arrow linked-node-arrow-moving';
            }
            if (link.style === 'delete-link') {
              return 'linked-node-arrow linked-node-arrow-delete';
            }
            return 'linked-node-arrow linked-node-arrow-new';
          })(),
          markerId: (() => {
            if (link.style === 'moving-root') {
              return 'linked-arrow-head-moving';
            }
            if (link.style === 'delete-link') {
              return 'linked-arrow-head-delete';
            }
            return 'linked-arrow-head-new';
          })(),
        });
      });

      const headPointerEl = container.querySelector<HTMLElement>('[data-head-pointer="true"]');
      const firstNodeId = chainVisualNodes[0]?.id;
      const targetEl = firstNodeId
        ? container.querySelector<HTMLElement>(`[data-node-id="${firstNodeId}"]`)
        : container.querySelector<HTMLElement>('[data-null-target="true"]');

      if (headPointerEl && targetEl) {
        const fromPoint = getRightCenter(headPointerEl.getBoundingClientRect(), containerRect, 0, 0, stageZoom);
        const toPoint = getLeftCenter(targetEl.getBoundingClientRect(), containerRect, 0, 0, stageZoom);
        setHeadArrow({
          d: `M ${fromPoint.x} ${fromPoint.y} L ${fromPoint.x} ${toPoint.y} L ${toPoint.x} ${toPoint.y}`,
          key: `head-${currentStep}`,
        });
      } else {
        setHeadArrow(null);
      }

      setLinkArrows(arrows);
    };

    const rafId = window.requestAnimationFrame(updateArrows);
    window.addEventListener('resize', updateArrows);
    window.addEventListener('workspace-stage-zoomchange', updateArrows);
    container?.addEventListener('scroll', updateArrows, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateArrows);
      window.removeEventListener('workspace-stage-zoomchange', updateArrows);
      container?.removeEventListener('scroll', updateArrows);
    };
  }, [
    chainVisualNodes,
    currentSnapshot,
    floatingVisualNodes,
    movingRootProgress,
    currentStep,
    arrowFrameTick,
    linkDrawProgress,
    activeMode,
  ]);

  return (
    <WorkspaceShell
      pageClassName={LINKED_LIST_WORKSPACE_CONFIG.pageClassName}
      panelLayout={LINKED_LIST_WORKSPACE_CONFIG.panelLayout}
      stageAriaLabel={t('module.l03.title')}
      title={t('module.l03.title')}
      description={t('module.l03.body')}
      shellClassName={LINKED_LIST_WORKSPACE_CONFIG.shellClassName}
      stageClassName={LINKED_LIST_WORKSPACE_CONFIG.stageClassName}
      stageBodyClassName={LINKED_LIST_WORKSPACE_CONFIG.stageBodyClassName}
      controlsPanelClassName={LINKED_LIST_WORKSPACE_CONFIG.controlsPanelClassName}
      stepPanelClassName="workspace-context-sheet-linear"
      defaultControlsPanelSize={LINKED_LIST_WORKSPACE_CONFIG.controlsPanelSize}
      controlsPanelAutoAvoid={LINKED_LIST_WORKSPACE_CONFIG.controlsPanelAutoAvoid}
      controlsPanelOverflowMargin={LINKED_LIST_WORKSPACE_CONFIG.controlsPanelOverflowMargin}
      defaultContextPanelSize={LINKED_LIST_WORKSPACE_CONFIG.contextPanelSize}
      stepPanelAutoAvoid={LINKED_LIST_WORKSPACE_CONFIG.stepPanelAutoAvoid}
      stepPanelOverflowMargin={LINKED_LIST_WORKSPACE_CONFIG.stepPanelOverflowMargin}
      floatingPanelsEnabledMinHeight={LINKED_LIST_WORKSPACE_CONFIG.floatingPanelsEnabledMinHeight}
      focusPoint={focusPoint}
      stageMeta={
        <>
          <span className="tree-workspace-pill tree-workspace-pill-active">
            {t('playback.status')}: {getStatusLabel(status, t)}
          </span>
          <span className="tree-workspace-pill">
            {t('playback.step')}: {currentLogicalStep}/{totalLogicalSteps}
          </span>
          <span className="tree-workspace-pill">{operationLabel}</span>
          <span className="tree-workspace-pill">{modeLabel}</span>
          <span className="tree-workspace-pill">
            {t('module.l03.currentList')}: {currentChainValues.length}
          </span>
          <span className="tree-workspace-pill">{stepDescription}</span>
        </>
      }
      controlsContent={
        <>
          <div className="array-controls-grid linked-controls-grid">
            <label className="tree-workspace-field array-controls-field" htmlFor="linked-list-mode">
              <span>{t('module.l03.input.mode')}</span>
              <select
                id="linked-list-mode"
                value={mode}
                onChange={(event) => {
                  const nextMode = event.target.value as LinkedListMode;
                  reset();
                  prevNodeRects.current = new Map();
                  skipNextLayoutAnimationRef.current = true;
                  setMode(nextMode);
                  recomputeInputState(nextMode, listInput, operationType, valueInput, indexInput);
                }}
              >
                <option value="singly">{t('module.l03.mode.singly')}</option>
                <option value="doubly">{t('module.l03.mode.doubly')}</option>
                <option value="circular">{t('module.l03.mode.circular')}</option>
              </select>
            </label>

            <label
              className="tree-workspace-field array-controls-field linked-controls-field-list"
              htmlFor="linked-list-input"
            >
              <span>{t('module.l03.input.list')}</span>
              <input
                id="linked-list-input"
                type="text"
                value={listInput}
                onChange={(event) => {
                  const nextListInput = event.target.value;
                  reset();
                  prevNodeRects.current = new Map();
                  skipNextLayoutAnimationRef.current = true;
                  setListInput(nextListInput);
                  recomputeInputState(mode, nextListInput, operationType, valueInput, indexInput);
                }}
                placeholder="4, 7, 11"
              />
            </label>

            <label className="tree-workspace-field array-controls-field" htmlFor="linked-list-operation">
              <span>{t('module.l03.input.operation')}</span>
              <select
                id="linked-list-operation"
                value={operationType}
                onChange={(event) => {
                  const nextOperationType = event.target.value as LinkedListOperation['type'];
                  const normalizedValueInput = nextOperationType === 'insertAt' ? String(createRandomLinkedValue()) : valueInput;
                  reset();
                  prevNodeRects.current = new Map();
                  skipNextLayoutAnimationRef.current = true;
                  setOperationType(nextOperationType);
                  if (nextOperationType === 'insertAt') {
                    setValueInput(normalizedValueInput);
                  }
                  recomputeInputState(mode, listInput, nextOperationType, normalizedValueInput, indexInput);
                }}
              >
                <option value="find">{t('module.l03.operation.find')}</option>
                <option value="insertAt">{t('module.l03.operation.insertAt')}</option>
                <option value="deleteAt">{t('module.l03.operation.deleteAt')}</option>
              </select>
            </label>

            {(operationType === 'insertAt' || operationType === 'deleteAt') && (
              <label className="tree-workspace-field array-controls-field" htmlFor="linked-list-index">
                <span>{operationType === 'insertAt' ? t('module.l03.input.insertIndex') : t('module.l03.input.deleteIndex')}</span>
                <input
                  id="linked-list-index"
                  type="number"
                  value={indexInput}
                  onChange={(event) => {
                    const nextIndexInput = event.target.value;
                    reset();
                    prevNodeRects.current = new Map();
                    skipNextLayoutAnimationRef.current = true;
                    setIndexInput(nextIndexInput);
                    recomputeInputState(mode, listInput, operationType, valueInput, nextIndexInput);
                  }}
                />
              </label>
            )}

            {(operationType === 'find' || operationType === 'insertAt') && (
              <label className="tree-workspace-field array-controls-field" htmlFor="linked-list-value">
                <span>{t('module.l03.input.value')}</span>
                <input
                  id="linked-list-value"
                  type="number"
                  value={valueInput}
                  onChange={(event) => {
                    const nextValueInput = event.target.value;
                    reset();
                    prevNodeRects.current = new Map();
                    skipNextLayoutAnimationRef.current = true;
                    setValueInput(nextValueInput);
                    recomputeInputState(mode, listInput, operationType, nextValueInput, indexInput);
                  }}
                />
              </label>
            )}

            <label htmlFor="linked-list-head-node" className="linked-toggle linked-controls-toggle">
              <input
                id="linked-list-head-node"
                type="checkbox"
                checked={hasHeadNode}
                onChange={(event) => setHasHeadNode(event.target.checked)}
              />
              <span>{t('module.l03.input.withHeadNode')}</span>
            </label>

            <div className="tree-workspace-field array-controls-field array-controls-field-speed linked-controls-field-speed">
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
          </div>

          <p className={`workspace-inline-feedback array-controls-feedback${error ? ' form-error' : ''}`} aria-live="polite">
            {error || ''}
          </p>

          <div className="linear-controls-section">
            <div className="linear-controls-summary">
              <div className="linear-controls-card">
                <span>{t('playback.status')}</span>
                <strong>{getStatusLabel(status, t)}</strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('playback.step')}</span>
                <strong>
                  {currentLogicalStep}/{totalLogicalSteps}
                </strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('module.l03.input.operation')}</span>
                <strong>{operationLabel}</strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('module.l03.input.mode')}</span>
                <strong>{modeLabel}</strong>
              </div>
              <div className="linear-controls-card">
                <span>{t('module.l03.input.withHeadNode')}</span>
                <strong>{hasHeadNode ? 'On' : 'Off'}</strong>
              </div>
              {typeof targetIndex === 'number' ? (
                <div className="linear-controls-card">
                  <span>
                    {activeOperationType === 'insertAt' ? t('module.l03.input.insertIndex') : t('module.l03.input.deleteIndex')}
                  </span>
                  <strong>{targetIndex}</strong>
                </div>
              ) : null}
            </div>

            <div className="linear-controls-note-grid">
              <p className="linear-controls-note">{stepDescription}</p>
              {findResultText ? <p className="linear-controls-note">{findResultText}</p> : null}
              <p className="linear-controls-note">
                {t('module.l03.currentList')}: [{currentChainValues.join(', ')}]
              </p>
              <p className="linear-controls-note linear-controls-note-wide">
                {t('module.s01.highlight')}: {highlightSummary}
              </p>
            </div>

          </div>

          {LINKED_LIST_WORKSPACE_CONFIG.showJsonControls ? (
            <>
              <label className="tree-workspace-field" htmlFor="linked-list-json-input">
                <span>{t('module.l03.json.label')}</span>
                <textarea
                  id="linked-list-json-input"
                  value={jsonInput}
                  onChange={(event) => setJsonInput(event.target.value)}
                  rows={6}
                  placeholder={t('module.l03.json.placeholder')}
                />
              </label>

              {jsonFeedback ? (
                <p className={`${hasJsonError ? 'form-error' : 'array-preview'} workspace-inline-feedback`}>
                  {jsonFeedback}
                </p>
              ) : null}

              <div className="tree-workspace-drawer-actions">
                <button type="button" className="tree-workspace-ghost-button" onClick={handleExportJson}>
                  {t('module.l03.json.export')}
                </button>
                <button type="button" className="tree-workspace-ghost-button" onClick={handleImportJson}>
                  {t('module.l03.json.import')}
                </button>
              </div>
            </>
          ) : null}
        </>
      }
      stepContent={
        <div className="workspace-panel-scroll workspace-panel-scroll-linear">
          <div className="workspace-panel-code-only workspace-panel-code-grid-double">
            <div className="workspace-panel-linear-code">
              <div className="pseudocode-block pseudocode-block-linear">
                <h3>{t('module.l03.pseudocode')}：中文式</h3>
                <ol>
                  {operationCodeLines.map((lineKey, index) => (
                    <li key={lineKey} className={currentSnapshot?.codeLines.includes(index + 1) ? 'code-active' : ''}>
                      {t(lineKey)}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="workspace-panel-linear-code">
              <div className="pseudocode-block pseudocode-block-linear">
                <h3>{t('module.l03.pseudocode')}：类 C 式</h3>
                <ol>
                  {operationCStyleLines.map((line, index) => (
                    <li key={`c-${line}`} className={currentSnapshot?.codeLines.includes(index + 1) ? 'code-active' : ''}>
                      <code>{line}</code>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      }
      stageContent={
        <div className="linked-diagram-canvas" ref={diagramRef} aria-label="linked-list-visualizer">
          <svg className="linked-arrow-layer" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker
                id="linked-arrow-head-next"
                markerWidth="7"
                markerHeight="5"
                refX="6"
                refY="2.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L7,2.5 L0,5 z" fill="#365a80" />
              </marker>
              <marker
                id="linked-arrow-head-prev"
                markerWidth="7"
                markerHeight="5"
                refX="6"
                refY="2.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L7,2.5 L0,5 z" fill="#8b3fa6" />
              </marker>
              <marker
                id="linked-arrow-head-circular"
                markerWidth="7"
                markerHeight="5"
                refX="6"
                refY="2.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L7,2.5 L0,5 z" fill="#14746f" />
              </marker>
              <marker
                id="linked-arrow-head-moving"
                markerWidth="7"
                markerHeight="5"
                refX="6"
                refY="2.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L7,2.5 L0,5 z" fill="#d97706" />
              </marker>
              <marker
                id="linked-arrow-head-new"
                markerWidth="7"
                markerHeight="5"
                refX="6"
                refY="2.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L7,2.5 L0,5 z" fill="#1e5ea3" />
              </marker>
              <marker
                id="linked-arrow-head-delete"
                markerWidth="7"
                markerHeight="5"
                refX="6"
                refY="2.5"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L7,2.5 L0,5 z" fill="#b94848" />
              </marker>
            </defs>

            {headArrow ? (
              <path
                d={getHeadArrowPolylinePoints(headArrow)}
                className="head-pointer-arrow"
                markerEnd="url(#linked-arrow-head-next)"
              />
            ) : null}

            {linkArrows.map((arrow) => (
              <path
                key={arrow.key}
                d={arrow.d}
                className={arrow.className ?? 'linked-node-arrow'}
                markerEnd={`url(#${arrow.markerId ?? 'linked-arrow-head-next'})`}
              />
            ))}
          </svg>

          <div className="linked-diagram-track">
            <div className="head-pointer-float" data-head-pointer="true">
              {t('module.l03.headPointer')}
            </div>

            <div className="linked-chain-wrap">
              {chainVisualNodes.length > 0 || floatingVisualNodes.length > 0 ? (
                <div className="linked-list-nodes">
                  {chainVisualNodes.map((node, index) => {
                    const detached = node.detached;

                    return (
                      <Fragment key={node.id}>
                        {showInsertSlot && floatingSlotIndex === index ? <div className="linked-insert-slot" /> : null}
                        <div ref={setNodeWrapRef(node.id)} className="linked-node-wrap">
                          <div className="linked-node-index">{node.indexLabel}</div>
                          <div
                            data-node-id={node.id}
                            className={`linked-node split-node${activeMode === 'doubly' ? ' linked-node-doubly' : ''} bar-${node.highlight}${detached ? ' linked-node-detached' : ''}`}
                          >
                            {activeMode === 'doubly' ? (
                              <div className="linked-node-pointer linked-node-pointer-prev" data-prev-pointer-id={node.id}>
                                {node.prevId ? 'prev' : t('module.l03.nullPointer')}
                              </div>
                            ) : null}
                            <div className="linked-node-data">{node.label}</div>
                            <div className="linked-node-pointer" data-pointer-id={node.id}>
                              {node.nextId ? (activeMode === 'doubly' ? 'next' : '') : activeMode === 'circular' && node.id !== HEAD_NODE_ID ? t('module.l03.selfPointer') : t('module.l03.nullPointer')}
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    );
                  })}
                  {showInsertSlot && floatingSlotIndex === chainVisualNodes.length ? <div className="linked-insert-slot" /> : null}

                  {floatingVisualNodes.map((node) => {
                    const detached = node.detached;
                    const left = (floatingSlotIndex ?? 0) * (NODE_WIDTH + NODE_GAP);

                    return (
                      <div
                        key={node.id}
                        ref={setNodeWrapRef(node.id)}
                        className="linked-node-wrap linked-node-wrap-floating"
                        style={{ left: `${left}px` }}
                      >
                        <div className="linked-node-index">{node.indexLabel}</div>
                        <div
                          data-node-id={node.id}
                          className={`linked-node split-node${activeMode === 'doubly' ? ' linked-node-doubly' : ''} bar-${node.highlight}${detached ? ' linked-node-detached' : ''}`}
                        >
                          {activeMode === 'doubly' ? (
                            <div className="linked-node-pointer linked-node-pointer-prev" data-prev-pointer-id={node.id}>
                              {node.prevId ? 'prev' : t('module.l03.nullPointer')}
                            </div>
                          ) : null}
                          <div className="linked-node-data">{node.label}</div>
                          <div className="linked-node-pointer" data-pointer-id={node.id}>
                            {node.nextId ? (activeMode === 'doubly' ? 'next' : '') : t('module.l03.nullPointer')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="linked-null-target" data-null-target="true">
                  {t('module.l03.nullPointer')}
                </div>
              )}
            </div>
          </div>
        </div>
      }
      transportLeft={
        <>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={prev}
            disabled={!hasValidConfig || steps.length === 0 || currentStep <= 0}
          >
            {t('playback.prev')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn tree-workspace-transport-btn-primary"
            onClick={status === 'playing' ? pause : handlePlay}
            disabled={!hasValidConfig || steps.length === 0 || (status !== 'playing' && isAtLastFrame)}
          >
            {status === 'playing' ? t('playback.pause') : t('playback.play')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={handleNextStep}
            disabled={!hasValidConfig || isAtLastFrame}
          >
            {t('playback.next')}
          </button>
          <button
            type="button"
            className="tree-workspace-transport-btn"
            onClick={handleResetToInitialState}
            disabled={!hasValidConfig || steps.length === 0}
          >
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
            {currentLogicalStep}/{totalLogicalSteps}
          </span>
        </>
      }
      transportRight={
        <>
          <span className="tree-workspace-transport-chip">{operationLabel}</span>
          <span className="tree-workspace-transport-chip">{modeLabel}</span>
          {typeof targetIndex === 'number' ? <span className="tree-workspace-transport-chip">#{targetIndex}</span> : null}
          <span className="tree-workspace-transport-chip">{hasHeadNode ? 'H' : 'NH'}</span>
          <span className="tree-workspace-transport-chip tree-workspace-transport-chip-active">
            {currentChainValues.length}
          </span>
        </>
      }
    />
  );
}
