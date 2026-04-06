import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  createFocusCollisionRect,
  useStageAnchorPanel,
  type StagePoint,
  type StageSize,
} from '../hooks/useStageAnchorPanel';
import { useI18n } from '../i18n/useI18n';

const DEFAULT_STAGE_SIZE: StageSize = { width: 1200, height: 460 };
const WORKSPACE_PANEL_TOP = 118;
const WORKSPACE_PANEL_SIDE_MARGIN = 18;
const WORKSPACE_PANEL_GAP = 8;
const DEFAULT_CONTROLS_TAB_SIZE: StageSize = { width: 48, height: 96 };
const DEFAULT_CONTROLS_PANEL_SIZE: StageSize = { width: 226, height: 432 };
const DEFAULT_CONTEXT_RAIL_SIZE: StageSize = { width: 54, height: 92 };
const DEFAULT_CONTEXT_PANEL_SIZE: StageSize = { width: 286, height: 372 };

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
  controlsNote?: string;
  stageMeta?: ReactNode;
  controlsContent: ReactNode;
  stepContent: ReactNode;
  stageContent: ReactNode;
  transportLeft: ReactNode;
  transportRight?: ReactNode;
  focusPoint?: StagePoint | null;
  defaultControlsTabSize?: StageSize;
  defaultControlsPanelSize?: StageSize;
  defaultContextRailSize?: StageSize;
  defaultContextPanelSize?: StageSize;
  floatingPanelsEnabledMinWidth?: number;
};

function joinClasses(...values: Array<string | undefined | false>): string {
  return values.filter(Boolean).join(' ');
}

function getControlsPanelDefaultAnchorPosition(_stageSize: StageSize, anchorSize: StageSize): StagePoint {
  return {
    x: WORKSPACE_PANEL_SIDE_MARGIN,
    y: WORKSPACE_PANEL_TOP + anchorSize.height + WORKSPACE_PANEL_GAP,
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

export function WorkspaceShell({
  title,
  description,
  stageAriaLabel,
  pageClassName,
  shellClassName,
  stageClassName,
  stageBodyClassName,
  controlsPanelClassName,
  stepPanelClassName,
  controlsLabel,
  stepLabel,
  controlsNote,
  stageMeta,
  controlsContent,
  stepContent,
  stageContent,
  transportLeft,
  transportRight,
  focusPoint = null,
  defaultControlsTabSize = DEFAULT_CONTROLS_TAB_SIZE,
  defaultControlsPanelSize = DEFAULT_CONTROLS_PANEL_SIZE,
  defaultContextRailSize = DEFAULT_CONTEXT_RAIL_SIZE,
  defaultContextPanelSize = DEFAULT_CONTEXT_PANEL_SIZE,
  floatingPanelsEnabledMinWidth = 960,
}: WorkspaceShellProps) {
  const { t } = useI18n();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const controlsTabRef = useRef<HTMLButtonElement | null>(null);
  const controlsPanelRef = useRef<HTMLDivElement | null>(null);
  const contextRailRef = useRef<HTMLDivElement | null>(null);
  const contextPanelRef = useRef<HTMLElement | null>(null);

  const [showControls, setShowControls] = useState(false);
  const [showStep, setShowStep] = useState(false);
  const [stageSize, setStageSize] = useState<StageSize>(DEFAULT_STAGE_SIZE);

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

  const floatingPanelsEnabled = stageSize.width >= floatingPanelsEnabledMinWidth;
  const focusCollisionRect = useMemo(
    () => createFocusCollisionRect(focusPoint, stageSize),
    [focusPoint, stageSize],
  );
  const controlsPanelAnchor = useStageAnchorPanel({
    stageRef,
    boundsRef: shellRef,
    anchorRef: controlsTabRef,
    panelRef: controlsPanelRef,
    isOpen: showControls,
    defaultPanelPosition: getControlsPanelDefaultAnchorPosition,
    defaultAnchorSize: defaultControlsTabSize,
    defaultPanelSize: defaultControlsPanelSize,
    collisionTarget: focusCollisionRect,
    overflowMargin: 320,
    enabled: floatingPanelsEnabled,
  });
  const stepPanelAnchor = useStageAnchorPanel({
    stageRef,
    boundsRef: shellRef,
    anchorRef: contextRailRef,
    panelRef: contextPanelRef,
    isOpen: showStep,
    defaultPanelPosition: getContextPanelDefaultAnchorPosition,
    defaultAnchorSize: defaultContextRailSize,
    defaultPanelSize: defaultContextPanelSize,
    collisionTarget: focusCollisionRect,
    overflowMargin: 320,
    enabled: floatingPanelsEnabled,
  });

  const handleStageClick = () => {
    setShowControls(false);
    setShowStep(false);
  };

  const resolvedControlsLabel = controlsLabel ?? t('module.t01.workspace.controls');
  const resolvedStepLabel = stepLabel ?? t('playback.step');
  const resolvedControlsNote = controlsNote ?? t('module.t01.workspace.onDemand');

  return (
    <section className={pageClassName}>
      <div className="tree-workspace-header">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <section ref={shellRef} className={joinClasses('tree-workspace-shell', shellClassName)}>
        <div className="tree-workspace-controls-anchor">
          <div className="tree-workspace-controls-tab-pin">
            <button
              ref={controlsTabRef}
              type="button"
              className="tree-workspace-edge-tab"
              onClick={() => setShowControls((previous) => !previous)}
              aria-expanded={showControls}
            >
              {resolvedControlsLabel}
            </button>
          </div>

          {showControls ? (
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
                <span>{resolvedControlsNote}</span>
              </div>

              {controlsContent}
            </div>
          ) : null}
        </div>

        <div className="tree-workspace-context-anchor">
          <div ref={contextRailRef} className="tree-workspace-context-rail">
            <button
              type="button"
              className={`tree-workspace-edge-tab tree-workspace-edge-tab-secondary${
                showStep ? ' tree-workspace-context-tab-active' : ''
              }`}
              onClick={() => setShowStep((previous) => !previous)}
              aria-pressed={showStep}
            >
              {resolvedStepLabel}
            </button>
          </div>

          {showStep ? (
            <aside
              ref={contextPanelRef}
              className={joinClasses('tree-workspace-context-sheet', stepPanelClassName)}
              style={stepPanelAnchor.panelStyle}
            >
              <div
                className={`tree-workspace-panel-drag-handle${
                  stepPanelAnchor.isDragging ? ' tree-workspace-panel-dragging' : ''
                }`}
                onPointerDown={stepPanelAnchor.startDrag}
              >
                <strong className="tree-workspace-step-label">{resolvedStepLabel}</strong>
              </div>

              {stepContent}
            </aside>
          ) : null}
        </div>

        <div
          ref={stageRef}
          className={joinClasses('tree-stage', 'tree-stage-visual', stageClassName)}
          aria-label={stageAriaLabel}
          onClick={handleStageClick}
        >
          {stageMeta ? <div className="tree-workspace-stage-meta">{stageMeta}</div> : null}

          <div className={joinClasses('workspace-stage-body', stageBodyClassName)}>
            {stageContent}
          </div>

          <div className="tree-workspace-transport" onClick={(event) => event.stopPropagation()}>
            <div className="tree-workspace-transport-left">{transportLeft}</div>
            {transportRight ? (
              <div className="tree-workspace-transport-right" aria-live="polite">
                {transportRight}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </section>
  );
}
