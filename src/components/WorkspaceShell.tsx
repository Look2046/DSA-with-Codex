import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type WheelEvent } from 'react';
import {
  createFocusCollisionRect,
  useStageAnchorPanel,
  type StageRect,
  type StagePoint,
  type StageSize,
} from '../hooks/useStageAnchorPanel';
import { useStagePan } from '../hooks/useStagePan';
import { useI18n } from '../i18n/useI18n';

const DEFAULT_STAGE_SIZE: StageSize = { width: 1200, height: 460 };
const WORKSPACE_PANEL_TOP = 118;
const WORKSPACE_PANEL_SIDE_MARGIN = 18;
const WORKSPACE_PANEL_GAP = 8;
const DEFAULT_CONTROLS_TAB_SIZE: StageSize = { width: 48, height: 96 };
const DEFAULT_CONTROLS_PANEL_SIZE: StageSize = { width: 226, height: 432 };
const DEFAULT_CONTEXT_RAIL_SIZE: StageSize = { width: 54, height: 92 };
const DEFAULT_CONTEXT_PANEL_SIZE: StageSize = { width: 286, height: 372 };
const TEXT_COLLISION_PADDING = 8;
const STAGE_ZOOM_MIN = 0.75;
const STAGE_ZOOM_MAX = 1.5;
const STAGE_ZOOM_STEP = 0.1;

type WorkspaceShellProps = {
  title: string;
  description: string;
  stageAriaLabel: string;
  pageClassName?: string;
  shellClassName?: string;
  stageClassName?: string;
  stageBodyClassName?: string;
  controlsPanelClassName?: string;
  stepPanelClassName?: string;
  controlsLabel?: string;
  stepLabel?: string;
  showStepPanel?: boolean;
  stageMeta?: ReactNode;
  controlsContent: ReactNode;
  stepContent?: ReactNode;
  stageContent: ReactNode;
  transportLeft: ReactNode;
  transportRight?: ReactNode;
  defaultTransportOpen?: boolean;
  enableStagePan?: boolean;
  focusPoint?: StagePoint | null;
  defaultControlsTabSize?: StageSize;
  defaultControlsPanelSize?: StageSize;
  controlsPanelAutoAvoid?: boolean;
  controlsPanelOverflowMargin?: number;
  defaultContextRailSize?: StageSize;
  defaultContextPanelSize?: StageSize;
  stepPanelAutoAvoid?: boolean;
  stepPanelOverflowMargin?: number;
  floatingPanelsEnabledMinWidth?: number;
  floatingPanelsEnabledMinHeight?: number;
  panelLayout?: 'auto' | 'docked';
  rightSidebarMode?: 'steps' | 'combined';
};

function joinClasses(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ');
}

function getControlsPanelDefaultAnchorPosition(stageSize: StageSize, _anchorSize: StageSize, panelSize: StageSize): StagePoint {
  return {
    x: stageSize.width - WORKSPACE_PANEL_SIDE_MARGIN - panelSize.width,
    y: 62,
  };
}

function getContextPanelDefaultAnchorPosition(
  stageSize: StageSize,
  anchorSize: StageSize,
  panelSize: StageSize,
): StagePoint {
  return {
    x: stageSize.width - WORKSPACE_PANEL_SIDE_MARGIN - anchorSize.width - WORKSPACE_PANEL_GAP - panelSize.width,
    y: WORKSPACE_PANEL_TOP,
  };
}

function expandRect(rect: DOMRect, padding: number): StageRect {
  return {
    x: rect.left - padding,
    y: rect.top - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

function rectToLocal(rect: StageRect, boundsRect: DOMRect): StageRect {
  return {
    x: rect.x - boundsRect.left,
    y: rect.y - boundsRect.top,
    width: rect.width,
    height: rect.height,
  };
}

function isRectVisible(rect: DOMRect): boolean {
  return rect.width > 1 && rect.height > 1;
}

function clampStageZoom(value: number): number {
  return Math.min(STAGE_ZOOM_MAX, Math.max(STAGE_ZOOM_MIN, Number(value.toFixed(2))));
}

function collectTextCollisionRects(root: HTMLElement, boundsRect: DOMRect): StageRect[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const rects: StageRect[] = [];
  const seen = new Set<string>();

  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    const text = textNode.textContent?.trim();
    if (!text) {
      continue;
    }

    const parent = textNode.parentElement;
    if (!parent) {
      continue;
    }

    const parentStyle = window.getComputedStyle(parent);
    if (
      parentStyle.display === 'none' ||
      parentStyle.visibility === 'hidden' ||
      parentStyle.opacity === '0' ||
      parent.closest('.tree-workspace-panel-strip')
    ) {
      continue;
    }

    const range = document.createRange();
    range.selectNodeContents(textNode);
    const clientRects = Array.from(range.getClientRects());
    range.detach?.();

    clientRects.forEach((clientRect) => {
      if (!isRectVisible(clientRect)) {
        return;
      }

      const localRect = rectToLocal(expandRect(clientRect, TEXT_COLLISION_PADDING), boundsRect);
      const key = `${Math.round(localRect.x)}:${Math.round(localRect.y)}:${Math.round(localRect.width)}:${Math.round(localRect.height)}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      rects.push(localRect);
    });
  }

  return rects;
}

export function WorkspaceShell({
  title,
  stageAriaLabel,
  pageClassName,
  shellClassName,
  stageClassName,
  stageBodyClassName,
  controlsPanelClassName,
  stepPanelClassName,
  controlsLabel,
  stepLabel,
  showStepPanel = true,
  stageMeta,
  controlsContent,
  stepContent,
  stageContent,
  transportLeft,
  transportRight,
  defaultTransportOpen = true,
  enableStagePan = true,
  focusPoint = null,
  defaultControlsTabSize = DEFAULT_CONTROLS_TAB_SIZE,
  defaultControlsPanelSize = DEFAULT_CONTROLS_PANEL_SIZE,
  controlsPanelAutoAvoid = true,
  controlsPanelOverflowMargin = 320,
  defaultContextRailSize = DEFAULT_CONTEXT_RAIL_SIZE,
  defaultContextPanelSize = DEFAULT_CONTEXT_PANEL_SIZE,
  stepPanelAutoAvoid = true,
  stepPanelOverflowMargin = 320,
  floatingPanelsEnabledMinWidth = 960,
  floatingPanelsEnabledMinHeight = 0,
  panelLayout = 'auto',
  rightSidebarMode = 'combined',
}: WorkspaceShellProps) {
  const { t } = useI18n();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const controlsTabRef = useRef<HTMLButtonElement | null>(null);
  const controlsPanelRef = useRef<HTMLDivElement | null>(null);
  const contextRailRef = useRef<HTMLButtonElement | null>(null);
  const contextPanelRef = useRef<HTMLElement | null>(null);

  const [showControls, setShowControls] = useState(false);
  const [showStep, setShowStep] = useState(false);
  const transportStateKey = `${title}:${defaultTransportOpen ? 'open' : 'closed'}`;
  const [transportState, setTransportState] = useState({
    key: transportStateKey,
    open: defaultTransportOpen,
  });
  const [stageSize, setStageSize] = useState<StageSize>(DEFAULT_STAGE_SIZE);
  const [textCollisionRects, setTextCollisionRects] = useState<StageRect[]>([]);
  const [stageZoom, setStageZoom] = useState(1);
  const showTransport = transportState.key === transportStateKey ? transportState.open : defaultTransportOpen;
  const stagePan = useStagePan();

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

      setStageSize((previous) =>
        Math.abs(previous.width - rect.width) < 0.5 && Math.abs(previous.height - rect.height) < 0.5
          ? previous
          : { width: rect.width, height: rect.height },
      );
    };

    updateSize();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(stageElement);
    return () => observer.disconnect();
  }, []);

  const floatingPanelsEnabled =
    panelLayout !== 'docked' &&
    stageSize.width >= floatingPanelsEnabledMinWidth &&
    stageSize.height >= floatingPanelsEnabledMinHeight;
  const isCombinedRightSidebar = rightSidebarMode === 'combined';
  const isRightSidebarOpen = isCombinedRightSidebar ? showControls || (showStepPanel && showStep) : showStepPanel && showStep;
  const showFloatingControls = showControls && !isCombinedRightSidebar;
  const focusCollisionRect = useMemo(
    () => createFocusCollisionRect(focusPoint, stageSize),
    [focusPoint, stageSize],
  );

  useEffect(() => {
    const shellElement = shellRef.current;
    const stageElement = stageRef.current;
    if (!shellElement || !stageElement || !floatingPanelsEnabled) {
      const rafId = window.requestAnimationFrame(() => setTextCollisionRects([]));
      return () => window.cancelAnimationFrame(rafId);
    }

    const updateTextCollisionRects = () => {
      const shellRect = shellElement.getBoundingClientRect();
      const roots = [
        shellElement.parentElement?.querySelector('.tree-workspace-header'),
        stageElement.querySelector('.tree-workspace-stage-meta'),
        stageElement.querySelector('.workspace-stage-body'),
        stageElement.querySelector('.tree-workspace-transport'),
      ].filter((node): node is HTMLElement => node instanceof HTMLElement);

      const nextRects = roots.flatMap((root) => collectTextCollisionRects(root, shellRect));
      setTextCollisionRects(nextRects);
    };

    updateTextCollisionRects();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => updateTextCollisionRects());
    observer.observe(shellElement);
    observer.observe(stageElement);
    return () => observer.disconnect();
  }, [floatingPanelsEnabled, showControls, showStep, stageSize.height, stageSize.width]);

  const controlsPanelAnchor = useStageAnchorPanel({
    stageRef,
    boundsRef: shellRef,
    anchorRef: controlsTabRef,
    panelRef: controlsPanelRef,
    isOpen: showFloatingControls,
    defaultPanelPosition: getControlsPanelDefaultAnchorPosition,
    defaultAnchorSize: defaultControlsTabSize,
    defaultPanelSize: defaultControlsPanelSize,
    collisionTarget: focusCollisionRect,
    collisionTargets: textCollisionRects,
    autoAvoid: controlsPanelAutoAvoid,
    overflowMargin: controlsPanelOverflowMargin,
    enabled: floatingPanelsEnabled,
  });
  const stepPanelAnchor = useStageAnchorPanel({
    stageRef,
    boundsRef: shellRef,
    anchorRef: contextRailRef,
    panelRef: contextPanelRef,
    isOpen: isRightSidebarOpen,
    defaultPanelPosition: getContextPanelDefaultAnchorPosition,
    defaultAnchorSize: defaultContextRailSize,
    defaultPanelSize: defaultContextPanelSize,
    collisionTarget: focusCollisionRect,
    collisionTargets: textCollisionRects,
    autoAvoid: stepPanelAutoAvoid,
    overflowMargin: stepPanelOverflowMargin,
    enabled: floatingPanelsEnabled,
  });

  const handleStageClick = () => {
    if (stagePan.consumePanClick()) {
      return;
    }

    setShowControls(false);
    setShowStep(false);
  };

  const resolvedControlsLabel = controlsLabel ?? t('module.t01.workspace.controls');
  const resolvedStepLabel = showStepPanel ? stepLabel ?? t('playback.step') : resolvedControlsLabel;
  const resolvedTransportLabel = showTransport ? t('workspace.transport.hide') : t('workspace.transport.show');
  const isDockedLayout = panelLayout === 'docked' && !isCombinedRightSidebar;

  const handleControlsToggle = () => {
    if (isCombinedRightSidebar) {
      const shouldOpen = !(showControls || showStep);
      setShowControls(shouldOpen);
      setShowStep(showStepPanel ? shouldOpen : false);
      return;
    }

    setShowControls((previous) => !previous);
  };

  const handleStepToggle = () => {
    if (!showStepPanel) {
      handleControlsToggle();
      return;
    }

    if (isCombinedRightSidebar) {
      const shouldOpen = !(showControls || showStep);
      setShowControls(shouldOpen);
      setShowStep(shouldOpen);
      return;
    }

    setShowStep((previous) => !previous);
  };

  const handleTransportToggle = () => {
    setTransportState((previous) => ({
      key: transportStateKey,
      open: !(previous.key === transportStateKey ? previous.open : defaultTransportOpen),
    }));
  };

  const changeStageZoom = useCallback((delta: number) => {
    setStageZoom((previous) => clampStageZoom(previous + delta));
  }, []);

  const resetStageZoom = useCallback(() => {
    setStageZoom(1);
  }, []);

  const handleStageWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey && !event.metaKey) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    changeStageZoom(event.deltaY > 0 ? -STAGE_ZOOM_STEP : STAGE_ZOOM_STEP);
  }, [changeStageZoom]);

  useEffect(() => {
    stageRef.current?.dispatchEvent(
      new CustomEvent('workspace-stage-zoomchange', {
        bubbles: true,
        detail: { zoom: stageZoom },
      }),
    );
  }, [stageZoom]);

  const stageBodyStyle = {
    '--workspace-stage-zoom': stageZoom,
    zoom: stageZoom,
    ...(enableStagePan ? stagePan.panStyle : {}),
  } as CSSProperties;
  const zoomControls = (
    <>
      <button
        type="button"
        className="tree-workspace-zoom-button"
        onClick={() => changeStageZoom(-STAGE_ZOOM_STEP)}
        disabled={stageZoom <= STAGE_ZOOM_MIN}
        title={t('workspace.zoom.out')}
        aria-label={t('workspace.zoom.out')}
      >
        -
      </button>
      <button
        type="button"
        className="tree-workspace-zoom-value"
        onClick={resetStageZoom}
        title={t('workspace.zoom.reset')}
        aria-label={t('workspace.zoom.reset')}
      >
        {Math.round(stageZoom * 100)}%
      </button>
      <button
        type="button"
        className="tree-workspace-zoom-button"
        onClick={() => changeStageZoom(STAGE_ZOOM_STEP)}
        disabled={stageZoom >= STAGE_ZOOM_MAX}
        title={t('workspace.zoom.in')}
        aria-label={t('workspace.zoom.in')}
      >
        +
      </button>
    </>
  );

  return (
    <section className={joinClasses('workspace-shell-page', pageClassName)}>
      <div className="tree-workspace-header">
        <h2>{title}</h2>
      </div>

      <section
        ref={shellRef}
        className={joinClasses('tree-workspace-shell', shellClassName)}
        data-controls-open={showControls ? 'true' : 'false'}
        data-floating-panels-enabled={floatingPanelsEnabled ? 'true' : 'false'}
        data-step-open={isRightSidebarOpen ? 'true' : 'false'}
        data-transport-open={showTransport ? 'true' : 'false'}
        data-panel-layout={panelLayout}
        data-right-sidebar-mode={rightSidebarMode}
      >
        <div className="tree-workspace-command-bar" onClick={(event) => event.stopPropagation()}>
          <div className="tree-workspace-command-title">
            <strong>{title}</strong>
          </div>

          <div className="tree-workspace-command-actions">
            {!isCombinedRightSidebar ? (
              <button
                ref={controlsTabRef}
                type="button"
                className={`tree-workspace-command-button${showControls ? ' tree-workspace-command-button-active' : ''}`}
                onClick={handleControlsToggle}
                aria-expanded={showControls}
              >
                {resolvedControlsLabel}
              </button>
            ) : null}
            <button
              type="button"
              className={`tree-workspace-command-button${showTransport ? '' : ' tree-workspace-command-button-active'}`}
              onClick={handleTransportToggle}
              title={resolvedTransportLabel}
              aria-label={resolvedTransportLabel}
              aria-pressed={!showTransport}
            >
              {t('workspace.transport.short')}
            </button>
          </div>
        </div>

        {isDockedLayout ? (
          <div className="tree-workspace-docked-strip">
            {showFloatingControls ? (
              <div
                ref={controlsPanelRef}
                className={joinClasses('tree-workspace-drawer', 'tree-workspace-docked-panel', controlsPanelClassName)}
                aria-label={resolvedControlsLabel}
              >
                <div
                  className="tree-workspace-drawer-head"
                >
                  <strong>{resolvedControlsLabel}</strong>
                </div>

                {controlsContent}
              </div>
            ) : null}

            {showStepPanel && showStep ? (
              <aside
                ref={contextPanelRef}
                className={joinClasses('tree-workspace-context-sheet', 'tree-workspace-docked-panel', stepPanelClassName)}
              >
                <div className="tree-workspace-drawer-head">
                  <strong className="tree-workspace-step-label">{resolvedStepLabel}</strong>
                </div>

                {stepContent}
              </aside>
            ) : null}
          </div>
        ) : (
          <div className="tree-workspace-panel-strip">
            <div className="tree-workspace-controls-anchor">
              {showFloatingControls ? (
                <div
                  ref={controlsPanelRef}
                  className={joinClasses('tree-workspace-drawer', controlsPanelClassName)}
                  style={controlsPanelAnchor.panelStyle}
                  aria-label={resolvedControlsLabel}
                >
                  <div
                    className={`tree-workspace-drawer-head tree-workspace-panel-drag-handle${
                      controlsPanelAnchor.isDragging ? ' tree-workspace-panel-dragging' : ''
                    }`}
                    onPointerDown={controlsPanelAnchor.startDrag}
                  >
                    <strong>{resolvedControlsLabel}</strong>
                  </div>

                  {controlsContent}
                </div>
              ) : null}
            </div>

            <div className="tree-workspace-context-anchor">
              {isRightSidebarOpen ? (
                <aside
                  ref={contextPanelRef}
                  className={joinClasses(
                    'tree-workspace-context-sheet',
                    isCombinedRightSidebar && 'tree-workspace-context-sheet-combined',
                    stepPanelClassName,
                  )}
                  style={stepPanelAnchor.panelStyle}
                >
                  {isCombinedRightSidebar ? (
                    <>
                      <section className="tree-workspace-sidebar-section tree-workspace-sidebar-section-controls">
                        <div className="tree-workspace-sidebar-section-head">
                          <strong>{resolvedControlsLabel}</strong>
                        </div>
                        <div className={joinClasses('tree-workspace-sidebar-section-body', controlsPanelClassName)}>
                          {controlsContent}
                        </div>
                      </section>

                      {showStepPanel ? (
                        <section className="tree-workspace-sidebar-section tree-workspace-sidebar-section-steps">
                          <div
                            className={`tree-workspace-sidebar-section-head tree-workspace-panel-drag-handle${
                              stepPanelAnchor.isDragging ? ' tree-workspace-panel-dragging' : ''
                            }`}
                            onPointerDown={stepPanelAnchor.startDrag}
                          >
                            <strong className="tree-workspace-step-label">{resolvedStepLabel}</strong>
                          </div>
                          <div className="tree-workspace-sidebar-section-body">
                            {stepContent}
                          </div>
                        </section>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <div
                        className={`tree-workspace-panel-drag-handle${
                          stepPanelAnchor.isDragging ? ' tree-workspace-panel-dragging' : ''
                        }`}
                        onPointerDown={stepPanelAnchor.startDrag}
                      >
                        <strong className="tree-workspace-step-label">{resolvedStepLabel}</strong>
                      </div>

                      {stepContent}
                    </>
                  )}
                </aside>
              ) : null}
            </div>
          </div>
        )}

        <button
          ref={contextRailRef}
          type="button"
          className={`tree-workspace-right-toggle${isRightSidebarOpen ? ' tree-workspace-right-toggle-active' : ''}`}
          onClick={(event) => {
            event.stopPropagation();
            handleStepToggle();
          }}
          aria-pressed={isRightSidebarOpen}
          aria-label={resolvedStepLabel}
          title={resolvedStepLabel}
        >
          <span aria-hidden="true">{isRightSidebarOpen ? '›' : '‹'}</span>
        </button>

        <div
          ref={stageRef}
          className={joinClasses('tree-stage', 'tree-stage-visual', stageClassName)}
          aria-label={stageAriaLabel}
          data-stage-panning={enableStagePan && stagePan.isPanning ? 'true' : 'false'}
          onClick={handleStageClick}
          onWheel={handleStageWheel}
        >
          {stageMeta ? <div className="tree-workspace-stage-meta">{stageMeta}</div> : null}

          <div className="workspace-stage-zoom-viewport" {...(enableStagePan ? stagePan.panHandlers : {})}>
            <div
              className={joinClasses('workspace-stage-body', stageBodyClassName)}
              style={stageBodyStyle}
            >
              {stageContent}
            </div>
          </div>

          {showTransport ? (
            <div className="tree-workspace-transport" onClick={(event) => event.stopPropagation()}>
              <div className="tree-workspace-transport-left">{transportLeft}</div>
              <div className="tree-workspace-transport-zoom" aria-label={t('workspace.zoom.label')}>
                {zoomControls}
              </div>
              {transportRight ? (
                <div className="tree-workspace-transport-right" aria-live="polite">
                  {transportRight}
                </div>
              ) : null}
              </div>
          ) : (
            <div
              className="tree-workspace-floating-zoom"
              onClick={(event) => event.stopPropagation()}
              aria-label={t('workspace.zoom.label')}
            >
              {zoomControls}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
