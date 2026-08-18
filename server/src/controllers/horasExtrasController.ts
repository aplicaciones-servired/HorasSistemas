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
          const min = new Date(Math.min(...fechas.map((d: Date) => d.getTime())));
          const max = new Date(Math.max(...fechas.map((d: Date) => d.getTime())));
          const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
          periodo = `${fmt(min)} al ${fmt(max)}`;
        }
        sendExcelEmail({
          empresa: empresa as 'Servired' | 'Multired',
          filename,
          buffer: Buffer.from(buffer),
          periodo
        }).catch((err) => console.error('Error enviando correo en background:', err));
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

      if (!empresa || !['Servired', 'Multired'].includes(empresa)) {
        return res.status(400).json({ error: 'empresa es obligatoria y debe ser "Servired" o "Multired"' });
      }

      const where: any = {};
      if (fechaCorteId) {
        where.fechaCorteId = fechaCorteId;
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
      const filename = `Novedades_nomina_jamundi_${empresa}_${fecha}.xlsx`;

      const registrosFiltrados = registros.filter((r: any) => r.persona?.empresa === empresa);
      const fechas = registrosFiltrados.map((r: any) => new Date(`${r.fecha}T12:00:00`));
      let periodo = fecha;
      if (fechas.length > 0) {
        const min = new Date(Math.min(...fechas.map((d: Date) => d.getTime())));
        const max = new Date(Math.max(...fechas.map((d: Date) => d.getTime())));
        const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        periodo = `${fmt(min)} al ${fmt(max)}`;
      }

      await sendExcelEmail({
        empresa: empresa as 'Servired' | 'Multired',
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
