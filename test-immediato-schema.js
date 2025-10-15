#!/usr/bin/env node

/**
 * TEST IMMEDIATO SCHEMA - Verifica diagnostica avanzata
 */

console.log('🔬 TEST IMMEDIATO SCHEMA IMPLEMENTATO\n');

console.log('🎯 OBIETTIVO:');
console.log('Identificare esatto schema tabella timbrature e correggere mapping');

console.log('\n📊 NUOVA DIAGNOSTICA IMPLEMENTATA:');

console.log('\n1️⃣ SCHEMA CHECK (completo):');
console.log('- fullResponse: risposta completa Supabase');
console.log('- record: record completo con tutti i campi');
console.log('- schema: array nomi campi');

console.log('\n2️⃣ RECORD FIELDS (dettagliato):');
console.log('- hasDataLocale: presenza campo data_locale');
console.log('- hasData: presenza campo data');
console.log('- hasOraLocale: presenza campo ora_locale');
console.log('- hasOre: presenza campo ore');
console.log('- Values: valori attuali dei campi');
console.log('- allFields: tutti i campi presenti');

console.log('\n3️⃣ ADAPTATION LOGIC (step-by-step):');
console.log('- originalUpdateData: dati in input');
console.log('- recordHas*: verifica presenza campi nel record');
console.log('- MAPPING logs: ogni step di adattamento');

console.log('\n4️⃣ ADAPTED updateData (finale):');
console.log('- original vs adapted');
console.log('- adaptedKeys: chiavi dopo adattamento');
console.log('- isEmpty: check se vuoto');

console.log('\n🧪 PROCEDURA TEST:');
console.log('1. Apri DevTools → Console');
console.log('2. Apri modale timbratura Martedì 14');
console.log('3. Modifica Entrata: 14:00 → 15:00');
console.log('4. Clicca SALVA');
console.log('5. Osserva log dettagliati');

console.log('\n✅ LOG ATTESI:');

console.log('\n[SERVICE] SCHEMA CHECK → {');
console.log('  id: 49,');
console.log('  exists: true,');
console.log('  schema: ["id", "tipo", "pin", "data", "ore", "giornologico", ...],');
console.log('  record: { id: 49, tipo: "entrata", data: "2025-10-14", ore: "14:00:00", ... },');
console.log('  fullResponse: [{ ... }]');
console.log('}');

console.log('\n[SERVICE] RECORD FIELDS → {');
console.log('  hasDataLocale: false,');
console.log('  hasData: true,');
console.log('  hasOraLocale: false,');
console.log('  hasOre: true,');
console.log('  dataValue: "2025-10-14",');
console.log('  oreValue: "14:00:00",');
console.log('  allFields: ["id", "tipo", "pin", "data", "ore", ...]');
console.log('}');

console.log('\n[SERVICE] ADAPTATION LOGIC → {');
console.log('  originalUpdateData: { data_locale: "2025-10-14", ora_locale: "15:00:00" },');
console.log('  recordHasDataLocale: false,');
console.log('  recordHasData: true,');
console.log('  recordHasOraLocale: false,');
console.log('  recordHasOre: true');
console.log('}');

console.log('\n[SERVICE] MAPPING → data_locale → data');
console.log('[SERVICE] MAPPING → ora_locale → ore');

console.log('\n[SERVICE] ADAPTED updateData → {');
console.log('  original: { data_locale: "2025-10-14", ora_locale: "15:00:00" },');
console.log('  adapted: { data: "2025-10-14", ore: "15:00:00" },');
console.log('  adaptedKeys: ["data", "ore"],');
console.log('  isEmpty: false');
console.log('}');

console.log('\n[SERVICE] PATCH response → {');
console.log('  status: 200,');
console.log('  rows: 1,');
console.log('  data: [{ id: 49, data: "2025-10-14", ore: "15:00:00", ... }]');
console.log('}');

console.log('\n❌ SE ANCORA FALLISCE:');
console.log('- Verifica schema reale nei log RECORD FIELDS');
console.log('- Controlla mapping nei log ADAPTATION LOGIC');
console.log('- Se adaptedUpdateData è vuoto → schema completamente diverso');

console.log('\n🚀 TEST PRONTO - Modifica timbratura e verifica log!');
