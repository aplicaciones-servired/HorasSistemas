import { Router } from 'express';
import cargoRoutes from './cargoRoutes';
import personaRoutes from './personaRoutes';
import registroRoutes from './registroRoutes';

const router = Router();

router.get('/health', (_request, response) => {
  response.json({ ok: true });
});

router.use('/cargos', cargoRoutes);
router.use('/personas', personaRoutes);
router.use('/registros', registroRoutes);

export default router;