import type { PropsWithChildren } from 'react';

type VisualizationCanvasProps = PropsWithChildren<{
  className?: string;
  stageClassName?: string;
  title?: string;
}>;

function joinClasses(...values: Array<string | undefined>): string {
  return values.filter((value) => Boolean(value)).join(' ');
}

export function VisualizationCanvas({ className, stageClassName, title, children }: VisualizationCanvasProps) {
  return (
    <section className={joinClasses('viz-canvas', className)}>
      {title ? (
        <header className="viz-canvas-header">
          <h3>{title}</h3>
        </header>
      ) : null}
      <div className={joinClasses('viz-canvas-stage', stageClassName)}>{children}</div>
    </section>
  );
}
