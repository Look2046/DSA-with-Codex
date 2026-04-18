import type { AnimationStep, HighlightEntry } from '../../types/animation';
import {
  getWeightedGraphEdgeKey,
  getWeightedGraphPreset,
  type WeightedGraphDefinition,
  type WeightedGraphEdge,
  type WeightedGraphPresetId,
} from './weightedGraph';

export type KruskalAction =
  | 'initial'
  | 'sortEdges'
  | 'inspectEdge'
  | 'chooseEdge'
  | 'rejectEdge'
  | 'completed';

export type KruskalOutcome = 'ongoing' | 'completed';

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function sortEdges(graph: WeightedGraphDefinition): WeightedGraphEdge[] {
  return [...graph.edges].sort((left, right) => {
    return (
      left.weight - right.weight ||
      Math.min(left.from, left.to) - Math.min(right.from, right.to) ||
      Math.max(left.from, left.to) - Math.max(right.from, right.to)
    );
  });
}

function findRoot(parents: number[], index: number): number {
  if (parents[index] !== index) {
    parents[index] = findRoot(parents, parents[index]);
  }
  return parents[index];
}

function unionRoots(parents: number[], ranks: number[], left: number, right: number): void {
  const leftRoot = findRoot(parents, left);
  const rightRoot = findRoot(parents, right);

  if (leftRoot === rightRoot) {
    return;
  }

  if (ranks[leftRoot] < ranks[rightRoot]) {
    parents[leftRoot] = rightRoot;
    return;
  }

  if (ranks[leftRoot] > ranks[rightRoot]) {
    parents[rightRoot] = leftRoot;
    return;
  }

  parents[rightRoot] = leftRoot;
  ranks[leftRoot] += 1;
}

function getComponentGroups(parents: number[]): number[][] {
  const groups = new Map<number, number[]>();

  parents.forEach((_, index) => {
    const root = findRoot(parents, index);
    const current = groups.get(root) ?? [];
    current.push(index);
    groups.set(root, current);
  });

  return [...groups.values()].sort((left, right) => left[0] - right[0]);
}

function getComponentLabels(parents: number[]): number[] {
  const groups = getComponentGroups([...parents]);
  const labelMap = new Map<number, number>();

  groups.forEach((group, labelIndex) => {
    group.forEach((nodeIndex) => {
      labelMap.set(nodeIndex, labelIndex);
    });
  });

  return parents.map((_, index) => labelMap.get(index) ?? 0);
}

function getSelectedNodeIndices(selectedEdges: WeightedGraphEdge[]): number[] {
  return [...new Set(selectedEdges.flatMap((edge) => [edge.from, edge.to]))].sort((left, right) => left - right);
}

function createNodeHighlights(
  selectedNodeIndices: number[],
  activeEdge: WeightedGraphEdge | null,
): HighlightEntry[] {
  const highlights: HighlightEntry[] = selectedNodeIndices.map((index) => ({
    index,
    type: 'matched',
  }));

  if (activeEdge) {
    highlights.push({ index: activeEdge.from, type: 'visiting' });
    highlights.push({ index: activeEdge.to, type: 'comparing' });
  }

  return highlights;
}

export type KruskalStep = AnimationStep & {
  graph: WeightedGraphDefinition;
  sortedEdges: WeightedGraphEdge[];
  action: KruskalAction;
  activeEdgeIndex: number | null;
  activeEdge: WeightedGraphEdge | null;
  selectedEdgeKeys: string[];
  rejectedEdgeKeys: string[];
  selectedNodeIndices: number[];
  componentLabels: number[];
  componentGroups: number[][];
  totalWeight: number;
  chosenEdgeCount: number;
  edgesNeeded: number;
  outcome: KruskalOutcome;
};

function createStep(
  graph: WeightedGraphDefinition,
  sortedEdges: WeightedGraphEdge[],
  action: KruskalAction,
  codeLines: number[],
  activeEdgeIndex: number | null,
  activeEdge: WeightedGraphEdge | null,
  selectedEdges: WeightedGraphEdge[],
  rejectedEdges: WeightedGraphEdge[],
  parents: number[],
  totalWeight: number,
  outcome: KruskalOutcome,
): KruskalStep {
  const selectedNodeIndices = getSelectedNodeIndices(selectedEdges);

  return {
    description: action,
    codeLines: [...codeLines],
    highlights: cloneHighlights(createNodeHighlights(selectedNodeIndices, activeEdge)),
    graph,
    sortedEdges: sortedEdges.map((edge) => ({ ...edge })),
    action,
    activeEdgeIndex,
    activeEdge: activeEdge ? { ...activeEdge } : null,
    selectedEdgeKeys: selectedEdges.map((edge) => getWeightedGraphEdgeKey(graph, edge.from, edge.to)),
    rejectedEdgeKeys: rejectedEdges.map((edge) => getWeightedGraphEdgeKey(graph, edge.from, edge.to)),
    selectedNodeIndices,
    componentLabels: getComponentLabels([...parents]),
    componentGroups: getComponentGroups([...parents]),
    totalWeight,
    chosenEdgeCount: selectedEdges.length,
    edgesNeeded: Math.max(graph.nodes.length - 1, 0),
    outcome,
  };
}

export function generateKruskalSteps(presetId: WeightedGraphPresetId): KruskalStep[] {
  const graph = getWeightedGraphPreset(presetId);
  const sortedGraphEdges = sortEdges(graph);
  const parents = graph.nodes.map((_, index) => index);
  const ranks = graph.nodes.map(() => 0);
  const selectedEdges: WeightedGraphEdge[] = [];
  const rejectedEdges: WeightedGraphEdge[] = [];
  const steps: KruskalStep[] = [];
  let totalWeight = 0;

  steps.push(
    createStep(
      graph,
      sortedGraphEdges,
      'initial',
      [1],
      null,
      null,
      selectedEdges,
      rejectedEdges,
      parents,
      totalWeight,
      'ongoing',
    ),
  );

  steps.push(
    createStep(
      graph,
      sortedGraphEdges,
      'sortEdges',
      [1],
      null,
      null,
      selectedEdges,
      rejectedEdges,
      parents,
      totalWeight,
      'ongoing',
    ),
  );

  for (const [edgeIndex, edge] of sortedGraphEdges.entries()) {
    steps.push(
      createStep(
        graph,
        sortedGraphEdges,
        'inspectEdge',
        [2],
        edgeIndex,
        edge,
        selectedEdges,
        rejectedEdges,
        parents,
        totalWeight,
        'ongoing',
      ),
    );

    const leftRoot = findRoot(parents, edge.from);
    const rightRoot = findRoot(parents, edge.to);

    if (leftRoot !== rightRoot) {
      unionRoots(parents, ranks, edge.from, edge.to);
      selectedEdges.push(edge);
      totalWeight += edge.weight;

      steps.push(
        createStep(
          graph,
          sortedGraphEdges,
          'chooseEdge',
          [3],
          edgeIndex,
          edge,
          selectedEdges,
          rejectedEdges,
          parents,
          totalWeight,
          'ongoing',
        ),
      );

      if (selectedEdges.length >= graph.nodes.length - 1) {
        break;
      }
    } else {
      rejectedEdges.push(edge);

      steps.push(
        createStep(
          graph,
          sortedGraphEdges,
          'rejectEdge',
          [4],
          edgeIndex,
          edge,
          selectedEdges,
          rejectedEdges,
          parents,
          totalWeight,
          'ongoing',
        ),
      );
    }
  }

  steps.push(
    createStep(
      graph,
      sortedGraphEdges,
      'completed',
      [5],
      null,
      null,
      selectedEdges,
      rejectedEdges,
      parents,
      totalWeight,
      'completed',
    ),
  );

  return steps;
}
