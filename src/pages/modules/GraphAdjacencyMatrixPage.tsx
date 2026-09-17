import { useMemo, useState } from 'react';
import { StaticWorkbenchShell } from '../../components/StaticWorkbenchShell';
import { useStagePan } from '../../hooks/useStagePan';
import { useI18n } from '../../i18n/useI18n';
import {
  buildAdjacencyMatrix,
  createAdjacencyMatrixSample,
  getDegreeSummary,
  getEdgeByCell,
  getGraphTypeLabel,
  getIncomingNeighbors,
  getMatrixDisplayValue,
  getOutgoingNeighbors,
  type AdjacencyMatrixConfig,
  type AdjacencyMatrixGraph,
} from '../../modules/graph/adjacencyMatrix';

type Copy = {
  title: string;
  body: string;
  stage: string;
  graphCanvas: string;
  graphCanvasHint: string;
  vertexArray: string;
  vertexArrayHint: string;
  matrix: string;
  matrixHint: string;
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
  matrixCell: string;
  currentValue: string;
  degreeLabel: string;
  neighborLabel: string;
  outDegree: string;
  inDegree: string;
  outgoingNeighbors: string;
  incomingNeighbors: string;
  definitions: string[];
  featureItems: string[];
  defaultMeaning: string;
  vertexMeaningPrefix: string;
  vertexArrayName: string;
  vertexArrayIndex: string;
};

const COPY: Record<'zh' | 'en', Copy> = {
  zh: {
    title: 'G-02 图的邻接矩阵存储',
    body: '本页只讲邻接矩阵的定义、存储方式，以及图与矩阵元素之间的静态对应关系。',
    stage: '邻接矩阵教学画布',
    graphCanvas: '图示样本',
    graphCanvasHint: '点击顶点、边或矩阵单元，直接观察它们在图与邻接矩阵中的对应关系。',
    vertexArray: '顶点数组',
    vertexArrayHint: '先用一维数组按顺序存储顶点，再让矩阵的行和列共享这同一顺序。',
    matrix: '邻接矩阵',
    matrixHint: '矩阵的行和列都按同一顶点顺序排列，元素值表示是否相邻或边权。',
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
    matrixCell: '矩阵位置',
    currentValue: '当前值',
    degreeLabel: '度',
    neighborLabel: '邻接点',
    outDegree: '出度',
    inDegree: '入度',
    outgoingNeighbors: '出邻接点',
    incomingNeighbors: '入邻接点',
    definitions: [
      '邻接矩阵用“顶点数组 + 二维矩阵”表示图：顶点数组负责确定顶点顺序，矩阵负责记录顶点之间的关系。',
      '顶点数组中的下标就是矩阵的行号和列号。例如下标 i 对应顶点 vi，第 i 行和第 i 列都围绕 vi 展开。',
      '无权图中，arcs[i][j] 通常用 1 表示 vi 与 vj 有边，用 0 表示没有边。',
      '带权图中，arcs[i][j] 存储边上的权值；若两个顶点不相邻，常用 ∞、0 或特殊空值表示，具体取决于算法约定。',
      '无向图的边没有方向，因此 arcs[i][j] 与 arcs[j][i] 表示同一条边，矩阵会关于主对角线对称。',
      '有向图必须区分方向：arcs[i][j] 表示从 vi 指向 vj 的弧，arcs[j][i] 则表示反方向的弧。',
    ],
    featureItems: [
      '判断两个顶点是否相邻非常直接，只需要访问 arcs[i][j]，时间复杂度为 O(1)。',
      '无向图中，第 i 行或第 i 列的非零元素个数就是顶点 vi 的度。',
      '有向图中，第 i 行非零元素个数表示 vi 的出度，第 i 列非零元素个数表示 vi 的入度。',
      '邻接矩阵适合表示稠密图，因为边较多时，O(n²) 的存储空间能换来很快的查询速度。',
      '邻接矩阵不适合非常稀疏的图，因为即使边很少，也必须保留 n × n 个矩阵位置。',
      '很多经典图算法会直接基于邻接矩阵描述，例如 Floyd 最短路径、Warshall 传递闭包等。',
    ],
    defaultMeaning: '请选择一个顶点、边或矩阵单元。',
    vertexMeaningPrefix: '当前选中顶点',
    vertexArrayName: '顶点',
    vertexArrayIndex: '下标',
  },
  en: {
    title: 'G-02 Graph Adjacency Matrix Storage',
    body: 'This page focuses only on adjacency-matrix definition, storage, and the static mapping between graph relations and matrix cells.',
    stage: 'Adjacency-matrix teaching stage',
    graphCanvas: 'Graph sample',
    graphCanvasHint: 'Click a vertex, edge, or matrix cell to inspect the direct mapping.',
    vertexArray: 'Vertex Array',
    vertexArrayHint: 'Store the vertices first in one linear array, then let the matrix rows and columns reuse that same order.',
    matrix: 'Adjacency Matrix',
    matrixHint: 'Rows and columns follow the same vertex order, and each value represents adjacency or edge weight.',
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
    matrixCell: 'Matrix cell',
    currentValue: 'Current value',
    degreeLabel: 'Degree',
    neighborLabel: 'Neighbors',
    outDegree: 'Out-degree',
    inDegree: 'In-degree',
    outgoingNeighbors: 'Outgoing neighbors',
    incomingNeighbors: 'Incoming neighbors',
    definitions: [
      'An adjacency matrix represents a graph with a vertex array plus a two-dimensional matrix.',
      'The vertex-array index is reused as both the matrix row and column index.',
      'In an unweighted graph, arcs[i][j] usually uses 1 for adjacency and 0 for no edge.',
      'In a weighted graph, arcs[i][j] stores the edge weight; a missing edge is represented by infinity, zero, or a special empty value depending on the algorithm.',
      'For an undirected graph, arcs[i][j] and arcs[j][i] describe the same edge, so the matrix is symmetric across the main diagonal.',
      'For a directed graph, arcs[i][j] means an arc from vi to vj, while arcs[j][i] means the opposite direction.',
    ],
    featureItems: [
      'Testing whether two vertices are adjacent only needs one access to arcs[i][j], so the query is O(1).',
      'For an undirected graph, the non-zero count in row i or column i equals the degree of vi.',
      'For a directed graph, row i counts outgoing arcs and column i counts incoming arcs.',
      'Adjacency matrices fit dense graphs because O(n²) storage buys fast relation queries.',
      'They are wasteful for sparse graphs because all n × n cells are stored even when there are few edges.',
      'Several classic algorithms are naturally described on matrices, including Floyd shortest paths and Warshall transitive closure.',
    ],
    defaultMeaning: 'Select a vertex, edge, or matrix cell.',
    vertexMeaningPrefix: 'Selected vertex',
    vertexArrayName: 'Vertex',
    vertexArrayIndex: 'Index',
  },
};

const DEFAULT_CONFIG: AdjacencyMatrixConfig = {
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

function getEdgeGeometry(graph: AdjacencyMatrixGraph, edge: AdjacencyMatrixGraph['edges'][number]) {
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
  const bend = 8;
  const control = {
    x: midX + (-dy / length) * bend,
    y: midY + (dx / length) * bend,
  };
  const clippedStart = getClippedSegment(from, control, trim, 0).start;
  const clippedEnd = getClippedSegment(control, to, 0, trim + 0.8).end;

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

export function GraphAdjacencyMatrixPage() {
  const { language } = useI18n();
  const copy = COPY[language];
  const graphPan = useStagePan();
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [graph, setGraph] = useState<AdjacencyMatrixGraph>(() => createAdjacencyMatrixSample(DEFAULT_CONFIG));
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [hoveredVertexIndex, setHoveredVertexIndex] = useState<number | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  const matrix = useMemo(() => buildAdjacencyMatrix(graph), [graph]);
  const selectedEdge = selectedEdgeId ? graph.edges.find((edge) => edge.id === selectedEdgeId) ?? null : null;

  const selectedEdgeCells = useMemo(() => {
    if (!selectedEdge) {
      return [] as Array<[number, number]>;
    }

    return graph.directed
      ? [[selectedEdge.from, selectedEdge.to]]
      : [
          [selectedEdge.from, selectedEdge.to],
          [selectedEdge.to, selectedEdge.from],
        ];
  }, [graph.directed, selectedEdge]);

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

  const selectedVertexCells = useMemo(() => {
    if (selectedVertexIndex === null) {
      return [] as Array<[number, number]>;
    }

    const cells: Array<[number, number]> = [];
    graph.edges.forEach((edge) => {
      if (edge.from === selectedVertexIndex) {
        cells.push([edge.from, edge.to]);
        if (!graph.directed) {
          cells.push([edge.to, edge.from]);
        }
      } else if (edge.to === selectedVertexIndex) {
        cells.push([edge.from, edge.to]);
        if (!graph.directed) {
          cells.push([edge.to, edge.from]);
        }
      }
    });

    return cells;
  }, [graph, selectedVertexIndex]);

  const infoItems = useMemo(() => [...copy.definitions, ...copy.featureItems], [copy.definitions, copy.featureItems]);

  const hoveredVertexSummary =
    hoveredVertexIndex !== null && selectedVertexIndex === hoveredVertexIndex
      ? getDegreeSummary(graph, hoveredVertexIndex)
      : null;
  const hoveredVertexNeighbors =
    hoveredVertexIndex !== null
      ? sortVertexIndexes(
          Array.from(new Set([...getOutgoingNeighbors(graph, hoveredVertexIndex), ...getIncomingNeighbors(graph, hoveredVertexIndex)])),
        )
      : [];
  const directedOutgoingNeighbors = useMemo(
    () => (selectedVertexIndex !== null ? sortVertexIndexes(getOutgoingNeighbors(graph, selectedVertexIndex)) : []),
    [graph, selectedVertexIndex],
  );
  const directedIncomingNeighbors = useMemo(
    () => (selectedVertexIndex !== null ? sortVertexIndexes(getIncomingNeighbors(graph, selectedVertexIndex)) : []),
    [graph, selectedVertexIndex],
  );

  const hoveredEdge =
    hoveredEdgeId && selectedEdgeId === hoveredEdgeId ? graph.edges.find((edge) => edge.id === hoveredEdgeId) ?? null : null;
  const hoveredEdgeGeometry = hoveredEdge ? getEdgeGeometry(graph, hoveredEdge) : null;
  const hoveredEdgeEndpoints = hoveredEdge
    ? graph.directed
      ? [hoveredEdge.from, hoveredEdge.to]
      : sortVertexIndexes([hoveredEdge.from, hoveredEdge.to])
    : null;

  const regenerateGraph = (nextConfig: AdjacencyMatrixConfig) => {
    setGraph(createAdjacencyMatrixSample(nextConfig));
    setSelectedVertexIndex(null);
    setSelectedEdgeId(null);
    setSelectedCell(null);
    setHoveredEdgeId(null);
  };

  const handleUpdateConfig = (partial: Partial<AdjacencyMatrixConfig>) => {
    setConfig((previous) => {
      const next = { ...previous, ...partial };
      regenerateGraph(next);
      return next;
    });
  };

  const handleVertexClick = (index: number) => {
    setSelectedVertexIndex(index);
    setSelectedEdgeId(null);
    setSelectedCell(null);
  };

  const handleEdgeClick = (edgeId: string, from: number, to: number) => {
    setSelectedEdgeId(edgeId);
    setSelectedVertexIndex(null);
    setSelectedCell([from, to]);
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    setSelectedCell([rowIndex, colIndex]);
    const edge = getEdgeByCell(graph, rowIndex, colIndex);
    setSelectedEdgeId(edge?.id ?? null);
    setSelectedVertexIndex(null);
  };

  return (
    <StaticWorkbenchShell
      title={copy.title}
      description={copy.body}
      stageAriaLabel={copy.stage}
      pageClassName="array-page tree-page storage-page adjacency-matrix-page"
      shellClassName="adjacency-matrix-workbench-shell"
      enableStagePan={false}
      controlsContent={
        <div className="adjacency-matrix-toolbar">
          <div className="adjacency-matrix-toolbar-row">
            <label className="tree-workspace-field adjacency-matrix-inline-field" htmlFor="adjacency-direction">
              <span>{copy.direction}</span>
              <select
                id="adjacency-direction"
                value={config.directed ? 'directed' : 'undirected'}
                onChange={(event) => handleUpdateConfig({ directed: event.target.value === 'directed' })}
              >
                <option value="undirected">{copy.undirected}</option>
                <option value="directed">{copy.directed}</option>
              </select>
            </label>

            <label className="tree-workspace-field adjacency-matrix-inline-field" htmlFor="adjacency-weighted">
              <span>{copy.weightMode}</span>
              <select
                id="adjacency-weighted"
                value={config.weighted ? 'weighted' : 'unweighted'}
                onChange={(event) => handleUpdateConfig({ weighted: event.target.value === 'weighted' })}
              >
                <option value="unweighted">{copy.unweighted}</option>
                <option value="weighted">{copy.weighted}</option>
              </select>
            </label>

            <label className="tree-workspace-field adjacency-matrix-inline-field" htmlFor="adjacency-vertex-count">
              <span>{copy.vertexCount}</span>
              <select
                id="adjacency-vertex-count"
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
        <div className="adjacency-matrix-layout">
          <section className="graph-stage-view-card adjacency-matrix-graph-panel">
            <div className="adjacency-matrix-graph-stage">
              <div className="adjacency-matrix-graph-pan-layer" style={graphPan.panStyle} {...graphPan.panHandlers}>
                <svg
                  className="adjacency-matrix-graph-svg"
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
                          style={{
                            stroke: 'transparent',
                            strokeWidth: 3.2,
                            fill: 'none',
                            pointerEvents: 'stroke',
                          }}
                          onClick={() => handleEdgeClick(edge.id, edge.from, edge.to)}
                          onMouseEnter={() => setHoveredEdgeId(edge.id)}
                          onMouseLeave={() => setHoveredEdgeId((previous) => (previous === edge.id ? null : previous))}
                        />
                        <path
                          d={geometry.path}
                          className={`adjacency-matrix-edge${isHighlighted ? ' adjacency-matrix-edge-highlighted' : ''}${
                            isSelected ? ' adjacency-matrix-edge-active' : ''
                          }`}
                          style={{ stroke: color }}
                          onClick={() => handleEdgeClick(edge.id, edge.from, edge.to)}
                          onMouseEnter={() => setHoveredEdgeId(edge.id)}
                          onMouseLeave={() => setHoveredEdgeId((previous) => (previous === edge.id ? null : previous))}
                        />
                        {geometry.arrow ? (
                          <path
                            d={geometry.arrow}
                            className={`adjacency-matrix-arrow${isHighlighted ? ' adjacency-matrix-arrow-highlighted' : ''}${
                              isSelected ? ' adjacency-matrix-arrow-active' : ''
                            }`}
                            style={{ stroke: color, pointerEvents: 'none' }}
                          />
                        ) : null}
                        {edge.weight !== null ? (
                          <text
                            x={(graph.nodes[edge.from]!.x + graph.nodes[edge.to]!.x) / 2}
                            y={(graph.nodes[edge.from]!.y + graph.nodes[edge.to]!.y) / 2 - 2}
                            className="adjacency-matrix-edge-weight"
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
                      className="adjacency-matrix-edge-tooltip"
                      style={{
                        left: `${hoveredEdgeGeometry?.tooltipX ?? 0}%`,
                        top: `${hoveredEdgeGeometry?.tooltipY ?? 0}%`,
                      }}
                    >
                      <strong>{`${graph.nodes[hoveredEdgeEndpoints?.[0] ?? 0]?.id} ${graph.directed ? '→' : '—'} ${graph.nodes[hoveredEdgeEndpoints?.[1] ?? 0]?.id}`}</strong>
                      <span>
                        {copy.matrixCell}: [{hoveredEdgeEndpoints?.[0] ?? 0},{hoveredEdgeEndpoints?.[1] ?? 0}]
                        {!graph.directed ? ` / [${hoveredEdgeEndpoints?.[1] ?? 0},${hoveredEdgeEndpoints?.[0] ?? 0}]` : ''}
                      </span>
                      <span>
                        {copy.currentValue}: {getMatrixDisplayValue(matrix[hoveredEdge.from]?.[hoveredEdge.to] ?? null, graph.weighted)}
                      </span>
                    </div>
                  ) : null}

                  {graph.nodes.map((node, index) => {
                    const isSelected = selectedVertexIndex === index;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        className={`graph-concept-node${isSelected ? ' graph-concept-node-selected' : ''}${
                          isSelected ? ' adjacency-matrix-node-row adjacency-matrix-node-col' : ''
                        }`}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        onClick={() => handleVertexClick(index)}
                        onMouseEnter={() => setHoveredVertexIndex(index)}
                        onMouseLeave={() => setHoveredVertexIndex((previous) => (previous === index ? null : previous))}
                      >
                        <span className="graph-concept-node-id">{node.id}</span>
                        <span className="graph-concept-node-index">{index}</span>
                        {isSelected && hoveredVertexIndex === index && hoveredVertexSummary ? (
                          <span className="adjacency-matrix-node-tooltip">
                            <strong>{node.id}</strong>
                            {!graph.directed ? (
                              <>
                                <span>
                                  {copy.degreeLabel}: {hoveredVertexSummary.degree}
                                </span>
                                <span>
                                  {copy.neighborLabel}:{' '}
                                  {hoveredVertexNeighbors.map((neighborIndex) => graph.nodes[neighborIndex]?.id).join(', ') || '∅'}
                                </span>
                              </>
                            ) : (
                              <>
                                <span>
                                  {copy.outDegree}: {hoveredVertexSummary.outDegree}
                                </span>
                                <span>
                                  {copy.inDegree}: {hoveredVertexSummary.inDegree}
                                </span>
                                <span>
                                  {copy.outgoingNeighbors}:{' '}
                                  {directedOutgoingNeighbors.map((neighborIndex) => graph.nodes[neighborIndex]?.id).join(', ') || '∅'}
                                </span>
                                <span>
                                  {copy.incomingNeighbors}:{' '}
                                  {directedIncomingNeighbors.map((neighborIndex) => graph.nodes[neighborIndex]?.id).join(', ') || '∅'}
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

          <div className="adjacency-matrix-right">
            <div className="adjacency-matrix-storage-row">
              <section className="graph-stage-view-card adjacency-matrix-storage-panel adjacency-matrix-grid-panel">
                <div className="graph-stage-view-head">
                  <strong>{copy.matrix}</strong>
                </div>

                <div className="graph-matrix-scroll">
                  <table className="graph-matrix adjacency-matrix-table">
                    <thead>
                      <tr>
                        <th className="adjacency-matrix-vertex-array-header">{copy.vertexArray}</th>
                        <th className="adjacency-matrix-storage-gap" aria-hidden="true" />
                        <th aria-label="corner" />
                        {graph.nodes.map((node, colIndex) => (
                          <th key={`col-${node.id}`} className={selectedVertexIndex === colIndex ? 'adjacency-matrix-header-col-active' : undefined}>
                            {node.id}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {matrix.map((row, rowIndex) => (
                        <tr key={`row-${rowIndex}`}>
                          <th className={`adjacency-matrix-vertex-array-cell${selectedVertexIndex === rowIndex ? ' adjacency-matrix-vertex-array-cell-active' : ''}`}>
                            <button
                              type="button"
                              className="adjacency-matrix-vertex-array-button"
                              onClick={() => handleVertexClick(rowIndex)}
                            >
                              <small>
                                {copy.vertexArrayIndex} {rowIndex}
                              </small>
                              <strong>
                                {copy.vertexArrayName} {graph.nodes[rowIndex]?.id}
                              </strong>
                            </button>
                          </th>
                          <td className="adjacency-matrix-storage-gap" aria-hidden="true" />
                          <th className={selectedVertexIndex === rowIndex ? 'adjacency-matrix-header-row-active' : undefined}>
                            {graph.nodes[rowIndex]?.id}
                          </th>
                          {row.map((value, colIndex) => {
                            const isSelected = selectedCell?.[0] === rowIndex && selectedCell?.[1] === colIndex;
                            const isHighlighted =
                              selectedEdgeCells.some(
                                ([highlightRow, highlightCol]) => highlightRow === rowIndex && highlightCol === colIndex,
                              ) ||
                              selectedVertexCells.some(
                                ([highlightRow, highlightCol]) => highlightRow === rowIndex && highlightCol === colIndex,
                              );
                            const displayValue = getMatrixDisplayValue(value, graph.weighted);
                            const isInfinity = graph.weighted && value === null;
                            return (
                              <td
                                key={`${rowIndex}-${colIndex}`}
                                className={`${isSelected ? 'adjacency-matrix-cell-active' : ''}${isHighlighted ? ' adjacency-matrix-cell-highlighted' : ''}`}
                              >
                                <button type="button" className="storage-matrix-cell-button" onClick={() => handleCellClick(rowIndex, colIndex)}>
                                  <span className={`storage-matrix-value${isInfinity ? ' adjacency-matrix-infinity-value' : ''}`}>{displayValue}</span>
                                  <small>
                                    [{rowIndex},{colIndex}]
                                  </small>
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <section className="graph-stage-view-card adjacency-matrix-info-panel">
              <div className="graph-stage-view-head">
                <strong>{copy.info}</strong>
              </div>

              <div className="adjacency-matrix-info-stack">
                <div className="adjacency-matrix-copy-columns">
                  {infoItems.map((item, itemIndex) => {
                    const order = itemIndex + 1;
                    return (
                      <p
                        key={item}
                        className={`adjacency-matrix-paragraph adjacency-matrix-numbered-paragraph${
                          order % 2 === 1 ? ' adjacency-matrix-numbered-paragraph-odd' : ' adjacency-matrix-numbered-paragraph-even'
                        }`}
                      >
                        <span className="adjacency-matrix-paragraph-number">{order}.</span>
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
