import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import { supabaseAdmin } from './supabase';

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint - SEMPRE disponibile, no DB required
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'BadgeNode'
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
      viteUrl: process.env.VITE_SUPABASE_URL?.substring(0, 30) + '...',
      timestamp: new Date().toISOString()
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
        database: 'not_implemented'
      });
    } catch (error) {
      res.status(503).json({ 
        status: 'error', 
        timestamp: new Date().toISOString(),
        service: 'BadgeNode',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ===== UTENTI API ROUTES =====
  
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
      const { data: readData, error: readError } = await supabase
        .from('utenti')
        .select('pin, nome, cognome')
        .limit(1);
      
      // Test eliminazione (dovrebbe fallire con RLS)
      const { error: deleteError } = await supabase
        .from('utenti')
        .delete()
        .eq('pin', 99999); // PIN inesistente per sicurezza
      
      res.json({
        permissions: {
          read: !readError,
          delete: !deleteError,
          readError: readError?.message,
          deleteError: deleteError?.message,
          deleteCode: deleteError?.code
        },
        config: {
          hasUrl: !!url,
          hasAnon: !!anon,
          hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
        }
      });
      
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Errore test permessi' 
      });
    }
  });
  
  // DELETE /api/utenti/:pin - Elimina utente (richiede SERVICE_ROLE_KEY)
  app.delete('/api/utenti/:pin', async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(503).json({ 
          error: 'Servizio admin non disponibile - configurazione Supabase mancante' 
        });
      }

      const pin = parseInt(req.params.pin);
      
      if (isNaN(pin)) {
        return res.status(400).json({ error: 'PIN deve essere un numero valido' });
      }

      console.log('🗑️ [API] Eliminazione utente PIN:', pin);
      
      const { error } = await supabaseAdmin
        .from('utenti')
        .delete()
        .eq('pin', pin);
      
      if (error) {
        console.error('❌ [API] Error deleting utente:', error);
        return res.status(500).json({ error: error.message });
      }
      
      console.log('✅ [API] Utente eliminato con successo');
      res.json({ success: true, message: 'Utente eliminato con successo' });
      
    } catch (error) {
      console.error('❌ [API] Errore eliminazione utente:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Errore interno del server' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
