import type { TranslationKey } from '../i18n/translations';
import type { ModuleCategory, ModuleDifficulty } from '../types/module';

export const MODULE_CATEGORY_ORDER: ModuleCategory[] = ['linear', 'sort', 'search', 'tree', 'graph', 'hash', 'string', 'paradigm'];

export const MODULE_CATEGORY_META: Record<
  ModuleCategory,
  {
    label: TranslationKey;
    summary: TranslationKey;
    focus: TranslationKey;
  }
> = {
  linear: {
    label: 'modules.filter.linear',
    summary: 'modules.category.linear.summary',
    focus: 'modules.category.linear.focus',
  },
  sort: {
    label: 'modules.filter.sort',
    summary: 'modules.category.sort.summary',
    focus: 'modules.category.sort.focus',
  },
  search: {
    label: 'modules.filter.search',
    summary: 'modules.category.search.summary',
    focus: 'modules.category.search.focus',
  },
  tree: {
    label: 'modules.filter.tree',
    summary: 'modules.category.tree.summary',
    focus: 'modules.category.tree.focus',
  },
  graph: {
    label: 'modules.filter.graph',
    summary: 'modules.category.graph.summary',
    focus: 'modules.category.graph.focus',
  },
  hash: {
    label: 'modules.filter.hash',
    summary: 'modules.category.hash.summary',
    focus: 'modules.category.hash.focus',
  },
  string: {
    label: 'modules.filter.string',
    summary: 'modules.category.string.summary',
    focus: 'modules.category.string.focus',
  },
  paradigm: {
    label: 'modules.filter.paradigm',
    summary: 'modules.category.paradigm.summary',
    focus: 'modules.category.paradigm.focus',
  },
};

export const MODULE_DIFFICULTY_LABEL_KEYS: Record<ModuleDifficulty, TranslationKey> = {
  1: 'modules.level.foundation',
  2: 'modules.level.core',
  3: 'modules.level.advanced',
};

export const MODULE_DESCRIPTION_KEYS: Record<string, TranslationKey> = {
  'S-01': 'module.s01.body',
  'S-02': 'module.s02.body',
  'S-03': 'module.s03.body',
  'S-04': 'module.s04.body',
  'S-05': 'module.s05.body',
  'S-06': 'module.s06.body',
  'S-07': 'module.s07.body',
  'S-08': 'module.s08.body',
  'S-09': 'module.s09.body',
  'S-10': 'module.s10.body',
  'S-11': 'module.s11.body',
  'SR-01': 'module.sr01.body',
  'SR-02': 'module.sr02.body',
  'L-01': 'module.l01.body',
  'L-02': 'module.l02.body',
  'L-03': 'module.l03.body',
  'L-04': 'module.l04.body',
  'L-05': 'module.l05.body',
  'T-01': 'module.t01.body',
  'T-02': 'module.t02.body',
  'T-03': 'module.t03.body',
  'T-04': 'module.t04.body',
  'T-05': 'module.t05.body',
  'T-06': 'module.t06.body',
  'T-07': 'module.t07.body',
  'G-01': 'module.g01.body',
  'G-02': 'module.g02.body',
  'G-03': 'module.g03.body',
  'G-04': 'module.g04.body',
  'G-05': 'module.g05.body',
  'G-06': 'module.g06.body',
  'G-07': 'module.g07.body',
  'G-08': 'module.g08.body',
  'G-09': 'module.g09.body',
  'H-01': 'module.h01.body',
  'H-02': 'module.h02.body',
  'ST-01': 'module.st01.body',
  'ST-02': 'module.st02.body',
  'P-01': 'module.p01.body',
  'P-02': 'module.p02.body',
  'P-03': 'module.p03.body',
  'P-04': 'module.p04.body',
  'P-05': 'module.p05.body',
};
