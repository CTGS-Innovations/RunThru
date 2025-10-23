import { Router } from 'express';
import healthRoutes from './health.routes';
import scriptsRoutes from './scripts.routes';
import sessionsRoutes from './sessions.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/scripts', scriptsRoutes);
router.use('/sessions', sessionsRoutes);

export default router;
