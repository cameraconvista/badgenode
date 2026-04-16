// Endpoint di sistema aggiuntivi (admin health, debug env, deep health)
// NOTA: /api/health, /api/ready, /api/version sono definiti in health.ts e version.ts
import { Router } from 'express';
import { getAdminDiagnostics } from '../../lib/supabaseAdmin';

const router = Router();

// Health check admin configuration
router.get('/api/health/admin', (_req, res) => {
  const diagnostics = getAdminDiagnostics();

  res.json({
    ok: diagnostics.hasUrl && diagnostics.hasServiceKey,
    ...diagnostics,
    urlSource: process.env.SUPABASE_URL
      ? 'SUPABASE_URL'
      : process.env.VITE_SUPABASE_URL
        ? 'VITE_SUPABASE_URL'
        : 'none',
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

// Deep health check con ping DB (placeholder)
router.get('/api/health/deep', async (_req, res) => {
  try {
    res.json({
      ok: true,
      status: 'deep-healthy',
      service: 'BadgeNode',
      timestamp: new Date().toISOString(),
      database: 'not-implemented',
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
