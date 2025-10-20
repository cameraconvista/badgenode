// API endpoints per gestione utenti
import { Router } from 'express';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import type { UtenteInsert } from '../../types/utenti';

const router = Router();

// GET /api/utenti - Lista utenti attivi
router.get('/api/utenti', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    // Development mode: return mock data if Supabase connection fails
    if (process.env.NODE_ENV === 'development') {
      try {
        const { data, error } = await supabaseAdmin
          .from('utenti')
          .select('*')
          .order('pin');

        if (error && error.message.includes('Invalid API key')) {
          console.warn('[API] Development mode: using mock data for utenti');
          const mockUtenti = [
            {
              id: 'mock-uuid-1',
              pin: 1,
              nome: 'Mario',
              cognome: 'Rossi',
              ore_contrattuali: 8.0,
              email: 'mario.rossi@test.dev',
              telefono: '123-456-7890',
              created_at: new Date().toISOString(),
              note: 'mock_dev_data'
            },
            {
              id: 'mock-uuid-2', 
              pin: 2,
              nome: 'Luigi',
              cognome: 'Verdi',
              ore_contrattuali: 8.0,
              email: 'luigi.verdi@test.dev',
              telefono: '098-765-4321',
              created_at: new Date().toISOString(),
              note: 'mock_dev_data'
            }
          ];
          return res.json({
            success: true,
            data: mockUtenti
          });
        }

        if (error) {
          throw error;
        }

        res.json({
          success: true,
          data: data || []
        });
      } catch (devError) {
        console.error('[API] Development error:', devError);
        return res.status(500).json({
          success: false,
          error: 'Errore durante il recupero degli utenti',
          code: 'QUERY_ERROR'
        });
      }
    } else {
      // Production mode: strict Supabase connection
      const { data, error } = await supabaseAdmin
        .from('utenti')
        .select('*')
        .order('pin');

      if (error) {
        console.warn('[API] Error fetching utenti:', error.message);
        return res.status(500).json({
          success: false,
          error: 'Errore durante il recupero degli utenti',
          code: 'QUERY_ERROR'
        });
      }

      res.json({
        success: true,
        data: data || []
      });
    }
  } catch (error) {
    console.error('[API] Errore utenti:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/utenti/pin/:pin - Verifica esistenza PIN
router.get('/api/utenti/pin/:pin', async (req, res) => {
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
      .select('pin, nome, cognome')
      .eq('pin', pinNum)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.json({
          success: true,
          exists: false,
          pin: pinNum
        });
      }
      
      console.warn('[API] Error checking PIN:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Errore durante la verifica del PIN',
        code: 'QUERY_ERROR'
      });
    }

    res.json({
      success: true,
      exists: true,
      data
    });
  } catch (error) {
    console.error('[API] Errore verifica PIN:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/utenti - Crea nuovo utente
router.post('/api/utenti', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        error: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const { pin, nome, cognome, email, telefono } = req.body as UtenteInsert;

    // Validazioni
    if (!pin || !nome || !cognome) {
      return res.status(400).json({
        success: false,
        error: 'Parametri obbligatori mancanti: pin, nome, cognome',
        code: 'MISSING_PARAMS'
      });
    }

    if (pin < 1 || pin > 99) {
      return res.status(400).json({
        success: false,
        error: 'PIN deve essere tra 1 e 99',
        code: 'INVALID_PIN'
      });
    }

    const { data, error } = await supabaseAdmin
      .from('utenti')
      .insert([{
        pin,
        nome: nome.trim(),
        cognome: cognome.trim(),
        email: email?.trim() || null,
        telefono: telefono?.trim() || null,
        ore_contrattuali: 8.0
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: `PIN ${pin} già esistente`,
          code: 'DUPLICATE_PIN'
        });
      }
      
      console.warn('[API] Error creating utente:', error.message);
      return res.status(500).json({
        success: false,
        error: 'Errore durante la creazione dell\'utente',
        code: 'QUERY_ERROR'
      });
    }

    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[API] Errore creazione utente:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Errore interno',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;
