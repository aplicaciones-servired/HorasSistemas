import { Request, Response } from 'express';
import { FechaCorte, RegistroAsistencia, Persona, Cargo } from '../models';
import { HorasExtrasService } from '../services/horasExtrasService';
import { sendExcelEmail } from '../services/emailService';

const horasExtrasService = new HorasExtrasService();

export const listFechasCorte = async (req: Request, res: Response): Promise<void> => {
  const empresa = req.query.empresa as string | undefined;

  const includeOptions: any[] = [
    {
      model: RegistroAsistencia,
      as: 'registros',
      attributes: ['id'],
      ...(empresa ? {
        required: true,
        include: [{
          model: Persona,
          as: 'persona',
          attributes: ['id'],
          required: true,
          where: { empresa }
        }]
      } : {})
    }
  ];

  const fechas = await FechaCorte.findAll({
    include: includeOptions,
    order: [['createdAt', 'DESC']]
  });

  res.json(fechas);
};

export const getFechaCorte = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const fecha = await FechaCorte.findByPk(id, {
    include: [
      {
        model: RegistroAsistencia,
        as: 'registros',
        include: [
          { model: Persona, as: 'persona' },
          { model: Cargo, as: 'cargo' }
        ],
        order: [['fecha', 'ASC'], ['horaEntrada', 'ASC']]
      }
    ]
  });

  if (!fecha) {
    res.status(404).json({ message: 'Fecha de corte no encontrada' });
    return;
  }

  res.json(fecha);
};

export const createFechaCorte = async (req: Request, res: Response): Promise<void> => {
  const { fechaInicio, fechaFin, descripcion } = req.body as {
    fechaInicio?: string;
    fechaFin?: string;
    descripcion?: string;
  };

  if (!fechaInicio || !fechaFin) {
    res.status(400).json({ message: 'fechaInicio y fechaFin son obligatorias' });
    return;
  }

  if (fechaFin < fechaInicio) {
    res.status(400).json({ message: 'La fecha fin no puede ser menor que la fecha inicio' });
    return;
  }

  const fecha = await FechaCorte.create({
    fechaInicio,
    fechaFin,
    descripcion: descripcion ?? null
  });

  res.status(201).json(fecha);
};

export const updateFechaCorte = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const fecha = await FechaCorte.findByPk(id);

  if (!fecha) {
    res.status(404).json({ message: 'Fecha de corte no encontrada' });
    return;
  }

  if (fecha.completada) {
    res.status(400).json({ message: 'No se puede modificar una fecha de corte ya finalizada' });
    return;
  }

  const { fechaInicio, fechaFin, descripcion } = req.body as {
    fechaInicio?: string;
    fechaFin?: string;
    descripcion?: string;
  };

  if (fechaInicio !== undefined) fecha.fechaInicio = fechaInicio;
  if (fechaFin !== undefined) fecha.fechaFin = fechaFin;
  if (descripcion !== undefined) fecha.descripcion = descripcion;

  await fecha.save();
  res.json(fecha);
};

export const deleteFechaCorte = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const fecha = await FechaCorte.findByPk(id);

  if (!fecha) {
    res.status(404).json({ message: 'Fecha de corte no encontrada' });
    return;
  }

  await RegistroAsistencia.destroy({ where: { fechaCorteId: fecha.id } });
  await fecha.destroy();
  res.status(204).send();
};

export const finalizarFechaCorte = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const empresa = req.query.empresa as string | undefined;
  const fecha = await FechaCorte.findByPk(id);

  if (!fecha) {
    res.status(404).json({ message: 'Fecha de corte no encontrada' });
    return;
  }

  const registros = await RegistroAsistencia.findAll({
    where: { fechaCorteId: fecha.id },
    include: [
      { model: Persona, as: 'persona' },
      { model: Cargo, as: 'cargo' }
    ]
  });

  if (registros.length === 0) {
    res.status(400).json({ message: 'No hay registros asociados a esta fecha de corte' });
    return;
  }

  if (!fecha.completada) {
    fecha.completada = true;
    await fecha.save();
  }

  const buffer = await horasExtrasService.generarExcel(registros, empresa);

  const empresaLabel = empresa ? `_${empresa}` : '';
  const filename = `Novedades_nomina_jamundi${empresaLabel}_${fecha.fechaInicio}_${fecha.fechaFin}.xlsx`;

  if (empresa) {
    const registrosFiltrados = registros.filter((r: any) => r.persona?.empresa === empresa);
    const fechas = registrosFiltrados.map((r: any) => new Date(`${r.fecha}T12:00:00`));
    let periodo = `${fecha.fechaInicio} al ${fecha.fechaFin}`;
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
    }).catch((err: Error) => console.error('Error enviando correo en background:', err));
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
};

export const listRegistrosByFechaCorte = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  const empresa = req.query.empresa as string | undefined;
  const fecha = await FechaCorte.findByPk(id);

  if (!fecha) {
    res.status(404).json({ message: 'Fecha de corte no encontrada' });
    return;
  }

  const where: any = { fechaCorteId: fecha.id };
  const includeOptions: any[] = [
    { model: Cargo, as: 'cargo' }
  ];

  if (empresa) {
    includeOptions.unshift({
      model: Persona,
      as: 'persona',
      where: { empresa },
      required: true
    });
  } else {
    includeOptions.unshift({ model: Persona, as: 'persona' });
  }

  const registros = await RegistroAsistencia.findAll({
    where,
    include: includeOptions,
    order: [['fecha', 'ASC'], ['horaEntrada', 'ASC']]
  });

  res.json(registros);
};
