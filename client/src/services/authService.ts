import axios from 'axios';
import { URL_LOGIN } from '../util/const';
import type { LoginResponse } from '../types/domain';

const authApi = axios.create({
  baseURL: URL_LOGIN,
  timeout: 15000,
  withCredentials: true
});

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const { data } = await authApi.post<LoginResponse>('/login', { username, password });
  return data;
};

export const logout = async (): Promise<void> => {
  await authApi.post('/logout');
};
