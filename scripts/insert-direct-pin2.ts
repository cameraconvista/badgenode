#!/usr/bin/env tsx

/**
 * Script per inserimento diretto uscita mancante PIN 2
 */

import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertDirectPin2() {
  console.log('🔧 Inserimento diretto uscita PIN 2...');
  
  try {
    // Inserimento diretto nel database
    const { data, error } = await supabase
      .from('timbrature')
      .insert([{
        pin: 2,
        tipo: 'uscita',
        data_locale: '2025-10-25',
        ora_locale: '04:09:00',
        giorno_logico: '2025-10-24',
        ts_order: '2025-10-25T03:09:00.000Z',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Uscita inserita direttamente → ID: ${data?.[0]?.id}`);

    // Verifica finale
    const { data: finalData, error: finalError } = await supabase
      .from('timbrature')
      .select('count(*)')
      .eq('pin', 2)
      .gte('data_locale', '2025-10-01')
      .lt('data_locale', '2025-11-01');

    if (finalError) {
      throw finalError;
    }

    console.log(`📊 Totale finale timbrature PIN 2 ottobre: ${finalData?.[0]?.count || 0}`);

    console.log('\n✅ Inserimento diretto completato!');

  } catch (error) {
    console.error('❌ Errore durante inserimento diretto:', error);
  }
}

insertDirectPin2().catch(console.error);
