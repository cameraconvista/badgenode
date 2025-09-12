// 🗄️ BADGEBOX Supabase Client - Modulo ES puro
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configurazione centralizzata - fallback per compatibilità
const supabaseConfig = {
  url: import.meta.env?.VITE_SUPABASE_URL || 'https://oelqgiqhpcjwtzttfhvy.supabase.co',
  key: import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbHFnaXFocGNqd3R6dHRmaHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNjA0NzIsImV4cCI6MjA0OTkzNjQ3Mn0.4r3y8F1eAJXyPOyFb0sHpfkkSTgqMUjJSgEvDBGcX30'
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

// ✅ INIZIALIZZAZIONE IMMEDIATA - Client Supabase pronto all'import
try {
  validateConfig();
  var supabaseClient = createClient(supabaseConfig.url, supabaseConfig.key);
  console.log('✅ Supabase client inizializzato immediatamente');
} catch (error) {
  console.error('❌ Errore critico Supabase:', error);
  var supabaseClient = null;
}

// Export immediato del client
export { supabaseClient };

// Funzione legacy per compatibilità
export async function initializeSupabaseClient() {
  if (!supabaseClient) {
    try {
      supabaseClient = createClient(supabaseConfig.url, supabaseConfig.key);
      console.log('✅ Supabase client ri-inizializzato');
    } catch (error) {
      console.error('❌ Errore ri-inizializzazione Supabase:', error);
      throw error;
    }
  }
  return supabaseClient;
}

// Utility per gestione errori
export function gestisciErroreSupabase(error) {
  if (error?.code === 'PGRST116') return 'Nessun dato trovato';
  if (error?.message?.includes('invalid key')) return 'Errore configurazione - contattare amministratore';
  return error?.message || 'Errore di sistema';
}