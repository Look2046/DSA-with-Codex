import { NavLink, Outlet } from 'react-router-dom';
import { useI18n } from '../../i18n/useI18n';

export function Layout() {
  const { language, toggleLanguage, t } = useI18n();

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/modules', label: t('nav.modules') },
    { to: '/modules/sorting', label: t('nav.sortingOverview') },
    { to: '/about', label: t('nav.about') },
  ];

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>{t('app.title')}</h1>
          <p className="app-subtitle">{t('app.subtitle')}</p>
        </div>

        <div className="header-controls">
          <nav className="app-nav">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/modules'}
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
