import { Request, Response } from 'express';
import { Cargo } from '../models';

export const listCargos = async (_request: Request, response: Response): Promise<void> => {
  const cargos = await Cargo.findAll({ order: [['nombre', 'ASC']] });
  response.json(cargos);
};

export const createCargo = async (request: Request, response: Response): Promise<void> => {
  const { nombre, descripcion } = request.body as { nombre?: string; descripcion?: string };

  if (!nombre) {
    response.status(400).json({ message: 'El nombre del cargo es obligatorio' });
    return;
  }

  const cargo = await Cargo.create({ nombre, descripcion: descripcion ?? null });
  response.status(201).json(cargo);
};

export const updateCargo = async (request: Request, response: Response): Promise<void> => {
  const cargoId = String(request.params.id);
  const cargo = await Cargo.findByPk(cargoId);

  if (!cargo) {
    response.status(404).json({ message: 'Cargo no encontrado' });
    return;
  }

  const { nombre, descripcion } = request.body as { nombre?: string; descripcion?: string };

  if (nombre !== undefined) cargo.nombre = nombre;
  if (descripcion !== undefined) cargo.descripcion = descripcion;

  await cargo.save();
  response.json(cargo);
};

export const deleteCargo = async (request: Request, response: Response): Promise<void> => {
  const cargoId = String(request.params.id);
  const cargo = await Cargo.findByPk(cargoId);

  if (!cargo) {
    response.status(404).json({ message: 'Cargo no encontrado' });
    return;
  }

  await cargo.destroy();
  response.status(204).send();
};