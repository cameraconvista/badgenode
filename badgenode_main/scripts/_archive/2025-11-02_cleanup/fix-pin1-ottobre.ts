#!/usr/bin/env tsx

/**
 * Script per correggere il problema PIN 1 ottobre 2025
 */

import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPin1Ottobre() {
  console.log('🔧 Correzione PIN 1 ottobre 2025...');
  
  try {
    // Inserimento diretto nel database dell'uscita mancante del 24 ottobre
    const { data, error } = await supabase
      .from('timbrature')
      .insert([{
        pin: 1,
        tipo: 'uscita',
        data_locale: '2025-10-25',
        ora_locale: '04:12:00',
        giorno_logico: '2025-10-24',
        ts_order: '2025-10-25T03:12:00.000Z',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Uscita 24 ottobre inserita direttamente → ID: ${data?.[0]?.id}`);

    // Verifica finale
    const { data: finalData, error: finalError } = await supabase
      .from('timbrature')
      .select('id, tipo, data_locale, ora_locale, giorno_logico')
      .eq('pin', 1)
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

    console.log(`\n📊 Risultato finale PIN 1:`);
    console.log(`- Totale timbrature: ${finalData?.length || 0}`);
    console.log(`- Entrate: ${entrate}`);
    console.log(`- Uscite: ${uscite}`);
    console.log(`- Turni completi: ${turniCompleti}`);
    console.log(`- Bilanciamento: ${entrate === uscite ? '✅ Perfetto' : '⚠️  Sbilanciato'}`);

    console.log('\n✅ Correzione PIN 1 completata!');

  } catch (error) {
    console.error('❌ Errore durante correzione PIN 1:', error);
  }
}

fixPin1Ottobre().catch(console.error);
