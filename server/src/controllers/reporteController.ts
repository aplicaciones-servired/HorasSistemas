import { Request, Response } from 'express';
import { RegistroAsistencia, Persona, Cargo } from '../models';
import { ReporteService } from '../services/reporteService';

const reporteService = new ReporteService();

export class ReporteController {
  async descargarAsistencia(req: Request, res: Response) {
    try {
      // Traer todos los registros con sus asociaciones
      const registros = await RegistroAsistencia.findAll({
        include: [
          { model: Persona, as: 'persona' },
          { model: Cargo, as: 'cargo' }
        ],
        order: [['fecha', 'DESC']]
      });

      // Crear mapas de personas y cargos para referencias rápidas
      const personas = new Map();
      const cargos = new Map();

      registros.forEach((reg: any) => {
        if (reg.persona && !personas.has(reg.persona.id)) {
          personas.set(reg.persona.id, reg.persona);
        }
        if (reg.cargo && !cargos.has(reg.cargo.id)) {
          cargos.set(reg.cargo.id, reg.cargo);
        }
      });

      // Generar Excel
      const buffer = await reporteService.generarExcelAsistencia(
        registros,
        personas,
        cargos
      );

      // Configurar respuesta
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
