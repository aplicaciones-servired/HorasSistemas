import { api } from './api';
import type { Cargo, CargoFormValues } from '../types/domain';

export const listCargos = async (): Promise<Cargo[]> => {
  const response = await api.get<Cargo[]>('/cargos');
  return response.data;
};

export const createCargo = async (values: CargoFormValues): Promise<Cargo> => {
  const response = await api.post<Cargo>('/cargos', values);
  return response.data;
};