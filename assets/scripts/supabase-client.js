
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

const SUPABASE_URL = 'https://txmjqrnitfsiytbytxlc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bWpxcm5pdGZzaXl0Ynl0eGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1MzE4NTYsImV4cCI6MjA0MTEwNzg1Nn0.2W_1oe8mSGCOdFqp-BXEFgqhJpUhGpWvNLHlc_PGJkU';

// Cache per connessioni e test
let connectionCache = { status: null, timestamp: 0 };
const CACHE_TTL = 30000; // 30 secondi

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'badgebox@1.0.0'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Mapping errori Supabase ottimizzato
const ERROR_MESSAGES = {
  'PGRST116': 'Nessun dato trovato',
  'PGRST301': 'Accesso negato',
  '23505': 'PIN già esistente',
  '23503': 'Riferimento non valido',
  '42P01': 'Tabella non trovata',
  '23514': 'Valore non valido',
  'PGRST204': 'Nessun contenuto',
  'PGRST400': 'Richiesta non valida'
};

export function gestisciErroreSupabase(error) {
  if (!error) return 'Errore sconosciuto';
  
  console.error('🔴 Errore Supabase:', {
    code: error.code,
    message: error.message,
    details: error.details
  });

  return ERROR_MESSAGES[error.code] || error.message || 'Errore durante l\'operazione';
}

// Test connessione con cache
export async function testConnessione() {
  const now = Date.now();
  
  // Usa cache se valida
  if (connectionCache.status !== null && (now - connectionCache.timestamp) < CACHE_TTL) {
    return connectionCache.status;
  }

  try {
    const { error } = await supabaseClient
      .from('utenti')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;
    
    connectionCache = { status: true, timestamp: now };
    console.log('✅ Connessione Supabase OK');
    return true;
  } catch (error) {
    connectionCache = { status: false, timestamp: now };
    console.error('❌ Errore connessione Supabase:', error);
    return false;
  }
}

// Query ottimizzate con caching interno
export async function recuperaUtente(pin) {
  try {
    const { data, error } = await supabaseClient
      .from('utenti')
      .select('*')
      .eq('pin', parseInt(pin))
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Errore recupero utente:', error);
    throw new Error(gestisciErroreSupabase(error));
  }
}

export async function recuperaTimbrature(pin, dataInizio, dataFine) {
  try {
    const { data, error } = await supabaseClient
      .from('timbrature')
      .select('*')
      .eq('pin', parseInt(pin))
      .gte('data', dataInizio)
      .lte('data', dataFine)
      .order('data', { ascending: true })
      .order('ore', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('❌ Errore recupero timbrature:', error);
    throw new Error(gestisciErroreSupabase(error));
  }
}

// Utility per pulizia cache
export function pulisciCache() {
  connectionCache = { status: null, timestamp: 0 };
  console.log('🧹 Cache pulita');
}

// Health check avanzato
export async function healthCheck() {
  const checks = {
    database: false,
    tables: false,
    permissions: false
  };

  try {
    // Test base connessione
    checks.database = await testConnessione();

    // Test tabelle principali
    const tabelle = ['utenti', 'timbrature', 'dipendenti_archiviati'];
    const testTabelle = await Promise.allSettled(
      tabelle.map(table => 
        supabaseClient.from(table).select('count', { count: 'exact', head: true })
      )
    );
    checks.tables = testTabelle.every(result => result.status === 'fulfilled');

    // Test permessi scrittura (con rollback)
    try {
      const { error } = await supabaseClient
        .from('utenti')
        .select('id')
        .limit(1);
      checks.permissions = !error;
    } catch {
      checks.permissions = false;
    }

    console.log('🏥 Health Check:', checks);
    return checks;
  } catch (error) {
    console.error('❌ Health check fallito:', error);
    return checks;
  }
}

// Inizializzazione automatica
(async function initSupabase() {
  try {
    await testConnessione();
  } catch (error) {
    console.warn('⚠️ Inizializzazione Supabase fallita:', error);
  }
})();
