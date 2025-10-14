import { createClient } from '@supabase/supabase-js';

// Usa SUPABASE_URL (senza prefisso VITE) per il server
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log diagnostico all'avvio
console.log(`[Supabase Admin] hasUrl=${!!supabaseUrl} hasServiceRole=${!!supabaseServiceKey}`);

let supabaseAdmin: unknown = null;

const hasUrl = !!process.env.SUPABASE_URL;
const hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!hasUrl || !hasServiceRole) {
  if (process.env.NODE_ENV === 'development') {
    console.info('[Supabase Admin] disabilitato in dev: variabili mancanti');
  }
  // non inizializzare l'admin client
  supabaseAdmin = null;
} else {
  // Client Supabase server-side con SERVICE_ROLE_KEY per operazioni admin
  supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('✅ [Supabase Admin] Connected with SERVICE_ROLE_KEY');
}

export { supabaseAdmin };
