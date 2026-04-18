import type { AnimationStep, HighlightEntry } from '../../types/animation';
import {
  createWeightedAdjacencyList,
  getWeightedGraphEdgeKey,
  getWeightedGraphPreset,
  type WeightedGraphDefinition,
  type WeightedGraphEdge,
  type WeightedGraphPresetId,
} from './weightedGraph';

export type PrimAction =
  | 'initial'
  | 'seedStart'
  | 'inspectEdge'
  | 'chooseEdge'
  | 'skipEdge'
  | 'completed';

export type PrimOutcome = 'ongoing' | 'completed';

export type PrimFrontierEntry = {
  key: string;
  from: number;
  to: number;
  weight: number;
};

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function cloneFrontierQueue(entries: PrimFrontierEntry[]): PrimFrontierEntry[] {
  return entries.map((entry) => ({ ...entry }));
}

function getTreeNodeIndices(visited: boolean[]): number[] {
  return visited.flatMap((value, index) => (value ? [index] : []));
}

function getFrontierNodeIndices(queue: PrimFrontierEntry[], visited: boolean[]): number[] {
  return [...new Set(queue.filter((entry) => !visited[entry.to]).map((entry) => entry.to))].sort(
    (left, right) => left - right,
  );
}

function createNodeHighlights(
  treeNodeIndices: number[],
  frontierNodeIndices: number[],
  activeSourceIndex: number | null,
  activeTargetIndex: number | null,
): HighlightEntry[] {
  const frontierSet = new Set(frontierNodeIndices);
  const highlights: HighlightEntry[] = treeNodeIndices.map((index) => ({
    index,
    type: frontierSet.has(index) ? 'visiting' : 'matched',
  }));

  if (activeSourceIndex !== null) {
    highlights.push({ index: activeSourceIndex, type: 'visiting' });
  }
  if (activeTargetIndex !== null) {
    highlights.push({ index: activeTargetIndex, type: 'comparing' });
  }

  return highlights;
}

function sortFrontierQueue(queue: PrimFrontierEntry[]): PrimFrontierEntry[] {
  return [...queue].sort((left, right) => {
    const leftMin = Math.min(left.from, left.to);
    const rightMin = Math.min(right.from, right.to);
    const leftMax = Math.max(left.from, left.to);
    const rightMax = Math.max(right.from, right.to);

    return (
      left.weight - right.weight ||
      leftMin - rightMin ||
      leftMax - rightMax ||
      left.from - right.from ||
      left.to - right.to
    );
  });
}

function buildFrontierEntry(
  graph: WeightedGraphDefinition,
  edge: WeightedGraphEdge,
): PrimFrontierEntry {
  return {
    key: getWeightedGraphEdgeKey(graph, edge.from, edge.to),
    from: edge.from,
    to: edge.to,
    weight: edge.weight,
  };
}

function enqueueCandidateEdges(
  graph: WeightedGraphDefinition,
  adjacencyList: WeightedGraphEdge[][],
  nodeIndex: number,
  visited: boolean[],
  seenEdgeKeys: Set<string>,
  frontierQueue: PrimFrontierEntry[],
): void {
  adjacencyList[nodeIndex]?.forEach((edge) => {
    if (visited[edge.to]) {
      return;
    }

    const key = getWeightedGraphEdgeKey(graph, edge.from, edge.to);
    if (seenEdgeKeys.has(key)) {
      return;
    }

    seenEdgeKeys.add(key);
    frontierQueue.push(buildFrontierEntry(graph, edge));
  });
}

export type PrimStep = AnimationStep & {
  graph: WeightedGraphDefinition;
  action: PrimAction;
  startNodeIndex: number;
  activeEdge: WeightedGraphEdge | null;
  activeSourceIndex: number | null;
  activeTargetIndex: number | null;
  frontierQueue: PrimFrontierEntry[];
  frontierNodeIndices: number[];
  selectedEdgeKeys: string[];
  rejectedEdgeKeys: string[];
  treeNodeIndices: number[];
  treeNodeOrder: number[];
  totalWeight: number;
  chosenEdgeCount: number;
  edgesNeeded: number;
  outcome: PrimOutcome;
};

function createStep(
  graph: WeightedGraphDefinition,
  action: PrimAction,
  codeLines: number[],
  startNodeIndex: number,
  activeEdge: WeightedGraphEdge | null,
  frontierQueue: PrimFrontierEntry[],
  selectedEdges: PrimFrontierEntry[],
  rejectedEdges: PrimFrontierEntry[],
  visited: boolean[],
  treeNodeOrder: number[],
  totalWeight: number,
  outcome: PrimOutcome,
): PrimStep {
  const treeNodeIndices = getTreeNodeIndices(visited);
  const frontierNodeIndices = getFrontierNodeIndices(frontierQueue, visited);
  const activeSourceIndex = activeEdge?.from ?? null;
  const activeTargetIndex = activeEdge?.to ?? null;

  return {
    description: action,
    codeLines: [...codeLines],
    highlights: cloneHighlights(
      createNodeHighlights(treeNodeIndices, frontierNodeIndices, activeSourceIndex, activeTargetIndex),
    ),
    graph,
    action,
    startNodeIndex,
    activeEdge: activeEdge ? { ...activeEdge } : null,
    activeSourceIndex,
    activeTargetIndex,
    frontierQueue: cloneFrontierQueue(frontierQueue),
    frontierNodeIndices,
    selectedEdgeKeys: selectedEdges.map((entry) => entry.key),
    rejectedEdgeKeys: rejectedEdges.map((entry) => entry.key),
    treeNodeIndices,
    treeNodeOrder: [...treeNodeOrder],
    totalWeight,
    chosenEdgeCount: selectedEdges.length,
    edgesNeeded: Math.max(graph.nodes.length - 1, 0),
    outcome,
  };
}

export function generatePrimSteps(presetId: WeightedGraphPresetId): PrimStep[] {
  const graph = getWeightedGraphPreset(presetId);
  const adjacencyList = createWeightedAdjacencyList(graph);
  const steps: PrimStep[] = [];
  const selectedEdges: PrimFrontierEntry[] = [];
  const rejectedEdges: PrimFrontierEntry[] = [];
  const frontierQueue: PrimFrontierEntry[] = [];
  const seenEdgeKeys = new Set<string>();
  const visited = graph.nodes.map(() => false);
  const startNodeIndex = 0;
  const treeNodeOrder: number[] = [];
  let totalWeight = 0;

  steps.push(
    createStep(
      graph,
      'initial',
      [1],
      startNodeIndex,
      null,
      frontierQueue,
      selectedEdges,
      rejectedEdges,
      visited,
      treeNodeOrder,
      totalWeight,
      'ongoing',
    ),
  );

  visited[startNodeIndex] = true;
  treeNodeOrder.push(startNodeIndex);
  enqueueCandidateEdges(graph, adjacencyList, startNodeIndex, visited, seenEdgeKeys, frontierQueue);

  steps.push(
    createStep(
      graph,
      'seedStart',
      [1, 2],
      startNodeIndex,
      null,
      sortFrontierQueue(frontierQueue),
      selectedEdges,
      rejectedEdges,
      visited,
      treeNodeOrder,
      totalWeight,
      'ongoing',
    ),
  );

  while (selectedEdges.length < graph.nodes.length - 1 && frontierQueue.length > 0) {
    const sortedQueue = sortFrontierQueue(frontierQueue);
    frontierQueue.splice(0, frontierQueue.length, ...sortedQueue);
    const current = frontierQueue[0];

    if (!current) {
      break;
    }

    const activeEdge: WeightedGraphEdge = {
      from: current.from,
      to: current.to,
      weight: current.weight,
    };

    steps.push(
      createStep(
        graph,
        'inspectEdge',
        [3],
        startNodeIndex,
        activeEdge,
        frontierQueue,
        selectedEdges,
        rejectedEdges,
        visited,
        treeNodeOrder,
        totalWeight,
        'ongoing',
      ),
    );

    frontierQueue.shift();

    if (visited[current.to]) {
      rejectedEdges.push(current);

      steps.push(
        createStep(
          graph,
          'skipEdge',
          [4],
          startNodeIndex,
          activeEdge,
          frontierQueue,
          selectedEdges,
          rejectedEdges,
          visited,
          treeNodeOrder,
          totalWeight,
          'ongoing',
        ),
      );
      continue;
    }

    visited[current.to] = true;
    treeNodeOrder.push(current.to);
    selectedEdges.push(current);
    totalWeight += current.weight;
    enqueueCandidateEdges(graph, adjacencyList, current.to, visited, seenEdgeKeys, frontierQueue);

    steps.push(
      createStep(
        graph,
        'chooseEdge',
        [5],
        startNodeIndex,
        activeEdge,
        sortFrontierQueue(frontierQueue),
        selectedEdges,
        rejectedEdges,
        visited,
        treeNodeOrder,
        totalWeight,
        'ongoing',
      ),
    );
  }

  steps.push(
    createStep(
      graph,
      'completed',
      [6],
      startNodeIndex,
      null,
      sortFrontierQueue(frontierQueue),
      selectedEdges,
      rejectedEdges,
      visited,
      treeNodeOrder,
      totalWeight,
      'completed',
    ),
  );

  return steps;
}
