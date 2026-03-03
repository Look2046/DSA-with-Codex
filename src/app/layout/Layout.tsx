import { NavLink, Outlet } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/modules', label: 'Modules' },
  { to: '/modules/sorting', label: 'Sorting Overview' },
  { to: '/about', label: 'About' },
];

export function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>DSA Visualizor</h1>
          <p className="app-subtitle">Data Structures and Algorithms, Visual First.</p>
        </div>
        <nav className="app-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
