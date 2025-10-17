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
 * Readiness check - verifica connessione DB con query banale
 */
router.get('/ready', async (req, res) => {
  const requestId = req.context?.requestId || 'unknown';
  
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        ok: false,
        error: 'Database client non disponibile',
        requestId
      });
    }
    
    // Query banale e veloce per verificare connessione
    const { error } = await supabaseAdmin
      .from('utenti')
      .select('pin', { count: 'exact', head: true })
      .limit(1);
    
    if (error) {
      console.warn(`[Readiness] DB check failed [${requestId}]:`, error.message);
      return res.status(503).json({
        ok: false,
        error: 'Database non raggiungibile',
        requestId
      });
    }
    
    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      requestId
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
