import { Router, Request, Response } from 'express';
import axios from 'axios';

const router = Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check TTS service
    const ttsUrl = process.env.TTS_SERVICE_URL || 'http://localhost:5000';
    let ttsStatus = 'unknown';

    try {
      await axios.get(`${ttsUrl}/health`, { timeout: 2000 });
      ttsStatus = 'connected';
    } catch {
      ttsStatus = 'disconnected';
    }

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'running',
        database: 'connected',
        tts: ttsStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
