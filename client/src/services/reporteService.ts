import { api } from './api';

export const reporteService = {
  async descargarAsistencia() {
    const response = await api.get('/reportes/asistencia', {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const fecha = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `asistencia_${fecha}.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async descargarNomina() {
    const response = await api.get('/nomina/descargar', {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    const fecha = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `nomina_${fecha}.xlsx`);
    
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async descargarHorasExtras(fechaCorteId?: number, empresa?: string) {
    const params: any = {};
    if (fechaCorteId) params.fechaCorteId = fechaCorteId;
    if (empresa) params.empresa = empresa;
    const response = await api.get('/horas-extras/descargar', {
      responseType: 'blob',
      params
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    const fecha = new Date().toISOString().split('T')[0];
    const empresaLabel = empresa ? `_${empresa}` : '';
    link.setAttribute('download', `horas_extras${empresaLabel}_${fecha}.xlsx`);

    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  async enviarHorasExtrasEmail(fechaCorteId: number | null, empresa: string) {
    const response = await api.post('/horas-extras/enviar-email', {
      fechaCorteId: fechaCorteId || null,
      empresa
    });
    return response.data;
  }
};

