import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import scriptsRoutes from './scripts.routes';
import sessionsRoutes from './sessions.routes';
import lobbiesRoutes from './lobbies.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/scripts', scriptsRoutes);
router.use('/sessions', sessionsRoutes);
router.use('/lobbies', lobbiesRoutes);

// Note: /voices endpoint is also in sessionsRoutes
// Mounted here to make it /api/voices instead of /api/sessions/voices
router.use('/', sessionsRoutes);

export default router;
