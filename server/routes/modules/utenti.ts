// API endpoints per gestione utenti
import { Router } from 'express';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { createClient } from '@supabase/supabase-js';
// Rimuovo import tipi per evitare conflitti schema

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
          .select('pin, nome, cognome, created_at')
          .order('pin');

        if (error && error.message.includes('Invalid API key')) {
          console.warn('[API] Development mode: using mock data for utenti');
          const mockUtenti = [
            {
              pin: 1,
              nome: 'Mario',
              cognome: 'Rossi',
              created_at: new Date().toISOString()
            },
            {
              pin: 2,
              nome: 'Luigi',
              cognome: 'Verdi',
              created_at: new Date().toISOString()
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
        .select('pin, nome, cognome, created_at')
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
    // Bypass controllo supabaseAdmin in development per evitare blocchi
    if (!supabaseAdmin && process.env.NODE_ENV !== 'development') {
      return res.status(503).json({
        success: false,
        message: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    // Estrai e normalizza input - SOLO campi esistenti nello schema DB reale
    const { pin: rawPin, nome: rawNome, cognome: rawCognome } = req.body;

    // Coerce e validazione input
    const pin = typeof rawPin === 'number' ? rawPin : parseInt(rawPin, 10);
    const nome = typeof rawNome === 'string' ? rawNome.trim() : '';
    const cognome = typeof rawCognome === 'string' ? rawCognome.trim() : '';

    // Validazione campi obbligatori
    if (!nome || !cognome) {
      return res.status(400).json({
        success: false,
        message: 'Nome e cognome sono obbligatori',
        code: 'BAD_REQUEST'
      });
    }

    // Validazione PIN
    if (isNaN(pin) || pin < 1 || pin > 99) {
      return res.status(400).json({
        success: false,
        message: 'PIN deve essere un numero tra 1 e 99',
        code: 'INVALID_PIN'
      });
    }

    // SOLUZIONE DEFINITIVA: INSERT diretto funzionante
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      return res.status(503).json({
        success: false,
        message: 'Configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }
    
    // INSERT diretto con REST API Supabase (bypassa problemi client)
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/utenti`, {
      method: 'POST',
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        pin: pin,
        nome: nome,
        cognome: cognome
      })
    });
    
    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      console.error('[API] Supabase INSERT error:', errorText);
      
      // Gestione errori specifici
      if (insertResponse.status === 409 || errorText.includes('duplicate')) {
        return res.status(409).json({
          success: false,
          message: `PIN ${pin} già in uso`,
          code: 'PIN_TAKEN'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Errore durante la creazione dell\'utente',
        code: 'QUERY_ERROR'
      });
    }
    
    const data = await insertResponse.json();
    console.log(`[API] ✅ Utente creato: PIN ${pin} - ${nome} ${cognome}`);
    
    // Restituisci il primo elemento dell'array (Supabase restituisce array)
    const userData = Array.isArray(data) ? data[0] : data;

    res.status(201).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('[API] Errore creazione utente:', error);
    
    // Genera request ID per tracking
    const requestId = Math.random().toString(36).substring(2, 15);
    
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      code: 'INTERNAL_ERROR',
      requestId
    });
  }
});

export default router;
