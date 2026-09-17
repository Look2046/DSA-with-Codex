export type AdjacencyMatrixNode = {
  id: string;
  x: number;
  y: number;
};

export type AdjacencyMatrixEdge = {
  id: string;
  from: number;
  to: number;
  weight: number | null;
};

export type AdjacencyMatrixGraph = {
  directed: boolean;
  weighted: boolean;
  nodes: AdjacencyMatrixNode[];
  edges: AdjacencyMatrixEdge[];
};

export type AdjacencyMatrixConfig = {
  directed: boolean;
  weighted: boolean;
  vertexCount: number;
};

export type AdjacencyMatrixValue = number | null;

const WEIGHTS = [3, 5, 2, 7, 4, 6, 8, 1, 9];

function createNodeId(index: number) {
  return `v${index}`;
}

function createLayout(vertexCount: number): AdjacencyMatrixNode[] {
  const radiusX = vertexCount >= 6 ? 31 : 28;
  const radiusY = vertexCount >= 6 ? 28 : 24;

  return Array.from({ length: vertexCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / vertexCount - Math.PI / 2;
    return {
      id: createNodeId(index),
      x: 50 + Math.cos(angle) * radiusX,
      y: 50 + Math.sin(angle) * radiusY,
    };
  });
}

function getUndirectedEdges(vertexCount: number): Array<[number, number]> {
  if (vertexCount === 4) {
    return [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
      [1, 2],
    ];
  }

  if (vertexCount === 5) {
    return [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
      [3, 4],
      [1, 2],
    ];
  }

  return [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [4, 5],
    [1, 2],
  ];
}

function getDirectedEdges(vertexCount: number): Array<[number, number]> {
  if (vertexCount === 4) {
    return [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 3],
    ];
  }

  if (vertexCount === 5) {
    return [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 4],
    ];
  }

  return [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [3, 5],
    [1, 4],
    [4, 5],
  ];
}

function createEdgeId(from: number, to: number, directed: boolean) {
  return directed ? `${from}->${to}` : from < to ? `${from}-${to}` : `${to}-${from}`;
}

export function createAdjacencyMatrixSample(config: AdjacencyMatrixConfig): AdjacencyMatrixGraph {
  const nodes = createLayout(config.vertexCount);
  const edgePairs = config.directed ? getDirectedEdges(config.vertexCount) : getUndirectedEdges(config.vertexCount);

  return {
    directed: config.directed,
    weighted: config.weighted,
    nodes,
    edges: edgePairs.map(([from, to], index) => ({
      id: createEdgeId(from, to, config.directed),
      from,
      to,
      weight: config.weighted ? WEIGHTS[index % WEIGHTS.length] : null,
    })),
  };
}

export function buildAdjacencyMatrix(graph: AdjacencyMatrixGraph): AdjacencyMatrixValue[][] {
  const size = graph.nodes.length;
  const matrix: AdjacencyMatrixValue[][] = Array.from({ length: size }, (_, rowIndex) =>
    Array.from({ length: size }, (_, colIndex) => (rowIndex === colIndex ? 0 : graph.weighted ? null : 0)),
  );

  graph.edges.forEach((edge) => {
    matrix[edge.from]![edge.to] = graph.weighted ? edge.weight ?? 0 : 1;
    if (!graph.directed) {
      matrix[edge.to]![edge.from] = graph.weighted ? edge.weight ?? 0 : 1;
    }
  });

  return matrix;
}

export function createEmptyAdjacencyMatrix(graph: AdjacencyMatrixGraph): AdjacencyMatrixValue[][] {
  return Array.from({ length: graph.nodes.length }, (_, rowIndex): AdjacencyMatrixValue[] =>
    Array.from({ length: graph.nodes.length }, (_, colIndex) => (rowIndex === colIndex ? 0 : graph.weighted ? null : 0)),
  );
}

export function getMatrixDisplayValue(value: AdjacencyMatrixValue, weighted: boolean) {
  if (value === null) {
    return weighted ? '∞' : '0';
  }
  return String(value);
}

export function locateVex(graph: AdjacencyMatrixGraph, vertexId: string) {
  return graph.nodes.findIndex((node) => node.id === vertexId);
}

export function getOutgoingNeighbors(graph: AdjacencyMatrixGraph, vertexIndex: number) {
  return graph.edges.filter((edge) => edge.from === vertexIndex).map((edge) => edge.to);
}

export function getIncomingNeighbors(graph: AdjacencyMatrixGraph, vertexIndex: number) {
  if (!graph.directed) {
    return graph.edges
      .filter((edge) => edge.from === vertexIndex || edge.to === vertexIndex)
      .map((edge) => (edge.from === vertexIndex ? edge.to : edge.from));
  }

  return graph.edges.filter((edge) => edge.to === vertexIndex).map((edge) => edge.from);
}

export function getDegreeSummary(graph: AdjacencyMatrixGraph, vertexIndex: number) {
  const outDegree = getOutgoingNeighbors(graph, vertexIndex).length;
  const inDegree = getIncomingNeighbors(graph, vertexIndex).length;

  return {
    outDegree,
    inDegree,
    degree: graph.directed ? outDegree + inDegree : inDegree,
  };
}

export function getEdgeByCell(graph: AdjacencyMatrixGraph, rowIndex: number, colIndex: number) {
  return (
    graph.edges.find((edge) =>
      graph.directed
        ? edge.from === rowIndex && edge.to === colIndex
        : (edge.from === rowIndex && edge.to === colIndex) || (edge.from === colIndex && edge.to === rowIndex),
    ) ?? null
  );
}

export function getGraphTypeLabel(graph: AdjacencyMatrixGraph) {
  if (graph.directed && graph.weighted) {
    return '有向网';
  }
  if (graph.directed) {
    return '有向图';
  }
  if (graph.weighted) {
    return '无向网';
  }
  return '无向图';
}
