import { Request, Response } from 'express';
import { Cargo, Persona } from '../models';

export const listPersonas = async (_request: Request, response: Response): Promise<void> => {
  const personas = await Persona.findAll({
    include: [{ model: Cargo, as: 'cargo' }],
    order: [['nombres', 'ASC']]
  });

  response.json(personas);
};

export const findPersonaByCedula = async (request: Request, response: Response): Promise<void> => {
  const persona = await Persona.findOne({
    where: { cedula: request.params.cedula },
    include: [{ model: Cargo, as: 'cargo' }]
  });

  if (!persona) {
    response.status(404).json({ message: 'Persona no encontrada' });
    return;
  }

  response.json(persona);
};

export const createPersona = async (request: Request, response: Response): Promise<void> => {
  const { cedula, nombres, apellidos, cargoId, activo } = request.body as {
    cedula?: string;
    nombres?: string;
    apellidos?: string;
    cargoId?: number | null;
    activo?: boolean;
  };

  if (!cedula || !nombres || !apellidos) {
    response.status(400).json({ message: 'Cedula, nombres y apellidos son obligatorios' });
    return;
  }

  const persona = await Persona.create({
    cedula,
    nombres,
    apellidos,
    cargoId: cargoId ?? null,
    activo: activo ?? true
  });

  response.status(201).json(persona);
};

export const updatePersona = async (request: Request, response: Response): Promise<void> => {
  const personaId = String(request.params.id);
  const persona = await Persona.findByPk(personaId);

  if (!persona) {
    response.status(404).json({ message: 'Persona no encontrada' });
    return;
  }

  const { cedula, nombres, apellidos, cargoId, activo } = request.body as {
    cedula?: string;
    nombres?: string;
    apellidos?: string;
    cargoId?: number | null;
    activo?: boolean;
  };

  if (cedula !== undefined) persona.cedula = cedula;
  if (nombres !== undefined) persona.nombres = nombres;
  if (apellidos !== undefined) persona.apellidos = apellidos;
  if (cargoId !== undefined) persona.cargoId = cargoId;
  if (activo !== undefined) persona.activo = activo;

  await persona.save();
  response.json(persona);
};

export const deletePersona = async (request: Request, response: Response): Promise<void> => {
  const personaId = String(request.params.id);
  const persona = await Persona.findByPk(personaId);

  if (!persona) {
    response.status(404).json({ message: 'Persona no encontrada' });
    return;
  }

  await persona.destroy();
  response.status(204).send();
};