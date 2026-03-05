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
    implemented: false,
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
    implemented: false,
  },
  {
    id: 'L-05',
    name: 'Queue',
    route: '/modules/queue',
    category: 'linear',
    difficulty: 2,
    implemented: false,
  },
];

export function getModuleByRoute(route: string): ModuleMetadata | null {
  return moduleRegistry.find((moduleItem) => moduleItem.route === route) ?? null;
}

export function getModuleById(id: string): ModuleMetadata | null {
  return moduleRegistry.find((moduleItem) => moduleItem.id === id) ?? null;
}
