import { describe, expect, it } from 'vitest';
import { generatePrimSteps } from './prim';

function getSelectedEdges(steps: ReturnType<typeof generatePrimSteps>): string[] {
  const finalStep = steps.at(-1);
  if (!finalStep) {
    return [];
  }

  return finalStep.selectedEdgeKeys;
}

describe('prim', () => {
  it('produces a deterministic MST growth order for the undirected teaching preset', () => {
    const steps = generatePrimSteps('mstUndirected');

    expect(getSelectedEdges(steps)).toEqual(['0-2', '1-2', '1-3', '3-4']);
    expect(steps.at(-1)?.totalWeight).toBe(10);
    expect(steps.at(-1)?.treeNodeOrder).toEqual([0, 2, 1, 3, 4]);
    expect(steps.some((step) => step.action === 'chooseEdge')).toBe(true);
    expect(steps.some((step) => step.action === 'skipEdge')).toBe(true);
    expect(steps.at(-1)?.outcome).toBe('completed');
  });
});
