// server/middleware/httpLog.ts
// BadgeNode HTTP Logging Middleware — Sprint 3
// Feature-flagged structured HTTP request/response logging

import type { NextFunction, Request, Response } from 'express';
import { log } from '../lib/logger';
import { FEATURE_LOGGER_ADAPTER } from '../config/featureFlags';

/**
 * HTTP logging middleware con feature flag.
 * 
 * Logga ogni richiesta HTTP con:
 * - Method (GET, POST, etc.)
 * - URL (originalUrl)
 * - Status code
 * - Duration (ms)
 * - Request ID (se presente)
 * 
 * Attivo solo se FEATURE_LOGGER_ADAPTER=true.
 * Zero impatto con flag OFF.
 * 
 * Usage:
 * ```ts
 * import { httpLog } from './middleware/httpLog';
 * app.use(httpLog);
 * ```
 */
export function httpLog(req: Request, res: Response, next: NextFunction): void {
  // Skip se feature flag OFF
  if (!FEATURE_LOGGER_ADAPTER) {
    return next();
  }

  const start = Date.now();
  
  // Log su response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const requestId = req.headers['x-request-id'] as string | undefined;
    
    log.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms: duration,
      requestId,
    }, 'http');
  });

  next();
}

/**
 * HTTP error logging helper.
 * 
 * Logga errori HTTP con context.
 * 
 * Usage:
 * ```ts
 * import { logHttpError } from './middleware/httpLog';
 * 
 * try {
 *   // ...
 * } catch (error) {
 *   logHttpError(req, error, 'utenti:list');
 *   res.status(500).json({ error: 'Internal error' });
 * }
 * ```
 */
export function logHttpError(
  req: Request,
  error: unknown,
  context: string
): void {
  if (!FEATURE_LOGGER_ADAPTER) {
    console.error(`[${context}]`, error);
    return;
  }

  const err = error instanceof Error ? error : new Error(String(error));
  
  log.error({
    context,
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: err.stack,
    requestId: req.headers['x-request-id'],
  }, 'http error');
}
