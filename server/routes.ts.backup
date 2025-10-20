import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { createClient } from '@supabase/supabase-js';
// import { storage } from './storage'; // Unused - commented out
import { supabaseAdmin, getAdminDiagnostics } from './lib/supabaseAdmin';
import type { UtenteInsert } from './types/utenti';

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint - SEMPRE disponibile, no DB required
  app.get('/api/health', (_req, res) => {
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
  app.get('/api/health/admin', (_req, res) => {
    const diagnostics = getAdminDiagnostics();
    
    res.json({
      ok: diagnostics.hasUrl && diagnostics.hasServiceKey,
      ...diagnostics,
      urlSource: process.env.SUPABASE_URL ? 'SUPABASE_URL' : (process.env.VITE_SUPABASE_URL ? 'VITE_SUPABASE_URL' : 'none')
    });
  });

  // Debug endpoint for env vars (DEV only)
  app.get('/api/debug/env', (_req, res) => {
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
  app.get('/api/health/deep', async (_req, res) => {
    try {
      // TODO: Ping database when storage is implemented
      // await storage.healthCheck();
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'BadgeNode',
        database: 'not_implemented',
      });
    } catch (error) {
      res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'BadgeNode',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  // ===== UTENTI API ROUTES =====

  // GET /api/utenti - Lista utenti attivi
  app.get('/api/utenti', async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(503).json({
          success: false,
          error: 'Servizio admin non disponibile - configurazione Supabase mancante',
          code: 'SERVICE_UNAVAILABLE'
        });
      }

      const { data, error } = await supabaseAdmin
        .from('utenti')
        .select('*')
        .order('pin');

      if (error) {
        console.warn('[API] Error fetching utenti:', error.message);
        // In development, return empty array for invalid API key instead of 500
        if (error.message.includes('Invalid API key') && process.env.NODE_ENV === 'development') {
          console.warn('[API] Development mode: returning empty utenti array');
          return res.json({
            success: true,
            data: []
          });
        }
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
  app.get('/api/utenti/pin/:pin', async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(503).json({
          success: false,
          error: 'Servizio admin non disponibile',
          code: 'SERVICE_UNAVAILABLE'
        });
      }

      const pin = parseInt(req.params.pin);
      if (isNaN(pin)) {
        return res.status(400).json({
          success: false,
          error: 'PIN deve essere un numero valido',
          code: 'INVALID_PIN'
        });
      }

      const { count, error } = await supabaseAdmin
        .from('utenti')
        .select('pin', { count: 'exact' })
        .eq('pin', pin)
        .limit(1);

      if (error) {
        console.warn('[API] Error checking PIN:', error.message);
        return res.status(500).json({
          success: false,
          error: 'Errore durante verifica PIN',
          code: 'QUERY_ERROR'
        });
      }

      res.json({
        success: true,
        data: { exists: (count || 0) > 0, pin }
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
  app.post('/api/utenti', async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(503).json({
          success: false,
          error: 'Servizio admin non disponibile',
          code: 'SERVICE_UNAVAILABLE'
        });
      }

      // Strict DTO & validation (consente solo pin,nome,cognome)
      const issues: string[] = [];
      const dto = {
        pin: Number(req.body?.pin),
        nome: String(req.body?.nome ?? '').trim(),
        cognome: String(req.body?.cognome ?? '').trim(),
      };

      if (!Number.isInteger(dto.pin) || dto.pin < 1 || dto.pin > 99) {
        issues.push('PIN deve essere un numero tra 1 e 99');
      }
      if (!dto.nome) issues.push('Nome obbligatorio');
      if (!dto.cognome) issues.push('Cognome obbligatorio');

      if (issues.length > 0) {
        return res.status(400).json({
          success: false,
          code: 'VALIDATION_ERROR',
          message: 'Dati mancanti o non validi',
          issues,
        });
      }

      // Costruisci payload sicuro (ignora campi extra)
      const payload: UtenteInsert = {
        pin: dto.pin,
        nome: dto.nome,
        cognome: dto.cognome,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabaseAdmin
        .from('utenti')
        .upsert(payload as any, { onConflict: 'pin' })
        .select('pin,nome,cognome,created_at')
        .single();

      if (error) {
        console.warn('[API] Error creating utente:', error.message);
        return res.status(400).json({
          success: false,
          code: 'SUPABASE_ERROR',
          message: error.message,
        });
      }

      console.info('[API] Utente creato:', { pin: dto.pin, nome: dto.nome, cognome: dto.cognome });
      res.json({
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

  // GET /api/ex-dipendenti - Lista ex dipendenti
  app.get('/api/ex-dipendenti', async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(503).json({
          success: false,
          error: 'Servizio admin non disponibile',
          code: 'SERVICE_UNAVAILABLE'
        });
      }

      const { data, error } = await supabaseAdmin
        .from('ex_dipendenti')
        .select('*')
        .order('archiviato_at', { ascending: false });

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
  app.get('/api/storico', async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(503).json({
          success: false,
          error: 'Servizio admin non disponibile',
          code: 'SERVICE_UNAVAILABLE'
        });
      }

      const { pin, dal, al } = req.query;

      if (!pin) {
        return res.status(400).json({
          success: false,
          error: 'Parametro pin obbligatorio',
          code: 'MISSING_PIN'
        });
      }

      const pinNum = Number(pin);
      if (!Number.isInteger(pinNum) || pinNum <= 0) {
        return res.status(400).json({
          success: false,
          error: 'PIN non valido',
          code: 'INVALID_PIN'
        });
      }

      let query = supabaseAdmin
        .from('timbrature')
        .select('id,pin,tipo,ts_order,giorno_logico,data_locale,ora_locale,client_event_id')
        .eq('pin', pinNum)
        .order('giorno_logico', { ascending: true })
        .order('ts_order', { ascending: true });

      // Filtri opzionali
      if (dal && typeof dal === 'string') {
        query = query.gte('giorno_logico', dal);
      }
      if (al && typeof al === 'string') {
        query = query.lte('giorno_logico', al);
      }

      const { data, error } = await query;

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
  app.get('/api/utenti/test-permissions', async (req, res) => {
    try {
      // Usa il client normale (ANON_KEY) per testare permessi
      const { createClient } = await import('@supabase/supabase-js');
      const url = process.env.VITE_SUPABASE_URL;
      const anon = process.env.VITE_SUPABASE_ANON_KEY;

      if (!url || !anon) {
        return res.status(503).json({ error: 'Configurazione Supabase client mancante' });
      }

      const supabase = createClient(url, anon);

      // Test lettura
      const { error: readError } = await supabase
        .from('utenti')
        .select('pin, nome, cognome')
        .limit(1);

      // Test eliminazione (dovrebbe fallire con RLS)
      const { error: deleteError } = await supabase.from('utenti').delete().eq('pin', 99999); // PIN inesistente per sicurezza

      res.json({
        permissions: {
          read: !readError,
          delete: !deleteError,
          readError: readError?.message,
          deleteError: deleteError?.message,
          deleteCode: deleteError?.code,
        },
        config: {
          hasUrl: !!url,
          hasAnon: !!anon,
          hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        },
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Errore test permessi',
      });
    }
  });

  // DELETE /api/utenti/:pin - Elimina utente (richiede SERVICE_ROLE_KEY)
  app.delete('/api/utenti/:pin', async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(503).json({
          error: 'Servizio admin non disponibile - configurazione Supabase mancante',
        });
      }

      const pin = parseInt(req.params.pin);

      if (isNaN(pin)) {
        return res.status(400).json({ error: 'PIN deve essere un numero valido' });
      }

      console.log('🗑️ [API] Eliminazione utente PIN:', pin);

      // STEP 1: Elimina tutte le timbrature dell'utente (CASCADE)
      console.log('🗑️ [API] Eliminazione timbrature per PIN:', pin);
      const { error: timbratureError } = await (supabaseAdmin as ReturnType<typeof createClient>)
        .from('timbrature')
        .delete()
        .eq('pin', pin);

      if (timbratureError) {
        console.error('❌ [API] Error deleting timbrature:', timbratureError);
        return res.status(400).json({
          error: `Errore eliminazione timbrature: ${timbratureError.message}`,
          code: timbratureError.code,
          details: timbratureError.details,
        });
      }

      console.log('✅ [API] Timbrature eliminate per PIN:', pin);

      // STEP 2: Elimina l'utente
      const { data, error } = await (supabaseAdmin as ReturnType<typeof createClient>).from('utenti').delete().eq('pin', pin).select();

      if (error) {
        console.error('❌ [API] Error deleting utente:', error);
        return res.status(400).json({
          error: error.message,
          code: error.code,
          details: error.details,
        });
      }

      console.log(`✅ [API] DELETE utenti OK id=${pin} (CASCADE: timbrature + utente)`);
      res.json({
        success: true,
        message: 'Utente e tutte le sue timbrature eliminati con successo',
        deletedCount: data?.length || 0,
      });
    } catch (error) {
      console.error('❌ [API] Errore eliminazione utente:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Errore interno del server',
      });
    }
  });

  // Router timbrature con SERVICE_ROLE_KEY (import dinamico dopo env load)
  const { default: timbratureRouter } = await import('./routes/timbrature.js');
  app.use('/api/timbrature', timbratureRouter);

  const httpServer = createServer(app);

  return httpServer;
}
