// Test script per verificare le funzioni offline
// Da eseguire nella console del browser

console.log('=== TEST OFFLINE FUNCTIONS ===');

// Test 1: Verifica che le funzioni siano disponibili
console.log('1. Verifica disponibilità diagnostics...');
if (window.__BADGENODE_DIAG__?.offline) {
  console.log('✅ Diagnostics offline disponibili');
  console.log('   - enabled:', window.__BADGENODE_DIAG__.offline.enabled);
  console.log('   - allowed:', window.__BADGENODE_DIAG__.offline.allowed);
  console.log('   - deviceId:', window.__BADGENODE_DIAG__.offline.deviceId);
} else {
  console.log('❌ Diagnostics offline non disponibili');
}

// Test 2: Verifica queue count
console.log('2. Test queue count...');
try {
  window.__BADGENODE_DIAG__.offline.queueCount().then(count => {
    console.log('✅ Queue count:', count);
  }).catch(e => {
    console.log('❌ Queue count error:', e.message);
  });
} catch (e) {
  console.log('❌ Queue count sync error:', e.message);
}

// Test 3: Verifica peek last
console.log('3. Test peek last...');
try {
  window.__BADGENODE_DIAG__.offline.peekLast().then(last => {
    console.log('✅ Peek last:', last);
  }).catch(e => {
    console.log('❌ Peek last error:', e.message);
  });
} catch (e) {
  console.log('❌ Peek last sync error:', e.message);
}

console.log('=== TEST COMPLETATO ===');
console.log('Aprire DevTools Network tab e impostare "Offline" per testare enqueue');
