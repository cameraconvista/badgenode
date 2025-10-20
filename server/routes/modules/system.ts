// Endpoint di sistema (health, debug, ready, version)
import { Router } from 'express';
import { getAdminDiagnostics } from '../../lib/supabaseAdmin';

const router = Router();

// Health check endpoint - SEMPRE disponibile, no DB required
router.get('/api/health', (_req, res) => {
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

// Health check admin configuration - STEP B.1 + B.2
router.get('/api/health/admin', (_req, res) => {
  const diagnostics = getAdminDiagnostics();
  
  res.json({
    ok: diagnostics.hasUrl && diagnostics.hasServiceKey,
    ...diagnostics,
    urlSource: process.env.SUPABASE_URL ? 'SUPABASE_URL' : (process.env.VITE_SUPABASE_URL ? 'VITE_SUPABASE_URL' : 'none')
  });
});

// Debug endpoint for env vars (DEV only)
router.get('/api/debug/env', (_req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json({
    NODE_ENV: process.env.NODE_ENV,
    hasViteSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
    hasViteSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    viteUrl: process.env.VITE_SUPABASE_URL?.slice(0, 30) + '...',
    timestamp: new Date().toISOString(),
  });
});

// Deep health check con ping DB (opzionale)
router.get('/api/health/deep', async (_req, res) => {
  try {
    // TODO: Ping database when storage is implemented
    // await storage.healthCheck();
    
    res.json({
      ok: true,
      status: 'deep-healthy',
      service: 'BadgeNode',
      timestamp: new Date().toISOString(),
      database: 'not-implemented'
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Ready endpoint - Kubernetes style readiness probe
router.get('/api/ready', (_req, res) => {
  const diagnostics = getAdminDiagnostics();
  
  res.json({
    ok: true,
    status: 'ready',
    service: 'BadgeNode',
    timestamp: new Date().toISOString(),
    requestId: Math.random().toString(16).slice(2),
    database: diagnostics.hasUrl && diagnostics.hasServiceKey ? 'configured' : 'missing'
  });
});

// Version endpoint
router.get('/api/version', (_req, res) => {
  res.json({
    version: process.env.NODE_ENV || 'dev',
    buildTime: new Date().toISOString(),
    commit: process.env.COMMIT_SHA || 'manual',
    timestamp: new Date().toISOString(),
    requestId: Math.random().toString(16).slice(2)
  });
});

export default router;
