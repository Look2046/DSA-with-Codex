import type { AnimationStep, HighlightEntry } from '../../types/animation';
import {
  createAdjacencyList,
  getGraphEdgeKey,
  getGraphPreset,
  type GraphDefinition,
  type GraphEdge,
  type GraphPresetId,
} from './graphRepresentation';

export type TopologicalSortPresetId = Extract<GraphPresetId, 'dag'>;

export type TopologicalSortAction =
  | 'initial'
  | 'countIndegree'
  | 'enqueueZero'
  | 'dequeue'
  | 'emit'
  | 'inspectEdge'
  | 'decreaseIndegree'
  | 'enqueueNeighbor'
  | 'completeNode'
  | 'completed'
  | 'cycleDetected';

export type TopologicalSortOutcome = 'ongoing' | 'completed' | 'cycleDetected';

export type TopologicalSortStep = AnimationStep & {
  graph: GraphDefinition;
  adjacencyList: number[][];
  action: TopologicalSortAction;
  activeNodeIndex: number | null;
  activeNeighborIndex: number | null;
  activeEdge: GraphEdge | null;
  queueNodeIndices: number[];
  outputOrder: number[];
  processedNodeIndices: number[];
  indegreeByNode: number[];
  inspectedEdgeKeys: string[];
  remainingNodeCount: number;
  outcome: TopologicalSortOutcome;
};

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function createNodeHighlights(
  queueNodeIndices: number[],
  outputOrder: number[],
  processedNodeIndices: number[],
  activeNodeIndex: number | null,
  activeNeighborIndex: number | null,
): HighlightEntry[] {
  const highlights: HighlightEntry[] = [];
  const outputSet = new Set(outputOrder);
  const processedSet = new Set(processedNodeIndices);

  queueNodeIndices.forEach((nodeIndex) => {
    if (!processedSet.has(nodeIndex)) {
      highlights.push({ index: nodeIndex, type: 'new-node' });
    }
  });

  outputSet.forEach((nodeIndex) => {
    highlights.push({ index: nodeIndex, type: processedSet.has(nodeIndex) ? 'matched' : 'new-node' });
  });

  if (activeNodeIndex !== null) {
    highlights.push({ index: activeNodeIndex, type: 'visiting' });
  }

  if (activeNeighborIndex !== null) {
    highlights.push({ index: activeNeighborIndex, type: 'comparing' });
  }

  return highlights;
}

function createStep(
  graph: GraphDefinition,
  adjacencyList: number[][],
  action: TopologicalSortAction,
  codeLines: number[],
  activeNodeIndex: number | null,
  activeNeighborIndex: number | null,
  activeEdge: GraphEdge | null,
  queueNodeIndices: number[],
  outputOrder: number[],
  processedNodeIndices: number[],
  indegreeByNode: number[],
  inspectedEdgeKeys: string[],
  outcome: TopologicalSortOutcome,
): TopologicalSortStep {
  return {
    description: action,
    codeLines: [...codeLines],
    highlights: cloneHighlights(
      createNodeHighlights(queueNodeIndices, outputOrder, processedNodeIndices, activeNodeIndex, activeNeighborIndex),
    ),
    graph,
    adjacencyList: adjacencyList.map((row) => [...row]),
    action,
    activeNodeIndex,
    activeNeighborIndex,
    activeEdge: activeEdge ? { ...activeEdge } : null,
    queueNodeIndices: [...queueNodeIndices],
    outputOrder: [...outputOrder],
    processedNodeIndices: [...processedNodeIndices],
    indegreeByNode: [...indegreeByNode],
    inspectedEdgeKeys: [...inspectedEdgeKeys],
    remainingNodeCount: Math.max(graph.nodes.length - outputOrder.length, 0),
    outcome,
  };
}

export function getTopologicalSortPresetIds(): TopologicalSortPresetId[] {
  return ['dag'];
}

export function getTopologicalSortPreset(presetId: TopologicalSortPresetId): GraphDefinition {
  const graph = getGraphPreset(presetId);
  if (graph.topology !== 'directed') {
    throw new Error('Topological sort currently supports directed presets only.');
  }
  return graph;
}

export function generateTopologicalSortSteps(presetId: TopologicalSortPresetId): TopologicalSortStep[] {
  const graph = getTopologicalSortPreset(presetId);
  const adjacencyList = createAdjacencyList(graph);
  const indegreeByNode = graph.nodes.map(() => 0);
  const queueNodeIndices: number[] = [];
  const outputOrder: number[] = [];
  const processedNodeIndices: number[] = [];
  const inspectedEdgeKeys = new Set<string>();
  const steps: TopologicalSortStep[] = [];

  steps.push(
    createStep(
      graph,
      adjacencyList,
      'initial',
      [1],
      null,
      null,
      null,
      queueNodeIndices,
      outputOrder,
      processedNodeIndices,
      indegreeByNode,
      [],
      'ongoing',
    ),
  );

  graph.edges.forEach((edge) => {
    indegreeByNode[edge.to] = (indegreeByNode[edge.to] ?? 0) + 1;
    inspectedEdgeKeys.add(getGraphEdgeKey(graph, edge.from, edge.to));

    steps.push(
      createStep(
        graph,
        adjacencyList,
        'countIndegree',
        [2],
        edge.from,
        edge.to,
        edge,
        queueNodeIndices,
        outputOrder,
        processedNodeIndices,
        indegreeByNode,
        [...inspectedEdgeKeys],
        'ongoing',
      ),
    );
  });

  inspectedEdgeKeys.clear();

  indegreeByNode.forEach((indegree, nodeIndex) => {
    if (indegree !== 0) {
      return;
    }

    queueNodeIndices.push(nodeIndex);

    steps.push(
      createStep(
        graph,
        adjacencyList,
        'enqueueZero',
        [3],
        nodeIndex,
        null,
        null,
        queueNodeIndices,
        outputOrder,
        processedNodeIndices,
        indegreeByNode,
        [...inspectedEdgeKeys],
        'ongoing',
      ),
    );
  });

  while (queueNodeIndices.length > 0) {
    const currentNodeIndex = queueNodeIndices.shift();
    if (currentNodeIndex === undefined) {
      break;
    }

    steps.push(
      createStep(
        graph,
        adjacencyList,
        'dequeue',
        [4],
        currentNodeIndex,
        null,
        null,
        queueNodeIndices,
        outputOrder,
        processedNodeIndices,
        indegreeByNode,
        [...inspectedEdgeKeys],
        'ongoing',
      ),
    );

    outputOrder.push(currentNodeIndex);

    steps.push(
      createStep(
        graph,
        adjacencyList,
        'emit',
        [5],
        currentNodeIndex,
        null,
        null,
        queueNodeIndices,
        outputOrder,
        processedNodeIndices,
        indegreeByNode,
        [...inspectedEdgeKeys],
        'ongoing',
      ),
    );

    const neighbors = adjacencyList[currentNodeIndex] ?? [];
    for (const neighborIndex of neighbors) {
      const activeEdge = { from: currentNodeIndex, to: neighborIndex };
      inspectedEdgeKeys.add(getGraphEdgeKey(graph, currentNodeIndex, neighborIndex));

      steps.push(
        createStep(
          graph,
          adjacencyList,
          'inspectEdge',
          [6],
          currentNodeIndex,
          neighborIndex,
          activeEdge,
          queueNodeIndices,
          outputOrder,
          processedNodeIndices,
          indegreeByNode,
          [...inspectedEdgeKeys],
          'ongoing',
        ),
      );

      indegreeByNode[neighborIndex] = Math.max((indegreeByNode[neighborIndex] ?? 0) - 1, 0);

      steps.push(
        createStep(
          graph,
          adjacencyList,
          'decreaseIndegree',
          [7],
          currentNodeIndex,
          neighborIndex,
          activeEdge,
          queueNodeIndices,
          outputOrder,
          processedNodeIndices,
          indegreeByNode,
          [...inspectedEdgeKeys],
          'ongoing',
        ),
      );

      if ((indegreeByNode[neighborIndex] ?? 0) === 0) {
        queueNodeIndices.push(neighborIndex);

        steps.push(
          createStep(
            graph,
            adjacencyList,
            'enqueueNeighbor',
            [8],
            currentNodeIndex,
            neighborIndex,
            activeEdge,
            queueNodeIndices,
            outputOrder,
            processedNodeIndices,
            indegreeByNode,
            [...inspectedEdgeKeys],
            'ongoing',
          ),
        );
      }
    }

    processedNodeIndices.push(currentNodeIndex);

    steps.push(
      createStep(
        graph,
        adjacencyList,
        'completeNode',
        [5],
        currentNodeIndex,
        null,
        null,
        queueNodeIndices,
        outputOrder,
        processedNodeIndices,
        indegreeByNode,
        [...inspectedEdgeKeys],
        'ongoing',
      ),
    );
  }

  const isCompleted = outputOrder.length === graph.nodes.length;

  steps.push(
    createStep(
      graph,
      adjacencyList,
      isCompleted ? 'completed' : 'cycleDetected',
      [8],
      null,
      null,
      null,
      queueNodeIndices,
      outputOrder,
      processedNodeIndices,
      indegreeByNode,
      [...inspectedEdgeKeys],
      isCompleted ? 'completed' : 'cycleDetected',
    ),
  );

  return steps;
}
