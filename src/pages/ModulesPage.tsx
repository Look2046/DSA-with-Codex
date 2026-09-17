import { startTransition, useDeferredValue, useMemo, type SVGProps } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { readRecentModuleVisits } from '../app/recentModuleVisits';
import { CatalogHeroArt } from '../components/CatalogHeroArt';
import { moduleRegistry } from '../data/moduleRegistry';
import { translations } from '../i18n/translations';
import { useI18n } from '../i18n/useI18n';
import { MODULE_CATEGORY_META, MODULE_CATEGORY_ORDER, MODULE_DESCRIPTION_KEYS, MODULE_DIFFICULTY_LABEL_KEYS } from './moduleCatalog';
import type { ModuleCategory, ModuleDifficulty, ModuleMetadata } from '../types/module';

type ModuleFilter = 'all' | ModuleCategory;
type DifficultyFilter = 'all' | ModuleDifficulty;

type CategoryCard = {
  category: ModuleCategory;
  totalCount: number;
  visibleCount: number;
  countsByDifficulty: Record<ModuleDifficulty, number>;
};

type CatalogModule = ModuleMetadata & {
  routeLabel: string;
  titleZh: string;
  titleEn: string;
};

const DIFFICULTY_FILTERS: DifficultyFilter[] = ['all', 1, 2, 3];
const MAX_RECENT_MODULES = 3;

function buildDifficultyCounts(modules: ModuleMetadata[]): Record<ModuleDifficulty, number> {
  return {
    1: modules.filter((moduleItem) => moduleItem.difficulty === 1).length,
    2: modules.filter((moduleItem) => moduleItem.difficulty === 2).length,
    3: modules.filter((moduleItem) => moduleItem.difficulty === 3).length,
  };
}

function getRouteLabel(route: string) {
  return route.replace('/modules/', '');
}

function getModuleTitleKey(moduleId: string) {
  return `module.${moduleId.toLowerCase().replace(/-/g, '')}.title` as keyof (typeof translations)['en'];
}

function stripModulePrefix(moduleId: string, title: string) {
  const prefix = `${moduleId} `;
  return title.startsWith(prefix) ? title.slice(prefix.length) : title;
}

function UiGlyph({
  kind,
  ...props
}: { kind: 'catalog' | 'search' | 'clear' | 'results' | 'tracks' | 'levels' | 'open' } & SVGProps<SVGSVGElement>) {
  const baseProps: SVGProps<SVGSVGElement> = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
    ...props,
  };

  switch (kind) {
    case 'catalog':
      return (
        <svg {...baseProps}>
          <rect x="3.5" y="4" width="7" height="7" rx="1.8" />
          <rect x="13.5" y="4" width="7" height="7" rx="1.8" />
          <rect x="3.5" y="13" width="7" height="7" rx="1.8" />
          <rect x="13.5" y="13" width="7" height="7" rx="1.8" />
        </svg>
      );
    case 'search':
      return (
        <svg {...baseProps}>
          <circle cx="10.5" cy="10.5" r="5.5" />
          <path d="m15 15 4.5 4.5" />
        </svg>
      );
    case 'clear':
      return (
        <svg {...baseProps}>
          <path d="M6 6 18 18" />
          <path d="M18 6 6 18" />
        </svg>
      );
    case 'results':
      return (
        <svg {...baseProps}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h10" />
        </svg>
      );
    case 'tracks':
      return (
        <svg {...baseProps}>
          <path d="M6 19V9" />
          <path d="M12 19V5" />
          <path d="M18 19v-7" />
          <path d="M4 19h16" />
        </svg>
      );
    case 'levels':
      return (
        <svg {...baseProps}>
          <path d="M5 17h3" />
          <path d="M10.5 13h3" />
          <path d="M16 9h3" />
        </svg>
      );
    case 'open':
      return (
        <svg {...baseProps}>
          <path d="M8 12h8" />
          <path d="m13 7 5 5-5 5" />
        </svg>
      );
  }
}

function CategoryGlyph({ category, ...props }: { category: ModuleCategory } & SVGProps<SVGSVGElement>) {
  const baseProps: SVGProps<SVGSVGElement> = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
    ...props,
  };

  switch (category) {
    case 'linear':
      return (
        <svg {...baseProps}>
          <rect x="3.5" y="7" width="4" height="10" rx="1.4" />
          <rect x="10" y="7" width="4" height="10" rx="1.4" />
          <rect x="16.5" y="7" width="4" height="10" rx="1.4" />
        </svg>
      );
    case 'sort':
      return (
        <svg {...baseProps}>
          <path d="M6 17V9" />
          <path d="M12 17V6" />
          <path d="M18 17v-4" />
          <path d="M4 17h16" />
        </svg>
      );
    case 'storage':
      return (
        <svg {...baseProps}>
          <rect x="4" y="5" width="14" height="11" rx="1.8" />
          <path d="M8 9h6" />
          <path d="M8 12h6" />
          <path d="M20 8v11" />
          <path d="M17 16h6" />
        </svg>
      );
    case 'search':
      return (
        <svg {...baseProps}>
          <circle cx="10" cy="10" r="4.5" />
          <path d="m14 14 5 5" />
          <path d="M9 10h2" />
        </svg>
      );
    case 'tree':
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="5.5" r="2.2" />
          <circle cx="6" cy="17.5" r="2.2" />
          <circle cx="18" cy="17.5" r="2.2" />
          <path d="M12 7.7v4.2" />
          <path d="M12 11.9 6 15.3" />
          <path d="m12 11.9 6 3.4" />
        </svg>
      );
    case 'graph':
      return (
        <svg {...baseProps}>
          <circle cx="6" cy="7" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="12" cy="18" r="2" />
          <path d="M7.8 8.1 10.2 16" />
          <path d="M16.1 7.3 13.9 16" />
          <path d="M8 7.2h8" />
        </svg>
      );
    case 'hash':
      return (
        <svg {...baseProps}>
          <path d="M8 4 6 20" />
          <path d="M16 4 14 20" />
          <path d="M4 9h16" />
          <path d="M3 15h16" />
        </svg>
      );
    case 'string':
      return (
        <svg {...baseProps}>
          <path d="M5 8c0-1.7 1.3-3 3-3h3.5c1.7 0 3 1.3 3 3s-1.3 3-3 3H9c-1.7 0-3 1.3-3 3s1.3 3 3 3h3.5c1.7 0 3-1.3 3-3" />
        </svg>
      );
    case 'paradigm':
      return (
        <svg {...baseProps}>
          <path d="M12 4v5" />
          <path d="M12 9 6 14" />
          <path d="m12 9 6 5" />
          <path d="M6 14v6" />
          <path d="M18 14v6" />
        </svg>
      );
  }
}

function DifficultyMeter({ difficulty }: { difficulty: ModuleDifficulty }) {
  return (
    <span className="modules-difficulty-meter" aria-hidden="true">
      {[1, 2, 3].map((item) => (
        <span key={item} className={item <= difficulty ? 'modules-difficulty-dot modules-difficulty-dot-active' : 'modules-difficulty-dot'} />
      ))}
    </span>
  );
}

export function ModulesPage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const readyModules = useMemo<CatalogModule[]>(
    () =>
      moduleRegistry
        .filter((moduleItem) => moduleItem.implemented)
        .map((moduleItem) => {
          const titleKey = getModuleTitleKey(moduleItem.id);
          const rawTitleZh = translations.zh[titleKey] ?? `${moduleItem.id} ${moduleItem.name}`;
          const rawTitleEn = translations.en[titleKey] ?? `${moduleItem.id} ${moduleItem.name}`;
          return {
            ...moduleItem,
            routeLabel: getRouteLabel(moduleItem.route),
            titleZh: stripModulePrefix(moduleItem.id, rawTitleZh),
            titleEn: stripModulePrefix(moduleItem.id, rawTitleEn),
          };
        }),
    [],
  );

  const query = searchParams.get('q') ?? '';
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filter = searchParams.get('category');
  const activeFilter: ModuleFilter = MODULE_CATEGORY_ORDER.includes(filter as ModuleCategory) ? (filter as ModuleCategory) : 'all';

  const level = searchParams.get('level');
  const activeDifficulty: DifficultyFilter = level === '1' || level === '2' || level === '3' ? (Number(level) as ModuleDifficulty) : 'all';

  const hasActiveFilters = query.trim() !== '' || activeFilter !== 'all' || activeDifficulty !== 'all';

  const updateParams = (nextFilter: ModuleFilter, nextQuery: string, nextDifficulty: DifficultyFilter) => {
    const nextSearchParams = new URLSearchParams();

    if (nextFilter !== 'all') {
      nextSearchParams.set('category', nextFilter);
    }

    if (nextDifficulty !== 'all') {
      nextSearchParams.set('level', String(nextDifficulty));
    }

    if (nextQuery.trim()) {
      nextSearchParams.set('q', nextQuery);
    }

    startTransition(() => setSearchParams(nextSearchParams));
  };

  const clearFilters = () => updateParams('all', '', 'all');

  const visibleModules = useMemo(() => {
    const filteredModules = readyModules.filter((moduleItem) => {
      if (activeFilter !== 'all' && moduleItem.category !== activeFilter) {
        return false;
      }

      if (activeDifficulty !== 'all' && moduleItem.difficulty !== activeDifficulty) {
        return false;
      }

      if (!deferredQuery) {
        return true;
      }

      const categoryMeta = MODULE_CATEGORY_META[moduleItem.category];
      const descriptionKey = MODULE_DESCRIPTION_KEYS[moduleItem.id];
      const searchableText = [
        moduleItem.id,
        moduleItem.titleZh,
        moduleItem.titleEn,
        moduleItem.routeLabel,
        translations.en[categoryMeta.label],
        translations.zh[categoryMeta.label],
        translations.en[categoryMeta.summary],
        translations.zh[categoryMeta.summary],
        translations.en[descriptionKey],
        translations.zh[descriptionKey],
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(deferredQuery);
    });

    return filteredModules.sort((left, right) => {
      const categoryGap = MODULE_CATEGORY_ORDER.indexOf(left.category) - MODULE_CATEGORY_ORDER.indexOf(right.category);
      if (categoryGap !== 0) {
        return categoryGap;
      }

      const difficultyGap = left.difficulty - right.difficulty;
      if (difficultyGap !== 0) {
        return difficultyGap;
      }

      return left.id.localeCompare(right.id);
    });
  }, [activeDifficulty, activeFilter, deferredQuery, readyModules]);

  const categoryCards = useMemo<CategoryCard[]>(
    () =>
      MODULE_CATEGORY_ORDER.map((category) => {
        const totalModules = readyModules.filter((moduleItem) => moduleItem.category === category);
        const matchingModules = visibleModules.filter((moduleItem) => moduleItem.category === category);
        return {
          category,
          totalCount: totalModules.length,
          visibleCount: matchingModules.length,
          countsByDifficulty: buildDifficultyCounts(matchingModules),
        };
      }),
    [readyModules, visibleModules],
  );

  const visibleDifficultyCounts = useMemo(() => buildDifficultyCounts(visibleModules), [visibleModules]);
  const visibleTrackCount = useMemo(() => categoryCards.filter((card) => card.visibleCount > 0).length, [categoryCards]);
  const recentModules = useMemo<CatalogModule[]>(
    () =>
      readRecentModuleVisits()
        .map((route) => readyModules.find((moduleItem) => moduleItem.route === route))
        .filter((moduleItem): moduleItem is CatalogModule => moduleItem !== undefined)
        .slice(0, MAX_RECENT_MODULES),
    [readyModules],
  );
  const lastVisitedModule = recentModules[0];

  return (
    <section className="modules-page modules-page-v6">
      <div className="modules-workbench" id="module-workbench">
        <aside className="modules-console">
          <section className="modules-console-search">
            <div className="modules-search-shell">
              <span className="modules-search-icon">
                <UiGlyph kind="search" />
              </span>
              <input
                className="modules-search-input"
                type="search"
                aria-label={t('modules.search.label')}
                value={query}
                placeholder={t('modules.search.placeholder')}
                onChange={(event) => updateParams(activeFilter, event.target.value, activeDifficulty)}
              />
            </div>

            {hasActiveFilters && (
              <button type="button" className="modules-clear-button" onClick={clearFilters}>
                <UiGlyph kind="clear" />
                {t('modules.action.reset')}
              </button>
            )}
          </section>

          <section className="modules-console-section">
            <div className="modules-console-section-head">
              <span className="modules-filter-group-label">{t('modules.launch.recent')}</span>
              {recentModules.length > 0 ? <span className="modules-console-count">{recentModules.length}</span> : null}
            </div>

            {recentModules.length > 0 ? (
              <div className="modules-recent-stack">
                {recentModules.map((moduleItem, index) => (
                  <Link
                    key={moduleItem.route}
                    className={
                      index === 0
                        ? `modules-recent-card modules-recent-card-active home-tone-${moduleItem.category}`
                        : `modules-recent-card home-tone-${moduleItem.category}`
                    }
                    to={moduleItem.route}
                  >
                    <div className="modules-recent-card-top">
                      <span className="modules-card-id">{moduleItem.id}</span>
                      <span className="modules-card-chip">{t(MODULE_CATEGORY_META[moduleItem.category].label)}</span>
                    </div>
                    <strong>{moduleItem.titleZh}</strong>
                    <span>{moduleItem.titleEn}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="modules-recent-empty">{t('modules.launch.recentEmpty')}</div>
            )}
          </section>

          <section className="modules-console-section">
            <span className="modules-filter-group-label">{t('modules.meta.difficulty')}</span>
            <div className="modules-filter-row">
              {DIFFICULTY_FILTERS.map((difficulty) => {
                const label = difficulty === 'all' ? t('modules.difficulty.all') : `${difficulty}`;
                return (
                  <button
                    key={String(difficulty)}
                    type="button"
                    className={activeDifficulty === difficulty ? 'modules-filter-pill modules-filter-pill-active' : 'modules-filter-pill'}
                    onClick={() => updateParams(activeFilter, query, difficulty)}
                  >
                    {difficulty !== 'all' && <DifficultyMeter difficulty={difficulty} />}
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="modules-console-section">
            <div className="modules-console-section-head">
              <span className="modules-filter-group-label">{t('modules.jump.label')}</span>
              {activeFilter !== 'all' ? (
                <button type="button" className="modules-console-link" onClick={() => updateParams('all', query, activeDifficulty)}>
                  {t('modules.filter.all')}
                </button>
              ) : null}
            </div>

            <div className="modules-track-grid" aria-label={t('modules.jump.label')}>
              {categoryCards.map((card) => (
                <button
                  key={card.category}
                  type="button"
                  className={
                    activeFilter === card.category
                      ? `modules-track-tile home-tone-${card.category} modules-track-tile-active`
                      : card.visibleCount === 0
                        ? `modules-track-tile home-tone-${card.category} modules-track-tile-empty`
                        : `modules-track-tile home-tone-${card.category}`
                  }
                  onClick={() => updateParams(activeFilter === card.category ? 'all' : card.category, query, activeDifficulty)}
                >
                  <span className="modules-track-tile-icon">
                    <CategoryGlyph category={card.category} />
                  </span>

                  <div className="modules-track-tile-copy">
                    <strong>{t(MODULE_CATEGORY_META[card.category].label)}</strong>
                    <div className="modules-track-tile-meta">
                      <span>{hasActiveFilters ? card.visibleCount : card.totalCount}</span>
                      {hasActiveFilters && card.visibleCount !== card.totalCount && <small>/{card.totalCount}</small>}
                    </div>
                  </div>

                  <div className="modules-track-tile-meter">
                    <span style={{ opacity: card.countsByDifficulty[1] > 0 ? 1 : 0.24 }} />
                    <span style={{ opacity: card.countsByDifficulty[2] > 0 ? 1 : 0.24 }} />
                    <span style={{ opacity: card.countsByDifficulty[3] > 0 ? 1 : 0.24 }} />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </aside>

        <div className="modules-mainboard">
          <section className="modules-directory-head">
            <div className="modules-directory-copy">
              <div className="modules-page-head-copy">
                <span className="modules-page-mark">
                  <UiGlyph kind="catalog" />
                </span>

                <div className="modules-page-headline">
                  <span className="modules-launch-kicker">{t('modules.launch.kicker')}</span>
                  <h2>{t('modules.launch.title')}</h2>
                </div>
              </div>

              <div className="modules-headline-pills">
                <span className="modules-headline-pill">
                  <UiGlyph kind="results" />
                  {visibleModules.length} {t('modules.summary.results')}
                </span>
                <span className="modules-headline-pill">
                  <UiGlyph kind="tracks" />
                  {visibleTrackCount} / {MODULE_CATEGORY_ORDER.length}
                </span>
                <span className="modules-headline-pill">
                  <UiGlyph kind="levels" />3 {t('modules.metric.levels')}
                </span>
                {activeFilter !== 'all' && <span className="modules-headline-pill">{t(MODULE_CATEGORY_META[activeFilter].label)}</span>}
                {activeDifficulty !== 'all' && (
                  <span className="modules-headline-pill">
                    <DifficultyMeter difficulty={activeDifficulty} />
                    {t(MODULE_DIFFICULTY_LABEL_KEYS[activeDifficulty])}
                  </span>
                )}
                {lastVisitedModule && (
                  <Link className="modules-headline-pill modules-headline-pill-link" to={lastVisitedModule.route}>
                    {t('modules.launch.resume')} {lastVisitedModule.id}
                  </Link>
                )}
              </div>
            </div>

            <div className="modules-directory-art">
              <CatalogHeroArt />
            </div>
          </section>

          <section className="modules-summary-rail">
            <span className="modules-summary-pill">
              <DifficultyMeter difficulty={1} />
              {visibleDifficultyCounts[1]}
            </span>
            <span className="modules-summary-pill">
              <DifficultyMeter difficulty={2} />
              {visibleDifficultyCounts[2]}
            </span>
            <span className="modules-summary-pill">
              <DifficultyMeter difficulty={3} />
              {visibleDifficultyCounts[3]}
            </span>
          </section>

          {visibleModules.length === 0 ? (
            <div className="modules-empty-state">
              <h3>{t('modules.empty.title')}</h3>
              <button type="button" className="btn btn-secondary" onClick={clearFilters}>
                {t('modules.action.reset')}
              </button>
            </div>
          ) : (
            <div className="modules-card-grid">
              {visibleModules.map((moduleItem) => (
                <Link key={moduleItem.id} className={`modules-card home-tone-${moduleItem.category}`} to={moduleItem.route}>
                  <div className="modules-card-top">
                    <span className="modules-card-id">{moduleItem.id}</span>
                    <DifficultyMeter difficulty={moduleItem.difficulty} />
                  </div>

                  <div className="modules-card-title">
                    <strong>{moduleItem.titleZh}</strong>
                    <span>{moduleItem.titleEn}</span>
                  </div>

                  <div className="modules-card-meta">
                    <span className="modules-card-chip">{t(MODULE_CATEGORY_META[moduleItem.category].label)}</span>
                  </div>

                  <span className="modules-card-action">
                    <UiGlyph kind="open" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
