import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { moduleRegistry } from '../data/moduleRegistry';
import { useI18n } from '../i18n/useI18n';
import { filterModules, formatDifficulty, type ModuleFilter } from './modulesPageUtils';

export function ModulesPage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();

  const filter = (searchParams.get('category') as ModuleFilter | null) ?? 'all';
  const activeFilter: ModuleFilter = filter === 'linear' || filter === 'sort' || filter === 'search' ? filter : 'all';
  const visibleModules = useMemo(() => filterModules(moduleRegistry, activeFilter), [activeFilter]);

  const filterOptions: Array<{ value: ModuleFilter; label: string }> = [
    { value: 'all', label: t('modules.filter.all') },
    { value: 'linear', label: t('modules.filter.linear') },
    { value: 'sort', label: t('modules.filter.sort') },
    { value: 'search', label: t('modules.filter.search') },
  ];

  const getCategoryLabel = (category: ModuleFilter): string => {
    if (category === 'linear') {
      return t('modules.filter.linear');
    }
    if (category === 'sort') {
      return t('modules.filter.sort');
    }
    if (category === 'search') {
      return t('modules.filter.search');
    }
    return t('modules.filter.all');
  };

  const updateFilter = (value: ModuleFilter) => {
    if (value === 'all') {
      setSearchParams({});
      return;
    }
    setSearchParams({ category: value });
  };

  return (
    <section className="modules-page">
      <h2>{t('modules.title')}</h2>
      <p>{t('modules.body')}</p>

      <div className="modules-filter-row">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={activeFilter === option.value ? 'modules-filter-btn modules-filter-btn-active' : 'modules-filter-btn'}
            onClick={() => updateFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {visibleModules.length === 0 ? <p className="array-preview">{t('modules.empty')}</p> : null}

      <div className="modules-grid">
        {visibleModules.map((moduleItem) => {
          const statusText = moduleItem.implemented ? t('modules.status.ready') : t('modules.status.pending');
          return (
            <article key={moduleItem.id} className="module-card">
              <header className="module-card-header">
                <h3>
                  {moduleItem.id} · {moduleItem.name}
                </h3>
                <span className={moduleItem.implemented ? 'module-badge module-badge-ready' : 'module-badge module-badge-pending'}>
                  {statusText}
                </span>
              </header>
              <p className="module-meta">
                {t('modules.meta.category')}: {getCategoryLabel(moduleItem.category)}
                {' | '}
                {t('modules.meta.difficulty')}: {formatDifficulty(moduleItem.difficulty)}
              </p>
              <p className="module-meta">
                {t('modules.meta.route')}: <code>{moduleItem.route}</code>
              </p>

              {moduleItem.implemented ? (
                <Link className="btn btn-primary" to={moduleItem.route}>
                  {t('modules.action.open')}
                </Link>
              ) : (
                <button type="button" className="btn btn-secondary" disabled>
                  {t('modules.action.comingSoon')}
                </button>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
