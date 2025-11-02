// API endpoints per gestione utenti
import { Router } from 'express';
import { supabaseAdmin } from '../../lib/supabaseAdmin';
import { log } from '../../lib/logger';
import { FEATURE_LOGGER_ADAPTER } from '../../config/featureFlags';
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
          FEATURE_LOGGER_ADAPTER
            ? log.warn({ mode: 'development', route: 'utenti:list' }, 'using mock data')
            : console.warn('[API] Development mode: using mock data for utenti');
          const mockUtenti = [
            {
              pin: 1,
              nome: 'Mario',
              cognome: 'Rossi',
              created_at: new Date().toISOString(),
              email: null,
              telefono: null,
              ore_contrattuali: 8.0,
              descrizione_contratto: null,
              note: null
            },
            {
              pin: 2,
              nome: 'Luigi',
              cognome: 'Verdi',
              created_at: new Date().toISOString(),
              email: null,
              telefono: null,
              ore_contrattuali: 8.0,
              descrizione_contratto: null,
              note: null
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

        // S3: typesafety
        interface UtenteDaDB { pin: number; nome: string; cognome: string; created_at: string }
        // Aggiungi campi di default per compatibilità con l'interfaccia
        const utentiConDefault = (data || []).map((u: UtenteDaDB) => ({
          ...u,
          email: null,
          telefono: null,
          ore_contrattuali: 8.0,
          descrizione_contratto: null,
          note: null
        }));

        res.json({
          success: true,
          data: utentiConDefault
        });
      } catch (devError) {
        FEATURE_LOGGER_ADAPTER
          ? log.error({ error: devError, route: 'utenti:list' }, 'development error')
          : console.error('[API] Development error:', devError);
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
        FEATURE_LOGGER_ADAPTER
          ? log.warn({ error: error.message, route: 'utenti:list' }, 'error fetching utenti')
          : console.warn('[API] Error fetching utenti:', error.message);
        return res.status(500).json({
          success: false,
          error: 'Errore durante il recupero degli utenti',
          code: 'QUERY_ERROR'
        });
      }

      // S3: typesafety
      interface UtenteDaDB { pin: number; nome: string; cognome: string; created_at: string }
      // Aggiungi campi di default per compatibilità con l'interfaccia
      const utentiConDefault = (data || []).map((u: UtenteDaDB) => ({
        ...u,
        email: null,
        telefono: null,
        ore_contrattuali: 8.0,
        descrizione_contratto: null,
        note: null
      }));

      res.json({
        success: true,
        data: utentiConDefault
      });
    }
  } catch (error) {
    FEATURE_LOGGER_ADAPTER
      ? log.error({ error, route: 'utenti:list' }, 'errore utenti')
      : console.error('[API] Errore utenti:', error);
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
      
      FEATURE_LOGGER_ADAPTER
        ? log.warn({ error: error.message, route: 'utenti:checkPin' }, 'error checking PIN')
        : console.warn('[API] Error checking PIN:', error.message);
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
    FEATURE_LOGGER_ADAPTER
      ? log.error({ error, route: 'utenti:checkPin' }, 'errore verifica PIN')
      : console.error('[API] Errore verifica PIN:', error);
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
      FEATURE_LOGGER_ADAPTER
        ? log.error({ errorText, status: insertResponse.status, route: 'utenti:create' }, 'supabase INSERT error')
        : console.error('[API] Supabase INSERT error:', errorText);
      
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
    FEATURE_LOGGER_ADAPTER
      ? log.info({ pin, nome, cognome, route: 'utenti:create' }, '✅ utente creato')
      : console.log(`[API] ✅ Utente creato: PIN ${pin} - ${nome} ${cognome}`);
    
    // Restituisci il primo elemento dell'array (Supabase restituisce array)
    const userData = Array.isArray(data) ? data[0] : data;

    res.status(201).json({
      success: true,
      data: userData
    });
  } catch (error) {
    FEATURE_LOGGER_ADAPTER
      ? log.error({ error, route: 'utenti:create' }, 'errore creazione utente')
      : console.error('[API] Errore creazione utente:', error);
    
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

// PUT /api/utenti/:pin - Aggiorna utente esistente
router.put('/api/utenti/:pin', async (req, res) => {
  try {
    if (!supabaseAdmin && process.env.NODE_ENV !== 'development') {
      return res.status(503).json({
        success: false,
        message: 'Servizio admin non disponibile - configurazione Supabase mancante',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    const { pin: paramPin } = req.params;
    const pinNum = parseInt(paramPin, 10);

    // Validazione PIN
    if (isNaN(pinNum) || pinNum < 1 || pinNum > 99) {
      return res.status(400).json({
        success: false,
        message: 'PIN deve essere un numero tra 1 e 99',
        code: 'INVALID_PIN'
      });
    }

    // Estrai campi aggiornabili dal body
    const { nome, cognome, email, telefono, ore_contrattuali, note } = req.body;

    // S3: typesafety
    // Costruisci payload di update solo con campi forniti
    const updatePayload: Partial<{
      nome: string;
      cognome: string;
      email: string | null;
      telefono: string | null;
      ore_contrattuali: number;
      note: string | null;
    }> = {};
    
    if (nome !== undefined) {
      const nomeStr = typeof nome === 'string' ? nome.trim() : '';
      if (!nomeStr) {
        return res.status(400).json({
          success: false,
          message: 'Nome non può essere vuoto',
          code: 'BAD_REQUEST'
        });
      }
      updatePayload.nome = nomeStr;
    }

    if (cognome !== undefined) {
      const cognomeStr = typeof cognome === 'string' ? cognome.trim() : '';
      if (!cognomeStr) {
        return res.status(400).json({
          success: false,
          message: 'Cognome non può essere vuoto',
          code: 'BAD_REQUEST'
        });
      }
      updatePayload.cognome = cognomeStr;
    }

    if (email !== undefined) {
      updatePayload.email = email && typeof email === 'string' ? email.trim() : null;
    }

    if (telefono !== undefined) {
      updatePayload.telefono = telefono && typeof telefono === 'string' ? telefono.trim() : null;
    }

    if (ore_contrattuali !== undefined) {
      const oreNum = typeof ore_contrattuali === 'number' ? ore_contrattuali : parseFloat(ore_contrattuali);
      if (isNaN(oreNum) || oreNum <= 0 || oreNum > 24) {
        return res.status(400).json({
          success: false,
          message: 'Ore contrattuali devono essere tra 0.25 e 24',
          code: 'BAD_REQUEST'
        });
      }
      updatePayload.ore_contrattuali = oreNum;
    }

    if (note !== undefined) {
      updatePayload.note = note && typeof note === 'string' ? note.trim() : null;
    }

    // NOTA: descrizione_contratto non esiste nella tabella utenti (solo in types per compatibilità UI)

    // Verifica che ci sia almeno un campo da aggiornare
    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nessun campo da aggiornare',
        code: 'BAD_REQUEST'
      });
    }

    // UPDATE con Supabase
    if (!supabaseAdmin) {
      return res.status(503).json({
        success: false,
        message: 'Servizio admin non disponibile',
        code: 'SERVICE_UNAVAILABLE'
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin as any)
      .from('utenti')
      .update(updatePayload)
      .eq('pin', pinNum)
      .select()
      .single();

    if (error) {
      FEATURE_LOGGER_ADAPTER
        ? log.error({ error, route: 'utenti:update' }, 'supabase UPDATE error')
        : console.error('[API] Supabase UPDATE error:', error);
      
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: `Utente con PIN ${pinNum} non trovato`,
          code: 'NOT_FOUND'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Errore durante l\'aggiornamento dell\'utente',
        code: 'QUERY_ERROR'
      });
    }

    FEATURE_LOGGER_ADAPTER
      ? log.info({ pin: pinNum, route: 'utenti:update' }, '✅ utente aggiornato')
      : console.log(`[API] ✅ Utente aggiornato: PIN ${pinNum}`);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    FEATURE_LOGGER_ADAPTER
      ? log.error({ error, route: 'utenti:update' }, 'errore aggiornamento utente')
      : console.error('[API] Errore aggiornamento utente:', error);
    
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
