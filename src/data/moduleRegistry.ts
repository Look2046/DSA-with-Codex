import type { ModuleMetadata } from '../types/module';

export const moduleRegistry: ModuleMetadata[] = [
  {
    id: 'S-01',
    name: 'Bubble Sort',
    route: '/modules/bubble-sort',
    category: 'sort',
    difficulty: 1,
  },
  {
    id: 'L-01',
    name: 'Array',
    route: '/modules/array',
    category: 'linear',
    difficulty: 1,
  },
  {
    id: 'L-03',
    name: 'Linked List',
    route: '/modules/linked-list',
    category: 'linear',
    difficulty: 2,
  },
];

export function getModuleByRoute(route: string): ModuleMetadata | null {
  return moduleRegistry.find((moduleItem) => moduleItem.route === route) ?? null;
}

export function getModuleById(id: string): ModuleMetadata | null {
  return moduleRegistry.find((moduleItem) => moduleItem.id === id) ?? null;
}
