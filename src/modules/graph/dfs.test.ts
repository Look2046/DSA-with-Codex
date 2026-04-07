import { describe, expect, it } from 'vitest';
import { generateDfsSteps } from './dfs';

function getOutputIds(steps: ReturnType<typeof generateDfsSteps>): string[] {
  const finalStep = steps.at(-1);
  if (!finalStep) {
    return [];
  }
  return finalStep.outputOrder.map((index) => finalStep.graph.nodes[index]?.id ?? '?');
}

describe('dfs', () => {
  it('produces deterministic DFS order for the directed preset', () => {
    const steps = generateDfsSteps('dag');

    expect(getOutputIds(steps)).toEqual(['A', 'B', 'D', 'F', 'C', 'E']);
    expect(steps.some((step) => step.action === 'skipVisited')).toBe(true);
    expect(steps.filter((step) => step.action === 'backtrack')).toHaveLength(6);
    expect(steps.at(-1)?.outcome).toBe('completed');
  });

  it('produces deterministic DFS order for the undirected preset', () => {
    const steps = generateDfsSteps('undirected');

    expect(getOutputIds(steps)).toEqual(['A', 'B', 'D', 'C', 'E', 'F']);
    expect(steps.some((step) => step.action === 'descend')).toBe(true);
    expect(steps.some((step) => step.action === 'inspectNeighbor')).toBe(true);
  });
});
