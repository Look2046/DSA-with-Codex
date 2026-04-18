import type { AnimationStep, HighlightEntry } from '../../types/animation';
import {
  createWeightedAdjacencyList,
  getWeightedGraphEdgeKey,
  getWeightedGraphPreset,
  type WeightedGraphDefinition,
  type WeightedGraphEdge,
  type WeightedGraphPresetId,
} from './weightedGraph';

export type DijkstraAction =
  | 'initial'
  | 'seedStart'
  | 'selectCandidate'
  | 'inspectEdge'
  | 'updateDistance'
  | 'keepDistance'
  | 'finalizeNode'
  | 'completed';

export type DijkstraOutcome = 'ongoing' | 'completed';

export type DijkstraStep = AnimationStep & {
  graph: WeightedGraphDefinition;
  adjacencyList: WeightedGraphEdge[][];
  action: DijkstraAction;
  startNodeIndex: number;
  activeNodeIndex: number | null;
  activeNeighborIndex: number | null;
  activeEdge: WeightedGraphEdge | null;
  distances: Array<number | null>;
  previousNodeIndices: Array<number | null>;
  settledNodeIndices: number[];
  frontierNodeIndices: number[];
  outputOrder: number[];
  inspectedEdgeKeys: string[];
  proposedDistance: number | null;
  currentDistance: number | null;
  outcome: DijkstraOutcome;
};

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function createNodeHighlights(
  frontierNodeIndices: number[],
  settledNodeIndices: number[],
  activeNodeIndex: number | null,
  activeNeighborIndex: number | null,
): HighlightEntry[] {
  const frontierSet = new Set(frontierNodeIndices);
  const settledSet = new Set(settledNodeIndices);
  const highlights: HighlightEntry[] = [];

  frontierSet.forEach((index) => {
    if (!settledSet.has(index)) {
      highlights.push({ index, type: 'new-node' });
    }
  });

  settledSet.forEach((index) => {
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
  graph: WeightedGraphDefinition,
  adjacencyList: WeightedGraphEdge[][],
  action: DijkstraAction,
  codeLines: number[],
  startNodeIndex: number,
  activeNodeIndex: number | null,
  activeNeighborIndex: number | null,
  activeEdge: WeightedGraphEdge | null,
  distances: Array<number | null>,
  previousNodeIndices: Array<number | null>,
  settledNodeIndices: number[],
  frontierNodeIndices: number[],
  outputOrder: number[],
  inspectedEdgeKeys: string[],
  proposedDistance: number | null,
  currentDistance: number | null,
  outcome: DijkstraOutcome,
): DijkstraStep {
  return {
    description: action,
    codeLines: [...codeLines],
    highlights: cloneHighlights(
      createNodeHighlights(frontierNodeIndices, settledNodeIndices, activeNodeIndex, activeNeighborIndex),
    ),
    graph,
    adjacencyList: adjacencyList.map((row) => row.map((edge) => ({ ...edge }))),
    action,
    startNodeIndex,
    activeNodeIndex,
    activeNeighborIndex,
    activeEdge: activeEdge ? { ...activeEdge } : null,
    distances: [...distances],
    previousNodeIndices: [...previousNodeIndices],
    settledNodeIndices: [...settledNodeIndices],
    frontierNodeIndices: [...frontierNodeIndices],
    outputOrder: [...outputOrder],
    inspectedEdgeKeys: [...inspectedEdgeKeys],
    proposedDistance,
    currentDistance,
    outcome,
  };
}

function sortFrontier(distances: Array<number | null>, settledSet: Set<number>): number[] {
  return distances
    .map((distance, index) => ({ distance, index }))
    .filter((item) => item.distance !== null && !settledSet.has(item.index))
    .sort((left, right) => {
      const leftDistance = left.distance ?? Number.POSITIVE_INFINITY;
      const rightDistance = right.distance ?? Number.POSITIVE_INFINITY;
      return leftDistance - rightDistance || left.index - right.index;
    })
    .map((item) => item.index);
}

export function generateDijkstraSteps(presetId: WeightedGraphPresetId, startNodeIndex = 0): DijkstraStep[] {
  const graph = getWeightedGraphPreset(presetId);
  const adjacencyList = createWeightedAdjacencyList(graph);
  const safeStartNodeIndex =
    startNodeIndex >= 0 && startNodeIndex < graph.nodes.length ? startNodeIndex : 0;
  const steps: DijkstraStep[] = [];
  const distances = graph.nodes.map(() => null as number | null);
  const previousNodeIndices = graph.nodes.map(() => null as number | null);
  const settledNodeIndices: number[] = [];
  const outputOrder: number[] = [];
  const settledSet = new Set<number>();
  const inspectedEdgeKeys = new Set<string>();

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
      distances,
      previousNodeIndices,
      settledNodeIndices,
      [],
      outputOrder,
      [],
      null,
      null,
      'ongoing',
    ),
  );

  distances[safeStartNodeIndex] = 0;

  steps.push(
    createStep(
      graph,
      adjacencyList,
      'seedStart',
      [2],
      safeStartNodeIndex,
      safeStartNodeIndex,
      null,
      null,
      distances,
      previousNodeIndices,
      settledNodeIndices,
      [safeStartNodeIndex],
      outputOrder,
      [],
      0,
      null,
      'ongoing',
    ),
  );

  while (true) {
    const frontierNodeIndices = sortFrontier(distances, settledSet);
    const candidateIndex = frontierNodeIndices[0];

    if (candidateIndex === undefined) {
      break;
    }

    steps.push(
      createStep(
        graph,
        adjacencyList,
        'selectCandidate',
        [3],
        safeStartNodeIndex,
        candidateIndex,
        null,
        null,
        distances,
        previousNodeIndices,
        settledNodeIndices,
        frontierNodeIndices,
        outputOrder,
        [...inspectedEdgeKeys],
        distances[candidateIndex],
        distances[candidateIndex],
        'ongoing',
      ),
    );

    const outgoingEdges = adjacencyList[candidateIndex] ?? [];
    for (const edge of outgoingEdges) {
      const activeEdge = { ...edge };
      const currentDistance = distances[edge.to];
      const baseDistance = distances[candidateIndex];
      const proposedDistance = baseDistance === null ? null : baseDistance + edge.weight;
      inspectedEdgeKeys.add(getWeightedGraphEdgeKey(graph, edge.from, edge.to));

      steps.push(
        createStep(
          graph,
          adjacencyList,
          'inspectEdge',
          [4],
          safeStartNodeIndex,
          candidateIndex,
          edge.to,
          activeEdge,
          distances,
          previousNodeIndices,
          settledNodeIndices,
          frontierNodeIndices,
          outputOrder,
          [...inspectedEdgeKeys],
          proposedDistance,
          currentDistance,
          'ongoing',
        ),
      );

      if (proposedDistance !== null && (currentDistance === null || proposedDistance < currentDistance)) {
        distances[edge.to] = proposedDistance;
        previousNodeIndices[edge.to] = candidateIndex;

        steps.push(
          createStep(
            graph,
            adjacencyList,
            'updateDistance',
            [5],
            safeStartNodeIndex,
            candidateIndex,
            edge.to,
            activeEdge,
            distances,
            previousNodeIndices,
            settledNodeIndices,
            sortFrontier(distances, settledSet),
            outputOrder,
            [...inspectedEdgeKeys],
            proposedDistance,
            currentDistance,
            'ongoing',
          ),
        );
      } else {
        steps.push(
          createStep(
            graph,
            adjacencyList,
            'keepDistance',
            [6],
            safeStartNodeIndex,
            candidateIndex,
            edge.to,
            activeEdge,
            distances,
            previousNodeIndices,
            settledNodeIndices,
            frontierNodeIndices,
            outputOrder,
            [...inspectedEdgeKeys],
            proposedDistance,
            currentDistance,
            'ongoing',
          ),
        );
      }
    }

    settledSet.add(candidateIndex);
    settledNodeIndices.push(candidateIndex);
    outputOrder.push(candidateIndex);

    steps.push(
      createStep(
        graph,
        adjacencyList,
        'finalizeNode',
        [7],
        safeStartNodeIndex,
        candidateIndex,
        null,
        null,
        distances,
        previousNodeIndices,
        settledNodeIndices,
        sortFrontier(distances, settledSet),
        outputOrder,
        [...inspectedEdgeKeys],
        distances[candidateIndex],
        distances[candidateIndex],
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
      distances,
      previousNodeIndices,
      settledNodeIndices,
      [],
      outputOrder,
      [...inspectedEdgeKeys],
      null,
      null,
      'completed',
    ),
  );

  return steps;
}
