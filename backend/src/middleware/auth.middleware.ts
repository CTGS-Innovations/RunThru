import { Request, Response, NextFunction } from 'express';

/**
 * PIN Validation Middleware
 *
 * Protects expensive operations (script upload, session creation) with a PIN code.
 * Expects PIN in the 'x-access-pin' header.
 *
 * Usage:
 *   router.post('/api/scripts', validatePIN, uploadScript);
 */
export function validatePIN(req: Request, res: Response, next: NextFunction): void {
  const providedPIN = req.headers['x-access-pin'];
  const requiredPIN = process.env.ACCESS_PIN;

  // If no PIN is configured, allow access (dev mode)
  if (!requiredPIN) {
    console.warn('⚠️  ACCESS_PIN not configured - PIN validation disabled');
    next();
    return;
  }

  // Check if PIN was provided
  if (!providedPIN) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Access PIN required. Please provide PIN in x-access-pin header.',
    });
    return;
  }

  // Validate PIN
  if (providedPIN !== requiredPIN) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid access PIN.',
    });
    return;
  }

  // PIN is valid, proceed
  next();
}
