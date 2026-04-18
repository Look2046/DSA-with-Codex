import type { GraphNode } from './graphRepresentation';

export type WeightedGraphPresetId = 'positiveDirected' | 'negativeDirected';
export type WeightedGraphPresetGroup = 'all' | 'nonNegative' | 'bellmanFord';

export type WeightedGraphEdge = {
  from: number;
  to: number;
  weight: number;
};

export type WeightedGraphDefinition = {
  presetId: WeightedGraphPresetId;
  topology: 'directed';
  nodes: GraphNode[];
  edges: WeightedGraphEdge[];
};

const WEIGHTED_GRAPH_PRESETS: Record<WeightedGraphPresetId, WeightedGraphDefinition> = {
  positiveDirected: {
    presetId: 'positiveDirected',
    topology: 'directed',
    nodes: [
      { id: 'A', x: 14, y: 26 },
      { id: 'B', x: 34, y: 14 },
      { id: 'C', x: 34, y: 44 },
      { id: 'D', x: 56, y: 22 },
      { id: 'E', x: 58, y: 50 },
      { id: 'F', x: 82, y: 34 },
    ],
    edges: [
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 2 },
      { from: 1, to: 3, weight: 5 },
      { from: 1, to: 4, weight: 12 },
      { from: 2, to: 1, weight: 1 },
      { from: 2, to: 3, weight: 8 },
      { from: 2, to: 4, weight: 10 },
      { from: 3, to: 4, weight: 2 },
      { from: 3, to: 5, weight: 6 },
      { from: 4, to: 5, weight: 2 },
    ],
  },
  negativeDirected: {
    presetId: 'negativeDirected',
    topology: 'directed',
    nodes: [
      { id: 'A', x: 14, y: 26 },
      { id: 'B', x: 34, y: 14 },
      { id: 'C', x: 34, y: 44 },
      { id: 'D', x: 56, y: 22 },
      { id: 'E', x: 58, y: 50 },
      { id: 'F', x: 82, y: 34 },
    ],
    edges: [
      { from: 3, to: 4, weight: 2 },
      { from: 4, to: 5, weight: 1 },
      { from: 2, to: 3, weight: 1 },
      { from: 1, to: 3, weight: 6 },
      { from: 2, to: 4, weight: 7 },
      { from: 0, to: 1, weight: 4 },
      { from: 0, to: 2, weight: 5 },
      { from: 1, to: 2, weight: -2 },
    ],
  },
};

export function getWeightedGraphPresetIds(group: WeightedGraphPresetGroup = 'all'): WeightedGraphPresetId[] {
  if (group === 'nonNegative') {
    return ['positiveDirected'];
  }
  if (group === 'bellmanFord') {
    return ['negativeDirected'];
  }
  return Object.keys(WEIGHTED_GRAPH_PRESETS) as WeightedGraphPresetId[];
}

export function getWeightedGraphPreset(presetId: WeightedGraphPresetId): WeightedGraphDefinition {
  const preset = WEIGHTED_GRAPH_PRESETS[presetId];
  return {
    presetId: preset.presetId,
    topology: preset.topology,
    nodes: preset.nodes.map((node) => ({ ...node })),
    edges: preset.edges.map((edge) => ({ ...edge })),
  };
}

export function getWeightedGraphEdgeKey(graph: WeightedGraphDefinition, from: number, to: number): string {
  return graph.topology === 'directed' ? `${from}->${to}` : `${Math.min(from, to)}-${Math.max(from, to)}`;
}

export function createWeightedAdjacencyList(graph: WeightedGraphDefinition): WeightedGraphEdge[][] {
  const rows = graph.nodes.map(() => [] as WeightedGraphEdge[]);

  graph.edges.forEach((edge) => {
    rows[edge.from]?.push({ ...edge });
  });

  return rows.map((row) => [...row].sort((left, right) => left.to - right.to || left.weight - right.weight));
}
