import { Router } from 'express';
import { NominaController } from '../controllers/nominaController';

const router = Router();
const nominaController = new NominaController();

router.get('/descargar', (req, res) => nominaController.descargarNomina(req, res));

export default router;
