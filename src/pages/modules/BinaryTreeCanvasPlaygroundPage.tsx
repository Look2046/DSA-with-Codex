import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VisualizationCanvas } from '../../components/VisualizationCanvas';

type Point = {
  x: number;
  y: number;
};

type RenderNode = {
  key: string;
  index: number;
  value: number;
  point: Point;
};

type RenderNullNode = {
  key: string;
  parentIndex: number;
  side: 'L' | 'R';
  point: Point;
};

type RenderEdge = {
  key: string;
  from: Point;
  to: Point;
  isNull: boolean;
};

type RenderModel = {
  nodes: RenderNode[];
  nullNodes: RenderNullNode[];
  edges: RenderEdge[];
  orphanNonNullCount: number;
  top: number;
  yStep: number;
  nodePointByIndex: Map<number, Point>;
};

type ParseResult = {
  values: Array<number | null>;
  error: string | null;
};

const DEFAULT_LEVEL_ORDER = '10,5,16,2,7,12,20,null,3,6,null,11,13,19,null';
const DEFAULT_STAGE_WIDTH = 1200;
const DEFAULT_STAGE_HEIGHT = 460;
const TREE_NODE_DIAMETER_PX = 62;
const TREE_NULL_DIAMETER_PX = 24;
const TRACE_GUIDE_CLEAR_PX = 10;
const TRACE_GUIDE_EDGE_OFFSET_PX = 10;
const TREE_TOP = 22;
const TREE_BOTTOM = 92;

type ArcDirection = 'cw' | 'ccw';

type TraceGeometry = {
  aspect: number;
  nodeRadius: number;
  nullRadius: number;
  guideNodeClearRadius: number;
  guideNullClearRadius: number;
  guideEdgeOffset: number;
};

type TracePathSegment = {
  key: string;
  d: string;
};

type TraceSegmentMetric = {
  length: number;
  start: number;
  end: number;
};

type TraceLineArrow = {
  key: string;
  segmentIndex: number;
  d: string;
};

const TRACE_DRAW_SPEED_UNITS_PER_SECOND = 120;
const TRACE_CURSOR_SAMPLE_DISTANCE = 0.45;

type MutablePath = {
  commands: string[];
  cursor: Point;
  aspect: number;
};

function getNodeLevel(index: number): number {
  return Math.floor(Math.log2(index + 1));
}

function formatPoint(point: Point): string {
  return `${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
}

function toMetricPoint(point: Point, aspect: number): Point {
  return { x: point.x * aspect, y: point.y };
}

function fromMetricPoint(point: Point, aspect: number): Point {
  return { x: point.x / aspect, y: point.y };
}

function normalizeDirection(dx: number, dy: number, fallbackX: number, fallbackY: number): Point {
  const length = Math.hypot(dx, dy);
  if (length <= 0.0001) {
    return { x: fallbackX, y: fallbackY };
  }
  return { x: dx / length, y: dy / length };
}

function metricDistance(from: Point, to: Point, aspect: number): number {
  const fromMetric = toMetricPoint(from, aspect);
  const toMetric = toMetricPoint(to, aspect);
  return Math.hypot(toMetric.x - fromMetric.x, toMetric.y - fromMetric.y);
}

function normalizePositiveAngle(value: number): number {
  const twoPi = Math.PI * 2;
  const normalized = value % twoPi;
  return normalized < 0 ? normalized + twoPi : normalized;
}

function resolveArcDelta(startAngle: number, endAngle: number, direction: ArcDirection): number {
  const clockwiseDelta = normalizePositiveAngle(endAngle - startAngle);
  const counterClockwiseDelta = clockwiseDelta - Math.PI * 2;
  return direction === 'cw' ? clockwiseDelta : counterClockwiseDelta;
}

function createPath(start: Point, aspect: number): MutablePath {
  return {
    commands: [`M ${formatPoint(start)}`],
    cursor: start,
    aspect,
  };
}

function appendPathLine(path: MutablePath, target: Point): void {
  if (metricDistance(path.cursor, target, path.aspect) <= 0.003) {
    return;
  }
  path.commands.push(`L ${formatPoint(target)}`);
  path.cursor = target;
}

function appendPathArc(
  path: MutablePath,
  center: Point,
  radius: number,
  target: Point,
  direction: ArcDirection,
): void {
  const centerMetric = toMetricPoint(center, path.aspect);
  const startMetric = toMetricPoint(path.cursor, path.aspect);
  const endMetric = toMetricPoint(target, path.aspect);

  const startRadius = Math.hypot(startMetric.x - centerMetric.x, startMetric.y - centerMetric.y);
  const endRadius = Math.hypot(endMetric.x - centerMetric.x, endMetric.y - centerMetric.y);
  if (Math.abs(startRadius - radius) > 0.9 || Math.abs(endRadius - radius) > 0.9) {
    appendPathLine(path, target);
    return;
  }

  const startAngle = Math.atan2(startMetric.y - centerMetric.y, startMetric.x - centerMetric.x);
  const endAngle = Math.atan2(endMetric.y - centerMetric.y, endMetric.x - centerMetric.x);
  const delta = resolveArcDelta(startAngle, endAngle, direction);

  if (Math.abs(delta) <= 0.035) {
    appendPathLine(path, target);
    return;
  }

  const radiusX = radius / path.aspect;
  const largeArcFlag = Math.abs(delta) > Math.PI ? 1 : 0;
  const sweepFlag = delta > 0 ? 1 : 0;
  path.commands.push(`A ${radiusX.toFixed(2)} ${radius.toFixed(2)} 0 ${largeArcFlag} ${sweepFlag} ${formatPoint(target)}`);
  path.cursor = target;
}

function buildOffsetEdgeSegment(config: {
  from: Point;
  to: Point;
  fromRadius: number;
  toRadius: number;
  lane: 'L' | 'R';
  edgeOffset: number;
  aspect: number;
}): { start: Point; end: Point } {
  const fromMetric = toMetricPoint(config.from, config.aspect);
  const toMetric = toMetricPoint(config.to, config.aspect);
  const direction = normalizeDirection(toMetric.x - fromMetric.x, toMetric.y - fromMetric.y, 0, 1);
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

function pickAbsoluteSidePair(config: {
  from: Point;
  to: Point;
  fromRadius: number;
  toRadius: number;
  edgeOffset: number;
  aspect: number;
}): { left: { start: Point; end: Point }; right: { start: Point; end: Point } } {
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

function buildTraceGeometry(stageWidth: number, stageHeight: number): TraceGeometry {
  const width = Math.max(stageWidth, 1);
  const height = Math.max(stageHeight, 1);
  const unitY = 100 / height;
  const nodeRadius = (TREE_NODE_DIAMETER_PX / 2) * unitY;
  const nullRadius = (TREE_NULL_DIAMETER_PX / 2) * unitY;
  const guideNodeClearRadius = nodeRadius + TRACE_GUIDE_CLEAR_PX * unitY;
  const guideNullClearRadius = nullRadius + TRACE_GUIDE_CLEAR_PX * unitY;
  const guideOffsetCap = Math.max(guideNodeClearRadius - 0.08, 0.08);
  const guideEdgeOffset = Math.min(TRACE_GUIDE_EDGE_OFFSET_PX * unitY, guideOffsetCap);

  return {
    aspect: width / height,
    nodeRadius,
    nullRadius,
    guideNodeClearRadius,
    guideNullClearRadius,
    guideEdgeOffset,
  };
}

function parseSimpleLineSegment(path: string): { from: Point; to: Point } | null {
  const match = path.match(/^M\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+L\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)$/);
  if (!match) {
    return null;
  }
  return {
    from: { x: Number(match[1]), y: Number(match[2]) },
    to: { x: Number(match[3]), y: Number(match[4]) },
  };
}

function buildLineEndArrowPath(from: Point, to: Point, geometry: TraceGeometry): string {
  const unitY = geometry.nodeRadius / (TREE_NODE_DIAMETER_PX / 2);
  const arrowSize = 7 * unitY;
  const arrowWing = 3.5 * unitY;
  const arrowTipBackoff = 0.8 * unitY;
  const fromMetric = toMetricPoint(from, geometry.aspect);
  const toMetric = toMetricPoint(to, geometry.aspect);
  const direction = normalizeDirection(toMetric.x - fromMetric.x, toMetric.y - fromMetric.y, 1, 0);
  const perpendicular = { x: -direction.y, y: direction.x };
  const tipMetric = {
    x: toMetric.x - direction.x * arrowTipBackoff,
    y: toMetric.y - direction.y * arrowTipBackoff,
  };
  const baseMetric = {
    x: tipMetric.x - direction.x * arrowSize,
    y: tipMetric.y - direction.y * arrowSize,
  };
  const left = {
    x: baseMetric.x + perpendicular.x * arrowWing,
    y: baseMetric.y + perpendicular.y * arrowWing,
  };
  const right = {
    x: baseMetric.x - perpendicular.x * arrowWing,
    y: baseMetric.y - perpendicular.y * arrowWing,
  };

  return `M ${formatPoint(fromMetricPoint(left, geometry.aspect))} L ${formatPoint(fromMetricPoint(tipMetric, geometry.aspect))} L ${formatPoint(fromMetricPoint(right, geometry.aspect))} Z`;
}

function getPointByIndex(index: number, top: number, yStep: number): Point {
  const level = getNodeLevel(index);
  const first = 2 ** level - 1;
  const offset = index - first;
  const count = 2 ** level;
  return {
    x: ((offset + 1) / (count + 1)) * 100,
    y: top + level * yStep,
  };
}

function parseLevelOrderInput(raw: string): ParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { values: [], error: null };
  }

  const tokens = trimmed
    .split(/[,\n\r\t ]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  const values: Array<number | null> = [];

  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (lower === 'null' || lower === 'nil' || lower === '#') {
      values.push(null);
      continue;
    }

    const numeric = Number(token);
    if (!Number.isFinite(numeric)) {
      return {
        values: [],
        error: `无法解析 token: ${token}（只支持数字或 null）`,
      };
    }
    values.push(numeric);
  }

  return {
    values,
    error: null,
  };
}

function collectReachableNodeIndices(values: Array<number | null>): number[] {
  if (values.length === 0 || values[0] === null) {
    return [];
  }

  const queue: number[] = [0];
  const visited = new Set<number>();
  const reachable: number[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (current === undefined || visited.has(current)) {
      continue;
    }
    visited.add(current);

    if (current >= values.length || values[current] === null) {
      continue;
    }

    reachable.push(current);

    const left = current * 2 + 1;
    const right = current * 2 + 2;
    if (left < values.length) {
      queue.push(left);
    }
    if (right < values.length) {
      queue.push(right);
    }
  }

  return reachable.sort((a, b) => a - b);
}

function buildRenderModel(values: Array<number | null>): RenderModel {
  const reachable = collectReachableNodeIndices(values);
  const top = TREE_TOP;
  const bottom = TREE_BOTTOM;
  if (reachable.length === 0) {
    return {
      nodes: [],
      nullNodes: [],
      edges: [],
      orphanNonNullCount: 0,
      top,
      yStep: bottom - top,
      nodePointByIndex: new Map<number, Point>(),
    };
  }

  const reachableSet = new Set(reachable);
  const orphanNonNullCount = values.reduce<number>((count, value, index) => {
    if (value === null) {
      return count;
    }
    return reachableSet.has(index) ? count : count + 1;
  }, 0);

  const maxNodeLevel = Math.max(...reachable.map((index) => getNodeLevel(index)));
  const maxDisplayLevel = Math.max(maxNodeLevel + 1, 1);
  const yStep = (bottom - top) / maxDisplayLevel;

  const nodePoints = new Map<number, Point>();
  reachable.forEach((index) => {
    nodePoints.set(index, getPointByIndex(index, top, yStep));
  });

  const nodes: RenderNode[] = reachable.map((index) => ({
    key: `node-${index}`,
    index,
    value: values[index] as number,
    point: nodePoints.get(index)!,
  }));

  const nullNodes: RenderNullNode[] = [];
  const edges: RenderEdge[] = [];

  reachable.forEach((parentIndex) => {
    const from = nodePoints.get(parentIndex);
    if (!from) {
      return;
    }

    (['L', 'R'] as const).forEach((side) => {
      const childIndex = parentIndex * 2 + (side === 'L' ? 1 : 2);
      const to = getPointByIndex(childIndex, top, yStep);
      const childValue = childIndex < values.length ? values[childIndex] : null;
      const hasRealChild = childValue !== null && childValue !== undefined && reachableSet.has(childIndex);

      edges.push({
        key: `edge-${parentIndex}-${side}`,
        from,
        to,
        isNull: !hasRealChild,
      });

      if (!hasRealChild) {
        nullNodes.push({
          key: `null-${parentIndex}-${side}`,
          parentIndex,
          side,
          point: to,
        });
      }
    });
  });

  return {
    nodes,
    nullNodes,
    edges,
    orphanNonNullCount,
    top,
    yStep,
    nodePointByIndex: nodePoints,
  };
}

function buildFirstStepTracePaths(model: RenderModel, geometry: TraceGeometry): TracePathSegment[] {
  if (!model.nodePointByIndex.has(0)) {
    return [];
  }

  type EdgeLanePair = { left: { start: Point; end: Point }; right: { start: Point; end: Point } };
  type ChildTraceContext = {
    childIndex: number;
    childCenter: Point;
    childIsReal: boolean;
    lanes: EdgeLanePair;
  };

  const segments: TracePathSegment[] = [];
  let segmentOrder = 1;
  const nextKey = (kind: string) => `trace-${segmentOrder++}-${kind}`;

  const pushLine = (from: Point, to: Point, kind: string): void => {
    if (metricDistance(from, to, geometry.aspect) <= 0.003) {
      return;
    }
    segments.push({
      key: nextKey(kind),
      d: `M ${formatPoint(from)} L ${formatPoint(to)}`,
    });
  };

  const pushArc = (from: Point, center: Point, radius: number, to: Point, kind: string): void => {
    const path = createPath(from, geometry.aspect);
    appendPathArc(path, center, radius, to, 'ccw');
    if (path.commands.length <= 1) {
      return;
    }
    segments.push({
      key: nextKey(kind),
      d: path.commands.join(' '),
    });
  };

  const buildChildTraceContext = (parentIndex: number, parentCenter: Point, side: 'L' | 'R'): ChildTraceContext => {
    const childIndex = parentIndex * 2 + (side === 'L' ? 1 : 2);
    const childCenter = model.nodePointByIndex.get(childIndex) ?? getPointByIndex(childIndex, model.top, model.yStep);
    const childIsReal = model.nodePointByIndex.has(childIndex);
    const childRadius = childIsReal ? geometry.guideNodeClearRadius : geometry.guideNullClearRadius;
    const lanes = pickAbsoluteSidePair({
      from: parentCenter,
      to: childCenter,
      fromRadius: geometry.guideNodeClearRadius,
      toRadius: childRadius,
      edgeOffset: geometry.guideEdgeOffset,
      aspect: geometry.aspect,
    });
    return {
      childIndex,
      childCenter,
      childIsReal,
      lanes,
    };
  };

  function traceNullNode(nullCenter: Point, incoming: EdgeLanePair): Point {
    pushArc(
      incoming.left.end,
      nullCenter,
      geometry.guideNullClearRadius,
      incoming.right.end,
      'null-turn-up-right',
    );
    pushLine(incoming.right.end, incoming.right.start, 'null-up-right-line');
    return incoming.right.start;
  }

  function traceDataNode(nodeIndex: number, nodeCenter: Point, incoming: EdgeLanePair): Point {
    const leftContext = buildChildTraceContext(nodeIndex, nodeCenter, 'L');
    pushArc(
      incoming.left.end,
      nodeCenter,
      geometry.guideNodeClearRadius,
      leftContext.lanes.left.start,
      'node-turn-left-down-left',
    );
    pushLine(leftContext.lanes.left.start, leftContext.lanes.left.end, 'node-left-down-left-line');

    const leftReturnPoint = traceChild(leftContext);

    const rightContext = buildChildTraceContext(nodeIndex, nodeCenter, 'R');
    pushArc(
      leftReturnPoint,
      nodeCenter,
      geometry.guideNodeClearRadius,
      rightContext.lanes.left.start,
      'node-turn-right-down-left',
    );
    pushLine(rightContext.lanes.left.start, rightContext.lanes.left.end, 'node-right-down-left-line');

    const rightReturnPoint = traceChild(rightContext);

    pushArc(
      rightReturnPoint,
      nodeCenter,
      geometry.guideNodeClearRadius,
      incoming.right.end,
      'node-turn-up-right',
    );
    pushLine(incoming.right.end, incoming.right.start, 'node-up-right-line');
    return incoming.right.start;
  }

  function traceChild(context: ChildTraceContext): Point {
    if (context.childIsReal) {
      return traceDataNode(context.childIndex, context.childCenter, context.lanes);
    }
    return traceNullNode(context.childCenter, context.lanes);
  }

  const rootCenter = model.nodePointByIndex.get(0)!;
  const pxToUnitY = geometry.nodeRadius / (TREE_NODE_DIAMETER_PX / 2);
  const entryStart = {
    x: rootCenter.x,
    y: rootCenter.y - (geometry.nodeRadius + 40 * pxToUnitY),
  };
  const entryEnd = {
    x: rootCenter.x,
    y: rootCenter.y - (geometry.nodeRadius + 10 * pxToUnitY),
  };

  pushLine(entryStart, entryEnd, 'root-up-line');

  const rootLeftContext = buildChildTraceContext(0, rootCenter, 'L');
  pushArc(
    entryEnd,
    rootCenter,
    geometry.guideNodeClearRadius,
    rootLeftContext.lanes.left.start,
    'root-turn-left-down-left',
  );
  pushLine(rootLeftContext.lanes.left.start, rootLeftContext.lanes.left.end, 'root-left-down-left-line');

  const rootLeftReturnPoint = traceChild(rootLeftContext);

  const rootRightContext = buildChildTraceContext(0, rootCenter, 'R');
  pushArc(
    rootLeftReturnPoint,
    rootCenter,
    geometry.guideNodeClearRadius,
    rootRightContext.lanes.left.start,
    'root-turn-right-down-left',
  );
  pushLine(rootRightContext.lanes.left.start, rootRightContext.lanes.left.end, 'root-right-down-left-line');

  traceChild(rootRightContext);

  return segments;
}

export function BinaryTreeCanvasPlaygroundPage() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const tracePathRefs = useRef<Array<SVGPathElement | null>>([]);
  const traceDrawLengthRef = useRef(0);
  const [stageSize, setStageSize] = useState({ width: DEFAULT_STAGE_WIDTH, height: DEFAULT_STAGE_HEIGHT });
  const [levelOrderInput, setLevelOrderInput] = useState(DEFAULT_LEVEL_ORDER);
  const [traceMetrics, setTraceMetrics] = useState<TraceSegmentMetric[]>([]);
  const [traceTotalLength, setTraceTotalLength] = useState(0);
  const [traceDrawLength, setTraceDrawLength] = useState(0);
  const [traceIsPlaying, setTraceIsPlaying] = useState(false);
  const [movingArrowPath, setMovingArrowPath] = useState<string | null>(null);
  const parseResult = useMemo(() => parseLevelOrderInput(levelOrderInput), [levelOrderInput]);

  const model = useMemo(() => {
    if (parseResult.error) {
      return {
        nodes: [],
        nullNodes: [],
        edges: [],
        orphanNonNullCount: 0,
        top: TREE_TOP,
        yStep: 80,
        nodePointByIndex: new Map<number, Point>(),
      };
    }
    return buildRenderModel(parseResult.values);
  }, [parseResult.error, parseResult.values]);
  const traceGeometry = useMemo(() => buildTraceGeometry(stageSize.width, stageSize.height), [stageSize.height, stageSize.width]);
  const tracePaths = useMemo(
    () => (parseResult.error ? [] : buildFirstStepTracePaths(model, traceGeometry)),
    [model, parseResult.error, traceGeometry],
  );
  const traceVisibleLengths = useMemo(
    () =>
      traceMetrics.map((metric) => {
        const visible = traceDrawLength - metric.start;
        return Math.max(0, Math.min(metric.length, visible));
      }),
    [traceDrawLength, traceMetrics],
  );
  const traceLineArrows = useMemo<TraceLineArrow[]>(
    () =>
      tracePaths
        .map((segment, index) => {
          const line = parseSimpleLineSegment(segment.d);
          if (!line) {
            return null;
          }
          return {
            key: `trace-line-arrow-${index}`,
            segmentIndex: index,
            d: buildLineEndArrowPath(line.from, line.to, traceGeometry),
          };
        })
        .filter((segment): segment is TraceLineArrow => segment !== null),
    [traceGeometry, tracePaths],
  );

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

      setStageSize((previous) => {
        if (Math.abs(previous.width - rect.width) < 0.5 && Math.abs(previous.height - rect.height) < 0.5) {
          return previous;
        }
        return { width: rect.width, height: rect.height };
      });
    };

    updateSize();
    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => updateSize());
    observer.observe(stageElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let rafId = 0;
    rafId = requestAnimationFrame(() => {
      tracePathRefs.current = tracePathRefs.current.slice(0, tracePaths.length);
      const nextMetrics: TraceSegmentMetric[] = [];
      let cursor = 0;

      tracePaths.forEach((_segment, index) => {
        const pathElement = tracePathRefs.current[index];
        const length = pathElement ? pathElement.getTotalLength() : 0;
        nextMetrics.push({
          length,
          start: cursor,
          end: cursor + length,
        });
        cursor += length;
      });

      setTraceMetrics(nextMetrics);
      setTraceTotalLength(cursor);
      traceDrawLengthRef.current = 0;
      setTraceDrawLength(0);
      setTraceIsPlaying(cursor > 0);
      setMovingArrowPath(null);
    });
    return () => cancelAnimationFrame(rafId);
  }, [tracePaths]);

  const resolveMovingArrowPath = useCallback((drawLength: number): string | null => {
    if (drawLength <= 0 || traceMetrics.length === 0 || traceTotalLength <= 0) {
      return null;
    }

    const clampedLength = Math.min(drawLength, traceTotalLength);
    let activeIndex = traceMetrics.findIndex((metric) => clampedLength <= metric.end + 0.0001);
    if (activeIndex < 0) {
      activeIndex = traceMetrics.length - 1;
    }

    const activeMetric = traceMetrics[activeIndex];
    const activePath = tracePathRefs.current[activeIndex];
    if (!activePath || activeMetric.length <= 0.001) {
      return null;
    }

    const localLength = Math.max(0, Math.min(activeMetric.length, clampedLength - activeMetric.start));
    const tipPoint = activePath.getPointAtLength(localLength);
    let fromPoint: Point;
    if (localLength <= 0.001) {
      const aheadPoint = activePath.getPointAtLength(Math.min(activeMetric.length, TRACE_CURSOR_SAMPLE_DISTANCE));
      const direction = normalizeDirection(aheadPoint.x - tipPoint.x, aheadPoint.y - tipPoint.y, 0, 1);
      fromPoint = {
        x: tipPoint.x - direction.x * TRACE_CURSOR_SAMPLE_DISTANCE,
        y: tipPoint.y - direction.y * TRACE_CURSOR_SAMPLE_DISTANCE,
      };
    } else {
      fromPoint = activePath.getPointAtLength(Math.max(0, localLength - TRACE_CURSOR_SAMPLE_DISTANCE));
    }

    return buildLineEndArrowPath(fromPoint, { x: tipPoint.x, y: tipPoint.y }, traceGeometry);
  }, [traceGeometry, traceMetrics, traceTotalLength]);

  useEffect(() => {
    if (!traceIsPlaying || traceTotalLength <= 0) {
      return;
    }

    let rafId = 0;
    let previousTimestamp: number | null = null;
    const tick = (timestamp: number) => {
      if (previousTimestamp === null) {
        previousTimestamp = timestamp;
        rafId = requestAnimationFrame(tick);
        return;
      }

      const elapsedSeconds = (timestamp - previousTimestamp) / 1000;
      previousTimestamp = timestamp;
      const currentLength = Math.min(
        traceDrawLengthRef.current + elapsedSeconds * TRACE_DRAW_SPEED_UNITS_PER_SECOND,
        traceTotalLength,
      );
      traceDrawLengthRef.current = currentLength;
      setTraceDrawLength(currentLength);
      setMovingArrowPath(resolveMovingArrowPath(currentLength));
      if (currentLength >= traceTotalLength - 0.001) {
        setTraceIsPlaying(false);
        return;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [resolveMovingArrowPath, traceIsPlaying, traceTotalLength]);

  const replayTrace = () => {
    if (traceTotalLength <= 0) {
      return;
    }
    traceDrawLengthRef.current = 0;
    setTraceDrawLength(0);
    setMovingArrowPath(null);
    setTraceIsPlaying(true);
  };

  return (
    <section className="array-page tree-page">
      <h2>二叉树画布实验页</h2>
      <p>输入层序数组，实时绘制任意二叉树；缺失孩子会显示为空节点。</p>

      <div className="tree-canvas-controls">
        <label htmlFor="tree-level-order-input" className="tree-canvas-input-label">
          层序输入（示例：`8,4,12,2,6,null,14`）
        </label>
        <textarea
          id="tree-level-order-input"
          className="tree-canvas-input"
          value={levelOrderInput}
          onChange={(event) => setLevelOrderInput(event.target.value)}
          spellCheck={false}
          rows={3}
        />
        <p className="tree-canvas-tip">支持分隔符：逗号/空格/换行；空节点支持：`null` / `nil` / `#`。</p>
        <button type="button" onClick={replayTrace}>
          重播轨迹
        </button>
      </div>

      {parseResult.error ? <p className="form-error">{parseResult.error}</p> : null}

      {!parseResult.error && model.orphanNonNullCount > 0 ? (
        <p className="dynamic-array-capacity-full">
          检测到 {model.orphanNonNullCount} 个孤立非空节点（其父节点为空），已忽略未连通节点。
        </p>
      ) : null}

      <VisualizationCanvas
        title="Binary Tree Canvas"
        subtitle="Real nodes + null nodes for each missing child"
        stageClassName="viz-canvas-stage-tree"
      >
        <div ref={stageRef} className="tree-stage tree-canvas-stage" aria-label="binary-tree-canvas-stage">
          <svg className="tree-edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {model.edges.map((edge) => (
              <line
                key={edge.key}
                className={edge.isNull ? 'tree-canvas-null-edge' : 'tree-edge'}
                x1={edge.from.x}
                y1={edge.from.y}
                x2={edge.to.x}
                y2={edge.to.y}
              />
            ))}
          </svg>

          <svg className="tree-canvas-trace-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {tracePaths.map((segment, index) => {
              const metric = traceMetrics[index];
              const segmentLength = metric?.length ?? 0;
              const visibleLength = traceVisibleLengths[index] ?? 0;
              const hiddenLength = Math.max(segmentLength - visibleLength, 0) + 0.01;
              const isPending = !metric || visibleLength <= 0.001;
              const isCompleted = metric && visibleLength >= segmentLength - 0.001;
              return (
                <path
                  key={segment.key}
                  ref={(element) => {
                    tracePathRefs.current[index] = element;
                  }}
                  className="tree-canvas-trace"
                  d={segment.d}
                  style={
                    isPending
                      ? { opacity: 0 }
                      : isCompleted
                        ? undefined
                        : {
                          strokeDasharray: `${visibleLength.toFixed(3)} ${hiddenLength.toFixed(3)}`,
                          strokeDashoffset: 0,
                        }
                  }
                />
              );
            })}
          </svg>

          <svg className="tree-canvas-trace-arrow-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {traceLineArrows.map((arrow) => {
              const metric = traceMetrics[arrow.segmentIndex];
              const isCompleted = metric ? traceDrawLength >= metric.end - 0.001 : false;
              if (!isCompleted) {
                return null;
              }
              return <path key={arrow.key} className="tree-canvas-trace-arrow" d={arrow.d} />;
            })}
            {movingArrowPath ? <path className="tree-canvas-trace-arrow" d={movingArrowPath} /> : null}
          </svg>

          <div className="tree-null-layer" aria-hidden="true">
            {model.nullNodes.map((node) => (
              <div key={node.key} className="tree-null-node tree-canvas-null-node" style={{ left: `${node.point.x}%`, top: `${node.point.y}%` }}>
                <span className="tree-null-value">null</span>
              </div>
            ))}
          </div>

          <div className="tree-node-layer" aria-hidden="true">
            {model.nodes.map((node) => (
              <div key={node.key} className="tree-node" style={{ left: `${node.point.x}%`, top: `${node.point.y}%` }}>
                <span className="tree-node-value">{node.value}</span>
                <span className="tree-node-index">#{node.index}</span>
              </div>
            ))}
          </div>
        </div>
      </VisualizationCanvas>

      {!parseResult.error && model.nodes.length === 0 ? (
        <p className="module-status-line">当前输入没有可绘制的根节点（根为 null 或输入为空）。</p>
      ) : null}
    </section>
  );
}
