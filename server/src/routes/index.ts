import { Router } from 'express';
import cargoRoutes from './cargoRoutes';
import personaRoutes from './personaRoutes';
import registroRoutes from './registroRoutes';
import reporteRoutes from './reporteRoutes';
import nominaRoutes from './nominaRoutes';

const router = Router();

router.get('/health', (_request, response) => {
  response.json({ ok: true });
});

router.use('/cargos', cargoRoutes);
router.use('/personas', personaRoutes);
router.use('/registros', registroRoutes);
router.use('/reportes', reporteRoutes);
router.use('/nomina', nominaRoutes);

export default router;