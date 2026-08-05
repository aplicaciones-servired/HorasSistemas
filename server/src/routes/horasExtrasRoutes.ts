import { Router } from 'express';
import { HorasExtrasController } from '../controllers/horasExtrasController';

const router = Router();
const horasExtrasController = new HorasExtrasController();

router.get('/descargar', (req, res) => horasExtrasController.descargarHorasExtras(req, res));

export default router;
