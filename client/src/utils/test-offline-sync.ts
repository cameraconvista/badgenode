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

// Esponi globalmente per test da console
if (typeof window !== 'undefined') {
  (window as any).testOfflineSync = testOfflineSync;
  (window as any).testSimpleInsert = testSimpleInsert;
  (window as any).testCheckUsers = testCheckUsers;
  console.log('🧪 [Test] Funzioni disponibili: testOfflineSync(), testSimpleInsert(), testCheckUsers()');
}
