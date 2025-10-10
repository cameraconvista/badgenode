// Test utility per verificare sync offline BadgeNode
// Uso: import e chiamare testOfflineSync() dalla console dev

import { timbratureSync } from '../services/timbrature-sync';
import { supabase } from '@/lib/supabaseClient';

export async function testOfflineSync() {
  console.log('🧪 [Test] Avvio test offline sync...');
  
  try {
    // Test 1: Inserimento con connessione
    console.log('📡 [Test] Test 1: Inserimento online');
    const result1 = await timbratureSync.insertNowOrEnqueue({
      pin: 1,
      tipo: 'entrata'
    });
    console.log('✅ [Test] Risultato 1:', result1);
    
    // Test 2: Verifica coda
    const pending = await timbratureSync.getPendingCount();
    console.log(`📋 [Test] Eventi in coda: ${pending}`);
    
    // Test 3: Sync manuale
    console.log('🔄 [Test] Test sync manuale...');
    await timbratureSync.syncNow();
    
    const pendingAfter = await timbratureSync.getPendingCount();
    console.log(`📋 [Test] Eventi dopo sync: ${pendingAfter}`);
    
    console.log('✅ [Test] Test completato con successo');
    
  } catch (error) {
    console.error('❌ [Test] Errore durante test:', error);
  }
}

// Test verifica configurazione Supabase
export async function testSupabaseConfig() {
  console.log('🔧 [Debug] Verifica configurazione Supabase...');
  console.log('🔧 [Debug] URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('🔧 [Debug] ANON_KEY presente:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
  console.log('🔧 [Debug] MODE:', import.meta.env.MODE);
}

// Test verifica utenti
export async function testCheckUsers() {
  console.log('👥 [Debug] Verifica utenti...');
  try {
    const { data, error } = await supabase
      .from('utenti')
      .select('*')
      .limit(5);
    
    console.log('👥 [Debug] Utenti trovati:', { data, error });
    return { data, error };
  } catch (error) {
    console.error('👥 [Debug] Errore verifica utenti:', error);
    throw error;
  }
}

// Test semplice per debug
export async function testSimpleInsert() {
  console.log('🔧 [Debug] Test insert semplice...');
  try {
    const result = await timbratureSync.insertNowOrEnqueue({
      pin: 1,
      tipo: 'entrata'
    });
    console.log('🔧 [Debug] Risultato:', result);
    return result;
  } catch (error) {
    console.error('🔧 [Debug] Errore:', error);
    throw error;
  }
}

// Funzione per inserire dipendenti e timbrature test
export async function seedTestData() {
  console.log('🌱 [Seed] Avvio inserimento dati test...');
  
  try {
    // 1. Inserisci dipendenti
    const dipendenti = [
      { pin: 1, nome: 'MARIO', cognome: 'ROSSI', ore_contrattuali: 8.0 },
      { pin: 2, nome: 'ANNA', cognome: 'VERDI', ore_contrattuali: 8.0 }
    ];
    
    for (const dip of dipendenti) {
      const { error } = await supabase
        .from('utenti')
        .upsert([dip], { onConflict: 'pin' });
      
      if (error) {
        console.error(`❌ Errore utente PIN ${dip.pin}:`, error);
      } else {
        console.log(`✅ Utente PIN ${dip.pin} inserito: ${dip.nome} ${dip.cognome}`);
      }
    }
    
    // 2. Genera timbrature ottobre 2024
    const timbrature = [];
    
    // PIN 1: Turni diurni (giorni feriali)
    for (let g = 1; g <= 31; g++) {
      if (g % 7 !== 0 && g % 7 !== 6) {
        const d = new Date(2024, 9, g);
        timbrature.push({
          pin: 1, tipo: 'entrata',
          created_at: new Date(d.getTime() + 8 * 3600000).toISOString(),
          client_event_id: `s1-${g}-e`
        }, {
          pin: 1, tipo: 'uscita',
          created_at: new Date(d.getTime() + 17 * 3600000).toISOString(),
          client_event_id: `s1-${g}-u`
        });
      }
    }
    
    // PIN 2: Multi-sessione (1-15) + Notturni (16-25)
    for (let g = 1; g <= 15; g++) {
      const d = new Date(2024, 9, g);
      timbrature.push({
        pin: 2, tipo: 'entrata',
        created_at: new Date(d.getTime() + 9 * 3600000).toISOString(),
        client_event_id: `s2-${g}-e1`
      }, {
        pin: 2, tipo: 'uscita',
        created_at: new Date(d.getTime() + 12 * 3600000).toISOString(),
        client_event_id: `s2-${g}-u1`
      }, {
        pin: 2, tipo: 'entrata',
        created_at: new Date(d.getTime() + 13 * 3600000).toISOString(),
        client_event_id: `s2-${g}-e2`
      }, {
        pin: 2, tipo: 'uscita',
        created_at: new Date(d.getTime() + 18 * 3600000).toISOString(),
        client_event_id: `s2-${g}-u2`
      });
    }
    
    for (let g = 16; g <= 25; g++) {
      const d = new Date(2024, 9, g);
      timbrature.push({
        pin: 2, tipo: 'entrata',
        created_at: new Date(d.getTime() + 22 * 3600000).toISOString(),
        client_event_id: `s2-${g}-ne`
      }, {
        pin: 2, tipo: 'uscita',
        created_at: new Date(d.getTime() + 30 * 3600000).toISOString(), // +6h giorno dopo
        client_event_id: `s2-${g}-nu`
      });
    }
    
    console.log(`📊 Generate ${timbrature.length} timbrature`);
    
    // 3. Inserisci timbrature in batch
    const batchSize = 20;
    for (let i = 0; i < timbrature.length; i += batchSize) {
      const batch = timbrature.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('timbrature')
        .insert(batch);
      
      if (error) {
        console.error(`❌ Errore batch ${i}:`, error);
      } else {
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} inserito (${batch.length} records)`);
      }
      
      // Pausa per non sovraccaricare
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('🎉 Seeding completato!');
    console.log('📋 Riepilogo:');
    console.log('   - PIN 1 (MARIO ROSSI): Turni diurni 08:00-17:00');
    console.log('   - PIN 2 (ANNA VERDI): Multi-sessione + turni notturni');
    console.log('   - Periodo: Ottobre 2024');
    console.log('   - Scenari giorno logico: Diurni, notturni, multi-sessione');
    
  } catch (error) {
    console.error('❌ Errore seeding:', error);
    throw error;
  }
}

// Esponi globalmente per test da console
if (typeof window !== 'undefined') {
  (window as any).testOfflineSync = testOfflineSync;
  (window as any).testSimpleInsert = testSimpleInsert;
  (window as any).testCheckUsers = testCheckUsers;
  (window as any).testSupabaseConfig = testSupabaseConfig;
  (window as any).seedTestData = seedTestData;
  console.log('🧪 [Test] Funzioni disponibili: testOfflineSync(), testSimpleInsert(), testCheckUsers(), testSupabaseConfig(), seedTestData()');
}
