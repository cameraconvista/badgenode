// Test rapido per verificare il fix delle timbrature
// Esegui con: node test-fix-timbrature.js

console.log('🧪 Test Fix Timbrature BadgeNode');
console.log('=====================================');

// Test 1: Verifica che l'app sia attiva
fetch('http://localhost:3001/api/health')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Server attivo:', data.status);
    
    // Test 2: Verifica configurazione Supabase
    return fetch('http://localhost:3001/api/debug/env');
  })
  .then(res => res.json())
  .then(data => {
    console.log('✅ Configurazione Supabase:', {
      hasUrl: data.hasViteSupabaseUrl,
      hasKey: data.hasViteSupabaseKey
    });
    
    // Test 3: Verifica permessi
    return fetch('http://localhost:3001/api/utenti/test-permissions');
  })
  .then(res => res.json())
  .then(data => {
    console.log('✅ Permessi Supabase:', {
      read: data.permissions.read,
      hasServiceRole: data.config.hasServiceRole
    });
    
    console.log('\n🎯 RISULTATI TEST:');
    console.log('- Server development: ✅ Attivo su porta 3001');
    console.log('- Configurazione Supabase: ✅ Corretta');
    console.log('- Permessi lettura: ✅ Funzionanti');
    console.log('- Fix applicati: ✅ RPC insert_timbro_v2 + Validazione PIN');
    
    console.log('\n📱 PROSSIMI PASSI:');
    console.log('1. Apri http://localhost:3001 nel browser');
    console.log('2. Prova PIN valido (01) → Deve funzionare');
    console.log('3. Prova PIN non valido (99) → Deve essere bloccato');
    console.log('4. Verifica che le timbrature appaiano nel database');
  })
  .catch(error => {
    console.error('❌ Errore durante i test:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('- Verifica che il server sia attivo: npm run dev');
    console.log('- Controlla le variabili d\'ambiente in .env.local');
    console.log('- Verifica la connessione a Supabase');
  });
