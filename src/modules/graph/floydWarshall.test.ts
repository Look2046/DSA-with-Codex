import { describe, expect, it } from 'vitest';
import { generateFloydWarshallSteps } from './floydWarshall';

function getDistanceMap(
  steps: ReturnType<typeof generateFloydWarshallSteps>,
): Record<string, Record<string, number | null>> {
  const finalStep = steps.at(-1);
  if (!finalStep) {
    return {};
  }

  return Object.fromEntries(
    finalStep.graph.nodes.map((sourceNode, sourceIndex) => [
      sourceNode.id,
      Object.fromEntries(
        finalStep.graph.nodes.map((targetNode, targetIndex) => [
          targetNode.id,
          finalStep.distanceMatrix[sourceIndex][targetIndex] ?? null,
        ]),
      ),
    ]),
  );
}

describe('floydWarshall', () => {
  it('produces deterministic all-pairs shortest paths for the teaching preset', () => {
    const steps = generateFloydWarshallSteps('floydDirected');

    expect(getDistanceMap(steps)).toEqual({
      A: { A: 0, B: 5, C: 8, D: 9 },
      B: { A: 11, B: 0, C: 3, D: 4 },
      C: { A: 8, B: 13, C: 0, D: 1 },
      D: { A: 7, B: 12, C: 15, D: 0 },
    });
    expect(steps.some((step) => step.action === 'updateDistance')).toBe(true);
    expect(steps.some((step) => step.action === 'keepDistance')).toBe(true);
    expect(steps.filter((step) => step.action === 'completeVia')).toHaveLength(4);
    expect(steps.filter((step) => step.action === 'updateDistance')).toHaveLength(8);
    expect(steps.at(-1)?.outcome).toBe('completed');
  });
});
