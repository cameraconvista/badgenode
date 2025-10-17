// Singleton — importato ovunque, istanza unica
// Named export per evitare ambiguità import/export

import { createClient } from '@supabase/supabase-js';

// Variabili env (già caricate da bootstrap/env.ts)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Singleton instance marker per diagnostica
const ADMIN_INSTANCE_SYMBOL = Symbol.for('badgenode.supabase.admin');

// Guard rail: se env mancano, crea proxy che lancia errore al primo uso
function createAdminProxy() {
  return new Proxy({} as any, {
    get(_target, prop) {
      throw new Error(`Supabase Admin non disponibile: configurazione mancante (tentativo di accesso a '${String(prop)}')`);
    }
  });
}

// Crea istanza singleton
let adminInstance: ReturnType<typeof createClient>;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('[Supabase Admin] Variabili mancanti - creando proxy di errore');
  adminInstance = createAdminProxy();
} else {
  adminInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  console.log('✅ [Supabase Admin] Singleton inizializzato');
}

// Marca istanza per diagnostica
(globalThis as any)[ADMIN_INSTANCE_SYMBOL] = true;

// Named export (NON default export)
export const supabaseAdmin = adminInstance;

// Export per diagnostica health check
export const getAdminDiagnostics = () => ({
  singleInstance: !!(globalThis as any)[ADMIN_INSTANCE_SYMBOL],
  moduleType: 'named-const' as const,
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!serviceRoleKey,
});
