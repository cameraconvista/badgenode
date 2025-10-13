import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// Diagnostica runtime per verifica config (senza side-effect)
export function getRuntimeSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL ?? '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  
  // Espone in window per verifica manuale DevTools
  if (typeof window !== 'undefined') {
    (window as any).__BADGENODE_DIAG__ = {
      ...(window as any).__BADGENODE_DIAG__,
      supabase: { url, anonKeyPrefix: key.slice(0, 8), len: key.length },
    };
  }
  return { url, hasKey: Boolean(key) };
}

// Supabase client initialization

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

// Inizializza diagnostica una sola volta
getRuntimeSupabaseConfig();

// Diagnosi PROD vs LOCAL - Solo in produzione
if (import.meta.env.PROD) {
  console.info('🔍 BadgeNode PROD Diagnostics');
  
  // 1. Config rilevata
  const config = getRuntimeSupabaseConfig();
  console.info('📊 Supabase Config:', {
    url: config.url,
    domain: config.url.split('//')[1]?.split('.')[0] || 'unknown',
    anonKeyHash: supabaseAnonKey.slice(0, 8) + '...',
    keyLength: supabaseAnonKey.length
  });

  // 2. Probe lettura dati (async, non blocca l'app)
  setTimeout(async () => {
    try {
      console.info('🔍 Testing data access...');
      
      // Test utenti
      const { count: utentiCount, error: utentiError } = await supabase
        .from('utenti')
        .select('*', { count: 'exact', head: true });
      
      console.info('👥 Utenti probe:', { 
        count: utentiCount, 
        error: utentiError?.message || null 
      });

      // Test timbrature  
      const { count: timbratureCount, error: timbratureError } = await supabase
        .from('timbrature')
        .select('*', { count: 'exact', head: true });
      
      console.info('⏰ Timbrature probe:', { 
        count: timbratureCount, 
        error: timbratureError?.message || null 
      });

      // Test RPC (solo verifica presenza, non esecuzione)
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('insert_timbro_v2', { p_pin: 999, p_tipo: 'entrata' })
        .limit(0); // Non esegue, solo verifica esistenza
      
      console.info('🔧 RPC insert_timbro_v2 probe:', { 
        exists: !rpcError || !rpcError.message.includes('does not exist'),
        error: rpcError?.message || null 
      });

    } catch (err) {
      console.error('❌ PROD Diagnostics failed:', err);
    }
  }, 1000);
}
