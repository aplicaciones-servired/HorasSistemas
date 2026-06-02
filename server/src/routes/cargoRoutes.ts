import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { createCargo, deleteCargo, listCargos, updateCargo } from '../controllers/cargoController';

const cargoRoutes = Router();

cargoRoutes.get('/', asyncHandler(listCargos));
cargoRoutes.post('/', asyncHandler(createCargo));
cargoRoutes.put('/:id', asyncHandler(updateCargo));
cargoRoutes.delete('/:id', asyncHandler(deleteCargo));

export default cargoRoutes;