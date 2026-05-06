// Singleton — importato ovunque, istanza unica
// Named export per evitare ambiguità import/export

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/types/database';
import { log } from './logger';

// Variabili env (già caricate da bootstrap/env.ts)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Singleton instance marker per diagnostica
const ADMIN_INSTANCE_SYMBOL = Symbol.for('badgenode.supabase.admin');

// Crea istanza singleton
let adminInstance: ReturnType<typeof createClient<Database>> | null;

if (!supabaseUrl || !serviceRoleKey) {
  log.warn('[Supabase Admin] Variabili mancanti - istanza admin non disponibile');
  adminInstance = null;
} else {
  adminInstance = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  log.info('✅ [Supabase Admin] Singleton inizializzato');
}

// Marca istanza per diagnostica
(globalThis as Record<symbol, unknown>)[ADMIN_INSTANCE_SYMBOL] = true;

// Named export (NON default export)
export const supabaseAdmin = adminInstance;

// Export per diagnostica health check
export const getAdminDiagnostics = () => ({
  singleInstance: !!(globalThis as Record<symbol, unknown>)[ADMIN_INSTANCE_SYMBOL],
  moduleType: 'named-const' as const,
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!serviceRoleKey,
});
