export type PreorderTracePoint = {
  x: number;
  y: number;
};

export type PreorderTraceLane = 'L' | 'R';

export type PreorderTraceEdgeSegment = {
  start: PreorderTracePoint;
  end: PreorderTracePoint;
};

export type PreorderTraceEdgeLanePair = {
  left: PreorderTraceEdgeSegment;
  right: PreorderTraceEdgeSegment;
};

function toMetricPoint(point: PreorderTracePoint, aspect: number): PreorderTracePoint {
  return { x: point.x * aspect, y: point.y };
}

function fromMetricPoint(point: PreorderTracePoint, aspect: number): PreorderTracePoint {
  return { x: point.x / aspect, y: point.y };
}

function normalizeDirection(
  dx: number,
  dy: number,
  fallbackX: number,
  fallbackY: number,
): PreorderTracePoint {
  const length = Math.hypot(dx, dy);
  if (length <= 0.0001) {
    return { x: fallbackX, y: fallbackY };
  }
  return { x: dx / length, y: dy / length };
}

export function buildOffsetEdgeSegment(config: {
  from: PreorderTracePoint;
  to: PreorderTracePoint;
  fromRadius: number;
  toRadius: number;
  lane: PreorderTraceLane;
  edgeOffset: number;
  aspect: number;
}): PreorderTraceEdgeSegment {
  const fromMetric = toMetricPoint(config.from, config.aspect);
  const toMetric = toMetricPoint(config.to, config.aspect);
  const direction = normalizeDirection(toMetric.x - fromMetric.x, toMetric.y - fromMetric.y, 0, 1);
  // Screen-space left normal: y grows downward, so use (dy, -dx) instead of (-dy, dx).
  const normal = { x: direction.y, y: -direction.x };
  const laneSign = config.lane === 'L' ? 1 : -1;
  const offsetCap = Math.max(Math.min(config.fromRadius, config.toRadius) - 0.08, 0.08);
  const offset = Math.min(config.edgeOffset, offsetCap);
  const fromAlong = Math.sqrt(Math.max(config.fromRadius ** 2 - offset ** 2, 0.03));
  const toAlong = Math.sqrt(Math.max(config.toRadius ** 2 - offset ** 2, 0.03));

  const startMetric = {
    x: fromMetric.x + direction.x * fromAlong + normal.x * offset * laneSign,
    y: fromMetric.y + direction.y * fromAlong + normal.y * offset * laneSign,
  };
  const endMetric = {
    x: toMetric.x - direction.x * toAlong + normal.x * offset * laneSign,
    y: toMetric.y - direction.y * toAlong + normal.y * offset * laneSign,
  };

  return {
    start: fromMetricPoint(startMetric, config.aspect),
    end: fromMetricPoint(endMetric, config.aspect),
  };
}

export function pickAbsoluteSidePair(config: {
  from: PreorderTracePoint;
  to: PreorderTracePoint;
  fromRadius: number;
  toRadius: number;
  edgeOffset: number;
  aspect: number;
}): PreorderTraceEdgeLanePair {
  const laneLeft = buildOffsetEdgeSegment({
    from: config.from,
    to: config.to,
    fromRadius: config.fromRadius,
    toRadius: config.toRadius,
    lane: 'L',
    edgeOffset: config.edgeOffset,
    aspect: config.aspect,
  });
  const laneRight = buildOffsetEdgeSegment({
    from: config.from,
    to: config.to,
    fromRadius: config.fromRadius,
    toRadius: config.toRadius,
    lane: 'R',
    edgeOffset: config.edgeOffset,
    aspect: config.aspect,
  });
  const laneLeftX = (laneLeft.start.x + laneLeft.end.x) / 2;
  const laneRightX = (laneRight.start.x + laneRight.end.x) / 2;
  return laneLeftX <= laneRightX
    ? { left: laneLeft, right: laneRight }
    : { left: laneRight, right: laneLeft };
}
