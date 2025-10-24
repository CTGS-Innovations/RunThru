import { Router, Request, Response } from 'express';
import { validatePIN } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/verify
 *
 * Verify PIN code
 * Used by frontend login page
 */
router.post('/verify', validatePIN, (req: Request, res: Response) => {
  // If we got here, PIN is valid (validatePIN middleware passed)
  res.status(200).json({
    success: true,
    message: 'PIN verified successfully',
  });
});

export default router;
