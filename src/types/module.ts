export type ModuleDifficulty = 1 | 2 | 3;

export type ModuleMetadata = {
  id: string;
  name: string;
  route: string;
  category: 'linear' | 'sort';
  difficulty: ModuleDifficulty;
};
