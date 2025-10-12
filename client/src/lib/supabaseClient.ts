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
