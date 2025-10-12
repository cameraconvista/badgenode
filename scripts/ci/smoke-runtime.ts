import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL!;
const anon = process.env.VITE_SUPABASE_ANON_KEY!;

async function main() {
  const supabase = createClient(url, anon, { auth: { persistSession: false } });

  // 1) SELECT utenti
  const u = await supabase.from('utenti').select('pin').limit(3);
  if (u.error) throw u.error;
  if (!u.data || !Array.isArray(u.data)) throw new Error('Utenti: risposta non valida');

  // 2) RPC insert_timbro_v2 (test "dry": entrata→uscita in sandbox pin=3)
  const e = await supabase.rpc('insert_timbro_v2', { p_pin: 3, p_tipo: 'entrata' });
  if (e.error && !/Alternanza|PIN/.test(e.error.message)) throw e.error;

  console.log('OK smoke runtime');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
