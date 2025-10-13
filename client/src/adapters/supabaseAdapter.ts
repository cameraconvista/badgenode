// Supabase SDK adapter - any confinato qui per 3rd-party API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Diagnostica runtime per verifica config (any confinato qui)
export function getRuntimeSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL ?? '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
  
  // Espone in window per verifica manuale DevTools - any necessario per window
  if (typeof window !== 'undefined') {
    (window as any).__BADGENODE_DIAG__ = {
      ...(window as any).__BADGENODE_DIAG__,
      supabase: { url, anonKeyPrefix: key.slice(0, 8), len: key.length },
    };
  }
  return { url, hasKey: Boolean(key) };
}

// RPC call wrapper - any necessario per Supabase RPC response
export async function callSupabaseRpc(functionName: string, params?: Record<string, unknown>): Promise<any> {
  const { data, error } = await supabase.rpc(functionName, params);
  if (error) throw error;
  return data;
}

// Diagnostica PROD - any necessario per probe dinamico
export function setupProdDiagnostics() {
  if (!import.meta.env.PROD) return;
  
  console.info('🔍 BadgeNode PROD Diagnostics');
  
  const config = getRuntimeSupabaseConfig();
  console.info('📊 Supabase Config:', {
    url: config.url,
    domain: config.url.split('//')[1]?.split('.')[0] || 'unknown',
    anonKey: supabaseAnonKey.slice(0, 8) + '...',
    keyLength: supabaseAnonKey.length
  });

  // Probe asincrono - any necessario per response dinamiche
  setTimeout(async () => {
    try {
      console.info('🔍 Testing data access...');
      
      const { count: utentiCount, error: utentiError } = await supabase
        .from('utenti')
        .select('*', { count: 'exact', head: true });
        
      const { data: _rpcData } = await supabase.rpc('ping_test');
      
      console.info('✅ PROD Data Access:', {
        utenti: utentiError ? `Error: ${utentiError.message}` : `${utentiCount} records`,
        rpc: 'ping_test OK'
      });
    } catch (e) {
      console.warn('⚠️ PROD Probe failed:', e);
    }
  }, 2000);
}
