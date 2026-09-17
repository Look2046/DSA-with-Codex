import { describe, expect, it } from 'vitest';
import { generateBellmanFordSteps } from './bellmanFord';

function getDistanceMap(steps: ReturnType<typeof generateBellmanFordSteps>): Record<string, number | null> {
  const finalStep = steps.at(-1);
  if (!finalStep) {
    return {};
  }

  return Object.fromEntries(
    finalStep.graph.nodes.map((node, index) => [node.id, finalStep.distances[index] ?? null] as const),
  );
}

function getPreviousMap(steps: ReturnType<typeof generateBellmanFordSteps>): Record<string, string | null> {
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

describe('bellmanFord', () => {
  it('produces deterministic shortest-path distances for the negative-edge preset', () => {
    const steps = generateBellmanFordSteps('negativeDirected');

    expect(getDistanceMap(steps)).toEqual({
      A: 0,
      B: 4,
      C: 2,
      D: 3,
      E: 5,
      F: 6,
    });
    expect(getPreviousMap(steps)).toEqual({
      A: null,
      B: 'A',
      C: 'B',
      D: 'C',
      E: 'D',
      F: 'E',
    });
    expect(steps.some((step) => step.action === 'updateDistance')).toBe(true);
    expect(steps.some((step) => step.action === 'keepDistance')).toBe(true);
    expect(steps.some((step) => step.action === 'earlyStop')).toBe(true);
    expect(steps.filter((step) => step.action === 'completePass')).toHaveLength(4);
    expect(steps.at(-1)?.outcome).toBe('completed');
  });
});
