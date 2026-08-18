import { Router } from 'express';
import { HorasExtrasController } from '../controllers/horasExtrasController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const horasExtrasController = new HorasExtrasController();

router.get('/descargar', (req, res) => horasExtrasController.descargarHorasExtras(req, res));
router.post('/enviar-email', asyncHandler((req, res) => horasExtrasController.enviarHorasExtrasEmail(req, res)));

export default router;
