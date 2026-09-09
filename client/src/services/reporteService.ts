import { api } from './api';

function downloadBlob(data: Blob, filename: string): void {
  const url = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export interface PreviewData {
  periodo: string;
  empresa: string | null;
  compania: string;
  elaboradoPor: string;
  rows: Array<{
    no: number;
    nombre: string;
    cedula: string;
    cargo: string;
    fecha: string;
    horaEntrada: string;
    horaSalida: string;
    recargoNocturnoOrdinario: number | '';
    recargoNocturnoFestivo: number | '';
    extraDiurna: number | '';
    extraNocturna: number | '';
    dominicalDiurna: number | '';
    dominicalNocturna: number | '';
    extraDominicalDiurna: number | '';
    extraDominicalNocturna: number | '';
  }>;
}

export const reporteService = {
  async descargarHorasExtras(fechaCorteId?: number, empresa?: string, sinEmail = false) {
    const params: Record<string, string | number> = {};
    if (fechaCorteId) params.fechaCorteId = fechaCorteId;
    if (empresa) params.empresa = empresa;
    if (sinEmail) params.sinEmail = '1';
    const response = await api.get('/horas-extras/descargar', {
      responseType: 'blob',
      params
    });

    const fecha = new Date().toISOString().split('T')[0];
    const empresaLabel = empresa ? `_${empresa}` : '';
    downloadBlob(response.data, `horas_extras${empresaLabel}_${fecha}.xlsx`);
  },

  async obtenerVistaPrevia(fechaCorteId?: number, empresa?: string): Promise<PreviewData> {
    const params: Record<string, string | number> = {};
    if (fechaCorteId) params.fechaCorteId = fechaCorteId;
    if (empresa) params.empresa = empresa;
    const response = await api.get<PreviewData>('/horas-extras/vista-previa', { params });
    return response.data;
  }
};
