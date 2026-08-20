import { createContext } from 'react';
import type { User } from '../types/domain';

export interface AuthContextValue {
  user: User | null;
  userCompany: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
