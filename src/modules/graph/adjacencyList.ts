import {
  createAdjacencyMatrixSample,
  getDegreeSummary,
  getIncomingNeighbors,
  getOutgoingNeighbors,
  type AdjacencyMatrixConfig,
  type AdjacencyMatrixGraph,
} from './adjacencyMatrix';

export type AdjacencyListGraph = AdjacencyMatrixGraph;
export type AdjacencyListConfig = AdjacencyMatrixConfig;

export type AdjacencyListEntry = {
  id: string;
  edgeId: string;
  rowIndex: number;
  neighborIndex: number;
  weight: number | null;
};

function createEntryId(edgeId: string, rowIndex: number, neighborIndex: number) {
  return `${edgeId}@${rowIndex}->${neighborIndex}`;
}

export function createAdjacencyListSample(config: AdjacencyListConfig): AdjacencyListGraph {
  return createAdjacencyMatrixSample(config);
}

export function buildAdjacencyList(graph: AdjacencyListGraph) {
  const rows: AdjacencyListEntry[][] = graph.nodes.map(() => []);

  graph.edges.forEach((edge) => {
    rows[edge.from]?.push({
      id: createEntryId(edge.id, edge.from, edge.to),
      edgeId: edge.id,
      rowIndex: edge.from,
      neighborIndex: edge.to,
      weight: edge.weight,
    });

    if (!graph.directed) {
      rows[edge.to]?.push({
        id: createEntryId(edge.id, edge.to, edge.from),
        edgeId: edge.id,
        rowIndex: edge.to,
        neighborIndex: edge.from,
        weight: edge.weight,
      });
    }
  });

  return rows.map((entries) => [...entries].sort((left, right) => left.neighborIndex - right.neighborIndex));
}

export function getAdjacencyListEntryIdsForEdge(graph: AdjacencyListGraph, edgeId: string) {
  const edge = graph.edges.find((item) => item.id === edgeId);
  if (!edge) {
    return [];
  }

  return graph.directed
    ? [createEntryId(edge.id, edge.from, edge.to)]
    : [createEntryId(edge.id, edge.from, edge.to), createEntryId(edge.id, edge.to, edge.from)];
}

export function getAdjacencyListEntryIdsForVertex(graph: AdjacencyListGraph, vertexIndex: number) {
  const rows = buildAdjacencyList(graph);
  const ids: string[] = [];

  rows.forEach((entries) => {
    entries.forEach((entry) => {
      if (entry.rowIndex === vertexIndex || entry.neighborIndex === vertexIndex) {
        ids.push(entry.id);
      }
    });
  });

  return ids;
}

export function getAdjacencySummary(graph: AdjacencyListGraph, vertexIndex: number) {
  return {
    degree: getDegreeSummary(graph, vertexIndex),
    outgoingNeighbors: [...getOutgoingNeighbors(graph, vertexIndex)].sort((left, right) => left - right),
    incomingNeighbors: [...getIncomingNeighbors(graph, vertexIndex)].sort((left, right) => left - right),
  };
}
