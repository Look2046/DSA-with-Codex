import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from 'react';

export type StagePoint = {
  x: number;
  y: number;
};

export type StageSize = {
  width: number;
  height: number;
};

export type StageRect = StagePoint & StageSize;

type AnchorPanelDragState = {
  pointerId: number;
  offsetX: number;
  offsetY: number;
};

type LayoutMetrics = {
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
};

type DefaultAnchorPositionResolver = (
  stageSize: StageSize,
  anchorSize: StageSize,
  panelSize: StageSize,
) => StagePoint;

type UseStageAnchorPanelOptions = {
  stageRef: RefObject<HTMLElement | null>;
  anchorRef: RefObject<HTMLElement | null>;
  panelRef: RefObject<HTMLElement | null>;
  isOpen: boolean;
  defaultPanelPosition: DefaultAnchorPositionResolver;
  defaultAnchorSize: StageSize;
  defaultPanelSize: StageSize;
  collisionTarget?: StageRect | null;
  margin?: number;
  autoAvoid?: boolean;
  enabled?: boolean;
};

type UseStageAnchorPanelResult = {
  panelStyle: CSSProperties;
  isDragging: boolean;
  startDrag: (event: ReactPointerEvent<HTMLElement>) => void;
};

const DEFAULT_STAGE_SIZE: StageSize = {
  width: 1200,
  height: 560,
};

const DEFAULT_MARGIN = 14;
const AVOIDANCE_GAP = 18;

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function arePointsEqual(left: StagePoint, right: StagePoint): boolean {
  return Math.abs(left.x - right.x) < 0.5 && Math.abs(left.y - right.y) < 0.5;
}

function areSizesEqual(left: StageSize, right: StageSize): boolean {
  return Math.abs(left.width - right.width) < 0.5 && Math.abs(left.height - right.height) < 0.5;
}

function readElementSize(element: HTMLElement | null, fallback: StageSize): StageSize {
  if (!element) {
    return fallback;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return fallback;
  }

  return {
    width: rect.width,
    height: rect.height,
  };
}

function buildBoundingBox(anchorPosition: StagePoint, metrics: LayoutMetrics): StageRect {
  return {
    x: anchorPosition.x + metrics.offsetX,
    y: anchorPosition.y + metrics.offsetY,
    width: metrics.width,
    height: metrics.height,
  };
}

function clampBoxOrigin(boxOrigin: StagePoint, boxSize: StageSize, stageSize: StageSize, margin: number): StagePoint {
  const maxX = Math.max(margin, stageSize.width - boxSize.width - margin);
  const maxY = Math.max(margin, stageSize.height - boxSize.height - margin);

  return {
    x: clampNumber(boxOrigin.x, margin, maxX),
    y: clampNumber(boxOrigin.y, margin, maxY),
  };
}

function clampAnchorPosition(
  anchorPosition: StagePoint,
  metrics: LayoutMetrics,
  stageSize: StageSize,
  margin: number,
): StagePoint {
  const boxOrigin = clampBoxOrigin(
    {
      x: anchorPosition.x + metrics.offsetX,
      y: anchorPosition.y + metrics.offsetY,
    },
    { width: metrics.width, height: metrics.height },
    stageSize,
    margin,
  );

  return {
    x: boxOrigin.x - metrics.offsetX,
    y: boxOrigin.y - metrics.offsetY,
  };
}

function getRectOverlapArea(left: StageRect, right: StageRect): number {
  const overlapLeft = Math.max(left.x, right.x);
  const overlapRight = Math.min(left.x + left.width, right.x + right.width);
  const overlapTop = Math.max(left.y, right.y);
  const overlapBottom = Math.min(left.y + left.height, right.y + right.height);

  return Math.max(0, overlapRight - overlapLeft) * Math.max(0, overlapBottom - overlapTop);
}

function createUniquePointKey(point: StagePoint): string {
  return `${Math.round(point.x * 10)}:${Math.round(point.y * 10)}`;
}

function getDistanceBetweenPoints(left: StagePoint, right: StagePoint): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

function buildCandidateBoxOrigins(
  currentBox: StageRect,
  preferredBox: StageRect,
  target: StageRect,
): StagePoint[] {
  const centeredX = target.x + target.width / 2 - currentBox.width / 2;
  const centeredY = target.y + target.height / 2 - currentBox.height / 2;
  const aboveY = target.y - currentBox.height - AVOIDANCE_GAP;
  const belowY = target.y + target.height + AVOIDANCE_GAP;
  const leftX = target.x - currentBox.width - AVOIDANCE_GAP;
  const rightX = target.x + target.width + AVOIDANCE_GAP;

  return [
    { x: currentBox.x, y: currentBox.y },
    { x: preferredBox.x, y: preferredBox.y },
    { x: currentBox.x, y: aboveY },
    { x: currentBox.x, y: belowY },
    { x: leftX, y: currentBox.y },
    { x: rightX, y: currentBox.y },
    { x: centeredX, y: aboveY },
    { x: centeredX, y: belowY },
    { x: leftX, y: centeredY },
    { x: rightX, y: centeredY },
    { x: preferredBox.x, y: aboveY },
    { x: preferredBox.x, y: belowY },
    { x: leftX, y: preferredBox.y },
    { x: rightX, y: preferredBox.y },
  ];
}

function resolveBestAnchorPosition(
  currentAnchorPosition: StagePoint,
  preferredAnchorPosition: StagePoint,
  metrics: LayoutMetrics,
  stageSize: StageSize,
  target: StageRect,
  margin: number,
): StagePoint {
  const currentBox = buildBoundingBox(currentAnchorPosition, metrics);
  if (getRectOverlapArea(currentBox, target) <= 0) {
    return currentAnchorPosition;
  }

  const preferredBox = buildBoundingBox(
    clampAnchorPosition(preferredAnchorPosition, metrics, stageSize, margin),
    metrics,
  );
  const cornerMaxX = Math.max(margin, stageSize.width - metrics.width - margin);
  const cornerMaxY = Math.max(margin, stageSize.height - metrics.height - margin);
  const candidateOrigins = [
    ...buildCandidateBoxOrigins(currentBox, preferredBox, target),
    { x: margin, y: margin },
    { x: cornerMaxX, y: margin },
    { x: margin, y: cornerMaxY },
    { x: cornerMaxX, y: cornerMaxY },
  ];

  let bestAnchor = currentAnchorPosition;
  let bestScore = Number.POSITIVE_INFINITY;
  const visited = new Set<string>();

  candidateOrigins.forEach((candidateOrigin) => {
    const clampedOrigin = clampBoxOrigin(
      candidateOrigin,
      { width: metrics.width, height: metrics.height },
      stageSize,
      margin,
    );
    const key = createUniquePointKey(clampedOrigin);
    if (visited.has(key)) {
      return;
    }
    visited.add(key);

    const candidateAnchor = {
      x: clampedOrigin.x - metrics.offsetX,
      y: clampedOrigin.y - metrics.offsetY,
    };
    const candidateBox = buildBoundingBox(candidateAnchor, metrics);
    const overlapArea = getRectOverlapArea(candidateBox, target);
    const distanceToCurrent = getDistanceBetweenPoints(clampedOrigin, { x: currentBox.x, y: currentBox.y });
    const distanceToPreferred = getDistanceBetweenPoints(clampedOrigin, { x: preferredBox.x, y: preferredBox.y });
    const score = overlapArea * 1000000 + distanceToCurrent + distanceToPreferred * 0.25;

    if (score < bestScore) {
      bestScore = score;
      bestAnchor = candidateAnchor;
    }
  });

  return bestAnchor;
}

function getStageSize(stageRef: RefObject<HTMLElement | null>): StageSize {
  const element = stageRef.current;
  if (!element) {
    return DEFAULT_STAGE_SIZE;
  }

  return readElementSize(element, DEFAULT_STAGE_SIZE);
}

export function createFocusCollisionRect(
  point: StagePoint | null | undefined,
  stageSize: StageSize,
  width = 112,
  height = 104,
): StageRect | null {
  if (!point) {
    return null;
  }

  const centerX = (point.x / 100) * stageSize.width;
  const centerY = (point.y / 100) * stageSize.height;

  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
  };
}

export function useStageAnchorPanel({
  stageRef,
  anchorRef,
  panelRef,
  isOpen,
  defaultPanelPosition,
  defaultAnchorSize,
  defaultPanelSize,
  collisionTarget = null,
  margin = DEFAULT_MARGIN,
  autoAvoid = true,
  enabled = true,
}: UseStageAnchorPanelOptions): UseStageAnchorPanelResult {
  const [stageSize, setStageSize] = useState<StageSize>(DEFAULT_STAGE_SIZE);
  const [anchorSize, setAnchorSize] = useState<StageSize>(defaultAnchorSize);
  const [panelSize, setPanelSize] = useState<StageSize>(defaultPanelSize);
  const [dragState, setDragState] = useState<AnchorPanelDragState | null>(null);
  const [anchorPosition, setAnchorPosition] = useState<StagePoint>(() =>
    defaultPanelPosition(DEFAULT_STAGE_SIZE, defaultAnchorSize, defaultPanelSize),
  );

  const metrics = useMemo(
    () => ({
      offsetX: 0,
      offsetY: 0,
      width: panelSize.width,
      height: panelSize.height,
    }),
    [panelSize.height, panelSize.width],
  );
  const resolvedAnchorPosition = useMemo(() => {
    if (!enabled) {
      return anchorPosition;
    }

    const clamped = clampAnchorPosition(anchorPosition, metrics, stageSize, margin);
    if (!isOpen || !autoAvoid || !collisionTarget) {
      return clamped;
    }

    const preferredAnchor = defaultPanelPosition(stageSize, anchorSize, panelSize);
    return resolveBestAnchorPosition(clamped, preferredAnchor, metrics, stageSize, collisionTarget, margin);
  }, [
    anchorPosition,
    anchorSize,
    autoAvoid,
    collisionTarget,
    defaultPanelPosition,
    enabled,
    isOpen,
    margin,
    metrics,
    panelSize,
    stageSize,
  ]);

  useEffect(() => {
    const updateStageSize = () => {
      const nextSize = getStageSize(stageRef);
      setStageSize((previous) => (areSizesEqual(previous, nextSize) ? previous : nextSize));
    };

    updateStageSize();
    const stageElement = stageRef.current;
    if (!stageElement || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => updateStageSize());
    observer.observe(stageElement);
    return () => observer.disconnect();
  }, [stageRef]);

  useEffect(() => {
    const updateElementSizes = () => {
      const nextAnchorSize = readElementSize(anchorRef.current, defaultAnchorSize);
      const nextPanelSize = readElementSize(panelRef.current, defaultPanelSize);

      setAnchorSize((previous) => (areSizesEqual(previous, nextAnchorSize) ? previous : nextAnchorSize));
      setPanelSize((previous) => (areSizesEqual(previous, nextPanelSize) ? previous : nextPanelSize));
    };

    updateElementSizes();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => updateElementSizes());
    if (anchorRef.current) {
      observer.observe(anchorRef.current);
    }
    if (panelRef.current) {
      observer.observe(panelRef.current);
    }
    return () => observer.disconnect();
  }, [anchorRef, defaultAnchorSize, defaultPanelSize, isOpen, panelRef]);

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      const stageElement = stageRef.current;
      if (!stageElement) {
        return;
      }

      const stageRect = stageElement.getBoundingClientRect();
      const nextAnchor = clampAnchorPosition(
        {
          x: event.clientX - stageRect.left - dragState.offsetX,
          y: event.clientY - stageRect.top - dragState.offsetY,
        },
        metrics,
        stageSize,
        margin,
      );

      setAnchorPosition((previous) => (arePointsEqual(previous, nextAnchor) ? previous : nextAnchor));
    };

    const handlePointerEnd = (event: PointerEvent) => {
      if (event.pointerId === dragState.pointerId) {
        setDragState(null);
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
  }, [dragState, margin, metrics, stageRef, stageSize]);

  useEffect(() => {
    if (!dragState) {
      return;
    }

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
    };
  }, [dragState]);

  const startDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) {
        return;
      }

      if (event.button !== 0) {
        return;
      }

      const stageElement = stageRef.current;
      if (!stageElement) {
        return;
      }

      const stageRect = stageElement.getBoundingClientRect();
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture?.(event.pointerId);

      setDragState({
        pointerId: event.pointerId,
        offsetX: event.clientX - stageRect.left - resolvedAnchorPosition.x,
        offsetY: event.clientY - stageRect.top - resolvedAnchorPosition.y,
      });
    },
    [enabled, resolvedAnchorPosition.x, resolvedAnchorPosition.y, stageRef],
  );

  const panelStyle = useMemo<CSSProperties>(
    () =>
      enabled
        ? {
          position: 'absolute',
          left: `${resolvedAnchorPosition.x}px`,
          top: `${resolvedAnchorPosition.y}px`,
          right: 'auto',
          bottom: 'auto',
          margin: 0,
        }
        : {},
    [enabled, resolvedAnchorPosition.x, resolvedAnchorPosition.y],
  );

  return {
    panelStyle,
    isDragging: dragState !== null,
    startDrag,
  };
}
