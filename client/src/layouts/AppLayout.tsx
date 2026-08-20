import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';

const navItems = [
  { to: '/novedades', label: 'Novedades' },
  { to: '/usuarios', label: 'Usuarios' },
  { to: '/cargos', label: 'Cargos' },
  { to: '/turnos', label: 'Turnos' }
];

export const AppLayout = () => {
  const { user, userCompany, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">Horas Sistemas</span>
          <h1>Control de nómina y asistencia</h1>
        </div>

        <div className="topbar-right">
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

          {user && (
            <div className="user-session">
              <div className="user-session__info">
                <span className="user-session__name">{user.names} {user.lastnames}</span>
                {userCompany && <span className="user-session__company">{userCompany}</span>}
              </div>
              <button type="button" className="ghost-button" onClick={logout}>
                Salir
              </button>
            </div>
          )}
        </div>
      </header>

      <Outlet />
    </div>
  );
};
