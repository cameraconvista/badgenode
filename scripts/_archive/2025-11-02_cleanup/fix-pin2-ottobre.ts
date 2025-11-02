#!/usr/bin/env tsx

/**
 * Script per correggere il problema PIN 2 ottobre 2025
 */

import { config } from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Carica environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixPin2Ottobre() {
  console.log('🔧 Correzione PIN 2 ottobre 2025...');
  
  try {
    // Verifica timbrature 24-25 ottobre
    const { data: timbrature24_25, error } = await supabase
      .from('timbrature')
      .select('id, tipo, data_locale, ora_locale, giorno_logico')
      .eq('pin', 2)
      .gte('data_locale', '2025-10-24')
      .lte('data_locale', '2025-10-26')
      .order('data_locale', { ascending: true })
      .order('ora_locale', { ascending: true });

    if (error) {
      throw error;
    }

    console.log('\n📋 Timbrature 24-26 ottobre PIN 2:');
    timbrature24_25?.forEach((t, i) => {
      console.log(`${i + 1}. ID:${t.id} ${t.tipo.toUpperCase()} ${t.data_locale} ${t.ora_locale} (giorno logico: ${t.giorno_logico})`);
    });

    // Inserisci manualmente l'uscita mancante del 25 ottobre con ancoraggio esplicito
    console.log('\n🔧 Inserimento uscita 25 ottobre con ancoraggio...');
    
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
      console.log(`✅ Uscita 25 ottobre inserita → ID: ${result.data?.id}`);
    } else {
      console.log(`❌ Errore inserimento: ${result.error}`);
      
      // Se fallisce, proviamo a eliminare eventuali duplicati e reinserire
      console.log('\n🔄 Tentativo pulizia e reinserimento...');
      
      // Trova timbrature problematiche del 24-25 ottobre
      const problematiche = timbrature24_25?.filter(t => 
        (t.data_locale === '2025-10-24' && t.ora_locale.startsWith('19:')) ||
        (t.data_locale === '2025-10-25' && t.ora_locale.startsWith('03:'))
      );
      
      if (problematiche && problematiche.length > 0) {
        console.log('🗑️  Eliminazione timbrature problematiche...');
        for (const t of problematiche) {
          const { error: deleteError } = await supabase
            .from('timbrature')
            .delete()
            .eq('id', t.id);
          
          if (!deleteError) {
            console.log(`✅ Eliminata timbratura ID:${t.id}`);
          }
        }
        
        // Reinserisci in ordine corretto
        console.log('\n🔄 Reinserimento in ordine corretto...');
        
        const reinserimenti = [
          { date: '2025-10-24', time: '19:00', tipo: 'entrata' },
          { date: '2025-10-25', time: '03:09', tipo: 'uscita' }
        ];
        
        for (const { date, time, tipo } of reinserimenti) {
          const timestamp = `${date}T${time}:00.000Z`;
          
          const response2 = await fetch('http://localhost:3001/api/timbrature', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              pin: 2,
              tipo: tipo.toLowerCase(),
              ts: timestamp
            })
          });

          const result2 = await response2.json();
          
          if (response2.ok && result2.success) {
            console.log(`✅ ${date} ${time} ${tipo.toUpperCase()} → ID: ${result2.data?.id}`);
          } else {
            console.log(`❌ ${date} ${time} ${tipo.toUpperCase()} → ERROR: ${result2.error}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    console.log('\n✅ Correzione completata!');

  } catch (error) {
    console.error('❌ Errore durante correzione:', error);
  }
}

fixPin2Ottobre().catch(console.error);
