import { Router } from 'express';
import { ReporteController } from '../controllers/reporteController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();
const reporteController = new ReporteController();

router.get('/asistencia', asyncHandler((req, res) => reporteController.descargarAsistencia(req, res)));

export default router;
