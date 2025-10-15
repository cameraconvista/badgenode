#!/usr/bin/env node

/**
 * DEBUG SCHEMA TIMBRATURE
 * Verifica struttura reale tabella vs codice
 */

console.log('🔍 DEBUG SCHEMA TIMBRATURE\n');

console.log('📋 DALLA RPC insert_timbro_v2 (REALE):');
console.log('INSERT INTO public.timbrature (tipo, pin, data, ore, giornologico, created_at)');
console.log('RETURNING timbrature.id, timbrature.tipo, timbrature.pin,');
console.log('         timbrature.data, timbrature.ore, timbrature.giornologico, timbrature.created_at');

console.log('\n📋 DAL CODICE CLIENT (ASPETTATO):');
console.log('SELECT id, pin, tipo, created_at, data_locale, ora_locale, giorno_logico, ts_order');
console.log('UPDATE { data_locale: "...", ora_locale: "..." }');

console.log('\n❌ PROBLEMA IDENTIFICATO:');
console.log('SCHEMA REALE:     data, ore, giornologico');
console.log('CODICE CLIENT:    data_locale, ora_locale, giorno_logico');
console.log('                  ↑ MISMATCH! ↑');

console.log('\n🔧 SOLUZIONE:');
console.log('Aggiornare updateData per usare i campi corretti:');
console.log('PRIMA: { data_locale: "2025-10-15", ora_locale: "14:10:00" }');
console.log('DOPO:  { data: "2025-10-15", ore: "14:10:00" }');

console.log('\n📊 VERIFICA NECESSARIA:');
console.log('1. Controllare schema reale tabella timbrature');
console.log('2. Verificare se esiste migrazione per rinominare campi');
console.log('3. Allineare codice client con schema database');

console.log('\n⚠️ NOTA:');
console.log('Se la tabella usa data/ore/giornologico, tutto il codice client');
console.log('che usa data_locale/ora_locale/giorno_logico è SBAGLIATO');

console.log('\n🎯 PROSSIMI STEP:');
console.log('1. Verificare schema con GET /rest/v1/timbrature?limit=1');
console.log('2. Aggiornare mapping campi in updateData');
console.log('3. Testare PATCH con campi corretti');
