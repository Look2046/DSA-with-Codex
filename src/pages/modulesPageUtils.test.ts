import { describe, expect, it } from 'vitest';
import { filterModules, formatDifficulty } from './modulesPageUtils';
import type { ModuleMetadata } from '../types/module';

const modules: ModuleMetadata[] = [
  { id: 'S-01', name: 'Bubble Sort', route: '/modules/bubble-sort', category: 'sort', difficulty: 1, implemented: true },
  { id: 'S-02', name: 'Selection Sort', route: '/modules/selection-sort', category: 'sort', difficulty: 1, implemented: false },
  { id: 'L-01', name: 'Array', route: '/modules/array', category: 'linear', difficulty: 1, implemented: true },
];

describe('modulesPageUtils', () => {
  it('filters modules by category', () => {
    expect(filterModules(modules, 'all')).toHaveLength(3);
    expect(filterModules(modules, 'sort').map((item) => item.id)).toEqual(['S-01', 'S-02']);
    expect(filterModules(modules, 'linear').map((item) => item.id)).toEqual(['L-01']);
  });

  it('formats difficulty into stars', () => {
    expect(formatDifficulty(1)).toBe('★');
    expect(formatDifficulty(2)).toBe('★★');
    expect(formatDifficulty(3)).toBe('★★★');
  });
});
