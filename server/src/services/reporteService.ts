import ExcelJS from 'exceljs';
import { RegistroAsistencia } from '../models';

export class ReporteService {
  async generarExcelAsistencia(
    registros: RegistroAsistencia[]
  ): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Asistencia');

    worksheet.columns = [
      { header: 'Fecha', key: 'fecha', width: 12 },
      { header: 'Cédula', key: 'cedula', width: 12 },
      { header: 'Nombres', key: 'nombres', width: 20 },
      { header: 'Apellidos', key: 'apellidos', width: 20 },
      { header: 'Cargo', key: 'cargo', width: 18 },
      { header: 'Hora Entrada', key: 'horaEntrada', width: 14 },
      { header: 'Hora Salida', key: 'horaSalida', width: 14 },
      { header: 'Observación', key: 'observacion', width: 30 }
    ];

    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1D4ED8' }
    };

    worksheet.getRow(1).font = {
      bold: true,
      color: { argb: 'FFFFFFFF' },
      size: 11
    };

    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

    registros.forEach((registro: any) => {
      worksheet.addRow({
        fecha: registro.fecha ? new Date(registro.fecha).toLocaleDateString('es-ES') : '',
        cedula: registro.persona?.cedula || '',
        nombres: registro.persona?.nombres || '',
        apellidos: registro.persona?.apellidos || '',
        cargo: registro.cargo?.nombre || '',
        horaEntrada: registro.horaEntrada || '',
        horaSalida: registro.horaSalida || '',
        observacion: registro.observacion || ''
      });
    });

    worksheet.columns.forEach(column => {
      column.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    });

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.height = 24;
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
