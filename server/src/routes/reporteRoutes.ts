import { Router } from 'express';
import { ReporteController } from '../controllers/reporteController';

const router = Router();
const reporteController = new ReporteController();

router.get('/asistencia', (req, res) => reporteController.descargarAsistencia(req, res));

export default router;
