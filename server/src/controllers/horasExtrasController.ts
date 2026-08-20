import { Request, Response } from 'express';
import { RegistroAsistencia, Persona, Cargo } from '../models';
import { HorasExtrasService } from '../services/horasExtrasService';
import { sendExcelEmail } from '../services/emailService';

const horasExtrasService = new HorasExtrasService();

export class HorasExtrasController {
  async descargarHorasExtras(req: Request, res: Response) {
    try {
      const where: any = {};
      const fechaCorteId = req.query.fechaCorteId;
      const empresa = req.query.empresa as string | undefined;

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

      const buffer = await horasExtrasService.generarExcel(registros, empresa);

      const fecha = new Date().toISOString().split('T')[0];
      const empresaLabel = empresa ? `_${empresa}` : '';
      const filename = `Novedades_nomina_jamundi${empresaLabel}_${fecha}.xlsx`;

      if (empresa) {
        const registrosFiltrados = registros.filter((r: any) => r.persona?.empresa === empresa);
        const fechas = registrosFiltrados.map((r: any) => new Date(`${r.fecha}T12:00:00`));
        let periodo = fecha;
        if (fechas.length > 0) {
          const minTs = fechas.reduce((min: number, d: Date) => Math.min(min, d.getTime()), Infinity);
          const maxTs = fechas.reduce((max: number, d: Date) => Math.max(max, d.getTime()), -Infinity);
          const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
          periodo = `${fmt(new Date(minTs))} al ${fmt(new Date(maxTs))}`;
        }
        sendExcelEmail({
          empresa: empresa as 'Servired' | 'Multired',
          filename,
          buffer: Buffer.from(buffer),
          periodo
        }).catch((err: Error) => console.error('Error enviando correo en background:', err));
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (error) {
      console.error('Error generando reporte de horas extras:', error);
      res.status(500).json({ error: 'Error al generar el reporte de horas extras' });
    }
  }

  async enviarHorasExtrasEmail(req: Request, res: Response) {
    try {
      const { fechaCorteId, empresa } = req.body as {
        fechaCorteId?: number;
        empresa?: string;
      };

      const empresaTrimmed = empresa?.trim();
      if (!empresaTrimmed || !['Servired', 'Multired'].includes(empresaTrimmed)) {
        return res.status(400).json({ error: 'empresa es obligatoria y debe ser "Servired" o "Multired"' });
      }

      const where: any = {};
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

      const buffer = await horasExtrasService.generarExcel(registros, empresaTrimmed);

      const fecha = new Date().toISOString().split('T')[0];
      const filename = `Novedades_nomina_jamundi_${empresaTrimmed}_${fecha}.xlsx`;

      const registrosFiltrados = registros.filter((r: any) => r.persona?.empresa === empresaTrimmed);
      const fechas = registrosFiltrados.map((r: any) => new Date(`${r.fecha}T12:00:00`));
      let periodo = fecha;
      if (fechas.length > 0) {
        const minTs = fechas.reduce((min: number, d: Date) => Math.min(min, d.getTime()), Infinity);
        const maxTs = fechas.reduce((max: number, d: Date) => Math.max(max, d.getTime()), -Infinity);
        const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        periodo = `${fmt(new Date(minTs))} al ${fmt(new Date(maxTs))}`;
      }

      await sendExcelEmail({
        empresa: empresaTrimmed as 'Servired' | 'Multired',
        filename,
        buffer: Buffer.from(buffer),
        periodo
      });

      res.json({ message: `Correo enviado exitosamente a los destinatarios de ${empresa}` });
    } catch (error) {
      console.error('Error enviando correo de horas extras:', error);
      res.status(500).json({ error: 'Error al enviar el correo. Verifica la configuración SMTP.' });
    }
  }
}
