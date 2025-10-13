#!/usr/bin/env node

/**
 * Test per verificare se il calcolo ore è corretto dopo il fix
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCalcoloOre() {
  console.log('🔍 Test Calcolo Ore Post-Fix\n');

  // Simula il calcolo che fa il client
  const entrata = {
    data_locale: '2025-10-12',
    ora_locale: '22:33:44'
  };
  
  const uscita = {
    data_locale: '2025-10-12', // Dopo il fix del giorno_logico
    ora_locale: '01:00:00'
  };

  console.log('📊 Dati per calcolo:');
  console.log(`Entrata: ${entrata.data_locale}T${entrata.ora_locale}`);
  console.log(`Uscita:  ${uscita.data_locale}T${uscita.ora_locale}`);

  // Simula il calcolo del client con il fix (arrotondamento al minuto)
  const entrataTime = entrata.ora_locale.substring(0, 5) + ':00'; // 22:33:00
  const uscitaTime = uscita.ora_locale.substring(0, 5) + ':00';   // 01:00:00
  
  console.log(`\n🔧 Con fix arrotondamento al minuto:`);
  console.log(`Entrata arrotondata: ${entrataTime}`);
  console.log(`Uscita arrotondata:  ${uscitaTime}`);

  const entrataDate = new Date(`${entrata.data_locale}T${entrataTime}`);
  const uscitaDate = new Date(`${uscita.data_locale}T${uscitaTime}`);
  
  if (uscitaDate < entrataDate) {
    uscitaDate.setDate(uscitaDate.getDate() + 1);
    console.log('Uscita attraversa mezzanotte, +1 giorno');
  }
  
  const ore = (uscitaDate.getTime() - entrataDate.getTime()) / (1000 * 60 * 60);
  const oreArrotondate = Math.round(ore * 100) / 100;
  
  console.log(`\n✅ Risultato calcolo:`);
  console.log(`Ore esatte: ${ore}`);
  console.log(`Ore arrotondate: ${oreArrotondate}`);
  console.log(`Formato UI: ${oreArrotondate.toFixed(2)}`);

  // Verifica manuale
  console.log(`\n🧮 Verifica manuale:`);
  console.log(`22:33 → 01:00 = 2 ore e 27 minuti`);
  console.log(`27 minuti = 27/60 = 0.45 ore`);
  console.log(`Totale = 2.45 ore`);
  
  if (oreArrotondate === 2.45) {
    console.log(`\n🎯 ✅ CALCOLO CORRETTO!`);
  } else {
    console.log(`\n❌ CALCOLO ERRATO: atteso 2.45, ottenuto ${oreArrotondate}`);
  }
}

testCalcoloOre().catch(console.error);
