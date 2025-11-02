#!/usr/bin/env tsx

/**
 * Script per verificare le timbrature PIN 1 ottobre 2025
 */

import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyPin1Ottobre() {
  console.log('🔍 Verifica timbrature ottobre 2025 - PIN 1...');
  
  try {
    // Timbrature ottobre 2025 PIN 1
    const { data: ottobreData, error: ottobreError } = await supabase
      .from('timbrature')
      .select('id, tipo, data_locale, ora_locale, giorno_logico, created_at')
      .eq('pin', 1)
      .gte('data_locale', '2025-10-01')
      .lt('data_locale', '2025-11-01')
      .order('data_locale', { ascending: true })
      .order('ora_locale', { ascending: true });

    if (ottobreError) {
      throw ottobreError;
    }

    console.log(`📊 Totale timbrature ottobre 2025 PIN 1: ${ottobreData?.length || 0}`);
    console.log('');

    if (ottobreData && ottobreData.length > 0) {
      console.log('📋 Timbrature ottobre 2025 PIN 1:');
      
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
          const dataDate = new Date(t.data_locale);
          const giornoLogicoDate = new Date(t.giorno_logico);
          const diffDays = Math.floor((dataDate.getTime() - giornoLogicoDate.getTime()) / (1000 * 60 * 60 * 24));
          
          console.log(`   ${i + 1}. ID:${t.id} ${t.tipo.toUpperCase()} ${t.data_locale} ${t.ora_locale} (diff: ${diffDays} giorni)`);
        });
        
        // Verifica alternanza
        const tipi = timbrature.map(t => t.tipo);
        if (tipi.length === 2 && tipi[0] === 'entrata' && tipi[1] === 'uscita') {
          console.log(`   ✅ Turno completo`);
        } else if (tipi.length === 1) {
          console.log(`   ⚠️  Turno incompleto: solo ${tipi[0]}`);
        } else {
          console.log(`   ⚠️  Problema alternanza: ${tipi.join(' → ')}`);
        }
      });

      // Statistiche
      console.log('\n📊 Statistiche PIN 1:');
      const entrate = ottobreData.filter(t => t.tipo === 'entrata');
      const uscite = ottobreData.filter(t => t.tipo === 'uscita');
      
      console.log(`- Entrate: ${entrate.length}`);
      console.log(`- Uscite: ${uscite.length}`);
      console.log(`- Turni completi: ${Math.min(entrate.length, uscite.length)}`);
      console.log(`- Bilanciamento: ${entrate.length === uscite.length ? '✅ Perfetto' : '⚠️ Sbilanciato'}`);

      // Range orari
      const orariEntrata = entrate.map(t => t.ora_locale).sort();
      const orariUscita = uscite.map(t => t.ora_locale).sort();
      
      console.log(`- Range entrate: ${orariEntrata[0]} - ${orariEntrata[orariEntrata.length - 1]}`);
      console.log(`- Range uscite: ${orariUscita[0]} - ${orariUscita[orariUscita.length - 1]}`);

      // Giorni lavorativi
      console.log('\n📅 Giorni lavorativi ottobre:');
      const giorniLavorativi = Object.keys(gruppiGiorno).sort();
      const giorniFormattati = giorniLavorativi.map(g => {
        const data = new Date(g);
        return data.getDate().toString().padStart(2, '0');
      });
      console.log(`   ${giorniFormattati.join(', ')}`);
    }

    console.log('\n✅ Verifica PIN 1 ottobre completata!');

  } catch (error) {
    console.error('❌ Errore durante verifica:', error);
  }
}

verifyPin1Ottobre().catch(console.error);
