// Ex-dipendenti routes
import { Router } from 'express';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

const router = Router();

// GET /api/ex-dipendenti - Lista ex dipendenti
router.get('/api/ex-dipendenti', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    // TODO(BUSINESS): Implementare tabella ex_dipendenti reale
    // Per ora restituisce array vuoto per Step 2 (read-only wiring)
    const { data, error } = await supabaseAdmin
      .from('ex_dipendenti')
      .select('*')
      .order('archiviato_il', { ascending: false });

    if (error) {
      console.warn('[API] Error fetching ex-dipendenti:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Errore durante il recupero degli ex dipendenti',
        code: 'QUERY_ERROR'
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('[API] Errore ex-dipendenti:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR'
    });
  }
});

export { router as exDipendentiRoutes };
