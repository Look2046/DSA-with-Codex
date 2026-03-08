export type ModuleDifficulty = 1 | 2 | 3;
export type ModuleCategory = 'linear' | 'sort' | 'search' | 'tree';

export type ModuleMetadata = {
  id: string;
  name: string;
  route: string;
  category: ModuleCategory;
  difficulty: ModuleDifficulty;
  implemented: boolean;
};
