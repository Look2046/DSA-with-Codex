import type { AnimationStep, HighlightEntry } from '../../types/animation';

export type GraphPresetId = 'dag' | 'undirected';
export type GraphTopology = 'directed' | 'undirected';

export type GraphNode = {
  id: string;
  x: number;
  y: number;
};

export type GraphEdge = {
  from: number;
  to: number;
};

export type GraphDefinition = {
  presetId: GraphPresetId;
  topology: GraphTopology;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type GraphMatrixCell = {
  row: number;
  col: number;
};

export type GraphRepresentationAction = 'initial' | 'selectVertex' | 'inspectEdge' | 'completeRow' | 'completed';
export type GraphRepresentationOutcome = 'ongoing' | 'completed';

export type GraphRepresentationStep = AnimationStep & {
  graph: GraphDefinition;
  adjacencyList: number[][];
  adjacencyMatrix: number[][];
  action: GraphRepresentationAction;
  activeNodeIndex: number | null;
  activeNeighborIndex: number | null;
  activeEdge: GraphEdge | null;
  activeMatrixCell: GraphMatrixCell | null;
  mirroredMatrixCell: GraphMatrixCell | null;
  completedNodeIndices: number[];
  completedEdgeKeys: string[];
  inspectedRelationCount: number;
  totalRelationCount: number;
  outcome: GraphRepresentationOutcome;
};

const GRAPH_PRESETS: Record<GraphPresetId, GraphDefinition> = {
  dag: {
    presetId: 'dag',
    topology: 'directed',
    nodes: [
      { id: 'A', x: 16, y: 24 },
      { id: 'B', x: 36, y: 18 },
      { id: 'C', x: 36, y: 42 },
      { id: 'D', x: 58, y: 18 },
      { id: 'E', x: 60, y: 42 },
      { id: 'F', x: 82, y: 30 },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 3 },
      { from: 2, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
    ],
  },
  undirected: {
    presetId: 'undirected',
    topology: 'undirected',
    nodes: [
      { id: 'A', x: 18, y: 28 },
      { id: 'B', x: 34, y: 16 },
      { id: 'C', x: 34, y: 46 },
      { id: 'D', x: 56, y: 30 },
      { id: 'E', x: 74, y: 16 },
      { id: 'F', x: 76, y: 46 },
    ],
    edges: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 1, to: 3 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 3, to: 5 },
      { from: 4, to: 5 },
    ],
  },
};

export function getGraphPresetIds(): GraphPresetId[] {
  return Object.keys(GRAPH_PRESETS) as GraphPresetId[];
}

export function getGraphPreset(presetId: GraphPresetId): GraphDefinition {
  const preset = GRAPH_PRESETS[presetId];
  return {
    presetId: preset.presetId,
    topology: preset.topology,
    nodes: preset.nodes.map((node) => ({ ...node })),
    edges: preset.edges.map((edge) => ({ ...edge })),
  };
}

export function createAdjacencyList(graph: GraphDefinition): number[][] {
  const rows = graph.nodes.map(() => [] as number[]);

  graph.edges.forEach((edge) => {
    rows[edge.from]?.push(edge.to);
    if (graph.topology === 'undirected' && edge.from !== edge.to) {
      rows[edge.to]?.push(edge.from);
    }
  });

  return rows.map((row) => [...row].sort((left, right) => left - right));
}

export function createAdjacencyMatrix(graph: GraphDefinition): number[][] {
  const size = graph.nodes.length;
  const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => 0));

  graph.edges.forEach((edge) => {
    if (matrix[edge.from]) {
      matrix[edge.from][edge.to] = 1;
    }
    if (graph.topology === 'undirected' && edge.from !== edge.to && matrix[edge.to]) {
      matrix[edge.to][edge.from] = 1;
    }
  });

  return matrix;
}

export function getGraphEdgeKey(graph: GraphDefinition, from: number, to: number): string {
  if (graph.topology === 'undirected') {
    return from <= to ? `${from}-${to}` : `${to}-${from}`;
  }
  return `${from}->${to}`;
}

export function countGraphRelations(adjacencyList: number[][]): number {
  return adjacencyList.reduce((sum, row) => sum + row.length, 0);
}

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function createNodeHighlights(
  completedNodeIndices: number[],
  activeNodeIndex: number | null,
  activeNeighborIndex: number | null,
): HighlightEntry[] {
  const completedSet = new Set(completedNodeIndices);
  const highlights: HighlightEntry[] = [];

  completedSet.forEach((index) => {
    highlights.push({ index, type: 'matched' });
  });

  if (activeNodeIndex !== null) {
    highlights.push({ index: activeNodeIndex, type: 'visiting' });
  }

  if (activeNeighborIndex !== null) {
    highlights.push({ index: activeNeighborIndex, type: 'new-node' });
  }

  return highlights;
}

function createStep(
  graph: GraphDefinition,
  adjacencyList: number[][],
  adjacencyMatrix: number[][],
  action: GraphRepresentationAction,
  codeLines: number[],
  activeNodeIndex: number | null,
  activeNeighborIndex: number | null,
  activeEdge: GraphEdge | null,
  activeMatrixCell: GraphMatrixCell | null,
  mirroredMatrixCell: GraphMatrixCell | null,
  completedNodeIndices: number[],
  completedEdgeKeys: string[],
  inspectedRelationCount: number,
  totalRelationCount: number,
  outcome: GraphRepresentationOutcome,
): GraphRepresentationStep {
  return {
    description: action,
    codeLines: [...codeLines],
    highlights: cloneHighlights(createNodeHighlights(completedNodeIndices, activeNodeIndex, activeNeighborIndex)),
    graph,
    adjacencyList: adjacencyList.map((row) => [...row]),
    adjacencyMatrix: adjacencyMatrix.map((row) => [...row]),
    action,
    activeNodeIndex,
    activeNeighborIndex,
    activeEdge: activeEdge ? { ...activeEdge } : null,
    activeMatrixCell: activeMatrixCell ? { ...activeMatrixCell } : null,
    mirroredMatrixCell: mirroredMatrixCell ? { ...mirroredMatrixCell } : null,
    completedNodeIndices: [...completedNodeIndices],
    completedEdgeKeys: [...completedEdgeKeys],
    inspectedRelationCount,
    totalRelationCount,
    outcome,
  };
}

export function generateGraphRepresentationSteps(presetId: GraphPresetId): GraphRepresentationStep[] {
  const graph = getGraphPreset(presetId);
  const adjacencyList = createAdjacencyList(graph);
  const adjacencyMatrix = createAdjacencyMatrix(graph);
  const totalRelationCount = countGraphRelations(adjacencyList);
  const steps: GraphRepresentationStep[] = [];
  const completedEdgeKeys = new Set<string>();
  let completedNodeIndices: number[] = [];
  let inspectedRelationCount = 0;

  steps.push(
    createStep(
      graph,
      adjacencyList,
      adjacencyMatrix,
      'initial',
      [1],
      null,
      null,
      null,
      null,
      null,
      completedNodeIndices,
      [],
      inspectedRelationCount,
      totalRelationCount,
      'ongoing',
    ),
  );

  adjacencyList.forEach((neighbors, nodeIndex) => {
    steps.push(
      createStep(
        graph,
        adjacencyList,
        adjacencyMatrix,
        'selectVertex',
        [1, 2],
        nodeIndex,
        null,
        null,
        null,
        null,
        completedNodeIndices,
        [...completedEdgeKeys],
        inspectedRelationCount,
        totalRelationCount,
        'ongoing',
      ),
    );

    neighbors.forEach((neighborIndex) => {
      inspectedRelationCount += 1;
      completedEdgeKeys.add(getGraphEdgeKey(graph, nodeIndex, neighborIndex));

      const activeMatrixCell = {
        row: nodeIndex,
        col: neighborIndex,
      };
      const mirroredMatrixCell =
        graph.topology === 'undirected' && nodeIndex !== neighborIndex
          ? {
              row: neighborIndex,
              col: nodeIndex,
            }
          : null;

      steps.push(
        createStep(
          graph,
          adjacencyList,
          adjacencyMatrix,
          'inspectEdge',
          graph.topology === 'undirected' ? [3, 4, 5] : [3, 4],
          nodeIndex,
          neighborIndex,
          { from: nodeIndex, to: neighborIndex },
          activeMatrixCell,
          mirroredMatrixCell,
          completedNodeIndices,
          [...completedEdgeKeys],
          inspectedRelationCount,
          totalRelationCount,
          'ongoing',
        ),
      );
    });

    completedNodeIndices = [...completedNodeIndices, nodeIndex];

    steps.push(
      createStep(
        graph,
        adjacencyList,
        adjacencyMatrix,
        'completeRow',
        [6],
        nodeIndex,
        null,
        null,
        null,
        null,
        completedNodeIndices,
        [...completedEdgeKeys],
        inspectedRelationCount,
        totalRelationCount,
        'ongoing',
      ),
    );
  });

  steps.push(
    createStep(
      graph,
      adjacencyList,
      adjacencyMatrix,
      'completed',
      [7],
      null,
      null,
      null,
      null,
      null,
      completedNodeIndices,
      [...completedEdgeKeys],
      inspectedRelationCount,
      totalRelationCount,
      'completed',
    ),
  );

  return steps;
}
