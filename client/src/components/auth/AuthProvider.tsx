import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from './AuthContext';
import type { User } from '../../types/domain';
import * as authService from '../../services/authService';

const USER_STORAGE_KEY = 'horas_user';
const COMPANY_STORAGE_KEY = 'horas_company';

const loadUser = (): User | null => {
  try {
    const raw = sessionStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const loadCompany = (): string => {
  return sessionStorage.getItem(COMPANY_STORAGE_KEY) || '';
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(loadUser);
  const [userCompany, setUserCompany] = useState<string>(loadCompany);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authService.login(username, password);
    if (!response.user) {
      throw new Error(response.message || 'Credenciales incorrectas');
    }
    setUser(response.user);
    setUserCompany(response.company || '');
    sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));
    sessionStorage.setItem(COMPANY_STORAGE_KEY, response.company || '');
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setUserCompany('');
      sessionStorage.removeItem(USER_STORAGE_KEY);
      sessionStorage.removeItem(COMPANY_STORAGE_KEY);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      userCompany,
      isAuthenticated: !!user,
      login,
      logout
    }),
    [user, userCompany, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
