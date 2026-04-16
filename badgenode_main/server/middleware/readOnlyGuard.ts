// Read-Only Mode Guard - Paracadute per manutenzioni
// Blocca operazioni di scrittura quando READ_ONLY_MODE=1

import { Request, Response, NextFunction } from 'express';

// Metodi HTTP che modificano dati
const MUTATING_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];

/**
 * Middleware che blocca operazioni di scrittura in Read-Only Mode
 * 
 * Quando READ_ONLY_MODE=1:
 * - Blocca POST, PATCH, PUT, DELETE con 503
 * - Permette GET, HEAD, OPTIONS
 * 
 * Utile per manutenzioni sicure senza downtime completo
 */
export function readOnlyGuard(req: Request, res: Response, next: NextFunction): void {
  // Controlla se Read-Only Mode è attivo
  const isReadOnlyMode = process.env.READ_ONLY_MODE === '1';
  
  if (isReadOnlyMode && MUTATING_METHODS.includes(req.method)) {
    // Ottieni request ID per logging
    const requestId = req.context?.requestId || 'unknown';
    
    // Log per monitoraggio
    console.warn(`[Read-Only] Blocked ${req.method} ${req.path} [${requestId}]`);
    
    // Risposta standardizzata
    res.status(503).json({
      success: false,
      code: 'READ_ONLY_MODE_ACTIVE',
      error: 'Sistema in manutenzione (solo lettura)',
      requestId
    });
    return;
  }
  
  // Procedi normalmente
  next();
}
