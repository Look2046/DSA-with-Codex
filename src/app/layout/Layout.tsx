import { Link, Outlet } from 'react-router-dom';

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
        <h1>DSA Visualizor</h1>
        <nav>
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className="nav-link">
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
