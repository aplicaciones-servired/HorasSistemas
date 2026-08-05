import { api } from './api';

export const reporteService = {
  async descargarAsistencia() {
    const response = await api.get('/reportes/asistencia', {
      responseType: 'blob'
    });
    
    // Crear un URL para descargar el archivo
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
    
    // Crear un URL para descargar el archivo
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

  async descargarHorasExtras() {
    const response = await api.get('/horas-extras/descargar', {
      responseType: 'blob'
    });

    // Crear un URL para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    const fecha = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `horas_extras_${fecha}.xlsx`);

    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

