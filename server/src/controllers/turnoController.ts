import { Request, Response } from 'express';
import { Turno } from '../models';

export const listTurnos = async (_request: Request, response: Response): Promise<void> => {
  const turnos = await Turno.findAll({ order: [['nombre', 'ASC']] });
  response.json(turnos);
};

export const createTurno = async (request: Request, response: Response): Promise<void> => {
  const { nombre, horaEntrada, horaSalida, esDominical } = request.body as {
    nombre?: string;
    horaEntrada?: string;
    horaSalida?: string;
    esDominical?: boolean;
  };

  if (!nombre || !horaEntrada || !horaSalida) {
    response.status(400).json({ message: 'Nombre, hora de entrada y hora de salida son obligatorios' });
    return;
  }

  const turno = await Turno.create({
    nombre,
    horaEntrada,
    horaSalida,
    esDominical: esDominical ?? false
  });
  response.status(201).json(turno);
};

export const updateTurno = async (request: Request, response: Response): Promise<void> => {
  const turnoId = String(request.params.id);
  const turno = await Turno.findByPk(turnoId);

  if (!turno) {
    response.status(404).json({ message: 'Turno no encontrado' });
    return;
  }

  const { nombre, horaEntrada, horaSalida, esDominical } = request.body as {
    nombre?: string;
    horaEntrada?: string;
    horaSalida?: string;
    esDominical?: boolean;
  };

  if (nombre !== undefined) turno.nombre = nombre;
  if (horaEntrada !== undefined) turno.horaEntrada = horaEntrada;
  if (horaSalida !== undefined) turno.horaSalida = horaSalida;
  if (esDominical !== undefined) turno.esDominical = esDominical;

  await turno.save();
  response.json(turno);
};

export const deleteTurno = async (request: Request, response: Response): Promise<void> => {
  const turnoId = String(request.params.id);
  const turno = await Turno.findByPk(turnoId);

  if (!turno) {
    response.status(404).json({ message: 'Turno no encontrado' });
    return;
  }

  await turno.destroy();
  response.status(204).send();
};
