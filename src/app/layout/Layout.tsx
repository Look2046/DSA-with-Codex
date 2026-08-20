import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { moduleRegistry } from '../../data/moduleRegistry';
import { useI18n } from '../../i18n/useI18n';
import { rememberModuleVisit } from '../recentModuleVisits';

export function Layout() {
  const { language, toggleLanguage, t } = useI18n();
  const location = useLocation();

  const navLinks = [
    { to: '/modules', label: t('nav.modules'), end: false },
    { to: '/about', label: t('nav.about'), end: false },
  ];

  useEffect(() => {
    const matchedModule = moduleRegistry.find((moduleItem) => moduleItem.implemented && moduleItem.route === location.pathname);
    if (matchedModule) {
      rememberModuleVisit(matchedModule.route);
    }
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link className="app-brand app-brand-link" to="/modules" aria-label={t('nav.modules')}>
          <h1>{t('app.title')}</h1>
          <p className="app-subtitle">{t('app.subtitle')}</p>
        </Link>

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
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
