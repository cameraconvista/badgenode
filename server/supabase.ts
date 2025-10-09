import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin: any = null;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ [Supabase Admin] Variabili ambiente mancanti - API admin disabilitate');
  console.warn('   VITE_SUPABASE_URL:', !!supabaseUrl);
  console.warn('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  supabaseAdmin = null;
} else {
  // Client Supabase server-side con SERVICE_ROLE_KEY per operazioni admin
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('✅ [Supabase Admin] Connected with SERVICE_ROLE_KEY');
}

export { supabaseAdmin };
