#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificaDatiReali() {
  console.log('🔍 Verifica Dati Reali nel Database\n');

  const { data, error } = await supabase
    .from('timbrature')
    .select('id, pin, tipo, ts_order, giorno_logico, data_locale, ora_locale')
    .eq('pin', 1)
    .eq('giorno_logico', '2025-10-12')
    .order('ts_order', { ascending: true });

  if (error) {
    console.error('❌ Errore:', error);
    return;
  }

  console.log('📊 Dati reali dal database:');
  data.forEach(row => {
    console.log(`ID: ${row.id}, Tipo: ${row.tipo}`);
    console.log(`  ts_order: ${row.ts_order}`);
    console.log(`  giorno_logico: ${row.giorno_logico}`);
    console.log(`  data_locale: ${row.data_locale}`);
    console.log(`  ora_locale: ${row.ora_locale}`);
    console.log('');
  });

  if (data.length >= 2) {
    const entrata = data.find(t => t.tipo === 'entrata');
    const uscita = data.find(t => t.tipo === 'uscita');

    console.log('🧮 Calcolo ore con dati reali:');
    console.log(`Entrata: ${entrata.data_locale}T${entrata.ora_locale}`);
    console.log(`Uscita:  ${uscita.data_locale}T${uscita.ora_locale}`);

    // Calcolo preciso
    const entrataMs = new Date(`${entrata.data_locale}T${entrata.ora_locale}`).getTime();
    let uscitaMs = new Date(`${uscita.data_locale}T${uscita.ora_locale}`).getTime();
    
    // Se uscita < entrata, aggiungi 24 ore
    if (uscitaMs < entrataMs) {
      uscitaMs += 24 * 60 * 60 * 1000;
      console.log('Uscita attraversa mezzanotte, +24 ore');
    }

    const differenzaMs = uscitaMs - entrataMs;
    const ore = differenzaMs / (1000 * 60 * 60);
    const oreArrotondate = Math.round(ore * 100) / 100;

    console.log(`Differenza ms: ${differenzaMs}`);
    console.log(`Ore esatte: ${ore}`);
    console.log(`Ore arrotondate: ${oreArrotondate}`);

    // Calcolo manuale per confronto
    const [hE, mE, sE] = entrata.ora_locale.split(':').map(Number);
    const [hU, mU, sU] = uscita.ora_locale.split(':').map(Number);

    const minutiEntrata = hE * 60 + mE + sE/60;
    let minutiUscita = hU * 60 + mU + sU/60;
    
    if (minutiUscita < minutiEntrata) {
      minutiUscita += 24 * 60;
    }

    const minutiTotali = minutiUscita - minutiEntrata;
    const oreCalcolate = minutiTotali / 60;

    console.log('\n🎯 Calcolo manuale preciso:');
    console.log(`Entrata: ${hE}:${mE}:${sE} = ${minutiEntrata} minuti`);
    console.log(`Uscita: ${hU}:${mU}:${sU} = ${minutiUscita} minuti`);
    console.log(`Differenza: ${minutiTotali} minuti = ${oreCalcolate} ore`);
    console.log(`Arrotondato: ${Math.round(oreCalcolate * 100) / 100} ore`);

    // Verifica se il problema è nei secondi
    if (sE > 0) {
      console.log(`\n⚠️  PROBLEMA: Entrata ha ${sE} secondi`);
      console.log('Questo riduce leggermente il totale ore');
    }
  }
}

verificaDatiReali().catch(console.error);
