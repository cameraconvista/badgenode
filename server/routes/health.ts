// Health & Readiness endpoints
// Separati da routes.ts principale per modularità

import { Router } from 'express';
import { supabaseAdmin } from '../lib/supabaseAdmin';

const router = Router();

/**
 * GET /api/health
 * Health check base - sempre disponibile, no DB required
 */
router.get('/health', (_req, res) => {
  const startTime = process.hrtime.bigint();
  const uptime = process.uptime();
  
  res.json({
    ok: true,
    status: 'healthy',
    service: 'BadgeNode',
    version: '1.0.0',
    uptime: Math.floor(uptime),
    timestamp: new Date().toISOString(),
    responseTime: Number(process.hrtime.bigint() - startTime) / 1000000 // ms
  });
});

/**
 * GET /api/ready
 * Readiness check - verifica che il server sia pronto (senza DB per ora)
 */
router.get('/ready', async (req, res) => {
  const requestId = req.context?.requestId || 'unknown';
  
  try {
    // Per ora solo check base - in futuro aggiungeremo DB check opzionale
    res.json({
      ok: true,
      status: 'ready',
      service: 'BadgeNode',
      timestamp: new Date().toISOString(),
      requestId,
      database: supabaseAdmin ? 'configured' : 'not_configured'
    });
    
  } catch (error) {
    console.error(`[Readiness] Unexpected error [${requestId}]:`, error);
    res.status(503).json({
      ok: false,
      error: 'Errore interno durante readiness check',
      requestId
    });
  }
});

export { router as healthRouter };
