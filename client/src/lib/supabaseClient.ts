// Re-export from adapter to maintain compatibility
export { supabase, getRuntimeSupabaseConfig, setupProdDiagnostics } from '@/adapters/supabaseAdapter';

// Initialize diagnostics
import { setupProdDiagnostics } from '@/adapters/supabaseAdapter';
setupProdDiagnostics();

// DEV-only Supabase diagnostics on window
if (import.meta.env.DEV) {
  const g = (globalThis as any);
  g.__BADGENODE_DIAG__ = g.__BADGENODE_DIAG__ || {};
  g.__BADGENODE_DIAG__.supabase = {
    url: (import.meta as any)?.env?.VITE_SUPABASE_URL || null,
    anonKeyPrefix: ((import.meta as any)?.env?.VITE_SUPABASE_ANON_KEY || '').slice(0, 8) || null,
  };
}
