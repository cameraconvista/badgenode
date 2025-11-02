#!/usr/bin/env tsx

/**
 * Script per analizzare le timbrature inserite erroneamente
 */

import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function analyzeWrongDates() {
  console.log('🔍 Analisi timbrature inserite erroneamente...');
  
  try {
    // Analizza PIN 04 - novembre (ERRORE: dovrebbe essere ottobre)
    console.log('\n📊 PIN 04 - Timbrature novembre (DA CORREGGERE):');
    const { data: pin04Nov, error: error04 } = await supabase
      .from('timbrature')
      .select('id, tipo, data_locale, ora_locale, giorno_logico')
      .eq('pin', 4)
      .gte('data_locale', '2025-11-01')
      .lt('data_locale', '2025-12-01')
      .order('data_locale', { ascending: true });

    if (error04) throw error04;
    
    console.log(`Totale: ${pin04Nov?.length || 0} timbrature`);
    if (pin04Nov && pin04Nov.length > 0) {
      console.log('Prime 5:');
      pin04Nov.slice(0, 5).forEach(t => {
        console.log(`  ID:${t.id} ${t.tipo.toUpperCase()} ${t.data_locale} ${t.ora_locale}`);
      });
    }

    // Analizza PIN 05 - novembre (ERRORE: dovrebbe essere ottobre)
    console.log('\n📊 PIN 05 - Timbrature novembre (DA CORREGGERE):');
    const { data: pin05Nov, error: error05 } = await supabase
      .from('timbrature')
      .select('id, tipo, data_locale, ora_locale, giorno_logico')
      .eq('pin', 5)
      .gte('data_locale', '2025-11-01')
      .lt('data_locale', '2025-12-01')
      .order('data_locale', { ascending: true });

    if (error05) throw error05;
    
    console.log(`Totale: ${pin05Nov?.length || 0} timbrature`);
    if (pin05Nov && pin05Nov.length > 0) {
      console.log('Prime 5:');
      pin05Nov.slice(0, 5).forEach(t => {
        console.log(`  ID:${t.id} ${t.tipo.toUpperCase()} ${t.data_locale} ${t.ora_locale}`);
      });
    }

    // Analizza PIN 07 - novembre (ERRORE: dovrebbe essere ottobre)
    console.log('\n📊 PIN 07 - Timbrature novembre (DA CORREGGERE):');
    const { data: pin07Nov, error: error07 } = await supabase
      .from('timbrature')
      .select('id, tipo, data_locale, ora_locale, giorno_logico')
      .eq('pin', 7)
      .gte('data_locale', '2025-11-01')
      .lt('data_locale', '2025-12-01')
      .order('data_locale', { ascending: true });

    if (error07) throw error07;
    
    console.log(`Totale: ${pin07Nov?.length || 0} timbrature`);
    if (pin07Nov && pin07Nov.length > 0) {
      console.log('Prime 5:');
      pin07Nov.slice(0, 5).forEach(t => {
        console.log(`  ID:${t.id} ${t.tipo.toUpperCase()} ${t.data_locale} ${t.ora_locale}`);
      });
    }

    // Verifica se ci sono timbrature ottobre per questi PIN
    console.log('\n🔍 Verifica timbrature ottobre esistenti:');
    
    for (const pin of [4, 5, 7]) {
      const { data: ottobreData, error: ottobreError } = await supabase
        .from('timbrature')
        .select('count(*)')
        .eq('pin', pin)
        .gte('data_locale', '2025-10-01')
        .lt('data_locale', '2025-11-01')
        .single();

      if (ottobreError) {
        console.log(`  PIN ${pin}: Errore verifica ottobre`);
      } else {
        console.log(`  PIN ${pin}: ${ottobreData?.count || 0} timbrature ottobre esistenti`);
      }
    }

    console.log('\n📋 PIANO DI CORREZIONE:');
    console.log('1. Eliminare tutte le timbrature novembre per PIN 04, 05, 07');
    console.log('2. Reinserire con date ottobre corrette');
    console.log('3. Verificare che PIN 04 (Veronica) abbia già timbrature settembre-ottobre');

    console.log('\n✅ Analisi completata!');

  } catch (error) {
    console.error('❌ Errore durante analisi:', error);
  }
}

analyzeWrongDates().catch(console.error);
