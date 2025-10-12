import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

const VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Mancano variabili: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
  console.error(
    'Esempio: VITE_SUPABASE_URL=https://xxx.supabase.co VITE_SUPABASE_ANON_KEY=xxx npm run env:write'
  );
  process.exit(1);
}

const ENV_CONTENT = `VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY}
`;

const targets = [path.join(ROOT, '.env'), path.join(ROOT, '.env.production.local')];

for (const file of targets) {
  fs.writeFileSync(file, ENV_CONTENT, { encoding: 'utf8' });
  console.log(`✅ Scritto ${file}`);
}

console.log('✨ Fatto. Ora esegui: npm run build:clean && npm run start');
