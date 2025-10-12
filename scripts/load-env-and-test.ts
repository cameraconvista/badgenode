// Script che carica .env e testa Supabase
import { config } from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carica variabili da .env.local
config({ path: join(__dirname, '../.env.local') });

console.log('🔧 Variabili ambiente caricate:');
console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Presente' : 'Mancante');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'Presente' : 'Mancante');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Presente' : 'Mancante');

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey) {
  console.error('❌ Mancano variabili ambiente base');
  process.exit(1);
}

// Usa ANON_KEY per ora (più sicuro per test iniziali)
const supabase = createClient(url, anonKey, {
  auth: { persistSession: false }
});

async function main() {
  console.log('\n🚀 Test connessione Supabase...');
  
  try {
    // Test 1: Lettura utenti esistenti
    console.log('\n📊 Test lettura utenti...');
    const { data: utenti, error: utentiError } = await supabase
      .from('utenti')
      .select('*')
      .limit(5);
    
    if (utentiError) {
      console.log('⚠️ Errore lettura utenti:', utentiError.message);
      console.log('Codice:', utentiError.code);
    } else {
      console.log('✅ Utenti trovati:', utenti?.length || 0);
      if (utenti && utenti.length > 0) {
        console.log('Primi utenti:', utenti);
      }
    }
    
    // Test 2: Test RPC insert_timbro_v2 (se esiste)
    console.log('\n🧪 Test RPC insert_timbro_v2...');
    try {
      const { data: rpcTest, error: rpcError } = await supabase
        .rpc('insert_timbro_v2', { p_pin: 1, p_tipo: 'entrata' });
      
      if (rpcError) {
        console.log('⚠️ RPC Error:', rpcError.message);
        console.log('Codice:', rpcError.code);
      } else {
        console.log('✅ RPC funziona:', rpcTest);
      }
    } catch (error) {
      console.log('⚠️ RPC Exception:', error);
    }
    
    // Test 3: Lettura timbrature esistenti
    console.log('\n📊 Test lettura timbrature...');
    const { data: timbrature, error: timbratureError } = await supabase
      .from('timbrature')
      .select('*')
      .limit(5);
    
    if (timbratureError) {
      console.log('⚠️ Errore lettura timbrature:', timbratureError.message);
    } else {
      console.log('✅ Timbrature trovate:', timbrature?.length || 0);
      if (timbrature && timbrature.length > 0) {
        console.log('Prime timbrature:', timbrature);
      }
    }
    
  } catch (error) {
    console.error('❌ Errore generale:', error);
  }
}

main();
