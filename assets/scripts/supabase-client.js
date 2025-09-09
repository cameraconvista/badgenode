import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

const SUPABASE_URL = 'https://txmjqrnitfsiytbytxlc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4bWpxcm5pdGZzaXl0Ynl0eGxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU1MzE4NTYsImV4cCI6MjA0MTEwNzg1Nn0.2W_1oe8mSGCOdFqp-BXEFgqhJpUhGpWvNLHlc_PGJkU';

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'badgebox@1.0.0'
    }
  }
});

// Funzione helper per gestire errori
export function gestisciErroreSupabase(error) {
  console.error('Errore Supabase:', error);

  switch (error?.code) {
    case 'PGRST116': return 'Nessun dato trovato';
    case '23505': return 'PIN già esistente';
    case '42P01': return 'Tabella non trovata';
    case 'PGRST301': return 'Permesso negato';
    default: return 'Errore durante l\'operazione';
  }
}

// Test connessione
export async function testConnessione() {
  try {
    const { data, error } = await supabaseClient
      .from('utenti')
      .select('count', { count: 'exact', head: true });

    if (error) throw error;
    console.log('✅ Connessione Supabase OK');
    return true;
  } catch (error) {
    console.error('❌ Errore connessione Supabase:', error);
    return false;
  }
}