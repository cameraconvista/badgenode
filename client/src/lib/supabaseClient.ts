import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase client initialization
console.log('✅ [Supabase] Connected to:', url?.replace(/https:\/\//, ''), 'Mode:', import.meta.env.MODE);

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.error('[Supabase ENV] Mancano env VITE_ nel bundle. Verifica .env/.env.production.local e rifai la build.', {
    mode: import.meta.env.MODE,
    hasUrl: !!url,
    hasAnon: !!anon
  });
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(url, anon);
