import { describe, expect, it } from 'vitest';
import { generateBfsSteps } from './bfs';

function getOutputIds(steps: ReturnType<typeof generateBfsSteps>): string[] {
  const finalStep = steps.at(-1);
  if (!finalStep) {
    return [];
  }
  return finalStep.outputOrder.map((index) => finalStep.graph.nodes[index]?.id ?? '?');
}

function getLevelMap(steps: ReturnType<typeof generateBfsSteps>): Record<string, number | null> {
  const finalStep = steps.at(-1);
  if (!finalStep) {
    return {};
  }

  return Object.fromEntries(
    finalStep.graph.nodes.map((node, index) => [node.id, finalStep.levelByNode[index] ?? null] as const),
  );
}

describe('bfs', () => {
  it('produces deterministic BFS order and levels for the directed preset', () => {
    const steps = generateBfsSteps('dag');

    expect(getOutputIds(steps)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(getLevelMap(steps)).toEqual({
      A: 0,
      B: 1,
      C: 1,
      D: 2,
      E: 2,
      F: 3,
    });
    expect(steps.some((step) => step.action === 'enqueueNeighbor')).toBe(true);
    expect(steps.some((step) => step.action === 'skipVisited')).toBe(true);
    expect(steps.filter((step) => step.action === 'completeVertex')).toHaveLength(6);
    expect(steps.at(-1)?.outcome).toBe('completed');
  });

  it('produces deterministic BFS order for the undirected preset', () => {
    const steps = generateBfsSteps('undirected');

    expect(getOutputIds(steps)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(steps.some((step) => step.action === 'inspectNeighbor')).toBe(true);
    expect(steps.some((step) => step.action === 'dequeue')).toBe(true);
  });
});
