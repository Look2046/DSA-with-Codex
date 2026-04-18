import type { AnimationStep, HighlightEntry } from '../../types/animation';
import {
  createAdjacencyList,
  getGraphEdgeKey,
  getGraphPreset,
  type GraphDefinition,
  type GraphEdge,
  type GraphPresetId,
} from './graphRepresentation';

export type BfsAction =
  | 'initial'
  | 'enqueueStart'
  | 'dequeue'
  | 'visit'
  | 'inspectNeighbor'
  | 'enqueueNeighbor'
  | 'skipVisited'
  | 'completeVertex'
  | 'completed';

export type BfsOutcome = 'ongoing' | 'completed';

export type BfsStep = AnimationStep & {
  graph: GraphDefinition;
  adjacencyList: number[][];
  action: BfsAction;
  startNodeIndex: number;
  activeNodeIndex: number | null;
  activeNeighborIndex: number | null;
  activeEdge: GraphEdge | null;
  queueNodeIndices: number[];
  outputOrder: number[];
  completedNodeIndices: number[];
  levelByNode: Array<number | null>;
  inspectedEdgeKeys: string[];
  outcome: BfsOutcome;
};

type BfsQueueEntry = {
  nodeIndex: number;
  level: number;
};

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function createNodeHighlights(
  queueNodeIndices: number[],
  completedNodeIndices: number[],
  activeNodeIndex: number | null,
  activeNeighborIndex: number | null,
): HighlightEntry[] {
  const completedSet = new Set(completedNodeIndices);
  const queueSet = new Set(queueNodeIndices);
  const highlights: HighlightEntry[] = [];

  queueSet.forEach((index) => {
    if (!completedSet.has(index)) {
      highlights.push({ index, type: 'new-node' });
    }
  });

  completedSet.forEach((index) => {
    highlights.push({ index, type: 'matched' });
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
  action: BfsAction,
  codeLines: number[],
  startNodeIndex: number,
  activeNodeIndex: number | null,
  activeNeighborIndex: number | null,
  activeEdge: GraphEdge | null,
  queueNodeIndices: number[],
  outputOrder: number[],
  completedNodeIndices: number[],
  levelByNode: Array<number | null>,
  inspectedEdgeKeys: string[],
  outcome: BfsOutcome,
): BfsStep {
  return {
    description: action,
    codeLines: [...codeLines],
    highlights: cloneHighlights(
      createNodeHighlights(queueNodeIndices, completedNodeIndices, activeNodeIndex, activeNeighborIndex),
    ),
    graph,
    adjacencyList: adjacencyList.map((row) => [...row]),
    action,
    startNodeIndex,
    activeNodeIndex,
    activeNeighborIndex,
    activeEdge: activeEdge ? { ...activeEdge } : null,
    queueNodeIndices: [...queueNodeIndices],
    outputOrder: [...outputOrder],
    completedNodeIndices: [...completedNodeIndices],
    levelByNode: [...levelByNode],
    inspectedEdgeKeys: [...inspectedEdgeKeys],
    outcome,
  };
}

export function generateBfsSteps(presetId: GraphPresetId, startNodeIndex = 0): BfsStep[] {
  const graph = getGraphPreset(presetId);
  const adjacencyList = createAdjacencyList(graph);
  const safeStartNodeIndex =
    startNodeIndex >= 0 && startNodeIndex < graph.nodes.length ? startNodeIndex : 0;
  const steps: BfsStep[] = [];
  const queue: BfsQueueEntry[] = [];
  const outputOrder: number[] = [];
  const completedNodeIndices: number[] = [];
  const discoveredSet = new Set<number>();
  const inspectedEdgeKeys = new Set<string>();
  const levelByNode = graph.nodes.map(() => null as number | null);

  steps.push(
    createStep(
      graph,
      adjacencyList,
      'initial',
      [1],
      safeStartNodeIndex,
      null,
      null,
      null,
      [],
      outputOrder,
      completedNodeIndices,
      levelByNode,
      [],
      'ongoing',
    ),
  );

  queue.push({ nodeIndex: safeStartNodeIndex, level: 0 });
  discoveredSet.add(safeStartNodeIndex);
  levelByNode[safeStartNodeIndex] = 0;

  steps.push(
    createStep(
      graph,
      adjacencyList,
      'enqueueStart',
      [1],
      safeStartNodeIndex,
      safeStartNodeIndex,
      null,
      null,
      queue.map((entry) => entry.nodeIndex),
      outputOrder,
      completedNodeIndices,
      levelByNode,
      [],
      'ongoing',
    ),
  );

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    steps.push(
      createStep(
        graph,
        adjacencyList,
        'dequeue',
        [2],
        safeStartNodeIndex,
        current.nodeIndex,
        null,
        null,
        queue.map((entry) => entry.nodeIndex),
        outputOrder,
        completedNodeIndices,
        levelByNode,
        [...inspectedEdgeKeys],
        'ongoing',
      ),
    );

    outputOrder.push(current.nodeIndex);

    steps.push(
      createStep(
        graph,
        adjacencyList,
        'visit',
        [3],
        safeStartNodeIndex,
        current.nodeIndex,
        null,
        null,
        queue.map((entry) => entry.nodeIndex),
        outputOrder,
        completedNodeIndices,
        levelByNode,
        [...inspectedEdgeKeys],
        'ongoing',
      ),
    );

    const neighbors = adjacencyList[current.nodeIndex] ?? [];
    for (const neighborIndex of neighbors) {
      const activeEdge = { from: current.nodeIndex, to: neighborIndex };
      inspectedEdgeKeys.add(getGraphEdgeKey(graph, current.nodeIndex, neighborIndex));

      steps.push(
        createStep(
          graph,
          adjacencyList,
          'inspectNeighbor',
          [4],
          safeStartNodeIndex,
          current.nodeIndex,
          neighborIndex,
          activeEdge,
          queue.map((entry) => entry.nodeIndex),
          outputOrder,
          completedNodeIndices,
          levelByNode,
          [...inspectedEdgeKeys],
          'ongoing',
        ),
      );

      if (!discoveredSet.has(neighborIndex)) {
        discoveredSet.add(neighborIndex);
        levelByNode[neighborIndex] = current.level + 1;
        queue.push({ nodeIndex: neighborIndex, level: current.level + 1 });

        steps.push(
          createStep(
            graph,
            adjacencyList,
            'enqueueNeighbor',
            [5],
            safeStartNodeIndex,
            current.nodeIndex,
            neighborIndex,
            activeEdge,
            queue.map((entry) => entry.nodeIndex),
            outputOrder,
            completedNodeIndices,
            levelByNode,
            [...inspectedEdgeKeys],
            'ongoing',
          ),
        );
      } else {
        steps.push(
          createStep(
            graph,
            adjacencyList,
            'skipVisited',
            [6],
            safeStartNodeIndex,
            current.nodeIndex,
            neighborIndex,
            activeEdge,
            queue.map((entry) => entry.nodeIndex),
            outputOrder,
            completedNodeIndices,
            levelByNode,
            [...inspectedEdgeKeys],
            'ongoing',
          ),
        );
      }
    }

    completedNodeIndices.push(current.nodeIndex);

    steps.push(
      createStep(
        graph,
        adjacencyList,
        'completeVertex',
        [7],
        safeStartNodeIndex,
        current.nodeIndex,
        null,
        null,
        queue.map((entry) => entry.nodeIndex),
        outputOrder,
        completedNodeIndices,
        levelByNode,
        [...inspectedEdgeKeys],
        'ongoing',
      ),
    );
  }

  steps.push(
    createStep(
      graph,
      adjacencyList,
      'completed',
      [8],
      safeStartNodeIndex,
      null,
      null,
      null,
      [],
      outputOrder,
      completedNodeIndices,
      levelByNode,
      [...inspectedEdgeKeys],
      'completed',
    ),
  );

  return steps;
}
