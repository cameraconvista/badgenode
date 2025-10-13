#!/usr/bin/env node

/**
 * Diagnosi PROD vs LOCAL - BadgeNode
 * Verifica configurazione e accesso dati
 */

console.log('🔍 DIAGNOSI PROD vs LOCAL - BadgeNode\n');

console.log('📋 DIAGNOSI IMPLEMENTATA:');

console.log('\n1. 📊 CONFIG DETECTION:');
console.log('   - URL Supabase completo');
console.log('   - Dominio estratto (es: tutllgsjrbxkmrwseogz)');
console.log('   - Hash anonKey (primi 8 caratteri)');
console.log('   - Lunghezza chiave per validazione');

console.log('\n2. 🔍 DATA ACCESS PROBES:');
console.log('   - Test utenti: SELECT count(*) con head: true');
console.log('   - Test timbrature: SELECT count(*) con head: true');
console.log('   - Test RPC insert_timbro_v2: verifica esistenza (non esecuzione)');

console.log('\n3. 🚨 ERROR DETECTION:');
console.log('   - Policies RLS mancanti → "permission denied"');
console.log('   - URL/Key errati → "Invalid API key" o network error');
console.log('   - Database vuoto → count: 0 ma no error');
console.log('   - RPC mancante → "does not exist"');

console.log('\n📐 IMPLEMENTAZIONE TECNICA:');
console.log('File: /client/src/lib/supabaseClient.ts');
console.log('- Blocco diagnosi solo se import.meta.env.PROD');
console.log('- setTimeout(1000) per non bloccare app startup');
console.log('- console.info() per output strutturato');
console.log('- window.__BADGENODE_DIAG__ per DevTools');

console.log('\n🎯 OUTPUT ATTESO IN PROD:');
console.log('🔍 BadgeNode PROD Diagnostics');
console.log('📊 Supabase Config: {');
console.log('  url: "https://tutllgsjrbxkmrwseogz.supabase.co",');
console.log('  domain: "tutllgsjrbxkmrwseogz",');
console.log('  anonKeyHash: "eyJhbGci...",');
console.log('  keyLength: 266');
console.log('}');
console.log('🔍 Testing data access...');
console.log('👥 Utenti probe: { count: 2, error: null }');
console.log('⏰ Timbrature probe: { count: 15, error: null }');
console.log('🔧 RPC insert_timbro_v2 probe: { exists: true, error: null }');

console.log('\n⚠️  POSSIBILI SCENARI ERRORE:');

console.log('\n❌ SCENARIO 1 - ENV ERRATI:');
console.log('📊 Supabase Config: {');
console.log('  url: "undefined" o URL diverso,');
console.log('  anonKeyHash: "undefined...",');
console.log('}');

console.log('\n❌ SCENARIO 2 - RLS POLICIES:');
console.log('👥 Utenti probe: { count: null, error: "permission denied" }');
console.log('⏰ Timbrature probe: { count: null, error: "permission denied" }');

console.log('\n❌ SCENARIO 3 - DATABASE VUOTO:');
console.log('👥 Utenti probe: { count: 0, error: null }');
console.log('⏰ Timbrature probe: { count: 0, error: null }');

console.log('\n❌ SCENARIO 4 - NETWORK/CORS:');
console.log('❌ PROD Diagnostics failed: NetworkError');

console.log('\n🚀 PROSSIMI PASSI:');
console.log('1. Build app per produzione');
console.log('2. Deploy su hosting');
console.log('3. Aprire DevTools → Console');
console.log('4. Cercare output "🔍 BadgeNode PROD Diagnostics"');
console.log('5. Analizzare risultati probe');
console.log('6. Identificare causa specifica');

console.log('\n📋 CHECKLIST DIAGNOSI:');
console.log('□ URL Supabase corretto?');
console.log('□ AnonKey presente e valida?');
console.log('□ Policies RLS attive per anon?');
console.log('□ Database popolato con dati?');
console.log('□ RPC insert_timbro_v2 esistente?');
console.log('□ PWA cache che serve build vecchia?');

console.log('\n✅ DIAGNOSI PRONTA');
console.log('App locale attiva su http://localhost:3001');
console.log('Modifiche implementate in supabaseClient.ts');
console.log('Pronto per build e deploy di test');
