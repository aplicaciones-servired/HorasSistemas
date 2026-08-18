import { Router } from 'express';
import cargoRoutes from './cargoRoutes';
import fechaCorteRoutes from './fechaCorteRoutes';
import personaRoutes from './personaRoutes';
import registroRoutes from './registroRoutes';
import turnoRoutes from './turnoRoutes';
import reporteRoutes from './reporteRoutes';
import nominaRoutes from './nominaRoutes';
import horasExtrasRoutes from './horasExtrasRoutes';

const router = Router();

router.get('/health', (_request, response) => {
  response.json({ ok: true });
});

router.use('/cargos', cargoRoutes);
router.use('/fechas-corte', fechaCorteRoutes);
router.use('/personas', personaRoutes);
router.use('/registros', registroRoutes);
router.use('/turnos', turnoRoutes);
router.use('/reportes', reporteRoutes);
router.use('/nomina', nominaRoutes);
router.use('/horas-extras', horasExtrasRoutes);

export default router;