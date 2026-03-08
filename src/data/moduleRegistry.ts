import type { ModuleMetadata } from '../types/module';

export const moduleRegistry: ModuleMetadata[] = [
  {
    id: 'S-01',
    name: 'Bubble Sort',
    route: '/modules/bubble-sort',
    category: 'sort',
    difficulty: 1,
    implemented: true,
  },
  {
    id: 'S-02',
    name: 'Selection Sort',
    route: '/modules/selection-sort',
    category: 'sort',
    difficulty: 1,
    implemented: true,
  },
  {
    id: 'S-03',
    name: 'Insertion Sort',
    route: '/modules/insertion-sort',
    category: 'sort',
    difficulty: 1,
    implemented: true,
  },
  {
    id: 'S-04',
    name: 'Shell Sort',
    route: '/modules/shell-sort',
    category: 'sort',
    difficulty: 2,
    implemented: true,
  },
  {
    id: 'S-05',
    name: 'Quick Sort',
    route: '/modules/quick-sort',
    category: 'sort',
    difficulty: 2,
    implemented: true,
  },
  {
    id: 'S-06',
    name: 'Merge Sort',
    route: '/modules/merge-sort',
    category: 'sort',
    difficulty: 2,
    implemented: true,
  },
  {
    id: 'SR-01',
    name: 'Linear Search',
    route: '/modules/linear-search',
    category: 'search',
    difficulty: 1,
    implemented: true,
  },
  {
    id: 'SR-02',
    name: 'Binary Search',
    route: '/modules/binary-search',
    category: 'search',
    difficulty: 1,
    implemented: true,
  },
  {
    id: 'L-01',
    name: 'Array',
    route: '/modules/array',
    category: 'linear',
    difficulty: 1,
    implemented: true,
  },
  {
    id: 'L-02',
    name: 'Dynamic Array',
    route: '/modules/dynamic-array',
    category: 'linear',
    difficulty: 2,
    implemented: true,
  },
  {
    id: 'L-03',
    name: 'Linked List',
    route: '/modules/linked-list',
    category: 'linear',
    difficulty: 2,
    implemented: true,
  },
  {
    id: 'L-04',
    name: 'Stack',
    route: '/modules/stack',
    category: 'linear',
    difficulty: 2,
    implemented: true,
  },
  {
    id: 'L-05',
    name: 'Queue',
    route: '/modules/queue',
    category: 'linear',
    difficulty: 2,
    implemented: true,
  },
];

export function getModuleByRoute(route: string): ModuleMetadata | null {
  return moduleRegistry.find((moduleItem) => moduleItem.route === route) ?? null;
}

export function getModuleById(id: string): ModuleMetadata | null {
  return moduleRegistry.find((moduleItem) => moduleItem.id === id) ?? null;
}
