import { Request, Response } from 'express';
import { RegistroAsistencia, Persona, Cargo } from '../models';
import { ReporteService } from '../services/reporteService';

const reporteService = new ReporteService();

export class ReporteController {
  async descargarAsistencia(req: Request, res: Response) {
    try {
      const registros = await RegistroAsistencia.findAll({
        include: [
          { model: Persona, as: 'persona' },
          { model: Cargo, as: 'cargo' }
        ],
        order: [['fecha', 'DESC']]
      });

      const buffer = await reporteService.generarExcelAsistencia(registros);

      const fecha = new Date().toISOString().split('T')[0];
      const filename = `asistencia_${fecha}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('Error generando reporte:', error);
      res.status(500).json({ error: 'Error al generar el reporte' });
    }
  }
}
