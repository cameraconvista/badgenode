
// Normalizzazione lettura ENV per compatibilità mobile/desktop
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 
                     (typeof window !== 'undefined' && window.__SUPABASE_URL__) ||
                     'https://txmjqrnitfsiytbytxlc.supabase.co';

const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 
                          (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__) ||
                          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bWpxcm5pdGZzaXl0Ynl0eGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjYxNjExMzcsImV4cCI6MjA0MTczNzEzN30.LGKP6sI7BQu8x7z2lAX7dWKjhYr4fYXVOcQf-DG4Gok';

// Validazione chiavi prima dell'inizializzazione
if (!SUPABASE_URL || SUPABASE_URL === 'undefined' || !SUPABASE_URL.includes('supabase.co')) {
  console.error('❌ SUPABASE_URL non valida:', SUPABASE_URL);
  throw new Error('Configurazione Supabase non valida - URL mancante');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'undefined' || SUPABASE_ANON_KEY.length < 100) {
  console.error('❌ SUPABASE_ANON_KEY non valida');
  throw new Error('Configurazione Supabase non valida - ANON_KEY mancante');
}

// Inizializzazione client con retry logic
let supabaseClient = null;

try {
  // Import dinamico di Supabase con fallback CDN
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.38.0/+esm');
  
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    realtime: {
      params: {
        eventsPerSecond: 2
      }
    }
  });
  
  console.log('✅ Supabase client inizializzato correttamente');
  
} catch (error) {
  console.error('❌ Errore inizializzazione Supabase:', error);
  throw new Error(`Impossibile inizializzare Supabase: ${error.message}`);
}

export { supabaseClient };
