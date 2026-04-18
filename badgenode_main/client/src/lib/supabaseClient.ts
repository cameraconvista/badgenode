// Re-export from adapter to maintain compatibility
export { supabase, getRuntimeSupabaseConfig, setupProdDiagnostics } from '@/adapters/supabaseAdapter';

// Initialize diagnostics
import { setupProdDiagnostics } from '@/adapters/supabaseAdapter';
setupProdDiagnostics();

// DEV-only Supabase diagnostics on window
if (import.meta.env.DEV) {
  type RuntimeEnv = { VITE_SUPABASE_URL?: string; VITE_SUPABASE_ANON_KEY?: string };
  type DiagStore = typeof globalThis & { __BADGENODE_DIAG__?: { supabase?: { url: string | null; anonKeyPrefix: string | null } } };
  const g = globalThis as DiagStore;
  const env = (import.meta as ImportMeta & { env?: RuntimeEnv }).env;
  g.__BADGENODE_DIAG__ = g.__BADGENODE_DIAG__ || {};
  g.__BADGENODE_DIAG__.supabase = {
    url: env?.VITE_SUPABASE_URL || null,
    anonKeyPrefix: (env?.VITE_SUPABASE_ANON_KEY || '').slice(0, 8) || null,
  };
}
