#!/usr/bin/env node

/**
 * TEST PATCH REST DIRETTA - Verifica finale update timbrature
 * Bypassa wrapper Supabase per diagnosi definitiva
 */

console.log('🔬 TEST PATCH REST DIRETTA IMPLEMENTATO\n');

console.log('🎯 OBIETTIVO:');
console.log('Verificare se il problema è nel wrapper Supabase o nella logica di aggiornamento');
console.log('Eseguire PATCH REST reale verso /rest/v1/timbrature per test diretto\n');

console.log('🔧 MODIFICA IMPLEMENTATA (timbratureRpc.ts):');
console.log('PRIMA (wrapper Supabase):');
console.log('  const { data, error } = await supabase');
console.log('    .from("timbrature")');
console.log('    .update(updateData)');
console.log('    .eq("id", id)');
console.log('    .select();');

console.log('\nDOPO (PATCH REST diretta):');
console.log('  const url = `${VITE_SUPABASE_URL}/rest/v1/timbrature?id=eq.${id}`;');
console.log('  const res = await fetch(url, {');
console.log('    method: "PATCH",');
console.log('    headers: {');
console.log('      apikey: VITE_SUPABASE_ANON_KEY,');
console.log('      Authorization: `Bearer ${VITE_SUPABASE_ANON_KEY}`,');
console.log('      "Content-Type": "application/json",');
console.log('      Prefer: "return=representation",');
console.log('    },');
console.log('    body: JSON.stringify(updateData),');
console.log('  });');

console.log('\n📊 LOG IMPLEMENTATI:');
console.log('- [SERVICE] callUpdateTimbro (FORCED PATCH) → { id, updateData }');
console.log('- [SERVICE] PATCH response → { status, rows, data }');
console.log('- [SERVICE] update OK → { id, rows }');
console.log('- [SERVICE] update ERR → { id, error }');

console.log('\n🧪 PROCEDURA TEST:');
console.log('1. Apri DevTools → Network (Fetch/XHR) + Console');
console.log('2. Apri modale di una riga DIURNA');
console.log('3. Cambia Entrata (es. 14:00 → 14:10)');
console.log('4. Clicca SALVA');
console.log('5. Osserva Network e Console');

console.log('\n✅ ESITO ATTESO (SUCCESS):');
console.log('Network:');
console.log('  - ✅ PATCH /rest/v1/timbrature?id=eq.<id>');
console.log('  - ✅ Status: 200/204');
console.log('  - ✅ Request Body: { "data_locale": "...", "ora_locale": "..." }');
console.log('  - ✅ Response: [{ id, data_locale, ora_locale, ... }]');

console.log('\nConsole:');
console.log('  - ✅ [SERVICE] callUpdateTimbro (FORCED PATCH) → { id: 123, updateData: {...} }');
console.log('  - ✅ [SERVICE] PATCH response → { status: 200, rows: 1, data: [...] }');
console.log('  - ✅ [SERVICE] update OK → { id: 123, rows: 1 }');

console.log('\nSupabase Table Editor:');
console.log('  - ✅ Record aggiornato con nuovi valori');

console.log('\n❌ POSSIBILI ESITI (FAILURE):');

console.log('\n1️⃣ PATCH 2xx ma rows=0:');
console.log('  - Network: PATCH 200 ma Response: []');
console.log('  - Console: [SERVICE] update ERR → nessuna riga aggiornata');
console.log('  - Causa: Filtri RLS o WHERE non corrispondenti');
console.log('  - Prossimo step: Analizzare policies Supabase');

console.log('\n2️⃣ PATCH 4xx/5xx:');
console.log('  - Network: PATCH 401/403/422');
console.log('  - Console: [SERVICE] update ERR → PATCH Supabase (4xx)');
console.log('  - Causa: Auth, permissions o validazione schema');
console.log('  - Prossimo step: Verificare headers e payload');

console.log('\n3️⃣ Nessuna PATCH:');
console.log('  - Network: Nessuna richiesta');
console.log('  - Console: Nessun log [SERVICE] callUpdateTimbro');
console.log('  - Causa: Flusso non entra in callUpdateTimbro');
console.log('  - Prossimo step: Tracciare return a monte');

console.log('\n🔍 DIAGNOSI SUCCESSIVA:');
console.log('- SUCCESS → Problema risolto, ripristinare wrapper standard');
console.log('- FAILURE 1 → Analizzare RLS policies su tabella timbrature');
console.log('- FAILURE 2 → Verificare auth e schema validation');
console.log('- FAILURE 3 → Tracciare flusso useStoricoMutations');

console.log('\n⚠️  NOTA TEMPORANEA:');
console.log('Questa è una modifica di TEST per diagnosi');
console.log('Dopo verifica, ripristinare wrapper Supabase standard');
console.log('Non committare questa versione in produzione');

console.log('\n🚀 TEST PRONTO - Apri modale e modifica timbratura!');
