import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { moduleRegistry } from '../../data/moduleRegistry';
import type { TranslationKey } from '../../i18n/translations';
import { useI18n } from '../../i18n/useI18n';
import { getModuleTitleKeyById, MODULE_CATEGORY_META, MODULE_CATEGORY_ORDER } from '../../pages/moduleCatalog';
import { rememberModuleVisit } from '../recentModuleVisits';

const MODULE_TITLE_KEY_BY_ROUTE = new Map(
  moduleRegistry
    .filter((moduleItem) => moduleItem.implemented)
    .map((moduleItem) => [
      moduleItem.route,
      getModuleTitleKeyById(moduleItem.id),
    ]),
);

function getPageTitle(pathname: string, t: (key: TranslationKey) => string) {
  const moduleTitleKey = MODULE_TITLE_KEY_BY_ROUTE.get(pathname);
  if (moduleTitleKey) {
    return t(moduleTitleKey);
  }

  switch (pathname) {
    case '/':
      return t('app.title');
    case '/modules':
      return t('modules.launch.title');
    case '/modules/sorting':
      return t('sorting.title');
    case '/about':
      return t('about.title');
    default:
      return t('notFound.title');
  }
}

function getModuleTreeTitle(moduleId: string, route: string, t: (key: TranslationKey) => string) {
  const title = getPageTitle(route, t);
  return title.replace(new RegExp(`^${moduleId}\\s*`), '');
}

const CATEGORY_ICON: Record<string, string> = {
  linear: '↔',
  storage: '▦',
  sort: '↕',
  search: '⌕',
  tree: '┬',
  graph: '⌘',
  hash: '#',
  string: 'S',
  paradigm: '◇',
};

const MODULE_TREE_EXPANDED_CATEGORIES_KEY = 'dsa-visualizer-module-tree-expanded-categories';

function isModuleCategory(value: string) {
  return MODULE_CATEGORY_ORDER.includes(value as (typeof MODULE_CATEGORY_ORDER)[number]);
}

function readModuleTreeExpandedCategories(defaultValue: string[]) {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const rawValue = window.localStorage.getItem(MODULE_TREE_EXPANDED_CATEGORIES_KEY);
    if (!rawValue) {
      return defaultValue;
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return defaultValue;
    }

    const categories = parsedValue.filter((item): item is string => typeof item === 'string' && isModuleCategory(item));
    return categories.length > 0 ? categories : defaultValue;
  } catch {
    return defaultValue;
  }
}

function writeModuleTreeExpandedCategories(categories: string[]) {
  try {
    window.localStorage.setItem(MODULE_TREE_EXPANDED_CATEGORIES_KEY, JSON.stringify(categories));
  } catch {
    // Keep module navigation usable even when localStorage is unavailable.
  }
}

export function Layout() {
  const { language, toggleLanguage, t } = useI18n();
  const location = useLocation();
  const [isModuleRailExpanded, setIsModuleRailExpanded] = useState(false);
  const [expandedModuleTreeCategories, setExpandedModuleTreeCategories] = useState<string[]>(() =>
    readModuleTreeExpandedCategories(['linear', 'tree']),
  );
  const moduleTreeRef = useRef<HTMLDivElement | null>(null);
  const pendingModuleTreeCenterRef = useRef<{ category?: string; route?: string } | null>(null);

  const navLinks = [
    { to: '/', label: t('nav.modules'), end: true },
    { to: '/about', label: t('nav.about'), end: false },
  ];
  const activeModule = moduleRegistry.find((moduleItem) => moduleItem.implemented && moduleItem.route === location.pathname);
  const isModuleWorkbench = Boolean(activeModule);

  const requestModuleTreeCenter = (category?: string) => {
    const targetCategory = category ?? activeModule?.category;
    pendingModuleTreeCenterRef.current = {
      category: targetCategory,
      route: activeModule && (!targetCategory || activeModule.category === targetCategory) ? activeModule.route : undefined,
    };
  };

  useEffect(() => {
    const matchedModule = moduleRegistry.find((moduleItem) => moduleItem.implemented && moduleItem.route === location.pathname);
    if (matchedModule) {
      rememberModuleVisit(matchedModule.route);
    }
  }, [location.pathname]);

  useEffect(() => {
    const appTitle = t('app.title');
    const pageTitle = getPageTitle(location.pathname, t);
    document.title = pageTitle === appTitle ? appTitle : `${pageTitle} | ${appTitle}`;
  }, [language, location.pathname, t]);

  useEffect(() => {
    if (!isModuleRailExpanded || !pendingModuleTreeCenterRef.current) {
      return undefined;
    }

    const centerPendingModuleTreeTarget = (behavior: ScrollBehavior) => {
      const moduleTree = moduleTreeRef.current;
      const pendingTarget = pendingModuleTreeCenterRef.current;
      if (!moduleTree || !pendingTarget) {
        return;
      }

      let targetElement: HTMLElement | null = null;
      if (pendingTarget.route) {
        targetElement = moduleTree.querySelector<HTMLElement>('.app-module-tree-link-active');
      }

      if (!targetElement && pendingTarget.category) {
        targetElement = moduleTree.querySelector<HTMLElement>(`[data-module-category="${pendingTarget.category}"]`);
      }

      const rail = moduleTree.closest<HTMLElement>('.app-module-rail');
      if (targetElement && rail) {
        const railRect = rail.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const targetCenter = targetRect.top + targetRect.height / 2;
        const railCenter = railRect.top + railRect.height / 2;
        rail.scrollTo({
          top: rail.scrollTop + targetCenter - railCenter,
          behavior,
        });
        return;
      }

      targetElement?.scrollIntoView({
        block: 'center',
        inline: 'nearest',
        behavior,
      });
    };

    const frameId = window.requestAnimationFrame(() => {
      centerPendingModuleTreeTarget('auto');
    });
    const timeoutId = window.setTimeout(() => {
      centerPendingModuleTreeTarget('auto');
      pendingModuleTreeCenterRef.current = null;
    }, 260);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [expandedModuleTreeCategories, isModuleRailExpanded, location.pathname]);

  const toggleModuleTreeCategory = (category: string) => {
    setExpandedModuleTreeCategories((previous) => {
      const next = previous.includes(category)
        ? previous.filter((item) => item !== category)
        : [...previous, category];
      writeModuleTreeExpandedCategories(next);
      return next;
    });
  };

  const openModuleRail = (category?: string) => {
    requestModuleTreeCenter(category);
    setIsModuleRailExpanded(true);
    if (!category) {
      return;
    }

    setExpandedModuleTreeCategories((previous) => {
      if (previous.includes(category)) {
        return previous;
      }

      const next = [...previous, category];
      writeModuleTreeExpandedCategories(next);
      return next;
    });
  };

  return (
    <div
      className={isModuleWorkbench ? 'app-shell app-shell-module' : 'app-shell'}
      data-module-rail-expanded={isModuleRailExpanded ? 'true' : 'false'}
    >
      <header className="app-header">
        <Link className="app-brand app-brand-link" to="/" aria-label={t('nav.modules')}>
          <span className="app-brand-mark" aria-hidden="true">◇</span>
          <span className="app-brand-copy">
          <h1>{t('app.title')}</h1>
          </span>
        </Link>

        {activeModule ? (
          <div className="app-module-picker" aria-label={t('nav.modules')}>
            <span>{t(MODULE_CATEGORY_META[activeModule.category].label)}</span>
            <strong>{getPageTitle(location.pathname, t)}</strong>
          </div>
        ) : null}

        <div className="header-controls">
          <nav className="app-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <button type="button" className="language-toggle" onClick={toggleLanguage} aria-label={t('app.switchLanguage')}>
            {language === 'en' ? '中文' : 'EN'}
          </button>
        </div>
      </header>
      {isModuleWorkbench ? (
        <aside className="app-module-rail" aria-label={t('nav.modules')}>
          <button
            type="button"
            className="app-module-rail-toggle"
            onClick={() => {
              if (isModuleRailExpanded) {
                setIsModuleRailExpanded(false);
                return;
              }

              openModuleRail(activeModule?.category);
            }}
            aria-pressed={isModuleRailExpanded}
            aria-label={isModuleRailExpanded ? t('workspace.sidebar.collapse') : t('workspace.sidebar.expand')}
            title={isModuleRailExpanded ? t('workspace.sidebar.collapse') : t('workspace.sidebar.expand')}
          >
            <span aria-hidden="true">{isModuleRailExpanded ? '‹' : '›'}</span>
          </button>
          <div className="app-module-rail-collapsed" aria-hidden={isModuleRailExpanded}>
            {MODULE_CATEGORY_ORDER.map((category) => {
              const firstModule = moduleRegistry.find((moduleItem) => moduleItem.implemented && moduleItem.category === category);
              if (!firstModule) {
                return null;
              }

              const isActive = activeModule?.category === category;
              return (
                <button
                  type="button"
                  key={category}
                  className={isActive ? 'app-module-rail-item app-module-rail-item-active' : 'app-module-rail-item'}
                  onClick={() => openModuleRail(category)}
                  title={t(MODULE_CATEGORY_META[category].label)}
                >
                  <span className="app-module-rail-icon" aria-hidden="true">{CATEGORY_ICON[category]}</span>
                  <span>{t(MODULE_CATEGORY_META[category].label).replace('结构', '').replace('算法', '')}</span>
                </button>
              );
            })}
            <button
              type="button"
              className="app-module-rail-item app-module-rail-search"
              onClick={() => openModuleRail(activeModule?.category)}
            >
              <span className="app-module-rail-icon" aria-hidden="true">⌕</span>
              <span>{t('nav.modules')}</span>
            </button>
          </div>

          <div ref={moduleTreeRef} className="app-module-tree" aria-hidden={!isModuleRailExpanded}>
            <div className="app-module-tree-title">
              <span>{t('workspace.sidebar.moduleTree')}</span>
              <strong>{t('nav.modules')}</strong>
            </div>
            {MODULE_CATEGORY_ORDER.map((category) => {
              const modules = moduleRegistry.filter((moduleItem) => moduleItem.implemented && moduleItem.category === category);
              if (modules.length === 0) {
                return null;
              }

              const isActiveCategory = activeModule?.category === category;
              const isExpandedCategory = expandedModuleTreeCategories.includes(category);
              return (
                <section key={category} className="app-module-tree-group" data-module-category={category}>
                  <button
                    type="button"
                    className={isActiveCategory ? 'app-module-tree-group-title app-module-tree-group-title-active' : 'app-module-tree-group-title'}
                    onClick={() => toggleModuleTreeCategory(category)}
                    aria-expanded={isExpandedCategory}
                    aria-controls={`app-module-tree-${category}`}
                  >
                    <span className="app-module-tree-group-icon" aria-hidden="true">{CATEGORY_ICON[category]}</span>
                    <span>{t(MODULE_CATEGORY_META[category].label)}</span>
                    <span className="app-module-tree-caret" aria-hidden="true">{isExpandedCategory ? '-' : '+'}</span>
                  </button>
                  {isExpandedCategory ? (
                    <div className="app-module-tree-list" id={`app-module-tree-${category}`}>
                      {modules.map((moduleItem) => {
                        const isActive = activeModule?.route === moduleItem.route;
                        return (
                          <Link
                            key={moduleItem.id}
                            className={isActive ? 'app-module-tree-link app-module-tree-link-active' : 'app-module-tree-link'}
                            to={moduleItem.route}
                          >
                            <span>{moduleItem.id}</span>
                            <strong>{getModuleTreeTitle(moduleItem.id, moduleItem.route, t)}</strong>
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </aside>
      ) : null}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
