// Bootstrap env - DEVE essere importato per primo in server/index.ts
// Carica dotenv prima di qualsiasi altro modulo per evitare problemi di timing

import 'dotenv/config';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { log } from '../lib/logger';

// Carica .env.local esplicitamente per development
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

// Carica in ordine: .env.local (dev) poi .env (fallback)
import dotenv from 'dotenv';
dotenv.config({ path: join(rootDir, '.env.local') });
dotenv.config(); // Fallback per .env standard

// Validazione env critiche (solo log warn, niente throw in dev)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

log.info('[ENV Bootstrap] Validazione variabili critiche:');
log.info('  SUPABASE_URL:', !!supabaseUrl ? '✅' : '❌');
log.info('  SUPABASE_SERVICE_ROLE_KEY:', !!serviceRoleKey ? '✅' : '❌');

if (!supabaseUrl || !serviceRoleKey) {
  if (process.env.NODE_ENV === 'development') {
    log.warn('⚠️  [ENV Bootstrap] Variabili Supabase mancanti in development');
    log.warn('   Alcuni endpoint API potrebbero non funzionare');
  } else {
    log.error('❌ [ENV Bootstrap] Variabili Supabase mancanti in production');
  }
}

log.info('✅ [ENV Bootstrap] Completato');
