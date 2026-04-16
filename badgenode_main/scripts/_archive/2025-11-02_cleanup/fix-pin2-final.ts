#!/usr/bin/env tsx

/**
 * Script per correzione finale PIN 2 ottobre 2025
 */

import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPin2Final() {
  console.log('🔧 Correzione finale PIN 2 ottobre 2025...');
  
  try {
    // 1. Correggi l'uscita del 05 ottobre (ID:713) - dovrebbe essere giorno logico 2025-10-04
    console.log('🔧 Correzione uscita 05 ottobre...');
    
    const { error: updateError1 } = await supabase
      .from('timbrature')
      .update({ giorno_logico: '2025-10-04' })
      .eq('id', 713);
    
    if (updateError1) {
      throw updateError1;
    }
    
    console.log('✅ Uscita 05 ottobre corretta (giorno logico → 2025-10-04)');
    
    // 2. Inserisci l'uscita mancante del 24 ottobre
    console.log('🔧 Inserimento uscita 24 ottobre...');
    
    const response = await fetch('http://localhost:3001/api/timbrature', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pin: 2,
        tipo: 'uscita',
        ts: '2025-10-25T03:09:00.000Z',
        anchorDate: '2025-10-24'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log(`✅ Uscita 24 ottobre inserita → ID: ${result.data?.id}`);
    } else {
      console.log(`❌ Errore inserimento uscita 24 ottobre: ${result.error}`);
    }
    
    // 3. Verifica finale
    console.log('\n📊 Verifica finale...');
    
    const { data: finalData, error: finalError } = await supabase
      .from('timbrature')
      .select('id, tipo, data_locale, ora_locale, giorno_logico')
      .eq('pin', 2)
      .gte('data_locale', '2025-10-01')
      .lt('data_locale', '2025-11-01')
      .order('giorno_logico', { ascending: true });

    if (finalError) {
      throw finalError;
    }

    // Raggruppa per giorno logico
    const gruppiGiorno = finalData?.reduce((acc, t) => {
      const giorno = t.giorno_logico;
      if (!acc[giorno]) acc[giorno] = [];
      acc[giorno].push(t);
      return acc;
    }, {} as Record<string, any[]>) || {};

    const entrate = finalData?.filter(t => t.tipo === 'entrata').length || 0;
    const uscite = finalData?.filter(t => t.tipo === 'uscita').length || 0;
    const turniCompleti = Object.values(gruppiGiorno).filter(timbrature => 
      timbrature.length === 2 && 
      timbrature[0].tipo === 'entrata' && 
      timbrature[1].tipo === 'uscita'
    ).length;

    console.log(`📊 Risultato finale:`);
    console.log(`- Totale timbrature: ${finalData?.length || 0}`);
    console.log(`- Entrate: ${entrate}`);
    console.log(`- Uscite: ${uscite}`);
    console.log(`- Turni completi: ${turniCompleti}`);
    console.log(`- Bilanciamento: ${entrate === uscite ? '✅ Perfetto' : '⚠️  Sbilanciato'}`);

    console.log('\n✅ Correzione finale completata!');

  } catch (error) {
    console.error('❌ Errore durante correzione finale:', error);
  }
}

fixPin2Final().catch(console.error);
