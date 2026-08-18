import { api } from './api';
import type { Turno, TurnoFormValues } from '../types/domain';

export const listTurnos = async (): Promise<Turno[]> => {
  const response = await api.get<Turno[]>('/turnos');
  return response.data;
};

export const createTurno = async (values: TurnoFormValues): Promise<Turno> => {
  const response = await api.post<Turno>('/turnos', values);
  return response.data;
};

export const updateTurno = async (id: number, values: TurnoFormValues): Promise<Turno> => {
  const response = await api.put<Turno>(`/turnos/${id}`, values);
  return response.data;
};

export const deleteTurno = async (id: number): Promise<void> => {
  await api.delete(`/turnos/${id}`);
};
