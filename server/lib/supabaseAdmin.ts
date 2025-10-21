// Singleton — importato ovunque, istanza unica
// Named export per evitare ambiguità import/export

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../shared/types/database';

// Variabili env (già caricate da bootstrap/env.ts)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Singleton instance marker per diagnostica
const ADMIN_INSTANCE_SYMBOL = Symbol.for('badgenode.supabase.admin');

// Guard rail: se env mancano, crea proxy che lancia errore al primo uso
function createAdminProxy(): ReturnType<typeof createClient<Database>> {
  return new Proxy({} as ReturnType<typeof createClient<Database>>, {
    get(_target, prop) {
      // Permetti controlli di esistenza senza lanciare errore
      if (prop === Symbol.toPrimitive || prop === 'valueOf' || prop === 'toString') {
        return () => null;
      }
      throw new Error(`Supabase Admin non disponibile: configurazione mancante (tentativo di accesso a '${String(prop)}')`);
    }
  });
}

// Crea istanza singleton
let adminInstance: ReturnType<typeof createClient<Database>> | null;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('[Supabase Admin] Variabili mancanti - creando proxy di errore');
  adminInstance = null; // Usa null invece del proxy per controlli più semplici
} else {
  adminInstance = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('✅ [Supabase Admin] Singleton inizializzato');
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
