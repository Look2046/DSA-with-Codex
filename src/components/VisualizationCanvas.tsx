import type { PropsWithChildren } from 'react';

type VisualizationCanvasProps = PropsWithChildren<{
  className?: string;
  stageClassName?: string;
  title?: string;
  subtitle?: string;
}>;

function joinClasses(...values: Array<string | undefined>): string {
  return values.filter((value) => Boolean(value)).join(' ');
}

export function VisualizationCanvas({ className, stageClassName, title, subtitle, children }: VisualizationCanvasProps) {
  return (
    <section className={joinClasses('viz-canvas', className)}>
      {title || subtitle ? (
        <header className="viz-canvas-header">
          {title ? <h3>{title}</h3> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
      ) : null}
      <div className={joinClasses('viz-canvas-stage', stageClassName)}>{children}</div>
    </section>
  );
}
