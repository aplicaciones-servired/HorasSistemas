import axios from 'axios';
import { URL_DATA_HORAS } from '../util/const';

export const api = axios.create({
  baseURL: URL_DATA_HORAS,
  timeout: 15000
});

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { message?: string } | undefined;
    return payload?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};