import { describe, expect, it } from 'vitest';
import { filterModules, formatDifficulty } from './modulesPageUtils';
import type { ModuleMetadata } from '../types/module';

const modules: ModuleMetadata[] = [
  { id: 'S-01', name: 'Bubble Sort', route: '/modules/bubble-sort', category: 'sort', difficulty: 1, implemented: true },
  { id: 'S-02', name: 'Selection Sort', route: '/modules/selection-sort', category: 'sort', difficulty: 1, implemented: false },
  { id: 'L-01', name: 'Array', route: '/modules/array', category: 'linear', difficulty: 1, implemented: true },
  { id: 'SR-02', name: 'Binary Search', route: '/modules/binary-search', category: 'search', difficulty: 1, implemented: true },
  { id: 'T-01', name: 'Binary Tree Traversal', route: '/modules/binary-tree', category: 'tree', difficulty: 1, implemented: true },
  { id: 'G-01', name: 'Graph Representation', route: '/modules/graph-representation', category: 'graph', difficulty: 1, implemented: true },
];

describe('modulesPageUtils', () => {
  it('filters modules by category', () => {
    expect(filterModules(modules, 'all')).toHaveLength(6);
    expect(filterModules(modules, 'sort').map((item) => item.id)).toEqual(['S-01', 'S-02']);
    expect(filterModules(modules, 'linear').map((item) => item.id)).toEqual(['L-01']);
    expect(filterModules(modules, 'search').map((item) => item.id)).toEqual(['SR-02']);
    expect(filterModules(modules, 'tree').map((item) => item.id)).toEqual(['T-01']);
    expect(filterModules(modules, 'graph').map((item) => item.id)).toEqual(['G-01']);
  });

  it('formats difficulty into stars', () => {
    expect(formatDifficulty(1)).toBe('★');
    expect(formatDifficulty(2)).toBe('★★');
    expect(formatDifficulty(3)).toBe('★★★');
  });
});
