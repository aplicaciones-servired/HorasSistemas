import { api } from './api';
import type { RegistroAsistencia } from '../types/domain';

export interface RegistroPayload {
  personaId: number;
  cargoId: number | null;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  observacion: string | null;
  esDominical: boolean;
}

export const listRegistros = async (): Promise<RegistroAsistencia[]> => {
  const response = await api.get<RegistroAsistencia[]>('/registros');
  return response.data;
};

export const createRegistro = async (payload: RegistroPayload): Promise<RegistroAsistencia> => {
  const response = await api.post<RegistroAsistencia>('/registros', payload);
  return response.data;
};

export const updateRegistro = async (id: number, payload: RegistroPayload): Promise<RegistroAsistencia> => {
  const response = await api.put<RegistroAsistencia>(`/registros/${id}`, payload);
  return response.data;
};