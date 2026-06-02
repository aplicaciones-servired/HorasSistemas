import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { createRegistro, deleteRegistro, listRegistros, updateRegistro } from '../controllers/registroController';

const registroRoutes = Router();

registroRoutes.get('/', asyncHandler(listRegistros));
registroRoutes.post('/', asyncHandler(createRegistro));
registroRoutes.put('/:id', asyncHandler(updateRegistro));
registroRoutes.delete('/:id', asyncHandler(deleteRegistro));

export default registroRoutes;