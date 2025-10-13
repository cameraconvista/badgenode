// Re-export from adapter to maintain compatibility
export { supabase, getRuntimeSupabaseConfig, setupProdDiagnostics } from '@/adapters/supabaseAdapter';

// Initialize diagnostics
import { setupProdDiagnostics } from '@/adapters/supabaseAdapter';
setupProdDiagnostics();
