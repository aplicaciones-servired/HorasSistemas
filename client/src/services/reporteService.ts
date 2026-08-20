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

export const reporteService = {
  async descargarHorasExtras(fechaCorteId?: number, empresa?: string) {
    const params: Record<string, string | number> = {};
    if (fechaCorteId) params.fechaCorteId = fechaCorteId;
    if (empresa) params.empresa = empresa;
    const response = await api.get('/horas-extras/descargar', {
      responseType: 'blob',
      params
    });

    const fecha = new Date().toISOString().split('T')[0];
    const empresaLabel = empresa ? `_${empresa}` : '';
    downloadBlob(response.data, `horas_extras${empresaLabel}_${fecha}.xlsx`);
  }
};

