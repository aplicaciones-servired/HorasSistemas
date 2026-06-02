import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { AppLayout } from './layouts/AppLayout';
import { CargosPage } from './pages/CargosPage';
import { NovedadesPage } from './pages/NovedadesPage';
import { UsuariosPage } from './pages/UsuariosPage';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/novedades" replace />} />
        <Route path="/novedades" element={<NovedadesPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
        <Route path="/cargos" element={<CargosPage />} />
      </Route>
    </Routes>
  );
}

export default App;
