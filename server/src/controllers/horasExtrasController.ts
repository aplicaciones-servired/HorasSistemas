import { Request, Response } from 'express';
import { RegistroAsistencia, Persona, Cargo } from '../models';
import { HorasExtrasService } from '../services/horasExtrasService';

const horasExtrasService = new HorasExtrasService();

export class HorasExtrasController {
  async descargarHorasExtras(req: Request, res: Response) {
    try {
      const where: any = {};
      const fechaCorteId = req.query.fechaCorteId;

      if (fechaCorteId) {
        where.fechaCorteId = Number(fechaCorteId);
      }

      const registros = await RegistroAsistencia.findAll({
        where,
        include: [
          { model: Persona, as: 'persona' },
          { model: Cargo, as: 'cargo' }
        ]
      });

      if (registros.length === 0) {
        return res.status(404).json({ error: 'No hay registros de asistencia' });
      }

      const buffer = await horasExtrasService.generarExcel(registros);

      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Novedades_nomina_ jamundi_${fecha}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('Error generando reporte de horas extras:', error);
      res.status(500).json({ error: 'Error al generar el reporte de horas extras' });
    }
  }
}