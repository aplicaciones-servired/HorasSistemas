import { Router } from 'express';
import { NominaController } from '../controllers/nominaController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const nominaController = new NominaController();

router.get('/descargar', asyncHandler((req, res) => nominaController.descargarNomina(req, res)));

export default router;
