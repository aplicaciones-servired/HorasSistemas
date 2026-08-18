import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import {
  listFechasCorte,
  getFechaCorte,
  createFechaCorte,
  updateFechaCorte,
  deleteFechaCorte,
  finalizarFechaCorte,
  listRegistrosByFechaCorte
} from '../controllers/fechaCorteController';

const fechaCorteRoutes = Router();

fechaCorteRoutes.get('/', asyncHandler(listFechasCorte));
fechaCorteRoutes.get('/:id', asyncHandler(getFechaCorte));
fechaCorteRoutes.post('/', asyncHandler(createFechaCorte));
fechaCorteRoutes.put('/:id', asyncHandler(updateFechaCorte));
fechaCorteRoutes.delete('/:id', asyncHandler(deleteFechaCorte));
fechaCorteRoutes.post('/:id/finalizar', asyncHandler(finalizarFechaCorte));
fechaCorteRoutes.get('/:id/registros', asyncHandler(listRegistrosByFechaCorte));

export default fechaCorteRoutes;
