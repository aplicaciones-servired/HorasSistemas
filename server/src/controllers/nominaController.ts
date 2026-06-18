import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import { NominaService } from '../services/nominaService';

const nominaService = new NominaService();

export class NominaController {
  async descargarNomina(req: Request, res: Response) {
    try {
      // Generar datos de nómina
      const nomina = await nominaService.generarNomina();

      if (nomina.length === 0) {
        return res.status(404).json({ error: 'No hay registros de asistencia' });
      }

      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Nómina');

      // Configurar columnas
      worksheet.columns = [
        { header: 'Cédula', key: 'cedula', width: 14 },
        { header: 'Nombres', key: 'nombres', width: 16 },
        { header: 'Apellidos', key: 'apellidos', width: 16 },
        { header: 'Cargo', key: 'cargo', width: 16 },
        { header: 'Horas Trabajadas', key: 'horasTrabajadas', width: 14 },
        { header: 'Horas Dominicales', key: 'horasDominicales', width: 14 },
        { header: 'Horas Netas', key: 'horasNetas', width: 14 },
        { header: 'Valor Hora', key: 'valorHora', width: 14 },
        { header: 'Salario Total', key: 'salarioTotal', width: 16 }
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
      nomina.forEach((row) => {
        worksheet.addRow({
          cedula: row.cedula,
          nombres: row.nombres,
          apellidos: row.apellidos,
          cargo: row.cargo,
          horasTrabajadas: row.horasTrabajadas,
          horasDominicales: row.horasDominicales,
          horasNetas: row.horasNetas,
          valorHora: `$${row.valorHora.toLocaleString('es-CO')}`,
          salarioTotal: `$${row.salarioTotal.toLocaleString('es-CO')}`
        });
      });

      // Formato de columnas numéricas
      worksheet.columns.forEach((col, idx) => {
        if (idx >= 4 && idx <= 8) {
          col.alignment = { horizontal: 'right', vertical: 'middle' };
        } else {
          col.alignment = { horizontal: 'left', vertical: 'middle' };
        }
        col.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });

      // Altura de filas
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.height = 24;
        }
      });

      // Generar buffer y descargar
      const buffer = await workbook.xlsx.writeBuffer();
      const fecha = new Date().toISOString().split('T')[0];
      const filename = `nomina_${fecha}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('Error generando nómina:', error);
      res.status(500).json({ error: 'Error al generar la nómina' });
    }
  }
}
