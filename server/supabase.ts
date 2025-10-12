import { createClient } from '@supabase/supabase-js';

// Usa SUPABASE_URL (senza prefisso VITE) per il server
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log diagnostico all'avvio
console.log(`[Supabase Admin] hasUrl=${!!supabaseUrl} hasServiceRole=${!!supabaseServiceKey}`);

let supabaseAdmin: any = null;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ [Supabase Admin] Variabili ambiente mancanti - API admin disabilitate');
  console.warn('   SUPABASE_URL:', !!process.env.SUPABASE_URL);
  console.warn('   VITE_SUPABASE_URL:', !!process.env.VITE_SUPABASE_URL);
  console.warn('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  supabaseAdmin = null;
} else {
  // Client Supabase server-side con SERVICE_ROLE_KEY per operazioni admin
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('✅ [Supabase Admin] Connected with SERVICE_ROLE_KEY');
}

export { supabaseAdmin };
