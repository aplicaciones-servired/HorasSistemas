import { Request, Response } from 'express';
import { Cargo, Persona, RegistroAsistencia } from '../models';

export const listRegistros = async (_request: Request, response: Response): Promise<void> => {
  const registros = await RegistroAsistencia.findAll({
    include: [
      { model: Persona, as: 'persona' },
      { model: Cargo, as: 'cargo' }
    ],
    order: [['fecha', 'DESC'], ['horaEntrada', 'DESC']]
  });

  response.json(registros);
};

export const createRegistro = async (request: Request, response: Response): Promise<void> => {
  const { personaId, cargoId, fecha, horaEntrada, horaSalida, observacion, esDominical } = request.body as {
    personaId?: number;
    cargoId?: number | null;
    fecha?: string;
    horaEntrada?: string;
    horaSalida?: string;
    observacion?: string;
    esDominical?: boolean;
  };

  if (!personaId || !fecha || !horaEntrada || !horaSalida) {
    response.status(400).json({ message: 'personaId, fecha, horaEntrada y horaSalida son obligatorios' });
    return;
  }

  if (horaSalida <= horaEntrada) {
    response.status(400).json({ message: 'La hora de salida debe ser mayor que la hora de entrada' });
    return;
  }

  const registro = await RegistroAsistencia.create({
    personaId,
    cargoId: cargoId ?? null,
    fecha,
    horaEntrada,
    horaSalida,
    observacion: observacion ?? null,
    esDominical: esDominical ?? false
  });

  response.status(201).json(registro);
};

export const updateRegistro = async (request: Request, response: Response): Promise<void> => {
  const registroId = String(request.params.id);
  const registro = await RegistroAsistencia.findByPk(registroId);

  if (!registro) {
    response.status(404).json({ message: 'Registro no encontrado' });
    return;
  }

  const { personaId, cargoId, fecha, horaEntrada, horaSalida, observacion, esDominical } = request.body as {
    personaId?: number;
    cargoId?: number | null;
    fecha?: string;
    horaEntrada?: string;
    horaSalida?: string;
    observacion?: string;
    esDominical?: boolean;
  };

  if (personaId !== undefined) registro.personaId = personaId;
  if (cargoId !== undefined) registro.cargoId = cargoId;
  if (fecha !== undefined) registro.fecha = fecha;
  if (horaEntrada !== undefined) registro.horaEntrada = horaEntrada;
  if (horaSalida !== undefined) registro.horaSalida = horaSalida;
  if (observacion !== undefined) registro.observacion = observacion;
  if (esDominical !== undefined) registro.esDominical = esDominical;

  if (registro.horaSalida <= registro.horaEntrada) {
    response.status(400).json({ message: 'La hora de salida debe ser mayor que la hora de entrada' });
    return;
  }

  await registro.save();
  response.json(registro);
};

export const deleteRegistro = async (request: Request, response: Response): Promise<void> => {
  const registroId = String(request.params.id);
  const registro = await RegistroAsistencia.findByPk(registroId);

  if (!registro) {
    response.status(404).json({ message: 'Registro no encontrado' });
    return;
  }

  await registro.destroy();
  response.status(204).send();
};