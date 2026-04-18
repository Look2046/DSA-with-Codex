import { describe, expect, it } from 'vitest';
import { generateDijkstraSteps } from './dijkstra';

function getOutputIds(steps: ReturnType<typeof generateDijkstraSteps>): string[] {
  const finalStep = steps.at(-1);
  if (!finalStep) {
    return [];
  }
  return finalStep.outputOrder.map((index) => finalStep.graph.nodes[index]?.id ?? '?');
}

function getDistanceMap(steps: ReturnType<typeof generateDijkstraSteps>): Record<string, number | null> {
  const finalStep = steps.at(-1);
  if (!finalStep) {
    return {};
  }

  return Object.fromEntries(
    finalStep.graph.nodes.map((node, index) => [node.id, finalStep.distances[index] ?? null] as const),
  );
}

function getPreviousMap(steps: ReturnType<typeof generateDijkstraSteps>): Record<string, string | null> {
  const finalStep = steps.at(-1);
  if (!finalStep) {
    return {};
  }

  return Object.fromEntries(
    finalStep.graph.nodes.map((node, index) => {
      const previousIndex = finalStep.previousNodeIndices[index];
      return [node.id, previousIndex === null ? null : (finalStep.graph.nodes[previousIndex]?.id ?? null)] as const;
    }),
  );
}

describe('dijkstra', () => {
  it('produces deterministic shortest-path distances for the positive weighted preset', () => {
    const steps = generateDijkstraSteps('positiveDirected');

    expect(getOutputIds(steps)).toEqual(['A', 'C', 'B', 'D', 'E', 'F']);
    expect(getDistanceMap(steps)).toEqual({
      A: 0,
      B: 3,
      C: 2,
      D: 8,
      E: 10,
      F: 12,
    });
    expect(getPreviousMap(steps)).toEqual({
      A: null,
      B: 'C',
      C: 'A',
      D: 'B',
      E: 'D',
      F: 'E',
    });
    expect(steps.some((step) => step.action === 'updateDistance')).toBe(true);
    expect(steps.some((step) => step.action === 'keepDistance')).toBe(true);
    expect(steps.filter((step) => step.action === 'finalizeNode')).toHaveLength(6);
    expect(steps.at(-1)?.outcome).toBe('completed');
  });
});
