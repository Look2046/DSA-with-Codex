import { useDeferredValue, useMemo, useState, type SVGProps } from 'react';
import { Link } from 'react-router-dom';
import { readRecentModuleVisits } from '../app/recentModuleVisits';
import { moduleRegistry } from '../data/moduleRegistry';
import { translations } from '../i18n/translations';
import { useI18n } from '../i18n/useI18n';
import type { ModuleCategory, ModuleMetadata } from '../types/module';
import { getModuleTitleKeyById, MODULE_CATEGORY_ORDER } from './moduleCatalog';

type HomeModule = ModuleMetadata & {
  title: string;
  searchText: string;
};

type HomeSection = {
  category: ModuleCategory;
  title: string;
  anchor: string;
  modules: HomeModule[];
};

type HomeIconKind = ModuleCategory | 'home' | 'magnify' | 'recent' | 'star' | 'open';

const HOME_EXPANDED_CATEGORIES_KEY = 'dsa-visualizer-home-expanded-categories';

const HOME_CATEGORY_LABELS: Record<ModuleCategory, string> = {
  linear: '线性结构',
  tree: '树结构',
  graph: '图结构',
  sort: '排序算法',
  search: '查找算法',
  string: '字符串',
  hash: '哈希表',
  storage: '数组与广义表',
  paradigm: '算法范式',
};

const HOME_CATEGORY_ANCHORS: Record<ModuleCategory, string> = {
  linear: 'linear',
  tree: 'tree',
  graph: 'graph',
  sort: 'sort',
  search: 'search',
  string: 'string',
  hash: 'hash',
  storage: 'storage',
  paradigm: 'paradigm',
};

const QUICK_MODULE_IDS = ['L-03', 'T-02', 'G-03', 'S-05', 'SR-02', 'ST-01'];
const FAVORITE_MODULE_IDS = ['L-03', 'G-01', 'SR-02', 'T-05', 'H-01'];
const MAX_SECTION_MODULES = 6;
const MAX_RECENT_MODULES = 5;

function isModuleCategory(value: string): value is ModuleCategory {
  return MODULE_CATEGORY_ORDER.includes(value as ModuleCategory);
}

function readExpandedCategories(defaultValue: ModuleCategory[]): ModuleCategory[] {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const rawValue = window.localStorage.getItem(HOME_EXPANDED_CATEGORIES_KEY);
    if (!rawValue) {
      return defaultValue;
    }

    const parsedValue: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) {
      return defaultValue;
    }

    const categories = parsedValue.filter((item): item is ModuleCategory => typeof item === 'string' && isModuleCategory(item));
    return categories.length > 0 ? categories : defaultValue;
  } catch {
    return defaultValue;
  }
}

function writeExpandedCategories(categories: ModuleCategory[]) {
  try {
    window.localStorage.setItem(HOME_EXPANDED_CATEGORIES_KEY, JSON.stringify(categories));
  } catch {
    // Keep navigation usable even when localStorage is unavailable.
  }
}

function stripModulePrefix(moduleId: string, title: string): string {
  const prefix = `${moduleId} `;
  return title.startsWith(prefix) ? title.slice(prefix.length) : title;
}

function createHomeModule(moduleItem: ModuleMetadata, language: 'en' | 'zh'): HomeModule {
  const titleKey = getModuleTitleKeyById(moduleItem.id);
  const zhTitle = stripModulePrefix(moduleItem.id, translations.zh[titleKey] ?? moduleItem.name);
  const enTitle = stripModulePrefix(moduleItem.id, translations.en[titleKey] ?? moduleItem.name);
  const title = language === 'zh' ? zhTitle : enTitle;

  return {
    ...moduleItem,
    title,
    searchText: [moduleItem.id, moduleItem.name, zhTitle, enTitle, moduleItem.route, HOME_CATEGORY_LABELS[moduleItem.category]]
      .join(' ')
      .toLowerCase(),
  };
}

function HomeIcon({ kind, ...props }: { kind: HomeIconKind } & SVGProps<SVGSVGElement>) {
  const baseProps: SVGProps<SVGSVGElement> = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': 'true',
    ...props,
  };

  switch (kind) {
    case 'home':
      return (
        <svg {...baseProps}>
          <path d="m4 10 8-6 8 6" />
          <path d="M6.5 9.5V20h11V9.5" />
          <path d="M10 20v-6h4v6" />
        </svg>
      );
    case 'magnify':
      return (
        <svg {...baseProps}>
          <circle cx="10.5" cy="10.5" r="5.5" />
          <path d="m15 15 4.5 4.5" />
        </svg>
      );
    case 'recent':
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    case 'star':
      return (
        <svg {...baseProps}>
          <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
        </svg>
      );
    case 'open':
      return (
        <svg {...baseProps}>
          <path d="M8 12h8" />
          <path d="m13 7 5 5-5 5" />
        </svg>
      );
    case 'linear':
      return (
        <svg {...baseProps}>
          <path d="M5 12h14" />
          <circle cx="6" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="18" cy="12" r="2" />
        </svg>
      );
    case 'tree':
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="5" r="2" />
          <circle cx="6" cy="18" r="2" />
          <circle cx="18" cy="18" r="2" />
          <path d="M12 7v4" />
          <path d="m12 11-6 5" />
          <path d="m12 11 6 5" />
        </svg>
      );
    case 'graph':
      return (
        <svg {...baseProps}>
          <circle cx="6" cy="7" r="2" />
          <circle cx="18" cy="6" r="2" />
          <circle cx="12" cy="18" r="2" />
          <path d="M8 7h8" />
          <path d="M7 9 11 16" />
          <path d="m17 8-4 8" />
        </svg>
      );
    case 'sort':
      return (
        <svg {...baseProps}>
          <path d="M6 18V10" />
          <path d="M12 18V6" />
          <path d="M18 18v-5" />
          <path d="M4 18h16" />
        </svg>
      );
    case 'search':
      return (
        <svg {...baseProps}>
          <circle cx="10" cy="10" r="4.5" />
          <path d="m14 14 5 5" />
          <path d="M8.5 10h3" />
        </svg>
      );
    case 'storage':
      return (
        <svg {...baseProps}>
          <rect x="4" y="5" width="16" height="12" rx="2" />
          <path d="M8 9h8" />
          <path d="M8 13h8" />
          <path d="M7 20h10" />
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
          <path d="M5 8c0-1.7 1.3-3 3-3h3c1.7 0 3 1.3 3 3s-1.3 3-3 3H9c-1.7 0-3 1.3-3 3s1.3 3 3 3h3c1.7 0 3-1.3 3-3" />
        </svg>
      );
    case 'paradigm':
      return (
        <svg {...baseProps}>
          <path d="M12 4v5" />
          <path d="M12 9 6 15" />
          <path d="m12 9 6 6" />
          <path d="M6 15v5" />
          <path d="M18 15v5" />
        </svg>
      );
  }
}

function ModuleSketch({ category }: { category: ModuleCategory }) {
  return (
    <div className={`quick-home-sketch quick-home-sketch-${category}`} aria-hidden="true">
      <HomeIcon kind={category} />
    </div>
  );
}

function ModuleCard({ moduleItem }: { moduleItem: HomeModule }) {
  return (
    <article className={`quick-home-module-card quick-home-tone-${moduleItem.category}`}>
      <div className="quick-home-module-top">
        <strong>{moduleItem.title}</strong>
        <span>{moduleItem.id}</span>
      </div>
      <ModuleSketch category={moduleItem.category} />
      <Link className="quick-home-enter" to={moduleItem.route}>
        进入
      </Link>
    </article>
  );
}

function SidebarCategory({
  category,
  modules,
  expanded,
  onToggle,
}: {
  category: ModuleCategory;
  modules: HomeModule[];
  expanded: boolean;
  onToggle: (category: ModuleCategory) => void;
}) {
  return (
    <div className={`quick-home-tree-group quick-home-tone-${category}`}>
      <button
        type="button"
        className={`quick-home-side-link quick-home-tree-toggle${expanded ? ' quick-home-tree-toggle-open' : ''}`}
        onClick={() => onToggle(category)}
        aria-expanded={expanded}
        aria-controls={`quick-home-tree-${category}`}
      >
        <HomeIcon kind={category} />
        <span>{HOME_CATEGORY_LABELS[category]}</span>
        <span className="quick-home-tree-caret" aria-hidden="true">
          {expanded ? '-' : '+'}
        </span>
      </button>

      {expanded ? (
        <div className="quick-home-tree-children" id={`quick-home-tree-${category}`}>
          {modules.map((moduleItem) => (
            <Link key={moduleItem.id} to={moduleItem.route} className="quick-home-tree-module">
              <span>{moduleItem.title}</span>
              <small>{moduleItem.id}</small>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function HomePage() {
  const { language } = useI18n();
  const [query, setQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<ModuleCategory[]>(() => readExpandedCategories(['linear', 'tree']));
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const modules = useMemo(
    () =>
      moduleRegistry
        .filter((moduleItem) => moduleItem.implemented)
        .map((moduleItem) => createHomeModule(moduleItem, language)),
    [language],
  );

  const filteredModules = useMemo(() => {
    if (!deferredQuery) {
      return modules;
    }

    return modules.filter((moduleItem) => moduleItem.searchText.includes(deferredQuery));
  }, [deferredQuery, modules]);

  const sections = useMemo<HomeSection[]>(
    () =>
      MODULE_CATEGORY_ORDER.map((category) => ({
        category,
        title: HOME_CATEGORY_LABELS[category],
        anchor: HOME_CATEGORY_ANCHORS[category],
        modules: filteredModules
          .filter((moduleItem) => moduleItem.category === category)
          .sort((left, right) => left.id.localeCompare(right.id))
          .slice(0, MAX_SECTION_MODULES),
      })).filter((section) => section.modules.length > 0),
    [filteredModules],
  );

  const modulesByCategory = useMemo(
    () =>
      MODULE_CATEGORY_ORDER.reduce<Record<ModuleCategory, HomeModule[]>>((accumulator, category) => {
        accumulator[category] = modules
          .filter((moduleItem) => moduleItem.category === category)
          .sort((left, right) => left.id.localeCompare(right.id));
        return accumulator;
      }, {} as Record<ModuleCategory, HomeModule[]>),
    [modules],
  );

  const recentModules = useMemo(
    () =>
      readRecentModuleVisits()
        .map((route) => modules.find((moduleItem) => moduleItem.route === route))
        .filter((moduleItem): moduleItem is HomeModule => moduleItem !== undefined)
        .slice(0, MAX_RECENT_MODULES),
    [modules],
  );

  const quickModules = useMemo(
    () =>
      QUICK_MODULE_IDS.map((id) => modules.find((moduleItem) => moduleItem.id === id)).filter(
        (moduleItem): moduleItem is HomeModule => moduleItem !== undefined,
      ),
    [modules],
  );

  const favoriteModules = useMemo(
    () =>
      FAVORITE_MODULE_IDS.map((id) => modules.find((moduleItem) => moduleItem.id === id)).filter(
        (moduleItem): moduleItem is HomeModule => moduleItem !== undefined,
      ),
    [modules],
  );

  const toggleCategory = (category: ModuleCategory) => {
    setExpandedCategories((previous) => {
      const next = previous.includes(category) ? previous.filter((item) => item !== category) : [...previous, category];
      writeExpandedCategories(next);
      return next;
    });
  };

  const expandCategory = (category: ModuleCategory) => {
    setExpandedCategories((previous) => {
      if (previous.includes(category)) {
        return previous;
      }

      const next = [...previous, category];
      writeExpandedCategories(next);
      return next;
    });
  };

  return (
    <section className="quick-home-page" aria-label="首页快速导航">
      <aside className="quick-home-sidebar" aria-label="课程导航">
        <a href="#quick-home-top" className="quick-home-side-link quick-home-side-link-active">
          <HomeIcon kind="home" />
          <span>首页</span>
        </a>
        {MODULE_CATEGORY_ORDER.map((category) => (
          <SidebarCategory
            key={category}
            category={category}
            modules={modulesByCategory[category]}
            expanded={expandedCategories.includes(category)}
            onToggle={toggleCategory}
          />
        ))}
      </aside>

      <div className="quick-home-main" id="quick-home-top">
        <header className="quick-home-toolbar">
          <div className="quick-home-title">
            <h2>全部模块</h2>
            <span>{filteredModules.length} 个入口</span>
          </div>

          <label className="quick-home-search">
            <HomeIcon kind="magnify" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索模块（如：二叉树、快速排序）"
              aria-label="搜索模块"
            />
          </label>
        </header>

        <div className="quick-home-content">
          <main className="quick-home-sections" aria-label="模块目录">
            {sections.length > 0 ? (
              sections.map((section) => (
                <section key={section.category} className={`quick-home-section quick-home-tone-${section.category}`} id={section.anchor}>
                  <div className="quick-home-section-head">
                    <div>
                      <h3>{section.title}</h3>
                    </div>
                    <button type="button" className="quick-home-more" onClick={() => expandCategory(section.category)}>
                      展开左侧
                    </button>
                  </div>

                  <div className="quick-home-module-grid">
                    {section.modules.map((moduleItem) => (
                      <ModuleCard key={moduleItem.id} moduleItem={moduleItem} />
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <section className="quick-home-empty">
                <h3>没有找到模块</h3>
                <button type="button" onClick={() => setQuery('')}>
                  清空搜索
                </button>
              </section>
            )}
          </main>

          <aside className="quick-home-aside" aria-label="快速入口">
            <section className="quick-home-panel">
              <div className="quick-home-panel-head">
                <h3>最近访问</h3>
                <HomeIcon kind="recent" />
              </div>
              <div className="quick-home-link-list">
                {(recentModules.length > 0 ? recentModules : quickModules.slice(0, 5)).map((moduleItem) => (
                  <Link key={moduleItem.route} to={moduleItem.route} className="quick-home-list-link">
                    <HomeIcon kind={moduleItem.category} />
                    <span>{moduleItem.title}</span>
                    <small>{moduleItem.id}</small>
                  </Link>
                ))}
              </div>
            </section>

            <section className="quick-home-panel">
              <div className="quick-home-panel-head">
                <h3>常用入口</h3>
                <HomeIcon kind="open" />
              </div>
              <div className="quick-home-link-list">
                {quickModules.map((moduleItem) => (
                  <Link key={moduleItem.route} to={moduleItem.route} className="quick-home-list-link">
                    <HomeIcon kind={moduleItem.category} />
                    <span>{moduleItem.title}</span>
                    <small>进入</small>
                  </Link>
                ))}
              </div>
            </section>

            <section className="quick-home-panel">
              <div className="quick-home-panel-head">
                <h3>收藏模块</h3>
                <HomeIcon kind="star" />
              </div>
              <div className="quick-home-link-list">
                {favoriteModules.map((moduleItem) => (
                  <Link key={moduleItem.route} to={moduleItem.route} className="quick-home-list-link">
                    <HomeIcon kind="star" />
                    <span>{moduleItem.title}</span>
                    <small>{HOME_CATEGORY_LABELS[moduleItem.category]}</small>
                  </Link>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
