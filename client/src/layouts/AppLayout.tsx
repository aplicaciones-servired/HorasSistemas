import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { to: '/novedades', label: 'Novedades' },
  { to: '/usuarios', label: 'Usuarios' },
  { to: '/cargos', label: 'Cargos' },
  { to: '/turnos', label: 'Turnos' }
];

export const AppLayout = () => {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Horas Sistemas</span>
          <h1>Control de nómina y asistencia</h1>
        </div>

        <nav className="topnav" aria-label="Navegación principal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `topnav-link${isActive ? ' topnav-link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Outlet />
    </div>
  );
};