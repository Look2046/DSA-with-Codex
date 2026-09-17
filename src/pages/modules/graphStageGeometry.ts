export type GraphStagePoint = {
  x: number;
  y: number;
};

export type GraphStageLineGeometry = {
  start: GraphStagePoint;
  end: GraphStagePoint;
  control: GraphStagePoint | null;
  mid: GraphStagePoint;
  path: string;
  arrowPath: string;
};

export function getGraphStageArrowPath(end: GraphStagePoint, from: GraphStagePoint, size = 1.8) {
  const dx = end.x - from.x;
  const dy = end.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const unitX = dx / length;
  const unitY = dy / length;
  const backX = end.x - unitX * size;
  const backY = end.y - unitY * size;
  const normalX = -unitY * size * 0.7;
  const normalY = unitX * size * 0.7;

  return `M ${backX + normalX} ${backY + normalY} L ${end.x} ${end.y} L ${backX - normalX} ${
    backY - normalY
  }`;
}

export function getGraphStageLineGeometry(
  from: GraphStagePoint | undefined,
  to: GraphStagePoint | undefined,
  trimStart = 6.4,
  trimEnd = 7.6,
): GraphStageLineGeometry | null {
  if (!from || !to) {
    return null;
  }

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const unitX = dx / length;
  const unitY = dy / length;
  const start = {
    x: from.x + unitX * trimStart,
    y: from.y + unitY * trimStart,
  };
  const end = {
    x: to.x - unitX * trimEnd,
    y: to.y - unitY * trimEnd,
  };

  return {
    start,
    end,
    control: null,
    mid: {
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2,
    },
    path: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
    arrowPath: getGraphStageArrowPath(end, start),
  };
}

export function getGraphStageDirectedCurveGeometry(
  from: GraphStagePoint | undefined,
  to: GraphStagePoint | undefined,
  trimStart = 6.4,
  trimEnd = 7.6,
  bend = 8,
): GraphStageLineGeometry | null {
  if (!from || !to) {
    return null;
  }

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const unitX = dx / length;
  const unitY = dy / length;
  const normalX = -unitY;
  const normalY = unitX;
  const start = {
    x: from.x + unitX * trimStart,
    y: from.y + unitY * trimStart,
  };
  const end = {
    x: to.x - unitX * trimEnd,
    y: to.y - unitY * trimEnd,
  };
  const control = {
    x: (from.x + to.x) / 2 + normalX * bend,
    y: (from.y + to.y) / 2 + normalY * bend,
  };

  return {
    start,
    end,
    control,
    mid: {
      x: (start.x + 2 * control.x + end.x) / 4,
      y: (start.y + 2 * control.y + end.y) / 4,
    },
    path: `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`,
    arrowPath: getGraphStageArrowPath(end, control),
  };
}

export function getGraphStageEdgeGeometry(
  from: GraphStagePoint | undefined,
  to: GraphStagePoint | undefined,
  directed: boolean,
) {
  return directed ? getGraphStageDirectedCurveGeometry(from, to) : getGraphStageLineGeometry(from, to);
}
