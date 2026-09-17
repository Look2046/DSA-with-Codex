import { describe, expect, it } from 'vitest';
import { generateKruskalSteps } from './kruskal';

function getSelectedEdges(steps: ReturnType<typeof generateKruskalSteps>): string[] {
  const finalStep = steps.at(-1);
  if (!finalStep) {
    return [];
  }

  return finalStep.selectedEdgeKeys;
}

describe('kruskal', () => {
  it('produces a deterministic MST for the undirected teaching preset', () => {
    const steps = generateKruskalSteps('mstUndirected');

    expect(getSelectedEdges(steps)).toEqual(['1-2', '0-2', '3-4', '1-3']);
    expect(steps.at(-1)?.totalWeight).toBe(10);
    expect(steps.at(-1)?.chosenEdgeCount).toBe(4);
    expect(steps.some((step) => step.action === 'chooseEdge')).toBe(true);
    expect(steps.some((step) => step.action === 'rejectEdge')).toBe(true);
    expect(steps.at(-1)?.outcome).toBe('completed');
  });
});
