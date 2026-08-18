import { api } from './api';
import type { RegistroAsistencia } from '../types/domain';

export interface RegistroPayload {
  personaId: number;
  cargoId: number | null;
  fechaCorteId: number | null;
  fecha: string;
  horaEntrada: string;
  horaSalida: string;
  observacion: string | null;
  esDominical: boolean;
}

export const listRegistros = async (fechaCorteId?: number): Promise<RegistroAsistencia[]> => {
  const params: any = {};
  if (fechaCorteId) params.fechaCorteId = fechaCorteId;
  const response = await api.get<RegistroAsistencia[]>('/registros', { params });
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

export const deleteRegistro = async (id: number): Promise<void> => {
  await api.delete(`/registros/${id}`);
};