// Request ID middleware per tracking e logging
// Genera x-request-id se assente, lo aggiunge a response headers e req.context

import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

// Estendi Request type per includere context
declare global {
  namespace Express {
    interface Request {
      context?: {
        requestId: string;
      };
    }
  }
}

/**
 * Genera un request ID univoco usando crypto random
 */
function generateRequestId(): string {
  return randomBytes(8).toString('hex');
}

/**
 * Middleware che aggiunge request ID a ogni richiesta
 * - Usa x-request-id dal client se presente
 * - Altrimenti genera nuovo ID
 * - Aggiunge ID a response headers e req.context
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Ottieni request ID da header o genera nuovo
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  
  // Inizializza context se non esiste
  if (!req.context) {
    req.context = { requestId };
  } else {
    req.context.requestId = requestId;
  }
  
  // Aggiungi a response headers per tracking
  res.setHeader('x-request-id', requestId);
  
  next();
}
