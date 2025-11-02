#!/usr/bin/env tsx

/**
 * Script per verificare le timbrature PIN 2 ottobre 2025
 */

import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyPin2Ottobre() {
  console.log('🔍 Verifica timbrature ottobre 2025 - PIN 2...');
  
  try {
    // Timbrature ottobre 2025 PIN 2
    const { data: ottobreData, error: ottobreError } = await supabase
      .from('timbrature')
      .select('id, tipo, data_locale, ora_locale, giorno_logico, created_at')
      .eq('pin', 2)
      .gte('data_locale', '2025-10-01')
      .lt('data_locale', '2025-11-01')
      .order('data_locale', { ascending: true })
      .order('ora_locale', { ascending: true });

    if (ottobreError) {
      throw ottobreError;
    }

    console.log(`📊 Totale timbrature ottobre 2025 PIN 2: ${ottobreData?.length || 0}`);
    console.log('');

    if (ottobreData && ottobreData.length > 0) {
      console.log('📋 Timbrature ottobre 2025 PIN 2:');
      
      // Raggruppa per giorno logico
      const gruppiGiorno = ottobreData.reduce((acc, t) => {
        const giorno = t.giorno_logico;
        if (!acc[giorno]) acc[giorno] = [];
        acc[giorno].push(t);
        return acc;
      }, {} as Record<string, any[]>);

      Object.entries(gruppiGiorno).forEach(([giorno, timbrature]) => {
        console.log(`\n🗓️  Giorno logico: ${giorno}`);
        timbrature.forEach((t, i) => {
          console.log(`   ${i + 1}. ID:${t.id} ${t.tipo.toUpperCase()} ${t.data_locale} ${t.ora_locale}`);
        });
        
        // Verifica alternanza
        const tipi = timbrature.map(t => t.tipo);
        const alternanzaCorretta = tipi.every((tipo, i) => {
          if (i === 0) return true;
          return tipo !== tipi[i - 1];
        });
        
        if (!alternanzaCorretta) {
          console.log(`   ⚠️  PROBLEMA ALTERNANZA: ${tipi.join(' → ')}`);
        } else if (tipi.length === 2 && tipi[0] === 'entrata' && tipi[1] === 'uscita') {
          console.log(`   ✅ Turno completo`);
        } else if (tipi.length === 1) {
          console.log(`   ⚠️  Turno incompleto: solo ${tipi[0]}`);
        }
      });

      // Analisi mancanti
      console.log('\n🔍 Analisi turni incompleti:');
      const turniIncompleti = Object.entries(gruppiGiorno).filter(([_, timbrature]) => {
        return timbrature.length === 1;
      });
      
      if (turniIncompleti.length > 0) {
        turniIncompleti.forEach(([giorno, timbrature]) => {
          const t = timbrature[0];
          console.log(`   ${giorno}: ${t.tipo.toUpperCase()} senza ${t.tipo === 'entrata' ? 'USCITA' : 'ENTRATA'}`);
        });
      } else {
        console.log('   Nessun turno incompleto trovato');
      }

      // Statistiche
      console.log('\n📊 Statistiche:');
      const entrate = ottobreData.filter(t => t.tipo === 'entrata');
      const uscite = ottobreData.filter(t => t.tipo === 'uscita');
      
      console.log(`- Entrate: ${entrate.length}`);
      console.log(`- Uscite: ${uscite.length}`);
      console.log(`- Turni completi: ${Math.min(entrate.length, uscite.length)}`);
      console.log(`- Differenza: ${Math.abs(entrate.length - uscite.length)}`);
    }

    console.log('\n✅ Verifica PIN 2 ottobre completata!');

  } catch (error) {
    console.error('❌ Errore durante verifica:', error);
  }
}

verifyPin2Ottobre().catch(console.error);
