import type { AnimationStep, HighlightEntry } from '../../types/animation';
import {
  createAdjacencyList,
  getGraphEdgeKey,
  getGraphPreset,
  type GraphDefinition,
  type GraphEdge,
  type GraphPresetId,
} from './graphRepresentation';

export type DfsAction =
  | 'initial'
  | 'pushStart'
  | 'visit'
  | 'inspectNeighbor'
  | 'descend'
  | 'skipVisited'
  | 'backtrack'
  | 'completed';

export type DfsOutcome = 'ongoing' | 'completed';

export type DfsStep = AnimationStep & {
  graph: GraphDefinition;
  adjacencyList: number[][];
  action: DfsAction;
  startNodeIndex: number;
  activeNodeIndex: number | null;
  activeNeighborIndex: number | null;
  activeEdge: GraphEdge | null;
  stackNodeIndices: number[];
  outputOrder: number[];
  completedNodeIndices: number[];
  inspectedEdgeKeys: string[];
  outcome: DfsOutcome;
};

type DfsFrame = {
  nodeIndex: number;
  nextNeighborCursor: number;
};

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function createNodeHighlights(
  outputOrder: number[],
  completedNodeIndices: number[],
  activeNodeIndex: number | null,
  activeNeighborIndex: number | null,
): HighlightEntry[] {
  const completedSet = new Set(completedNodeIndices);
  const highlights: HighlightEntry[] = [];

  outputOrder.forEach((index) => {
    highlights.push({ index, type: completedSet.has(index) ? 'matched' : 'new-node' });
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
  action: DfsAction,
  codeLines: number[],
  startNodeIndex: number,
  activeNodeIndex: number | null,
  activeNeighborIndex: number | null,
  activeEdge: GraphEdge | null,
  stackNodeIndices: number[],
  outputOrder: number[],
  completedNodeIndices: number[],
  inspectedEdgeKeys: string[],
  outcome: DfsOutcome,
): DfsStep {
  return {
    description: action,
    codeLines: [...codeLines],
    highlights: cloneHighlights(
      createNodeHighlights(outputOrder, completedNodeIndices, activeNodeIndex, activeNeighborIndex),
    ),
    graph,
    adjacencyList: adjacencyList.map((row) => [...row]),
    action,
    startNodeIndex,
    activeNodeIndex,
    activeNeighborIndex,
    activeEdge: activeEdge ? { ...activeEdge } : null,
    stackNodeIndices: [...stackNodeIndices],
    outputOrder: [...outputOrder],
    completedNodeIndices: [...completedNodeIndices],
    inspectedEdgeKeys: [...inspectedEdgeKeys],
    outcome,
  };
}

export function generateDfsSteps(presetId: GraphPresetId, startNodeIndex = 0): DfsStep[] {
  const graph = getGraphPreset(presetId);
  const adjacencyList = createAdjacencyList(graph);
  const safeStartNodeIndex =
    startNodeIndex >= 0 && startNodeIndex < graph.nodes.length ? startNodeIndex : 0;
  const steps: DfsStep[] = [];
  const stack: DfsFrame[] = [];
  const outputOrder: number[] = [];
  const completedNodeIndices: number[] = [];
  const visitedSet = new Set<number>();
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
      [],
      outputOrder,
      completedNodeIndices,
      [],
      'ongoing',
    ),
  );

  stack.push({ nodeIndex: safeStartNodeIndex, nextNeighborCursor: 0 });
  steps.push(
    createStep(
      graph,
      adjacencyList,
      'pushStart',
      [1, 2],
      safeStartNodeIndex,
      safeStartNodeIndex,
      null,
      null,
      stack.map((frame) => frame.nodeIndex),
      outputOrder,
      completedNodeIndices,
      [...inspectedEdgeKeys],
      'ongoing',
    ),
  );

  while (stack.length > 0) {
    const frame = stack[stack.length - 1];
    if (!frame) {
      break;
    }

    if (!visitedSet.has(frame.nodeIndex)) {
      visitedSet.add(frame.nodeIndex);
      outputOrder.push(frame.nodeIndex);

      steps.push(
        createStep(
          graph,
          adjacencyList,
          'visit',
          [3],
          safeStartNodeIndex,
          frame.nodeIndex,
          null,
          null,
          stack.map((item) => item.nodeIndex),
          outputOrder,
          completedNodeIndices,
          [...inspectedEdgeKeys],
          'ongoing',
        ),
      );
    }

    const neighbors = adjacencyList[frame.nodeIndex] ?? [];
    if (frame.nextNeighborCursor < neighbors.length) {
      const neighborIndex = neighbors[frame.nextNeighborCursor];
      frame.nextNeighborCursor += 1;
      const activeEdge = { from: frame.nodeIndex, to: neighborIndex };
      inspectedEdgeKeys.add(getGraphEdgeKey(graph, frame.nodeIndex, neighborIndex));

      steps.push(
        createStep(
          graph,
          adjacencyList,
          'inspectNeighbor',
          [4],
          safeStartNodeIndex,
          frame.nodeIndex,
          neighborIndex,
          activeEdge,
          stack.map((item) => item.nodeIndex),
          outputOrder,
          completedNodeIndices,
          [...inspectedEdgeKeys],
          'ongoing',
        ),
      );

      if (!visitedSet.has(neighborIndex)) {
        stack.push({ nodeIndex: neighborIndex, nextNeighborCursor: 0 });

        steps.push(
          createStep(
            graph,
            adjacencyList,
            'descend',
            [5],
            safeStartNodeIndex,
            neighborIndex,
            frame.nodeIndex,
            activeEdge,
            stack.map((item) => item.nodeIndex),
            outputOrder,
            completedNodeIndices,
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
            frame.nodeIndex,
            neighborIndex,
            activeEdge,
            stack.map((item) => item.nodeIndex),
            outputOrder,
            completedNodeIndices,
            [...inspectedEdgeKeys],
            'ongoing',
          ),
        );
      }

      continue;
    }

    const parentNodeIndex = stack.length > 1 ? stack[stack.length - 2]?.nodeIndex ?? null : null;
    completedNodeIndices.push(frame.nodeIndex);
    stack.pop();

    steps.push(
      createStep(
        graph,
        adjacencyList,
        'backtrack',
        [7],
        safeStartNodeIndex,
        frame.nodeIndex,
        parentNodeIndex,
        parentNodeIndex === null ? null : { from: parentNodeIndex, to: frame.nodeIndex },
        stack.map((item) => item.nodeIndex),
        outputOrder,
        completedNodeIndices,
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
      [...inspectedEdgeKeys],
      'completed',
    ),
  );

  return steps;
}
