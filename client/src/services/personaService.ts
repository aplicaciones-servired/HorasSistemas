import { api } from './api';
import type { Persona } from '../types/domain';

export interface PersonaPayload {
  cedula: string;
  nombres: string;
  apellidos: string;
  empresa: string | null;
  cargoId: number | null;
  activo?: boolean;
}

export const listPersonas = async (): Promise<Persona[]> => {
  const response = await api.get<Persona[]>('/personas');
  return response.data;
};

export const findPersonaByCedula = async (cedula: string): Promise<Persona> => {
  const response = await api.get<Persona>(`/personas/cedula/${encodeURIComponent(cedula)}`);
  return response.data;
};

export const createPersona = async (payload: PersonaPayload): Promise<Persona> => {
  const response = await api.post<Persona>('/personas', payload);
  return response.data;
};

export const updatePersona = async (id: number, payload: PersonaPayload): Promise<Persona> => {
  const response = await api.put<Persona>(`/personas/${id}`, payload);
  return response.data;
};

export const deletePersona = async (id: number): Promise<void> => {
  await api.delete(`/personas/${id}`);
};