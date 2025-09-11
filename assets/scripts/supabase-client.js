import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
console.log('[SUPA] url=', (import.meta.env.VITE_SUPABASE_URL||'undefined'));
console.log('[SUPA] anonKey=', anonKey? (anonKey.slice(0,6)+'…'+anonKey.slice(-4)) : 'undefined');

if (!url || !anonKey) {
  console.error('❌ Variabili Supabase mancanti. Controlla VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY');
}

export const supabaseClient = createClient(url, anonKey, {
  auth: { persistSession: false }
});
