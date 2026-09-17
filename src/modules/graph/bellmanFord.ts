import type { AnimationStep, HighlightEntry } from '../../types/animation';
import {
  createWeightedAdjacencyList,
  getWeightedGraphEdgeKey,
  getWeightedGraphPreset,
  type WeightedGraphDefinition,
  type WeightedGraphEdge,
  type WeightedGraphPresetId,
} from './weightedGraph';

export type BellmanFordAction =
  | 'initial'
  | 'seedStart'
  | 'beginPass'
  | 'inspectEdge'
  | 'updateDistance'
  | 'keepDistance'
  | 'completePass'
  | 'earlyStop'
  | 'completed';

export type BellmanFordOutcome = 'ongoing' | 'completed';

export type BellmanFordStep = AnimationStep & {
  graph: WeightedGraphDefinition;
  adjacencyList: WeightedGraphEdge[][];
  action: BellmanFordAction;
  startNodeIndex: number;
  activePassIndex: number | null;
  totalPasses: number;
  activeNodeIndex: number | null;
  activeNeighborIndex: number | null;
  activeEdge: WeightedGraphEdge | null;
  distances: Array<number | null>;
  previousNodeIndices: Array<number | null>;
  reachableNodeIndices: number[];
  changedNodeIndices: number[];
  inspectedEdgeKeys: string[];
  proposedDistance: number | null;
  currentDistance: number | null;
  updatedInPassCount: number;
  completedPassCount: number;
  outcome: BellmanFordOutcome;
};

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function createNodeHighlights(
  reachableNodeIndices: number[],
  changedNodeIndices: number[],
  activeNodeIndex: number | null,
  activeNeighborIndex: number | null,
): HighlightEntry[] {
  const changedSet = new Set(changedNodeIndices);
  const highlights: HighlightEntry[] = [];

  reachableNodeIndices.forEach((index) => {
    highlights.push({ index, type: changedSet.has(index) ? 'matched' : 'new-node' });
  });

  if (activeNodeIndex !== null) {
    highlights.push({ index: activeNodeIndex, type: 'visiting' });
  }

  if (activeNeighborIndex !== null) {
    highlights.push({ index: activeNeighborIndex, type: 'comparing' });
  }

  return highlights;
}

function getReachableNodeIndices(distances: Array<number | null>): number[] {
  return distances
    .map((distance, index) => ({ distance, index }))
    .filter((item) => item.distance !== null)
    .map((item) => item.index);
}

function createStep(
  graph: WeightedGraphDefinition,
  adjacencyList: WeightedGraphEdge[][],
  action: BellmanFordAction,
  codeLines: number[],
  startNodeIndex: number,
  activePassIndex: number | null,
  totalPasses: number,
  activeNodeIndex: number | null,
  activeNeighborIndex: number | null,
  activeEdge: WeightedGraphEdge | null,
  distances: Array<number | null>,
  previousNodeIndices: Array<number | null>,
  changedNodeIndices: number[],
  inspectedEdgeKeys: string[],
  proposedDistance: number | null,
  currentDistance: number | null,
  updatedInPassCount: number,
  completedPassCount: number,
  outcome: BellmanFordOutcome,
): BellmanFordStep {
  const reachableNodeIndices = getReachableNodeIndices(distances);

  return {
    description: action,
    codeLines: [...codeLines],
    highlights: cloneHighlights(
      createNodeHighlights(reachableNodeIndices, changedNodeIndices, activeNodeIndex, activeNeighborIndex),
    ),
    graph,
    adjacencyList: adjacencyList.map((row) => row.map((edge) => ({ ...edge }))),
    action,
    startNodeIndex,
    activePassIndex,
    totalPasses,
    activeNodeIndex,
    activeNeighborIndex,
    activeEdge: activeEdge ? { ...activeEdge } : null,
    distances: [...distances],
    previousNodeIndices: [...previousNodeIndices],
    reachableNodeIndices,
    changedNodeIndices: [...changedNodeIndices],
    inspectedEdgeKeys: [...inspectedEdgeKeys],
    proposedDistance,
    currentDistance,
    updatedInPassCount,
    completedPassCount,
    outcome,
  };
}

export function generateBellmanFordSteps(presetId: WeightedGraphPresetId, startNodeIndex = 0): BellmanFordStep[] {
  const graph = getWeightedGraphPreset(presetId);
  const adjacencyList = createWeightedAdjacencyList(graph);
  const safeStartNodeIndex =
    startNodeIndex >= 0 && startNodeIndex < graph.nodes.length ? startNodeIndex : 0;
  const totalPasses = Math.max(graph.nodes.length - 1, 0);
  const steps: BellmanFordStep[] = [];
  const distances = graph.nodes.map(() => null as number | null);
  const previousNodeIndices = graph.nodes.map(() => null as number | null);
  const inspectedEdgeKeys = new Set<string>();
  let completedPassCount = 0;

  steps.push(
    createStep(
      graph,
      adjacencyList,
      'initial',
      [1],
      safeStartNodeIndex,
      null,
      totalPasses,
      null,
      null,
      null,
      distances,
      previousNodeIndices,
      [],
      [],
      null,
      null,
      0,
      completedPassCount,
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
      null,
      totalPasses,
      safeStartNodeIndex,
      null,
      null,
      distances,
      previousNodeIndices,
      [safeStartNodeIndex],
      [],
      0,
      null,
      1,
      completedPassCount,
      'ongoing',
    ),
  );

  for (let passIndex = 1; passIndex <= totalPasses; passIndex += 1) {
    const changedNodeSet = new Set<number>();
    let updatedInPassCount = 0;

    steps.push(
      createStep(
        graph,
        adjacencyList,
        'beginPass',
        [3],
        safeStartNodeIndex,
        passIndex,
        totalPasses,
        null,
        null,
        null,
        distances,
        previousNodeIndices,
        [],
        [...inspectedEdgeKeys],
        null,
        null,
        updatedInPassCount,
        completedPassCount,
        'ongoing',
      ),
    );

    for (const edge of graph.edges) {
      const currentDistance = distances[edge.to];
      const baseDistance = distances[edge.from];
      const proposedDistance = baseDistance === null ? null : baseDistance + edge.weight;
      inspectedEdgeKeys.add(getWeightedGraphEdgeKey(graph, edge.from, edge.to));

      steps.push(
        createStep(
          graph,
          adjacencyList,
          'inspectEdge',
          [4],
          safeStartNodeIndex,
          passIndex,
          totalPasses,
          edge.from,
          edge.to,
          edge,
          distances,
          previousNodeIndices,
          [...changedNodeSet],
          [...inspectedEdgeKeys],
          proposedDistance,
          currentDistance,
          updatedInPassCount,
          completedPassCount,
          'ongoing',
        ),
      );

      if (proposedDistance !== null && (currentDistance === null || proposedDistance < currentDistance)) {
        distances[edge.to] = proposedDistance;
        previousNodeIndices[edge.to] = edge.from;
        changedNodeSet.add(edge.to);
        updatedInPassCount += 1;

        steps.push(
          createStep(
            graph,
            adjacencyList,
            'updateDistance',
            [5],
            safeStartNodeIndex,
            passIndex,
            totalPasses,
            edge.from,
            edge.to,
            edge,
            distances,
            previousNodeIndices,
            [...changedNodeSet],
            [...inspectedEdgeKeys],
            proposedDistance,
            currentDistance,
            updatedInPassCount,
            completedPassCount,
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
            passIndex,
            totalPasses,
            edge.from,
            edge.to,
            edge,
            distances,
            previousNodeIndices,
            [...changedNodeSet],
            [...inspectedEdgeKeys],
            proposedDistance,
            currentDistance,
            updatedInPassCount,
            completedPassCount,
            'ongoing',
          ),
        );
      }
    }

    completedPassCount += 1;

    steps.push(
      createStep(
        graph,
        adjacencyList,
        'completePass',
        [7],
        safeStartNodeIndex,
        passIndex,
        totalPasses,
        null,
        null,
        null,
        distances,
        previousNodeIndices,
        [...changedNodeSet],
        [...inspectedEdgeKeys],
        null,
        null,
        updatedInPassCount,
        completedPassCount,
        'ongoing',
      ),
    );

    if (updatedInPassCount === 0) {
      steps.push(
        createStep(
          graph,
          adjacencyList,
          'earlyStop',
          [8],
          safeStartNodeIndex,
          passIndex,
          totalPasses,
          null,
          null,
          null,
          distances,
          previousNodeIndices,
          [],
          [...inspectedEdgeKeys],
          null,
          null,
          updatedInPassCount,
          completedPassCount,
          'ongoing',
        ),
      );
      break;
    }
  }

  steps.push(
    createStep(
      graph,
      adjacencyList,
      'completed',
      [8],
      safeStartNodeIndex,
      null,
      totalPasses,
      null,
      null,
      null,
      distances,
      previousNodeIndices,
      [],
      [...inspectedEdgeKeys],
      null,
      null,
      0,
      completedPassCount,
      'completed',
    ),
  );

  return steps;
}
