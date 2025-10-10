// Test utility per verificare sync offline BadgeNode
// Uso: import e chiamare testOfflineSync() dalla console dev

import { timbratureSync } from '../services/timbrature-sync';

export async function testOfflineSync() {
  console.log('🧪 [Test] Avvio test offline sync...');
  
  try {
    // Test 1: Inserimento con connessione
    console.log('📡 [Test] Test 1: Inserimento online');
    const result1 = await timbratureSync.insertNowOrEnqueue({
      pin: 99,
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

// Esponi globalmente per test da console
if (typeof window !== 'undefined') {
  (window as any).testOfflineSync = testOfflineSync;
  console.log('🧪 [Test] Funzione testOfflineSync() disponibile nella console');
}
