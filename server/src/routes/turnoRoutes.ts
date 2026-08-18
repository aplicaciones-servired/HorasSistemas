import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { createTurno, deleteTurno, listTurnos, updateTurno } from '../controllers/turnoController';

const turnoRoutes = Router();

turnoRoutes.get('/', asyncHandler(listTurnos));
turnoRoutes.post('/', asyncHandler(createTurno));
turnoRoutes.put('/:id', asyncHandler(updateTurno));
turnoRoutes.delete('/:id', asyncHandler(deleteTurno));

export default turnoRoutes;
