#!/usr/bin/env tsx

// Script per eliminare tutti gli utenti demo dal database Supabase
// Uso: npm run clean:demo-users

import { createClient } from '@supabase/supabase-js';

// Credenziali Supabase (da .env o hardcoded per script)
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hjbungtedtgffmnficmp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqYnVuZ3RlZHRnZmZtbmZpY21wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTg2ODc2NCwiZXhwIjoyMDc1NDQ0NzY0fQ.iSdAS_ufJv8bE-HUEaMV38ika_Hqb6KCJwrdfgjLCY4';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Mancano le variabili d\'ambiente VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Client Supabase con service role per operazioni admin
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanDemoUsers() {
  try {
    console.log('🧹 Inizio pulizia utenti demo...');

    // 1. Elimina tutte le timbrature
    console.log('🗑️  Eliminazione timbrature...');
    const { error: timbratureError } = await supabase
      .from('timbrature')
      .delete()
      .neq('pin', 0); // Elimina tutto

    if (timbratureError) {
      console.error('❌ Errore eliminazione timbrature:', timbratureError);
    } else {
      console.log('✅ Timbrature eliminate');
    }

    // 2. Elimina tutti gli ex-dipendenti
    console.log('🗑️  Eliminazione ex-dipendenti...');
    const { error: exDipendentiError } = await supabase
      .from('ex_dipendenti')
      .delete()
      .neq('pin', 0); // Elimina tutto

    if (exDipendentiError) {
      console.error('❌ Errore eliminazione ex-dipendenti:', exDipendentiError);
    } else {
      console.log('✅ Ex-dipendenti eliminati');
    }

    // 3. Elimina tutti gli utenti
    console.log('🗑️  Eliminazione utenti...');
    const { error: utentiError } = await supabase
      .from('utenti')
      .delete()
      .neq('pin', 0); // Elimina tutto (usa pin invece di id)

    if (utentiError) {
      console.error('❌ Errore eliminazione utenti:', utentiError);
    } else {
      console.log('✅ Utenti eliminati');
    }

    // 4. Verifica pulizia
    console.log('🔍 Verifica pulizia...');
    
    const { data: utentiRimasti } = await supabase
      .from('utenti')
      .select('count', { count: 'exact' });

    const { data: timbratureRimaste } = await supabase
      .from('timbrature')
      .select('count', { count: 'exact' });

    console.log(`📊 Utenti rimasti: ${utentiRimasti?.[0]?.count || 0}`);
    console.log(`📊 Timbrature rimaste: ${timbratureRimaste?.[0]?.count || 0}`);

    console.log('✨ Pulizia completata! Database vuoto e pronto per dati reali.');

  } catch (error) {
    console.error('❌ Errore durante la pulizia:', error);
    process.exit(1);
  }
}

// Esegui pulizia
cleanDemoUsers();
