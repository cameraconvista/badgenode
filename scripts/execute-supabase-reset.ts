// Script per eseguire reset Supabase lato server
// Esegue script SQL idempotente + smoke test

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Configurazione Supabase (usa SERVICE_ROLE_KEY per operazioni admin)
const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error('❌ Mancano variabili ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});

async function executeSQL(sql: string, description: string) {
  console.log(`\n🔧 Esecuzione: ${description}`);
  console.log('='.repeat(60));

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`❌ Errore: ${error.message}`);
      return false;
    }

    console.log('✅ Successo');
    if (data) {
      console.log('📊 Risultato:', data);
    }
    return true;
  } catch (error) {
    console.error(`❌ Eccezione: ${error}`);
    return false;
  }
}

async function executeRawSQL(sql: string, description: string) {
  console.log(`\n🔧 Esecuzione: ${description}`);
  console.log('='.repeat(60));

  try {
    // Per script complessi, proviamo a eseguire direttamente
    const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
      },
      body: JSON.stringify({ sql_query: sql }),
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error('Dettagli:', errorText);
      return false;
    }

    const result = await response.json();
    console.log('✅ Successo');
    if (result) {
      console.log('📊 Risultato:', result);
    }
    return true;
  } catch (error) {
    console.error(`❌ Eccezione: ${error}`);
    return false;
  }
}

async function main() {
  console.log('🚀 BADGENODE STEP 2: Reset Supabase lato server');
  console.log(`📡 URL: ${url.substring(0, 30)}...`);
  console.log(`🔑 Service Role: ${serviceRoleKey ? 'Presente' : 'Mancante'}`);

  // Leggi script SQL
  const resetSQL = readFileSync(join(__dirname, 'sql/reset-supabase-server.sql'), 'utf-8');
  const smokeTestSQL = readFileSync(join(__dirname, 'sql/smoke-test-supabase.sql'), 'utf-8');

  // Esegui reset
  const resetSuccess = await executeRawSQL(resetSQL, 'Reset Supabase Server (idempotente)');

  if (!resetSuccess) {
    console.error('❌ Reset fallito, interrompo');
    process.exit(1);
  }

  // Pausa breve
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Esegui smoke test
  const smokeSuccess = await executeRawSQL(smokeTestSQL, 'Smoke Test');

  if (!smokeSuccess) {
    console.error('❌ Smoke test fallito');
    process.exit(1);
  }

  console.log('\n🎉 STEP 2 COMPLETATO CON SUCCESSO!');
  console.log('📋 Prossimo: Creare report e attendere conferma per STEP 3');
}

main().catch(console.error);
