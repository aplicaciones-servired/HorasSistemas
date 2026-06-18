import ExcelJS from 'exceljs';
import { RegistroAsistencia, Persona, Cargo } from '../models';

export class ReporteService {
  async generarExcelAsistencia(
    registros: RegistroAsistencia[],
    personas: Map<number, Persona>,
    cargos: Map<number, Cargo>
  ): Promise<any> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Asistencia');

    // Encabezados
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

    // Estilos para encabezado
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

    // Agregar datos
    registros.forEach((registro: any) => {
      const persona = personas.get(registro.personaId);
      const cargo = cargos.get(registro.cargoId);

      worksheet.addRow({
        fecha: registro.fecha ? new Date(registro.fecha).toLocaleDateString('es-ES') : '',
        cedula: persona?.cedula || '',
        nombres: persona?.nombres || '',
        apellidos: persona?.apellidos || '',
        cargo: cargo?.nombre || '',
        horaEntrada: registro.horaEntrada || '',
        horaSalida: registro.horaSalida || '',
        observacion: registro.observacion || ''
      });
    });

    // Alinear columnas
    worksheet.columns.forEach(column => {
      column.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    });

    // Ajustar altura de filas
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        row.height = 24;
      }
    });

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
