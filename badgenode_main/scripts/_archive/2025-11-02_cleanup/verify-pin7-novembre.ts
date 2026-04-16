#!/usr/bin/env tsx

/**
 * Script per verificare l'inserimento delle timbrature novembre 2025 - PIN 7
 */

import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyPin7Novembre() {
  console.log('🔍 Verifica timbrature novembre 2025 - PIN 7...');
  
  try {
    // Timbrature novembre 2025 PIN 7
    const { data: novembreData, error: novembreError } = await supabase
      .from('timbrature')
      .select('id, tipo, data_locale, ora_locale, giorno_logico, created_at')
      .eq('pin', 7)
      .gte('data_locale', '2025-11-01')
      .lt('data_locale', '2025-12-01')
      .order('data_locale', { ascending: true })
      .order('ora_locale', { ascending: true });

    if (novembreError) {
      throw novembreError;
    }

    console.log(`📊 Totale timbrature novembre 2025 PIN 7: ${novembreData?.length || 0}`);
    console.log('');

    if (novembreData && novembreData.length > 0) {
      console.log('📋 Timbrature novembre 2025 PIN 7:');
      
      // Raggruppa per giorno logico
      const gruppiGiorno = novembreData.reduce((acc, t) => {
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
          
          console.log(`   ${i + 1}. ${t.tipo.toUpperCase()} ${t.data_locale} ${t.ora_locale} (diff: ${diffDays} giorni)`);
        });
      });

      // Analisi pattern turni
      console.log('\n📊 Analisi pattern turni PIN 7:');
      const entrate = novembreData.filter(t => t.tipo === 'entrata');
      const uscite = novembreData.filter(t => t.tipo === 'uscita');
      
      console.log(`- Entrate: ${entrate.length}`);
      console.log(`- Uscite: ${uscite.length}`);
      console.log(`- Turni completi: ${Math.min(entrate.length, uscite.length)}`);

      // Classificazione turni
      const turniDiurni = [];
      const turniNotturni = [];
      
      for (const giorno of Object.keys(gruppiGiorno)) {
        const timbratureGiorno = gruppiGiorno[giorno];
        const entrata = timbratureGiorno.find(t => t.tipo === 'entrata');
        const uscita = timbratureGiorno.find(t => t.tipo === 'uscita');
        
        if (entrata && uscita) {
          const dataEntrata = new Date(`${entrata.data_locale}T${entrata.ora_locale}`);
          const dataUscita = new Date(`${uscita.data_locale}T${uscita.ora_locale}`);
          
          if (dataUscita.getDate() === dataEntrata.getDate()) {
            turniDiurni.push(giorno);
          } else {
            turniNotturni.push(giorno);
          }
        }
      }
      
      console.log(`- Turni diurni: ${turniDiurni.length} (${turniDiurni.join(', ')})`);
      console.log(`- Turni notturni: ${turniNotturni.length}`);

      // Range orari
      const orariEntrata = entrate.map(t => t.ora_locale).sort();
      const orariUscita = uscite.map(t => t.ora_locale).sort();
      
      console.log(`- Range entrate: ${orariEntrata[0]} - ${orariEntrata[orariEntrata.length - 1]}`);
      console.log(`- Range uscite: ${orariUscita[0]} - ${orariUscita[orariUscita.length - 1]}`);
    }

    console.log('\n✅ Verifica PIN 7 novembre completata!');

  } catch (error) {
    console.error('❌ Errore durante verifica:', error);
  }
}

verifyPin7Novembre().catch(console.error);
