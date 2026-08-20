import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';
import { useToast } from '../components/toast/useToast';
import { getApiErrorMessage } from '../services/api';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error('Ingresa usuario y contraseña');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(username.trim(), password);
      navigate('/novedades', { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Error al iniciar sesión'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-header">
          <span className="eyebrow">Horas Sistemas</span>
          <h1>Iniciar sesión</h1>
          <p>Ingresa tus credenciales para acceder al sistema</p>
        </div>

        <form className="stack-form login-form" onSubmit={handleSubmit}>
          <label>
            Usuario
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu usuario"
              autoComplete="username"
              autoFocus
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              autoComplete="current-password"
            />
          </label>

          <button
            type="submit"
            className="primary-button login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};
