import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { CargosPage } from './pages/CargosPage';
import { LoginPage } from './pages/LoginPage';
import { NovedadesPage } from './pages/NovedadesPage';
import { TurnosPage } from './pages/TurnosPage';
import { UsuariosPage } from './pages/UsuariosPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/novedades" replace />} />
          <Route path="/novedades" element={<NovedadesPage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/cargos" element={<CargosPage />} />
          <Route path="/turnos" element={<TurnosPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
