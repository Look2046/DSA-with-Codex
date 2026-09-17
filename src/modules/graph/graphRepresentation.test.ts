import { describe, expect, it } from 'vitest';
import {
  createAdjacencyList,
  createAdjacencyMatrix,
  generateGraphRepresentationSteps,
  getGraphPreset,
} from './graphRepresentation';

describe('graphRepresentation', () => {
  it('builds a directed adjacency list and matrix from one shared graph model', () => {
    const graph = getGraphPreset('dag');
    const adjacencyList = createAdjacencyList(graph);
    const adjacencyMatrix = createAdjacencyMatrix(graph);

    expect(adjacencyList.map((row) => row.map((index) => graph.nodes[index]?.id))).toEqual([
      ['B', 'C'],
      ['D'],
      ['D', 'E'],
      ['F'],
      ['F'],
      [],
    ]);

    expect(adjacencyMatrix[0]).toEqual([0, 1, 1, 0, 0, 0]);
    expect(adjacencyMatrix[2]).toEqual([0, 0, 0, 1, 1, 0]);
    expect(adjacencyMatrix[5]).toEqual([0, 0, 0, 0, 0, 0]);
  });

  it('mirrors undirected edges in both representations', () => {
    const graph = getGraphPreset('undirected');
    const adjacencyList = createAdjacencyList(graph);
    const adjacencyMatrix = createAdjacencyMatrix(graph);

    expect(adjacencyList.map((row) => row.map((index) => graph.nodes[index]?.id))).toEqual([
      ['B', 'C'],
      ['A', 'D'],
      ['A', 'D'],
      ['B', 'C', 'E', 'F'],
      ['D', 'F'],
      ['D', 'E'],
    ]);

    expect(adjacencyMatrix[0][1]).toBe(1);
    expect(adjacencyMatrix[1][0]).toBe(1);
    expect(adjacencyMatrix[3][5]).toBe(1);
    expect(adjacencyMatrix[5][3]).toBe(1);
  });

  it('generates deterministic row-by-row teaching steps and finishes completed', () => {
    const steps = generateGraphRepresentationSteps('dag');

    expect(steps[0]?.action).toBe('initial');
    expect(steps[1]?.action).toBe('selectVertex');
    expect(steps.some((step) => step.action === 'inspectEdge')).toBe(true);
    expect(steps.some((step) => step.action === 'completeRow')).toBe(true);
    expect(steps.at(-1)?.action).toBe('completed');
    expect(steps.at(-1)?.outcome).toBe('completed');
    expect(steps.at(-1)?.completedNodeIndices).toEqual([0, 1, 2, 3, 4, 5]);
    expect(steps.at(-1)?.inspectedRelationCount).toBe(7);
  });
});
