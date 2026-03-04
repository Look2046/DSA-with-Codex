import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useCurrentModule } from '../../hooks/useCurrentModule';
import { useI18n } from '../../i18n/useI18n';
import type { TranslationKey } from '../../i18n/translations';
import { generateLinkedListSteps } from '../../modules/linear/linkedListOps';
import type { LinkedListOperation, LinkedListStep } from '../../modules/linear/linkedListOps';
import { usePlaybackStore } from '../../store/playbackStore';
import type { HighlightType, PlaybackStatus } from '../../types/animation';

type LinkedListConfig = {
  list: number[];
  operation: LinkedListOperation;
};

type ArrowSegment = {
  d: string;
  key: string;
  className?: string;
};

type VisualNode = {
  id: string;
  label: string;
  nextId: string | null;
  detached: boolean;
  highlight: HighlightType;
  indexLabel: string;
  floating: boolean;
};

const DEFAULT_CONFIG: LinkedListConfig = {
  list: [4, 7, 11],
  operation: {
    type: 'insertAt',
    index: 1,
    value: 9,
  },
};

const DEFAULT_OPERATION = DEFAULT_CONFIG.operation as Extract<LinkedListOperation, { type: 'insertAt' }>;
const HEAD_NODE_ID = '__head_node__';
const NODE_WIDTH = 126;
const NODE_GAP = 16;

function parseNumberArrayAllowEmpty(raw: string): number[] | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return [];
  }

  const parts = trimmed
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  const parsed = parts.map((item) => Number(item));
  if (parsed.some((value) => Number.isNaN(value))) {
    return null;
  }

  return parsed;
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

function getOperationCodeLines(operation: LinkedListOperation['type']): TranslationKey[] {
  if (operation === 'find') {
    return [
      'module.l03.code.find.line1',
      'module.l03.code.find.line2',
      'module.l03.code.find.line3',
      'module.l03.code.find.line4',
      'module.l03.code.find.line5',
    ];
  }

  if (operation === 'insertAt') {
    return [
      'module.l03.code.insert.line1',
      'module.l03.code.insert.line2',
      'module.l03.code.insert.line3',
      'module.l03.code.insert.line4',
      'module.l03.code.insert.line5',
      'module.l03.code.insert.line6',
      'module.l03.code.insert.line7',
      'module.l03.code.insert.line8',
    ];
  }

  return [
    'module.l03.code.delete.line1',
    'module.l03.code.delete.line2',
    'module.l03.code.delete.line3',
    'module.l03.code.delete.line4',
    'module.l03.code.delete.line5',
  ];
}

function getFindResultText(
  operation: LinkedListOperation,
  list: number[],
  step: LinkedListStep | undefined,
  t: ReturnType<typeof useI18n>['t'],
): string | null {
  if (operation.type !== 'find') {
    return null;
  }

  if (step?.action !== 'completed') {
    return null;
  }

  const matchedIndex = list.indexOf(operation.value);
  if (matchedIndex >= 0) {
    return `${t('module.l03.findResult.found')} ${matchedIndex}`;
  }

  if (list.length === 0) {
    return `${t('module.l03.findResult.notFound')} []`;
  }

  return `${t('module.l03.findResult.notFound')} [0, ${list.length - 1}]`;
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
): { x: number; y: number } {
  return {
    x: rect.right - containerRect.left + offsetX,
    y: rect.top + rect.height / 2 - containerRect.top + offsetY,
  };
}

function getLeftCenter(
  rect: DOMRect,
  containerRect: DOMRect,
  offsetX = 0,
  offsetY = 0,
): { x: number; y: number } {
  return {
    x: rect.left - containerRect.left + offsetX,
    y: rect.top + rect.height / 2 - containerRect.top + offsetY,
  };
}

function getCenterOfPointerField(
  rect: DOMRect,
  containerRect: DOMRect,
  offsetX = 0,
  offsetY = 0,
): { x: number; y: number } {
  return {
    x: rect.left + rect.width / 2 - containerRect.left + offsetX,
    y: rect.top + rect.height / 2 - containerRect.top + offsetY,
  };
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
  const currentModule = useCurrentModule();

  const [listInput, setListInput] = useState(DEFAULT_CONFIG.list.join(', '));
  const [operationType, setOperationType] = useState<LinkedListOperation['type']>(DEFAULT_CONFIG.operation.type);
  const [valueInput, setValueInput] = useState(String(DEFAULT_OPERATION.value));
  const [indexInput, setIndexInput] = useState(String(DEFAULT_OPERATION.index + 1));
  const [speedMs, setSpeedMs] = useState(700);
  const [hasHeadNode, setHasHeadNode] = useState(false);

  const [linkArrows, setLinkArrows] = useState<ArrowSegment[]>([]);
  const [headArrow, setHeadArrow] = useState<ArrowSegment | null>(null);
  const [arrowLayerSize, setArrowLayerSize] = useState({ width: 0, height: 0 });
  const [movingRootProgress, setMovingRootProgress] = useState(1);
  const [linkDrawProgress, setLinkDrawProgress] = useState(1);
  const [arrowFrameTick, setArrowFrameTick] = useState(0);
  const diagramRef = useRef<HTMLDivElement | null>(null);
  const nodeWrapRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevNodeRects = useRef<Map<string, DOMRect>>(new Map());
  const arrowLayerSizeRef = useRef({ width: 0, height: 0 });

  const { status, currentStep, totalSteps, setTotalSteps, play, pause, nextStep, prevStep, reset } =
    usePlaybackStore();

  const parsedConfig = useMemo<{ config: LinkedListConfig | null; error: string }>(() => {
    const parsedList = parseNumberArrayAllowEmpty(listInput);
    if (!parsedList) {
      return { config: null, error: t('module.l03.error.list') };
    }
    if (parsedList.length > 30) {
      return { config: null, error: t('module.l03.error.length') };
    }

    if (operationType === 'find') {
      const value = Number(valueInput);
      if (Number.isNaN(value)) {
        return { config: null, error: t('module.l03.error.value') };
      }
      return { config: { list: parsedList, operation: { type: 'find', value } }, error: '' };
    }

    if (operationType === 'insertAt') {
      const displayIndex = Number(indexInput);
      const value = Number(valueInput);
      if (!Number.isInteger(displayIndex) || displayIndex < 1 || displayIndex > parsedList.length + 1) {
        return { config: null, error: t('module.l03.error.insertIndex') };
      }
      if (Number.isNaN(value)) {
        return { config: null, error: t('module.l03.error.value') };
      }
      return { config: { list: parsedList, operation: { type: 'insertAt', index: displayIndex - 1, value } }, error: '' };
    }

    const displayIndex = Number(indexInput);
    if (!Number.isInteger(displayIndex) || displayIndex < 1 || displayIndex > parsedList.length) {
      return { config: null, error: t('module.l03.error.deleteIndex') };
    }
    return { config: { list: parsedList, operation: { type: 'deleteAt', index: displayIndex - 1 } }, error: '' };
  }, [listInput, operationType, valueInput, indexInput, t]);

  const steps = useMemo(
    () => (parsedConfig.config ? generateLinkedListSteps(parsedConfig.config.list, parsedConfig.config.operation) : []),
    [parsedConfig.config],
  );
  const error = parsedConfig.error;
  const activeOperationType = parsedConfig.config?.operation.type ?? operationType;
  const hasValidConfig = parsedConfig.config !== null;
  const currentSnapshot = steps[currentStep] ?? steps[0];
  const completedListText = useMemo(() => {
    const lastStep = steps[steps.length - 1];
    return collectChainValues(lastStep).join(', ');
  }, [steps]);

  const syncInputToCompletedList = useCallback(() => {
    if (!hasValidConfig || steps.length === 0) {
      return;
    }

    if (normalizeListText(listInput) === normalizeListText(completedListText)) {
      return;
    }

    // Clear FLIP baseline before swapping to the next operation input,
    // so stale rects do not cause artificial jump animations.
    prevNodeRects.current = new Map();
    setListInput(completedListText);
  }, [completedListText, hasValidConfig, listInput, steps.length]);

  useEffect(() => {
    setTotalSteps(steps.length);
    reset();
  }, [setTotalSteps, reset, steps]);

  useEffect(() => {
    if (status !== 'playing') {
      return;
    }

    const timer = window.setInterval(() => {
      const state = usePlaybackStore.getState();
      if (state.currentStep >= state.totalSteps - 1) {
        state.setStatus('completed');
        syncInputToCompletedList();
        window.clearInterval(timer);
        return;
      }
      state.nextStep();
    }, speedMs);

    return () => window.clearInterval(timer);
  }, [status, speedMs, syncInputToCompletedList]);

  const handleNextStep = useCallback(() => {
    const willComplete = currentStep >= steps.length - 2;
    nextStep();
    if (willComplete) {
      syncInputToCompletedList();
    }
  }, [currentStep, nextStep, steps.length, syncInputToCompletedList]);

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
    if (currentSnapshot?.action !== 'linkNewNode') {
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
        detached: true,
        highlight:
          highlightByNodeId.get(node.id) ?? (activeOperationType === 'deleteAt' ? 'swapping' : 'new-node'),
        indexLabel: activeOperationType === 'deleteAt' ? t('module.l03.index.removed') : t('module.l03.index.new'),
        floating: true,
      });
    });

    return nodes;
  }, [currentSnapshot, floatingNodeIds, highlightByNodeId, nodeMap, activeOperationType, t]);

  const operationCodeLines = useMemo(() => getOperationCodeLines(activeOperationType), [activeOperationType]);
  const targetIndex =
    typeof currentSnapshot?.targetIndex === 'number'
      ? currentSnapshot.targetIndex
      : parsedConfig.config?.operation.type === 'insertAt'
        ? parsedConfig.config.operation.index
        : null;
  const floatingSlotIndex =
    typeof targetIndex === 'number' ? Math.max(0, targetIndex + (hasHeadNode ? 1 : 0)) : null;

  const showInsertSlot = currentSnapshot?.action === 'shiftForInsert' && floatingVisualNodes.length > 0;
  const renderNodes = useMemo(() => [...chainVisualNodes, ...floatingVisualNodes], [chainVisualNodes, floatingVisualNodes]);
  const findResultText = useMemo(
    () =>
      parsedConfig.config ? getFindResultText(parsedConfig.config.operation, parsedConfig.config.list, currentSnapshot, t) : null,
    [parsedConfig.config, currentSnapshot, t],
  );

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
    const skipLayoutAnimation = activeOperationType === 'deleteAt' && currentSnapshot?.action === 'completed';

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
      const offsetX = container.scrollLeft;
      const offsetY = container.scrollTop;
      const nextArrowLayerSize = {
        width: Math.max(container.clientWidth, container.scrollWidth),
        height: Math.max(container.clientHeight, container.scrollHeight),
      };
      if (
        nextArrowLayerSize.width !== arrowLayerSizeRef.current.width ||
        nextArrowLayerSize.height !== arrowLayerSizeRef.current.height
      ) {
        arrowLayerSizeRef.current = nextArrowLayerSize;
        setArrowLayerSize(nextArrowLayerSize);
      }
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

        const fromPoint = getCenterOfPointerField(fromEl.getBoundingClientRect(), containerRect, offsetX, offsetY);
        const toPoint = getLeftCenter(toEl.getBoundingClientRect(), containerRect, offsetX, offsetY);

        arrows.push({
          d: buildLinePath(fromPoint, toPoint),
          key: `default-${node.id}-${node.nextId}`,
          className: 'linked-node-arrow',
        });
      });

      (currentSnapshot?.transientLinks ?? []).forEach((link) => {
        const fromEl = container.querySelector<HTMLElement>(`[data-pointer-id="${link.fromId}"]`);
        const toEl = container.querySelector<HTMLElement>(`[data-node-id="${link.toId}"]`);
        if (!fromEl || !toEl) {
          return;
        }

        let fromPoint = getCenterOfPointerField(fromEl.getBoundingClientRect(), containerRect, offsetX, offsetY);
        const toPoint = getLeftCenter(toEl.getBoundingClientRect(), containerRect, offsetX, offsetY);
        if (link.style === 'moving-root' && link.moveToPointerId) {
          const moveToEl = container.querySelector<HTMLElement>(`[data-pointer-id="${link.moveToPointerId}"]`);
          if (moveToEl) {
            const moveToPoint = getCenterOfPointerField(moveToEl.getBoundingClientRect(), containerRect, offsetX, offsetY);
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
        });
      });

      const headPointerEl = container.querySelector<HTMLElement>('[data-head-pointer="true"]');
      const firstNodeId = chainVisualNodes[0]?.id;
      const targetEl = firstNodeId
        ? container.querySelector<HTMLElement>(`[data-node-id="${firstNodeId}"]`)
        : container.querySelector<HTMLElement>('[data-null-target="true"]');

      if (headPointerEl && targetEl) {
        const fromPoint = getRightCenter(headPointerEl.getBoundingClientRect(), containerRect, offsetX, offsetY);
        const toPoint = getLeftCenter(targetEl.getBoundingClientRect(), containerRect, offsetX, offsetY);
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
    container?.addEventListener('scroll', updateArrows, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateArrows);
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
  ]);

  return (
    <section className="linked-list-page">
      <h2>{t('module.l03.title')}</h2>
      <p>{t('module.l03.body')}</p>

      <div className="array-form">
        <label htmlFor="linked-list-input">
          <span>{t('module.l03.input.list')}</span>
          <input
            id="linked-list-input"
            value={listInput}
            onChange={(event) => setListInput(event.target.value)}
            placeholder="4, 7, 11"
          />
        </label>

        <label htmlFor="linked-list-operation">
          <span>{t('module.l03.input.operation')}</span>
          <select
            id="linked-list-operation"
            value={operationType}
            onChange={(event) => setOperationType(event.target.value as LinkedListOperation['type'])}
          >
            <option value="find">{t('module.l03.operation.find')}</option>
            <option value="insertAt">{t('module.l03.operation.insertAt')}</option>
            <option value="deleteAt">{t('module.l03.operation.deleteAt')}</option>
          </select>
        </label>

        {(operationType === 'insertAt' || operationType === 'deleteAt') && (
          <label htmlFor="linked-list-index">
            <span>{operationType === 'insertAt' ? t('module.l03.input.insertIndex') : t('module.l03.input.deleteIndex')}</span>
            <input
              id="linked-list-index"
              type="number"
              value={indexInput}
              onChange={(event) => setIndexInput(event.target.value)}
            />
          </label>
        )}

        {(operationType === 'find' || operationType === 'insertAt') && (
          <label htmlFor="linked-list-value">
            <span>{t('module.l03.input.value')}</span>
            <input
              id="linked-list-value"
              type="number"
              value={valueInput}
              onChange={(event) => setValueInput(event.target.value)}
            />
          </label>
        )}

        <label htmlFor="linked-list-head-node" className="linked-toggle">
          <span>{t('module.l03.input.withHeadNode')}</span>
          <input
            id="linked-list-head-node"
            type="checkbox"
            checked={hasHeadNode}
            onChange={(event) => setHasHeadNode(event.target.checked)}
          />
        </label>

      </div>

      {error ? <p className="form-error">{error}</p> : null}

      <div className="bubble-toolbar">
        <span>{t('module.s01.speed')}</span>
        <div className="speed-group">
          {speedOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              className={speedMs === option.value ? 'speed-active' : ''}
              onClick={() => setSpeedMs(option.value)}
            >
              {t(option.key)}
            </button>
          ))}
        </div>
      </div>

      <p>
        {t('module.s01.moduleLabel')}: {currentModule?.id ?? '-'} | {t('playback.step')}: {currentStep + 1}/{totalSteps || 0}{' '}
        | {t('playback.status')}: {getStatusLabel(status, t)}
      </p>

      <p>{getStepDescription(currentSnapshot, t)}</p>
      {findResultText ? <p className="array-preview">{findResultText}</p> : null}
      <p className="array-preview">
        {t('module.l03.currentList')}: [{currentChainValues.join(', ')}]
      </p>
      <p>
        {t('module.s01.highlight')}:{' '}
        {(currentSnapshot?.highlights ?? [])
          .map((item) => `${item.index}:${getHighlightLabel(item.type, t)}`)
          .join(' | ') || t('module.s01.none')}
      </p>

      <div className="linked-diagram-canvas" ref={diagramRef} aria-label="linked-list-visualizer">
        <svg
          className="linked-arrow-layer"
          xmlns="http://www.w3.org/2000/svg"
          width={arrowLayerSize.width || undefined}
          height={arrowLayerSize.height || undefined}
        >
          <defs>
            <marker
              id="linked-arrow-head"
              markerWidth="7"
              markerHeight="5"
              refX="6"
              refY="2.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L7,2.5 L0,5 z" fill="#365a80" />
            </marker>
          </defs>

          {headArrow ? (
            <path
              d={getHeadArrowPolylinePoints(headArrow)}
              className="head-pointer-arrow"
              markerEnd="url(#linked-arrow-head)"
            />
          ) : null}

          {linkArrows.map((arrow) => (
            <path
              key={arrow.key}
              d={arrow.d}
              className={arrow.className ?? 'linked-node-arrow'}
              markerEnd="url(#linked-arrow-head)"
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
                          className={`linked-node split-node bar-${node.highlight}${detached ? ' linked-node-detached' : ''}`}
                        >
                          <div className="linked-node-data">{node.label}</div>
                          <div className="linked-node-pointer" data-pointer-id={node.id}>
                            {node.nextId ? '' : t('module.l03.nullPointer')}
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
                        className={`linked-node split-node bar-${node.highlight}${detached ? ' linked-node-detached' : ''}`}
                      >
                        <div className="linked-node-data">{node.label}</div>
                        <div className="linked-node-pointer" data-pointer-id={node.id}>
                          {node.nextId ? '' : t('module.l03.nullPointer')}
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

      <div className="legend-row">
        <span className="legend-item legend-default">{t('module.s01.legend.default')}</span>
        <span className="legend-item legend-visiting">{t('module.l03.highlight.visiting')}</span>
        <span className="legend-item legend-matched">{t('module.l03.highlight.matched')}</span>
        <span className="legend-item legend-swapping">{t('module.l03.highlight.swapping')}</span>
        <span className="legend-item legend-inserted">{t('module.l03.highlight.newNode')}</span>
      </div>

      <div className="playback-actions">
        <button type="button" onClick={play} disabled={status === 'playing' || !hasValidConfig || steps.length === 0}>
          {t('playback.play')}
        </button>
        <button type="button" onClick={pause} disabled={status !== 'playing'}>
          {t('playback.pause')}
        </button>
        <button type="button" onClick={prevStep} disabled={!hasValidConfig || steps.length === 0}>
          {t('playback.prev')}
        </button>
        <button type="button" onClick={handleNextStep} disabled={!hasValidConfig || steps.length === 0}>
          {t('playback.next')}
        </button>
        <button type="button" onClick={reset} disabled={!hasValidConfig || steps.length === 0}>
          {t('playback.reset')}
        </button>
      </div>

      <div className="pseudocode-block">
        <h3>{t('module.l03.pseudocode')}</h3>
        <ol>
          {operationCodeLines.map((lineKey, index) => (
            <li key={lineKey} className={currentSnapshot?.codeLines.includes(index + 1) ? 'code-active' : ''}>
              {t(lineKey)}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
