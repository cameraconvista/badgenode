// Test permissions routes
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// TEST /api/utenti/test-permissions - Testa permessi Supabase
router.get('/api/utenti/test-permissions', async (req, res) => {
  try {
    // Usa il client normale (ANON_KEY) per testare permessi
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(503).json({
        success: false,
        error: 'Configurazione Supabase client mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase
      .from('utenti')
      .select('pin, nome, cognome')
      .limit(5);

    if (error) {
      return res.json({
        success: false,
        error: error.message,
        code: 'PERMISSION_DENIED',
        hasReadAccess: false
      });
    }

    res.json({
      success: true,
      hasReadAccess: true,
      recordCount: data?.length || 0,
      sampleData: data?.slice(0, 2) || []
    });
  } catch (error) {
    console.error('[API] Errore test permissions:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR'
    });
  }
});

export { router as testPermissionsRoutes };
