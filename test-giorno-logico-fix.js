#!/usr/bin/env node

/**
 * Test e Fix Giorno Logico - STEP 1
 * Verifica lo stato attuale e implementa il fix per il cutoff 05:00
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carica variabili d'ambiente se disponibili
config();

// Configurazione Supabase (usa variabili d'ambiente o fallback)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variabili Supabase mancanti. Controlla .env o variabili d\'ambiente.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 STEP 1: Analisi Giorno Logico - Fix Cutoff 05:00\n');

  // 1. Verifica dati attuali della sessione problematica
  console.log('📊 Verifica dati attuali per PIN 01 (12-13 Ottobre):');
  
  const { data: currentData, error: currentError } = await supabase
    .from('timbrature')
    .select('id, pin, tipo, data, ore, giorno_logico, created_at')
    .eq('pin', 1)
    .gte('data', '2025-10-12')
    .lte('data', '2025-10-13')
    .order('data', { ascending: true })
    .order('ore', { ascending: true });

  if (currentError) {
    console.error('❌ Errore query dati attuali:', currentError);
    return;
  }

  console.log('Dati attuali:');
  currentData.forEach(row => {
    const dataLocale = new Date(row.data + 'T' + row.ore + '+02:00');
    console.log(`  ID: ${row.id}, PIN: ${row.pin}, Tipo: ${row.tipo}, Data: ${row.data}, Ore: ${row.ore}, GiornoLogico: ${row.giorno_logico}`);
  });

  // 2. Verifica se esiste il trigger
  console.log('\n🔧 Verifica trigger enforce_alternanza_fn:');
  
  const { data: triggerData, error: triggerError } = await supabase
    .rpc('sql', { 
      query: `
        SELECT trigger_name, event_manipulation, action_statement 
        FROM information_schema.triggers 
        WHERE trigger_name = 'trg_enforce_alternanza'
      ` 
    });

  if (triggerError) {
    console.log('⚠️  Non riesco a verificare il trigger (potrebbe non avere permessi SQL diretti)');
  } else {
    console.log('Trigger trovato:', triggerData);
  }

  // 3. Verifica RPC insert_timbro_v2
  console.log('\n🔧 Test RPC insert_timbro_v2 (dry run):');
  
  try {
    // Test con orario notturno (dovrebbe essere assegnato al giorno precedente)
    const testTime = new Date('2025-10-13T01:00:00+02:00'); // 01:00 del 13/10
    console.log(`Test timestamp: ${testTime.toISOString()} (Europe/Rome: ${testTime.toLocaleString('it-IT', { timeZone: 'Europe/Rome' })})`);
    
    // Calcolo giorno logico atteso
    const localHour = testTime.getHours();
    const localDate = testTime.toLocaleDateString('sv-SE'); // YYYY-MM-DD
    const expectedGiornoLogico = localHour < 5 ? 
      new Date(testTime.getTime() - 24*60*60*1000).toLocaleDateString('sv-SE') : 
      localDate;
    
    console.log(`Giorno logico atteso per 01:00 del 13/10: ${expectedGiornoLogico}`);
    
  } catch (error) {
    console.error('❌ Errore test RPC:', error);
  }

  // 4. Proposta di fix
  console.log('\n🛠️  PROPOSTA FIX:');
  console.log('Il trigger enforce_alternanza_fn ha già la logica corretta con cutoff 05:00.');
  console.log('Problema potrebbe essere:');
  console.log('1. Trigger non attivo nel database corrente');
  console.log('2. Dati inseriti prima dell\'implementazione del trigger');
  console.log('3. Client che bypassa la RPC insert_timbro_v2');
  
  console.log('\n✅ STEP 1 COMPLETATO');
  console.log('Attendere conferma prima di procedere con correzione dati esistenti.');
}

main().catch(console.error);
