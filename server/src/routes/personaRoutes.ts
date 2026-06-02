import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createPersona,
  deletePersona,
  findPersonaByCedula,
  listPersonas,
  updatePersona
} from '../controllers/personaController';

const personaRoutes = Router();

personaRoutes.get('/', asyncHandler(listPersonas));
personaRoutes.get('/cedula/:cedula', asyncHandler(findPersonaByCedula));
personaRoutes.post('/', asyncHandler(createPersona));
personaRoutes.put('/:id', asyncHandler(updatePersona));
personaRoutes.delete('/:id', asyncHandler(deletePersona));

export default personaRoutes;