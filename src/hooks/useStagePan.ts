import { useCallback, useRef, useState, type CSSProperties, type PointerEvent } from 'react';

type StagePanPoint = {
  x: number;
  y: number;
};

const INTERACTIVE_SELECTOR = [
  'button',
  'a',
  'input',
  'select',
  'textarea',
  'label',
  '[role="button"]',
  '[contenteditable="true"]',
  '.tree-workspace-transport',
  '.tree-workspace-floating-zoom',
  '.tree-workspace-stage-meta',
].join(',');

function canStartPan(event: PointerEvent<HTMLElement>): boolean {
  if (event.button !== 0 || event.pointerType === 'touch') {
    return false;
  }

  const target = event.target;
  return target instanceof Element ? !target.closest(INTERACTIVE_SELECTOR) : true;
}

export function useStagePan() {
  const startRef = useRef<StagePanPoint | null>(null);
  const panStartRef = useRef<StagePanPoint>({ x: 0, y: 0 });
  const draggedRef = useRef(false);
  const [pan, setPan] = useState<StagePanPoint>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const handlePanPointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    if (!canStartPan(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    startRef.current = { x: event.clientX, y: event.clientY };
    panStartRef.current = pan;
    draggedRef.current = false;
    setIsPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [pan]);

  const handlePanPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const start = startRef.current;
    if (!start) {
      return;
    }

    event.preventDefault();
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      draggedRef.current = true;
    }

    setPan({
      x: panStartRef.current.x + deltaX,
      y: panStartRef.current.y + deltaY,
    });
  }, []);

  const handlePanPointerUp = useCallback((event: PointerEvent<HTMLElement>) => {
    if (!startRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    startRef.current = null;
    setIsPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const consumePanClick = useCallback(() => {
    const didDrag = draggedRef.current;
    draggedRef.current = false;
    return didDrag;
  }, []);

  const resetPan = useCallback(() => {
    setPan({ x: 0, y: 0 });
  }, []);

  const panStyle = {
    '--workspace-stage-pan-x': `${pan.x}px`,
    '--workspace-stage-pan-y': `${pan.y}px`,
    transform: `translate(${pan.x}px, ${pan.y}px)`,
  } as CSSProperties;

  return {
    isPanning,
    pan,
    panStyle,
    resetPan,
    consumePanClick,
    panHandlers: {
      onPointerDown: handlePanPointerDown,
      onPointerMove: handlePanPointerMove,
      onPointerUp: handlePanPointerUp,
      onPointerCancel: handlePanPointerUp,
    },
  };
}
