#!/usr/bin/env tsx

/**
 * Script per verifica finale di tutte le correzioni ottobre 2025
 */

import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAllCorrections() {
  console.log('🔍 Verifica finale correzioni ottobre 2025...');
  
  try {
    // Verifica per ogni PIN
    const pins = [2, 4, 5, 7];
    const results = [];

    for (const pin of pins) {
      console.log(`\n📊 PIN ${pin}:`);
      
      // Conta timbrature ottobre
      const { data: ottobreData, error: ottobreError } = await supabase
        .from('timbrature')
        .select('id, tipo')
        .eq('pin', pin)
        .gte('data_locale', '2025-10-01')
        .lt('data_locale', '2025-11-01');

      if (ottobreError) {
        console.log(`  ❌ Errore verifica ottobre: ${ottobreError.message}`);
        continue;
      }

      // Conta timbrature novembre (dovrebbero essere 0)
      const { data: novembreData, error: novembreError } = await supabase
        .from('timbrature')
        .select('id')
        .eq('pin', pin)
        .gte('data_locale', '2025-11-01')
        .lt('data_locale', '2025-12-01');

      if (novembreError) {
        console.log(`  ❌ Errore verifica novembre: ${novembreError.message}`);
        continue;
      }

      const entrate = ottobreData?.filter(t => t.tipo === 'entrata').length || 0;
      const uscite = ottobreData?.filter(t => t.tipo === 'uscita').length || 0;
      const novembreCount = novembreData?.length || 0;

      console.log(`  📈 Ottobre: ${ottobreData?.length || 0} timbrature (${entrate} entrate, ${uscite} uscite)`);
      console.log(`  📈 Novembre: ${novembreCount} timbrature ${novembreCount === 0 ? '✅' : '❌'}`);
      console.log(`  📈 Bilanciamento: ${entrate === uscite ? '✅ Perfetto' : '⚠️ Sbilanciato'}`);

      results.push({
        pin,
        ottobre: ottobreData?.length || 0,
        novembre: novembreCount,
        entrate,
        uscite,
        bilanciato: entrate === uscite
      });
    }

    // Riepilogo finale
    console.log('\n📋 RIEPILOGO FINALE CORREZIONI:');
    console.log('┌─────┬─────────┬─────────┬─────────┬─────────┬─────────────┐');
    console.log('│ PIN │ Ottobre │ Novembre│ Entrate │ Uscite  │ Bilanciato  │');
    console.log('├─────┼─────────┼─────────┼─────────┼─────────┼─────────────┤');
    
    results.forEach(r => {
      const pinStr = r.pin.toString().padStart(3);
      const ottStr = r.ottobre.toString().padStart(7);
      const novStr = r.novembre.toString().padStart(7);
      const entStr = r.entrate.toString().padStart(7);
      const uscStr = r.uscite.toString().padStart(7);
      const balStr = (r.bilanciato ? '✅ Sì' : '❌ No').padStart(11);
      
      console.log(`│ ${pinStr} │ ${ottStr} │ ${novStr} │ ${entStr} │ ${uscStr} │ ${balStr} │`);
    });
    
    console.log('└─────┴─────────┴─────────┴─────────┴─────────┴─────────────┘');

    // Statistiche totali
    const totalOttobre = results.reduce((sum, r) => sum + r.ottobre, 0);
    const totalNovembre = results.reduce((sum, r) => sum + r.novembre, 0);
    const allBalanced = results.every(r => r.bilanciato);
    const noNovembre = results.every(r => r.novembre === 0);

    console.log('\n📊 STATISTICHE TOTALI:');
    console.log(`- Totale timbrature ottobre: ${totalOttobre}`);
    console.log(`- Totale timbrature novembre: ${totalNovembre} ${noNovembre ? '✅' : '❌'}`);
    console.log(`- Tutti bilanciati: ${allBalanced ? '✅ Sì' : '❌ No'}`);
    console.log(`- Correzioni completate: ${noNovembre && allBalanced ? '✅ Sì' : '❌ No'}`);

    if (noNovembre && allBalanced) {
      console.log('\n🎉 TUTTE LE CORREZIONI COMPLETATE CON SUCCESSO!');
      console.log('✅ Tutti i PIN hanno le timbrature nel mese corretto (ottobre)');
      console.log('✅ Tutti i PIN hanno entrate e uscite bilanciate');
      console.log('✅ Nessuna timbratura errata in novembre');
    } else {
      console.log('\n⚠️  Alcune correzioni potrebbero necessitare ulteriori verifiche');
    }

    console.log('\n✅ Verifica finale completata!');

  } catch (error) {
    console.error('❌ Errore durante verifica finale:', error);
  }
}

verifyAllCorrections().catch(console.error);
