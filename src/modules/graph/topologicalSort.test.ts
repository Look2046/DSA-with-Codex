import { describe, expect, it } from 'vitest';
import { generateTopologicalSortSteps } from './topologicalSort';

function getOutputIds(steps: ReturnType<typeof generateTopologicalSortSteps>): string[] {
  const finalStep = steps.at(-1);
  if (!finalStep) {
    return [];
  }
  return finalStep.outputOrder.map((nodeIndex) => finalStep.graph.nodes[nodeIndex]?.id ?? '?');
}

describe('topologicalSort', () => {
  it('produces deterministic Kahn order for the default DAG preset', () => {
    const steps = generateTopologicalSortSteps('dag');
    const finalStep = steps.at(-1);

    expect(getOutputIds(steps)).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
    expect(finalStep?.outcome).toBe('completed');
    expect(finalStep?.remainingNodeCount).toBe(0);
    expect(finalStep?.indegreeByNode).toEqual([0, 0, 0, 0, 0, 0]);
    expect(steps.some((step) => step.action === 'countIndegree')).toBe(true);
    expect(steps.some((step) => step.action === 'decreaseIndegree')).toBe(true);
    expect(steps.some((step) => step.action === 'enqueueNeighbor')).toBe(true);
  });

  it('keeps step sequence deterministic across repeated generation', () => {
    const first = generateTopologicalSortSteps('dag');
    const second = generateTopologicalSortSteps('dag');

    expect(first).toEqual(second);
  });
});
