import { describe, expect, it } from 'vitest';
import { createTreeDefinitionSample, getLeafCount, getTreeHeight } from './treeDefinition';

describe('tree definition samples', () => {
  it('creates a complete binary tree sample', () => {
    const sample = createTreeDefinitionSample('complete');

    expect(sample.kind).toBe('complete');
    expect(sample.nodes).toHaveLength(9);
    expect(sample.nodes[0]?.children).toEqual([1, 2]);
    expect(sample.nodes[3]?.children).toEqual([7, 8]);
    expect(getTreeHeight(sample)).toBe(4);
  });

  it('creates a full binary tree sample where internal nodes have two children', () => {
    const sample = createTreeDefinitionSample('full');
    const internalNodes = sample.nodes.filter((node) => node.children.length > 0);

    expect(sample.kind).toBe('full');
    expect(internalNodes.every((node) => node.children.length === 2)).toBe(true);
    expect(getLeafCount(sample)).toBe(4);
  });

  it('creates deterministic random tree samples from a seed', () => {
    const first = createTreeDefinitionSample('general', 7);
    const second = createTreeDefinitionSample('general', 7);
    const third = createTreeDefinitionSample('general', 8);

    expect(first.kind).toBe('general');
    expect(first.nodes.map((node) => node.parent)).toEqual(second.nodes.map((node) => node.parent));
    expect(first.nodes.map((node) => node.parent)).not.toEqual(third.nodes.map((node) => node.parent));
  });
});
