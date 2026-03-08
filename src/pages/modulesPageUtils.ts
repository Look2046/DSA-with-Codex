import type { ModuleCategory, ModuleMetadata } from '../types/module';

export type ModuleFilter = 'all' | ModuleCategory;

export function filterModules(modules: ModuleMetadata[], filter: ModuleFilter): ModuleMetadata[] {
  if (filter === 'all') {
    return modules;
  }
  return modules.filter((moduleItem) => moduleItem.category === filter);
}

export function formatDifficulty(difficulty: ModuleMetadata['difficulty']): string {
  return '★'.repeat(difficulty);
}
