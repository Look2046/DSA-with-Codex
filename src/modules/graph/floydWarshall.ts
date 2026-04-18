import type { AnimationStep, HighlightEntry } from '../../types/animation';
import {
  getWeightedGraphEdgeKey,
  getWeightedGraphPreset,
  type WeightedGraphDefinition,
  type WeightedGraphPresetId,
} from './weightedGraph';

export type FloydWarshallAction =
  | 'initial'
  | 'seedMatrix'
  | 'selectVia'
  | 'inspectPair'
  | 'updateDistance'
  | 'keepDistance'
  | 'completeVia'
  | 'completed';

export type FloydWarshallOutcome = 'ongoing' | 'completed';

type DistanceMatrix = Array<Array<number | null>>;

function getPairKey(sourceIndex: number, targetIndex: number): string {
  return `${sourceIndex}-${targetIndex}`;
}

function cloneMatrix(matrix: DistanceMatrix): DistanceMatrix {
  return matrix.map((row) => [...row]);
}

function cloneHighlights(highlights: HighlightEntry[]): HighlightEntry[] {
  return highlights.map((entry) => ({ ...entry }));
}

function countFiniteDistances(matrix: DistanceMatrix): number {
  return matrix.reduce<number>(
    (total, row) =>
      total +
      row.reduce<number>((rowTotal, value) => rowTotal + (value === null ? 0 : 1), 0),
    0,
  );
}

function createNodeHighlights(
  viaNodeIndex: number | null,
  activeSourceIndex: number | null,
  activeTargetIndex: number | null,
  completedViaNodeIndices: number[],
): HighlightEntry[] {
  const highlights: HighlightEntry[] = completedViaNodeIndices.map((index) => ({
    index,
    type: 'matched',
  }));

  if (viaNodeIndex !== null && !completedViaNodeIndices.includes(viaNodeIndex)) {
    highlights.push({ index: viaNodeIndex, type: 'new-node' });
  }

  if (activeSourceIndex !== null) {
    highlights.push({ index: activeSourceIndex, type: 'visiting' });
  }

  if (activeTargetIndex !== null) {
    highlights.push({ index: activeTargetIndex, type: 'comparing' });
  }

  return highlights;
}

function getDirectEdgeKey(
  graph: WeightedGraphDefinition,
  fromIndex: number,
  toIndex: number,
): string | null {
  if (fromIndex === toIndex) {
    return null;
  }

  return graph.edges.some((edge) => edge.from === fromIndex && edge.to === toIndex)
    ? getWeightedGraphEdgeKey(graph, fromIndex, toIndex)
    : null;
}

function getActivePathEdgeKeys(
  graph: WeightedGraphDefinition,
  sourceIndex: number | null,
  viaNodeIndex: number | null,
  targetIndex: number | null,
): string[] {
  if (sourceIndex === null || viaNodeIndex === null || targetIndex === null) {
    return [];
  }

  const keys = [
    getDirectEdgeKey(graph, sourceIndex, viaNodeIndex),
    getDirectEdgeKey(graph, viaNodeIndex, targetIndex),
  ].filter((value): value is string => value !== null);

  return [...new Set(keys)];
}

export type FloydWarshallStep = AnimationStep & {
  graph: WeightedGraphDefinition;
  action: FloydWarshallAction;
  distanceMatrix: DistanceMatrix;
  viaNodeIndex: number | null;
  activeSourceIndex: number | null;
  activeTargetIndex: number | null;
  activePathEdgeKeys: string[];
  changedPairKeys: string[];
  completedViaNodeIndices: number[];
  candidateLeftDistance: number | null;
  candidateRightDistance: number | null;
  candidateDistance: number | null;
  currentDistance: number | null;
  updatedInViaCount: number;
  completedViaCount: number;
  finiteDistanceCount: number;
  outcome: FloydWarshallOutcome;
};

function createStep(
  graph: WeightedGraphDefinition,
  action: FloydWarshallAction,
  codeLines: number[],
  distanceMatrix: DistanceMatrix,
  viaNodeIndex: number | null,
  activeSourceIndex: number | null,
  activeTargetIndex: number | null,
  changedPairKeys: string[],
  completedViaNodeIndices: number[],
  candidateLeftDistance: number | null,
  candidateRightDistance: number | null,
  candidateDistance: number | null,
  currentDistance: number | null,
  updatedInViaCount: number,
  completedViaCount: number,
  outcome: FloydWarshallOutcome,
): FloydWarshallStep {
  return {
    description: action,
    codeLines: [...codeLines],
    highlights: cloneHighlights(
      createNodeHighlights(viaNodeIndex, activeSourceIndex, activeTargetIndex, completedViaNodeIndices),
    ),
    graph,
    action,
    distanceMatrix: cloneMatrix(distanceMatrix),
    viaNodeIndex,
    activeSourceIndex,
    activeTargetIndex,
    activePathEdgeKeys: getActivePathEdgeKeys(graph, activeSourceIndex, viaNodeIndex, activeTargetIndex),
    changedPairKeys: [...changedPairKeys],
    completedViaNodeIndices: [...completedViaNodeIndices],
    candidateLeftDistance,
    candidateRightDistance,
    candidateDistance,
    currentDistance,
    updatedInViaCount,
    completedViaCount,
    finiteDistanceCount: countFiniteDistances(distanceMatrix),
    outcome,
  };
}

function createInitialMatrix(graph: WeightedGraphDefinition): DistanceMatrix {
  const matrix = graph.nodes.map((_, rowIndex) =>
    graph.nodes.map((__, colIndex) => (rowIndex === colIndex ? 0 : null as number | null)),
  );

  graph.edges.forEach((edge) => {
    const current = matrix[edge.from]?.[edge.to] ?? null;
    if (current === null || edge.weight < current) {
      matrix[edge.from][edge.to] = edge.weight;
    }
  });

  return matrix;
}

export function generateFloydWarshallSteps(presetId: WeightedGraphPresetId): FloydWarshallStep[] {
  const graph = getWeightedGraphPreset(presetId);
  const steps: FloydWarshallStep[] = [];
  const distanceMatrix = graph.nodes.map(() => graph.nodes.map(() => null as number | null));
  const completedViaNodeIndices: number[] = [];

  steps.push(
    createStep(
      graph,
      'initial',
      [1],
      distanceMatrix,
      null,
      null,
      null,
      [],
      completedViaNodeIndices,
      null,
      null,
      null,
      null,
      0,
      0,
      'ongoing',
    ),
  );

  const seededMatrix = createInitialMatrix(graph);
  seededMatrix.forEach((row, rowIndex) => {
    row.forEach((value, colIndex) => {
      distanceMatrix[rowIndex][colIndex] = value;
    });
  });

  steps.push(
    createStep(
      graph,
      'seedMatrix',
      [1],
      distanceMatrix,
      null,
      null,
      null,
      [],
      completedViaNodeIndices,
      null,
      null,
      null,
      null,
      0,
      0,
      'ongoing',
    ),
  );

  for (let viaNodeIndex = 0; viaNodeIndex < graph.nodes.length; viaNodeIndex += 1) {
    const changedPairKeys: string[] = [];
    let updatedInViaCount = 0;

    steps.push(
      createStep(
        graph,
        'selectVia',
        [2],
        distanceMatrix,
        viaNodeIndex,
        null,
        null,
        changedPairKeys,
        completedViaNodeIndices,
        null,
        null,
        null,
        null,
        updatedInViaCount,
        completedViaNodeIndices.length,
        'ongoing',
      ),
    );

    for (let sourceIndex = 0; sourceIndex < graph.nodes.length; sourceIndex += 1) {
      for (let targetIndex = 0; targetIndex < graph.nodes.length; targetIndex += 1) {
        const candidateLeftDistance = distanceMatrix[sourceIndex][viaNodeIndex];
        const candidateRightDistance = distanceMatrix[viaNodeIndex][targetIndex];
        const candidateDistance =
          candidateLeftDistance === null || candidateRightDistance === null
            ? null
            : candidateLeftDistance + candidateRightDistance;
        const currentDistance = distanceMatrix[sourceIndex][targetIndex];

        steps.push(
          createStep(
            graph,
            'inspectPair',
            [3],
            distanceMatrix,
            viaNodeIndex,
            sourceIndex,
            targetIndex,
            changedPairKeys,
            completedViaNodeIndices,
            candidateLeftDistance,
            candidateRightDistance,
            candidateDistance,
            currentDistance,
            updatedInViaCount,
            completedViaNodeIndices.length,
            'ongoing',
          ),
        );

        if (candidateDistance !== null && (currentDistance === null || candidateDistance < currentDistance)) {
          distanceMatrix[sourceIndex][targetIndex] = candidateDistance;
          changedPairKeys.push(getPairKey(sourceIndex, targetIndex));
          updatedInViaCount += 1;

          steps.push(
            createStep(
              graph,
              'updateDistance',
              [5],
              distanceMatrix,
              viaNodeIndex,
              sourceIndex,
              targetIndex,
              changedPairKeys,
              completedViaNodeIndices,
              candidateLeftDistance,
              candidateRightDistance,
              candidateDistance,
              currentDistance,
              updatedInViaCount,
              completedViaNodeIndices.length,
              'ongoing',
            ),
          );
        } else {
          steps.push(
            createStep(
              graph,
              'keepDistance',
              candidateDistance === null ? [4, 6] : [6],
              distanceMatrix,
              viaNodeIndex,
              sourceIndex,
              targetIndex,
              changedPairKeys,
              completedViaNodeIndices,
              candidateLeftDistance,
              candidateRightDistance,
              candidateDistance,
              currentDistance,
              updatedInViaCount,
              completedViaNodeIndices.length,
              'ongoing',
            ),
          );
        }
      }
    }

    completedViaNodeIndices.push(viaNodeIndex);

    steps.push(
      createStep(
        graph,
        'completeVia',
        [7],
        distanceMatrix,
        viaNodeIndex,
        null,
        null,
        changedPairKeys,
        completedViaNodeIndices,
        null,
        null,
        null,
        null,
        updatedInViaCount,
        completedViaNodeIndices.length,
        'ongoing',
      ),
    );
  }

  steps.push(
    createStep(
      graph,
      'completed',
      [8],
      distanceMatrix,
      null,
      null,
      null,
      [],
      completedViaNodeIndices,
      null,
      null,
      null,
      null,
      0,
      completedViaNodeIndices.length,
      'completed',
    ),
  );

  return steps;
}
