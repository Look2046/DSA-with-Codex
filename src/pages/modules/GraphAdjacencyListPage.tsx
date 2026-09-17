import { useMemo, useState } from 'react';
import { StaticWorkbenchShell } from '../../components/StaticWorkbenchShell';
import { useStagePan } from '../../hooks/useStagePan';
import { useI18n } from '../../i18n/useI18n';
import {
  buildAdjacencyList,
  createAdjacencyListSample,
  getAdjacencyListEntryIdsForEdge,
  getAdjacencyListEntryIdsForVertex,
  getAdjacencySummary,
  type AdjacencyListConfig,
  type AdjacencyListGraph,
} from '../../modules/graph/adjacencyList';
import { getGraphTypeLabel } from '../../modules/graph/adjacencyMatrix';

type Copy = {
  stage: string;
  graphCanvas: string;
  graphCanvasHint: string;
  list: string;
  listHint: string;
  info: string;
  directed: string;
  undirected: string;
  weighted: string;
  unweighted: string;
  direction: string;
  weightMode: string;
  vertexCount: string;
  graphType: string;
  edgeCount: string;
  degreeLabel: string;
  neighborLabel: string;
  outDegree: string;
  inDegree: string;
  outgoingNeighbors: string;
  incomingNeighbors: string;
  headPointer: string;
  nextPointer: string;
  nullPointer: string;
  listRows: string;
  currentWeight: string;
  rowMapping: string;
  headNodePointer: string;
  rowIndex: string;
  definitions: string[];
  featureItems: string[];
};

const COPY: Record<'zh' | 'en', Copy> = {
  zh: {
    stage: '邻接表教学画布',
    graphCanvas: '图示样本',
    graphCanvasHint: '点击顶点、边或邻接表结点，观察图与邻接表之间的静态对应关系。',
    list: '表头数组与邻接链表',
    listHint: '每一行最左侧就是一个顶点数组单元：前半格存顶点，后半格存头指针；后面所有邻接结点也都按“数据域 + 指针域”连接。',
    info: '定义与说明',
    directed: '有向图',
    undirected: '无向图',
    weighted: '带权图',
    unweighted: '无权图',
    direction: '方向',
    weightMode: '权值',
    vertexCount: '顶点数',
    graphType: '图类型',
    edgeCount: '边数',
    degreeLabel: '度',
    neighborLabel: '邻接点',
    outDegree: '出度',
    inDegree: '入度',
    outgoingNeighbors: '出邻接点',
    incomingNeighbors: '入邻接点',
    headPointer: '表头',
    nextPointer: 'next',
    nullPointer: 'NULL',
    listRows: '所在表行',
    currentWeight: '权值',
    rowMapping: '链表表示',
    headNodePointer: 'firstedge',
    rowIndex: '下标',
    definitions: [
      '邻接表用“顶点数组 + 邻接链表”表示图：顶点数组确定每个顶点所在行，链表记录从该顶点出发能直接到达的邻接点。',
      '顶点数组中的每个单元通常包含顶点数据域和 firstedge 头指针，头指针指向这一行的第一个边结点。',
      '每个边结点通常包含邻接点下标、边权或其他附加信息，以及指向下一个边结点的 next 指针。',
      '同一顶点的所有邻接点按 next 指针串联，沿着一行链表走完，就能得到该顶点的全部邻接关系。',
      '无向图的一条边会分别出现在两个端点的邻接链表中；有向图通常只把弧 <vi, vj> 记录在 vi 对应的行里。',
      '带权图会在边结点中额外保存 weight；无权图则只需要记录邻接点和 next 指针。',
    ],
    featureItems: [
      '邻接表的空间复杂度通常是 O(n + e)，比邻接矩阵的 O(n²) 更适合稀疏图。',
      '求某个顶点的所有邻接点时，只需要遍历该顶点所在行的链表，操作非常直接。',
      '无向图中，某个顶点邻接链表的结点数就是该顶点的度。',
      '有向图中，第 i 行边结点数是 vi 的出度；若要快速求入度，通常需要扫描所有行或建立逆邻接表。',
      '判断任意两个顶点是否相邻时，邻接表需要在某一行链表中查找，不如邻接矩阵 O(1) 直接。',
      'BFS、DFS 这类需要枚举邻接点的算法，经常更适合用邻接表组织数据。',
    ],
  },
  en: {
    stage: 'Adjacency-list teaching stage',
    graphCanvas: 'Graph sample',
    graphCanvasHint: 'Click vertices, edges, or list nodes to inspect the static mapping between the graph and the adjacency list.',
    list: 'Head Array & Adjacency Chains',
    listHint: 'The leftmost node in each row is the real vertex-array slot: the front half stores the vertex and the back half stores the head pointer.',
    info: 'Definition & Notes',
    directed: 'Directed',
    undirected: 'Undirected',
    weighted: 'Weighted',
    unweighted: 'Unweighted',
    direction: 'Direction',
    weightMode: 'Weight',
    vertexCount: 'Vertices',
    graphType: 'Graph type',
    edgeCount: 'Edges',
    degreeLabel: 'Degree',
    neighborLabel: 'Neighbors',
    outDegree: 'Out-degree',
    inDegree: 'In-degree',
    outgoingNeighbors: 'Outgoing neighbors',
    incomingNeighbors: 'Incoming neighbors',
    headPointer: 'Head',
    nextPointer: 'next',
    nullPointer: 'NULL',
    listRows: 'List row',
    currentWeight: 'Weight',
    rowMapping: 'List form',
    headNodePointer: 'firstedge',
    rowIndex: 'Index',
    definitions: [
      'An adjacency list represents a graph with a vertex array plus linked rows of adjacent vertices.',
      'Each vertex-array slot stores vertex data and a firstedge pointer to the first edge node in that row.',
      'Each edge node stores a neighbor index, optional edge data such as weight, and a next pointer.',
      'Following next pointers through one row reveals all direct neighbors of that vertex.',
      'For an undirected graph, one edge appears in both endpoint rows; for a directed graph, arc <vi, vj> is usually stored in vi row.',
      'Weighted graphs store weight in the edge node, while unweighted graphs only need neighbor and next fields.',
    ],
    featureItems: [
      'Adjacency lists usually need O(n + e) space, making them a good fit for sparse graphs.',
      'Enumerating all neighbors of one vertex only requires walking that vertex row.',
      'In an undirected graph, the number of edge nodes in one row equals that vertex degree.',
      'In a directed graph, row length gives out-degree; in-degree needs scanning all rows or maintaining an inverse list.',
      'Checking whether two arbitrary vertices are adjacent requires searching a row, so it is not as immediate as a matrix lookup.',
      'BFS and DFS often pair naturally with adjacency lists because they repeatedly enumerate neighbors.',
    ],
  },
};

const DEFAULT_CONFIG: AdjacencyListConfig = {
  directed: false,
  weighted: false,
  vertexCount: 5,
};

function getArrowPath(end: { x: number; y: number }, from: { x: number; y: number }, size = 1.7) {
  const dx = end.x - from.x;
  const dy = end.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const unitX = dx / length;
  const unitY = dy / length;
  const backX = end.x - unitX * size;
  const backY = end.y - unitY * size;
  const normalX = -unitY * size * 0.7;
  const normalY = unitX * size * 0.7;

  return `M ${backX + normalX} ${backY + normalY} L ${end.x} ${end.y} L ${backX - normalX} ${backY - normalY}`;
}

function getClippedSegment(
  start: { x: number; y: number },
  end: { x: number; y: number },
  trimStart: number,
  trimEnd: number,
) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const unitX = dx / length;
  const unitY = dy / length;

  return {
    start: { x: start.x + unitX * trimStart, y: start.y + unitY * trimStart },
    end: { x: end.x - unitX * trimEnd, y: end.y - unitY * trimEnd },
  };
}

function getPolarAngle(from: { x: number; y: number }, to: { x: number; y: number }) {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

function getFanOffset(index: number, total: number, spacing: number) {
  return (index - (total - 1) / 2) * spacing;
}

function getEdgeGeometry(graph: AdjacencyListGraph, edge: AdjacencyListGraph['edges'][number]) {
  const from = graph.nodes[edge.from];
  const to = graph.nodes[edge.to];
  if (!from || !to) {
    return { path: '', arrow: null as string | null, tooltipX: 0, tooltipY: 0 };
  }

  const trim = 6.4;
  if (!graph.directed) {
    const segment = getClippedSegment(from, to, trim, trim);
    return {
      path: `M ${segment.start.x} ${segment.start.y} L ${segment.end.x} ${segment.end.y}`,
      arrow: null,
      tooltipX: (segment.start.x + segment.end.x) / 2,
      tooltipY: (segment.start.y + segment.end.y) / 2,
    };
  }

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.max(1, Math.hypot(dx, dy));
  const unitX = dx / length;
  const unitY = dy / length;
  const normalX = -unitY;
  const normalY = unitX;

  const outgoingEdges = graph.edges
    .filter((item) => item.from === edge.from)
    .sort((left, right) => {
      const leftTarget = graph.nodes[left.to];
      const rightTarget = graph.nodes[right.to];
      if (!leftTarget || !rightTarget) {
        return left.id.localeCompare(right.id);
      }

      return getPolarAngle(from, leftTarget) - getPolarAngle(from, rightTarget) || left.id.localeCompare(right.id);
    });
  const incomingEdges = graph.edges
    .filter((item) => item.to === edge.to)
    .sort((left, right) => {
      const leftSource = graph.nodes[left.from];
      const rightSource = graph.nodes[right.from];
      if (!leftSource || !rightSource) {
        return left.id.localeCompare(right.id);
      }

      return getPolarAngle(leftSource, to) - getPolarAngle(rightSource, to) || left.id.localeCompare(right.id);
    });

  const outgoingIndex = Math.max(
    0,
    outgoingEdges.findIndex((item) => item.id === edge.id),
  );
  const incomingIndex = Math.max(
    0,
    incomingEdges.findIndex((item) => item.id === edge.id),
  );
  const outgoingOffset = getFanOffset(outgoingIndex, outgoingEdges.length, 2.6);
  const incomingOffset = getFanOffset(incomingIndex, incomingEdges.length, 2.6);

  const clippedStart = {
    x: from.x + unitX * trim + normalX * outgoingOffset,
    y: from.y + unitY * trim + normalY * outgoingOffset,
  };
  const clippedEnd = {
    x: to.x - unitX * (trim + 0.8) + normalX * incomingOffset,
    y: to.y - unitY * (trim + 0.8) + normalY * incomingOffset,
  };
  const bend = 10 + (outgoingOffset + incomingOffset) * 0.5;
  const control = {
    x: midX + normalX * bend,
    y: midY + normalY * bend,
  };

  return {
    path: `M ${clippedStart.x} ${clippedStart.y} Q ${control.x} ${control.y} ${clippedEnd.x} ${clippedEnd.y}`,
    arrow: getArrowPath(clippedEnd, control),
    tooltipX: (clippedStart.x + clippedEnd.x + control.x) / 3,
    tooltipY: (clippedStart.y + clippedEnd.y + control.y) / 3,
  };
}

function sortVertexIndexes(indexes: number[]) {
  return [...indexes].sort((left, right) => left - right);
}

export function GraphAdjacencyListPage() {
  const { language, t } = useI18n();
  const copy = COPY[language];
  const graphPan = useStagePan();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [graph, setGraph] = useState<AdjacencyListGraph>(() => createAdjacencyListSample(DEFAULT_CONFIG));
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredVertexIndex, setHoveredVertexIndex] = useState<number | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const adjacencyRows = useMemo(() => buildAdjacencyList(graph), [graph]);
  const selectedEdge = selectedEdgeId ? graph.edges.find((edge) => edge.id === selectedEdgeId) ?? null : null;
  const selectedEdgeEntryIds = useMemo(
    () => (selectedEdge ? new Set(getAdjacencyListEntryIdsForEdge(graph, selectedEdge.id)) : new Set<string>()),
    [graph, selectedEdge],
  );
  const selectedVertexEntryIds = useMemo(
    () => (selectedVertexIndex !== null ? new Set(getAdjacencyListEntryIdsForVertex(graph, selectedVertexIndex)) : new Set<string>()),
    [graph, selectedVertexIndex],
  );
  const selectedVertexNeighborIndexes = useMemo(() => {
    if (selectedVertexIndex === null) {
      return new Set<number>();
    }

    const summary = getAdjacencySummary(graph, selectedVertexIndex);
    return new Set([...summary.outgoingNeighbors, ...summary.incomingNeighbors]);
  }, [graph, selectedVertexIndex]);
  const selectedVertexEdgeIds = useMemo(() => {
    if (selectedVertexIndex === null) {
      return new Set<string>();
    }

    const edgeIds = new Set<string>();
    graph.edges.forEach((edge) => {
      if (edge.from === selectedVertexIndex || edge.to === selectedVertexIndex) {
        edgeIds.add(edge.id);
      }
    });
    return edgeIds;
  }, [graph, selectedVertexIndex]);
  const selectedEdgeEndpointIndexes = useMemo(() => {
    if (!selectedEdge) {
      return new Set<number>();
    }

    return new Set([selectedEdge.from, selectedEdge.to]);
  }, [selectedEdge]);

  const infoItems = useMemo(() => [...copy.definitions, ...copy.featureItems], [copy.definitions, copy.featureItems]);

  const hoveredVertexSummary =
    hoveredVertexIndex !== null && selectedVertexIndex === hoveredVertexIndex
      ? getAdjacencySummary(graph, hoveredVertexIndex)
      : null;
  const hoveredUndirectedNeighbors = hoveredVertexSummary
    ? sortVertexIndexes(Array.from(new Set([...hoveredVertexSummary.outgoingNeighbors, ...hoveredVertexSummary.incomingNeighbors])))
    : [];

  const hoveredEdge =
    hoveredEdgeId && selectedEdgeId === hoveredEdgeId ? graph.edges.find((edge) => edge.id === hoveredEdgeId) ?? null : null;
  const hoveredEdgeGeometry = hoveredEdge ? getEdgeGeometry(graph, hoveredEdge) : null;
  const hoveredEdgeRows = hoveredEdge
    ? graph.directed
      ? [hoveredEdge.from]
      : sortVertexIndexes([hoveredEdge.from, hoveredEdge.to])
    : [];

  const regenerateGraph = (nextConfig: AdjacencyListConfig) => {
    setGraph(createAdjacencyListSample(nextConfig));
    setSelectedVertexIndex(null);
    setSelectedEdgeId(null);
    setHoveredEdgeId(null);
  };

  const handleUpdateConfig = (partial: Partial<AdjacencyListConfig>) => {
    setConfig((previous) => {
      const next = { ...previous, ...partial };
      regenerateGraph(next);
      return next;
    });
  };

  const handleVertexClick = (index: number) => {
    setSelectedVertexIndex(index);
    setSelectedEdgeId(null);
  };

  const handleEdgeClick = (edgeId: string) => {
    setSelectedEdgeId(edgeId);
    setSelectedVertexIndex(null);
  };

  return (
    <StaticWorkbenchShell
      title={t('module.g02b.title')}
      description={t('module.g02b.body')}
      stageAriaLabel={copy.stage}
      pageClassName="array-page tree-page storage-page adjacency-list-page"
      shellClassName="adjacency-list-workbench-shell"
      enableStagePan={false}
      controlsContent={
        <div className="adjacency-list-toolbar">
          <div className="adjacency-list-toolbar-row">
            <label className="tree-workspace-field adjacency-list-inline-field" htmlFor="adjacency-list-direction">
              <span>{copy.direction}</span>
              <select
                id="adjacency-list-direction"
                value={config.directed ? 'directed' : 'undirected'}
                onChange={(event) => handleUpdateConfig({ directed: event.target.value === 'directed' })}
              >
                <option value="undirected">{copy.undirected}</option>
                <option value="directed">{copy.directed}</option>
              </select>
            </label>

            <label className="tree-workspace-field adjacency-list-inline-field" htmlFor="adjacency-list-weighted">
              <span>{copy.weightMode}</span>
              <select
                id="adjacency-list-weighted"
                value={config.weighted ? 'weighted' : 'unweighted'}
                onChange={(event) => handleUpdateConfig({ weighted: event.target.value === 'weighted' })}
              >
                <option value="unweighted">{copy.unweighted}</option>
                <option value="weighted">{copy.weighted}</option>
              </select>
            </label>

            <label className="tree-workspace-field adjacency-list-inline-field" htmlFor="adjacency-list-vertex-count">
              <span>{copy.vertexCount}</span>
              <select
                id="adjacency-list-vertex-count"
                value={config.vertexCount}
                onChange={(event) => handleUpdateConfig({ vertexCount: Number(event.target.value) })}
              >
                {[4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </label>

            <span className="tree-workspace-pill tree-workspace-pill-active">
              {copy.graphType}: {getGraphTypeLabel(graph)}
            </span>
            <span className="tree-workspace-pill">
              {copy.edgeCount}: {graph.edges.length}
            </span>
          </div>
        </div>
      }
      stageContent={
        <div className="adjacency-list-layout">
          <section className="graph-stage-view-card adjacency-list-graph-panel">
            <div className="adjacency-list-graph-stage">
              <div className="adjacency-list-graph-pan-layer" style={graphPan.panStyle} {...graphPan.panHandlers}>
              <svg
                className="adjacency-list-graph-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                role="img"
                aria-label={copy.graphCanvas}
              >
                {graph.edges.map((edge) => {
                  const geometry = getEdgeGeometry(graph, edge);
                  const isSelected = selectedEdgeId === edge.id;
                  const isHighlighted = selectedVertexEdgeIds.has(edge.id);
                  const color = isSelected ? '#c5602d' : isHighlighted ? '#2f7fb3' : '#7a91ab';

                  return (
                    <g key={edge.id}>
                      <path
                        d={geometry.path}
                        style={{ stroke: 'transparent', strokeWidth: 3.2, fill: 'none', pointerEvents: 'stroke' }}
                        onClick={() => handleEdgeClick(edge.id)}
                        onMouseEnter={() => setHoveredEdgeId(edge.id)}
                        onMouseLeave={() => setHoveredEdgeId((previous) => (previous === edge.id ? null : previous))}
                      />
                      <path
                        d={geometry.path}
                        className={`adjacency-list-edge${isHighlighted ? ' adjacency-list-edge-highlighted' : ''}${
                          isSelected ? ' adjacency-list-edge-active' : ''
                        }`}
                        style={{ stroke: color }}
                        onClick={() => handleEdgeClick(edge.id)}
                        onMouseEnter={() => setHoveredEdgeId(edge.id)}
                        onMouseLeave={() => setHoveredEdgeId((previous) => (previous === edge.id ? null : previous))}
                      />
                      {geometry.arrow ? (
                        <path
                          d={geometry.arrow}
                          className={`adjacency-list-arrow${isHighlighted ? ' adjacency-list-arrow-highlighted' : ''}${
                            isSelected ? ' adjacency-list-arrow-active' : ''
                          }`}
                          style={{ stroke: color, pointerEvents: 'none' }}
                        />
                      ) : null}
                      {edge.weight !== null ? (
                        <text
                          x={(graph.nodes[edge.from]!.x + graph.nodes[edge.to]!.x) / 2}
                          y={(graph.nodes[edge.from]!.y + graph.nodes[edge.to]!.y) / 2 - 2}
                          className="adjacency-list-edge-weight"
                          style={{ pointerEvents: 'none' }}
                        >
                          {edge.weight}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </svg>

              <div className="graph-concept-node-layer">
                {hoveredEdge ? (
                  <div
                    className="adjacency-list-edge-tooltip"
                    style={{
                      left: `${hoveredEdgeGeometry?.tooltipX ?? 0}%`,
                      top: `${hoveredEdgeGeometry?.tooltipY ?? 0}%`,
                    }}
                  >
                    <strong>{`${graph.nodes[hoveredEdge.from]?.id} ${graph.directed ? '→' : '—'} ${graph.nodes[hoveredEdge.to]?.id}`}</strong>
                    <span>
                      {copy.listRows}: {hoveredEdgeRows.map((rowIndex) => graph.nodes[rowIndex]?.id).join(' / ')}
                    </span>
                    <span>
                      {copy.rowMapping}:{' '}
                      {hoveredEdgeRows
                        .map((rowIndex) => `${graph.nodes[rowIndex]?.id} -> ${graph.nodes[rowIndex === hoveredEdge.from ? hoveredEdge.to : hoveredEdge.from]?.id}`)
                        .join(' / ')}
                    </span>
                    {graph.weighted ? (
                      <span>
                        {copy.currentWeight}: {hoveredEdge.weight ?? 0}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {graph.nodes.map((node, index) => {
                  const isSelected = selectedVertexIndex === index;
                  const isEdgeEndpoint = selectedEdgeEndpointIndexes.has(index);
                  const isNeighborOfSelectedVertex = selectedVertexNeighborIndexes.has(index);
                  return (
                    <button
                      key={node.id}
                      type="button"
                      className={`graph-concept-node${isSelected ? ' graph-concept-node-selected' : ''}${
                        isSelected ? ' adjacency-list-node-active' : ''
                      }${isEdgeEndpoint ? ' adjacency-list-node-endpoint' : ''}${
                        isNeighborOfSelectedVertex ? ' adjacency-list-node-neighbor' : ''
                      }`}
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                      onClick={() => handleVertexClick(index)}
                      onMouseEnter={() => setHoveredVertexIndex(index)}
                      onMouseLeave={() => setHoveredVertexIndex((previous) => (previous === index ? null : previous))}
                    >
                      <span className="graph-concept-node-id">{node.id}</span>
                      <span className="graph-concept-node-index">{index}</span>
                      {isSelected && hoveredVertexIndex === index && hoveredVertexSummary ? (
                        <span className="adjacency-list-node-tooltip">
                          <strong>{node.id}</strong>
                          {!graph.directed ? (
                            <>
                              <span>
                                {copy.degreeLabel}: {hoveredVertexSummary.degree.degree}
                              </span>
                              <span>
                                {copy.neighborLabel}:{' '}
                                {hoveredUndirectedNeighbors.map((neighborIndex) => graph.nodes[neighborIndex]?.id).join(', ') || '∅'}
                              </span>
                            </>
                          ) : (
                            <>
                              <span>
                                {copy.outDegree}: {hoveredVertexSummary.degree.outDegree}
                              </span>
                              <span>
                                {copy.inDegree}: {hoveredVertexSummary.degree.inDegree}
                              </span>
                              <span>
                                {copy.outgoingNeighbors}:{' '}
                                {hoveredVertexSummary.outgoingNeighbors.map((neighborIndex) => graph.nodes[neighborIndex]?.id).join(', ') || '∅'}
                              </span>
                              <span>
                                {copy.incomingNeighbors}:{' '}
                                {hoveredVertexSummary.incomingNeighbors.map((neighborIndex) => graph.nodes[neighborIndex]?.id).join(', ') || '∅'}
                              </span>
                            </>
                          )}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              </div>
            </div>
          </section>

          <div className="adjacency-list-right">
            <section className="graph-stage-view-card adjacency-list-list-panel">
              <div className="graph-stage-view-head">
                <strong>{copy.list}</strong>
              </div>

              <div className="adjacency-list-list-card">
                {adjacencyRows.map((entries, rowIndex) => {
                  const rowNode = graph.nodes[rowIndex];
                  const isRowSelected = selectedVertexIndex === rowIndex;
                  const isRowEdgeEndpoint = selectedEdgeEndpointIndexes.has(rowIndex);
                  return (
                    <div key={`row-${rowNode?.id ?? rowIndex}`} className="adjacency-list-row">
                      <div className={`adjacency-list-row-index${isRowSelected || isRowEdgeEndpoint ? ' adjacency-list-row-index-active' : ''}`}>{`${copy.rowIndex} ${rowIndex}`}</div>
                      <button
                        type="button"
                        className={`adjacency-list-head-node split-node${isRowSelected ? ' adjacency-list-head-node-active' : ''}${
                          isRowEdgeEndpoint ? ' adjacency-list-head-node-endpoint' : ''
                        }`}
                        onClick={() => handleVertexClick(rowIndex)}
                      >
                        <div className="linked-node-data adjacency-list-head-node-data">{rowNode?.id}</div>
                        <div className="linked-node-pointer adjacency-list-head-node-pointer" data-pointer-id={`head-${rowNode?.id}`}>
                          <span className="adjacency-list-head-node-pointer-line">first</span>
                          <span className="adjacency-list-head-node-pointer-line">edge</span>
                        </div>
                      </button>
                      <span className="adjacency-list-row-arrow" aria-hidden="true">
                        →
                      </span>
                      <div className="adjacency-list-row-entries">
                        {entries.length > 0 ? (
                          entries.map((entry) => {
                            const isSelected = selectedEdgeEntryIds.has(entry.id);
                            const isHighlighted = selectedVertexEntryIds.has(entry.id);
                            const neighborNode = graph.nodes[entry.neighborIndex];
                            return (
                              <div key={entry.id} className="adjacency-list-entry-wrap">
                                <button
                                  type="button"
                                  className={`adjacency-list-entry-node split-node${isSelected ? ' adjacency-list-entry-active' : ''}${
                                    isHighlighted ? ' adjacency-list-entry-highlighted' : ''
                                  }`}
                                  onClick={() => handleEdgeClick(entry.edgeId)}
                                >
                                  <div className="linked-node-data adjacency-list-entry-data">
                                    <strong>{neighborNode?.id}</strong>
                                    {graph.weighted ? <span className="adjacency-list-entry-weight">w={entry.weight ?? 0}</span> : null}
                                  </div>
                                  <div className="linked-node-pointer adjacency-list-entry-pointer" data-pointer-id={entry.id}>
                                    {copy.nextPointer}
                                  </div>
                                </button>
                                <span className="adjacency-list-row-arrow" aria-hidden="true">
                                  →
                                </span>
                              </div>
                            );
                          })
                        ) : null}
                        <span className="adjacency-list-null">{copy.nullPointer}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="graph-stage-view-card adjacency-list-info-panel">
              <div className="graph-stage-view-head">
                <strong>{copy.info}</strong>
              </div>

              <div className="adjacency-list-info-stack">
                <div className="adjacency-list-copy-columns">
                  {infoItems.map((item, itemIndex) => {
                    const order = itemIndex + 1;
                    return (
                      <p
                        key={item}
                        className={`adjacency-list-numbered-paragraph${
                          order % 2 === 1 ? ' adjacency-list-numbered-paragraph-odd' : ' adjacency-list-numbered-paragraph-even'
                        }`}
                      >
                        <span className="adjacency-list-paragraph-number">{order}.</span>
                        <span>{item}</span>
                      </p>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </div>
      }
    />
  );
}
