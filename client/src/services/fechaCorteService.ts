import { api } from './api';
import type { FechaCorte, RegistroAsistencia } from '../types/domain';

export interface FechaCortePayload {
  fechaInicio: string;
  fechaFin: string;
  descripcion?: string;
}

export const fechaCorteService = {
  async list(empresa?: string): Promise<FechaCorte[]> {
    const params: any = {};
    if (empresa) params.empresa = empresa;
    const response = await api.get<FechaCorte[]>('/fechas-corte', { params });
    return response.data;
  },

  async get(id: number): Promise<FechaCorte> {
    const response = await api.get<FechaCorte>(`/fechas-corte/${id}`);
    return response.data;
  },

  async create(payload: FechaCortePayload): Promise<FechaCorte> {
    const response = await api.post<FechaCorte>('/fechas-corte', payload);
    return response.data;
  },

  async update(id: number, payload: Partial<FechaCortePayload>): Promise<FechaCorte> {
    const response = await api.put<FechaCorte>(`/fechas-corte/${id}`, payload);
    return response.data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/fechas-corte/${id}`);
  },

  async finalizar(id: number, empresa?: string): Promise<Blob> {
    const params: any = {};
    if (empresa) params.empresa = empresa;
    const response = await api.post(`/fechas-corte/${id}/finalizar`, null, {
      responseType: 'blob',
      params
    });
    return response.data;
  },

  async listRegistros(id: number): Promise<RegistroAsistencia[]> {
    const response = await api.get<RegistroAsistencia[]>(`/fechas-corte/${id}/registros`);
    return response.data;
  }
};
