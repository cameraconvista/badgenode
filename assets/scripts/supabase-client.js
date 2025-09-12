
// 🗄️ BADGEBOX Supabase Client - Modulo ES puro
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configurazione centralizzata
const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY
};

// Validazione configurazione
function validateConfig() {
  if (!supabaseConfig.url || !supabaseConfig.key) {
    throw new Error(`❌ Configurazione Supabase mancante:
    - VITE_SUPABASE_URL: ${supabaseConfig.url ? '✅' : '❌'}
    - VITE_SUPABASE_ANON_KEY: ${supabaseConfig.key ? '✅' : '❌'}
    
    Verifica le variabili d'ambiente in Replit Secrets.`);
  }
}

// Client Supabase singleton
let supabaseClient = null;

export async function initializeSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  try {
    validateConfig();
    
    supabaseClient = createClient(supabaseConfig.url, supabaseConfig.key);
    
    // Test connessione
    const { data, error } = await supabaseClient.from('utenti').select('count').limit(1);
    if (error) {
      console.error('❌ Test connessione Supabase fallito:', error);
      throw error;
    }
    
    console.log('✅ Supabase client inizializzato e testato');
    return supabaseClient;
    
  } catch (error) {
    console.error('❌ Errore inizializzazione Supabase:', error);
    throw error;
  }
}

// Export per compatibilità
export { supabaseClient };

// Utility per gestione errori
export function gestisciErroreSupabase(error) {
  if (error?.code === 'PGRST116') return 'Nessun dato trovato';
  if (error?.message?.includes('invalid key')) return 'Errore configurazione - contattare amministratore';
  return error?.message || 'Errore di sistema';
}
