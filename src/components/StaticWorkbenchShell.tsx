import type { ReactNode } from 'react';
import { WorkspaceShell } from './WorkspaceShell';

type StaticWorkbenchShellProps = {
  title: string;
  description: string;
  stageAriaLabel: string;
  pageClassName?: string;
  shellClassName?: string;
  stageClassName?: string;
  stageMeta?: ReactNode;
  controlsContent: ReactNode;
  stepContent?: ReactNode;
  stageContent: ReactNode;
  transportLeft?: ReactNode;
  transportRight?: ReactNode;
  enableStagePan?: boolean;
};

export function StaticWorkbenchShell({
  title,
  description,
  stageAriaLabel,
  pageClassName,
  shellClassName,
  stageClassName,
  stageMeta,
  controlsContent,
  stepContent,
  stageContent,
  transportLeft,
  transportRight,
  enableStagePan,
}: StaticWorkbenchShellProps) {
  return (
    <WorkspaceShell
      title={title}
      description={description}
      stageAriaLabel={stageAriaLabel}
      pageClassName={pageClassName}
      shellClassName={`static-workbench-shell${shellClassName ? ` ${shellClassName}` : ''}`}
      stageClassName={`static-workbench-stage${stageClassName ? ` ${stageClassName}` : ''}`}
      stageBodyClassName="static-workbench-stage-body"
      controlsPanelClassName="static-workbench-controls-panel"
      stepPanelClassName="static-workbench-step-panel"
      controlsContent={controlsContent}
      stepContent={stepContent}
      showStepPanel={Boolean(stepContent)}
      stageMeta={stageMeta}
      stageContent={stageContent}
      defaultTransportOpen={false}
      enableStagePan={enableStagePan}
      transportLeft={transportLeft ?? <span className="tree-workspace-transport-empty">静态演示</span>}
      transportRight={transportRight}
      defaultControlsPanelSize={{ width: 340, height: 430 }}
      defaultContextPanelSize={{ width: 360, height: 430 }}
      controlsPanelOverflowMargin={80}
      stepPanelOverflowMargin={80}
      floatingPanelsEnabledMinWidth={900}
      floatingPanelsEnabledMinHeight={0}
    />
  );
}
