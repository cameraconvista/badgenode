// Altri endpoint API (ex-dipendenti, storico, test, delete utenti)
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../lib/supabaseAdmin';

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

    const { data, error } = await supabaseAdmin
      .from('ex_dipendenti')
      .select('*')
      .order('data_archiviazione', { ascending: false });

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

// GET /api/storico - Storico timbrature con filtri
router.get('/api/storico', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const { pin, dal, al } = req.query as { pin?: string; dal?: string; al?: string };

    if (!pin) {
      return res.status(400).json({
        success: false,
        error: 'Parametro PIN obbligatorio',
        code: 'MISSING_PARAMS'
      });
    }

    const pinNum = parseInt(pin, 10);
    if (isNaN(pinNum) || pinNum < 1 || pinNum > 99) {
      return res.status(400).json({
        success: false,
        error: 'PIN deve essere un numero tra 1 e 99',
        code: 'INVALID_PIN'
      });
    }

    let query = supabaseAdmin
      .from('v_turni_giornalieri')
      .select('*')
      .eq('pin', pinNum);

    if (dal) {
      query = query.gte('giorno_logico', dal);
    }
    if (al) {
      query = query.lte('giorno_logico', al);
    }

    const { data, error } = await query.order('giorno_logico', { ascending: false });

    if (error) {
      console.warn('[API] Error fetching storico:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Errore durante il recupero dello storico',
        code: 'QUERY_ERROR'
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('[API] Errore storico:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR'
    });
  }
});

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

// DELETE /api/utenti/:pin - Elimina utente (richiede SERVICE_ROLE_KEY)
router.delete('/api/utenti/:pin', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const { pin } = req.params;
    const pinNum = parseInt(pin, 10);

    if (isNaN(pinNum) || pinNum < 1 || pinNum > 99) {
      return res.status(400).json({
        success: false,
        error: 'PIN deve essere un numero tra 1 e 99',
        code: 'INVALID_PIN'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('utenti')
      .delete()
      .eq('pin', pinNum)
      .select();

    if (error) {
      console.warn('[API] Error deleting utente:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Errore durante l\'eliminazione dell\'utente',
        code: 'QUERY_ERROR'
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Utente con PIN ${pinNum} non trovato`,
        code: 'NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: `Utente con PIN ${pinNum} eliminato`,
      deletedUser: data[0]
    });
  } catch (error) {
    console.error('[API] Errore eliminazione utente:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;
