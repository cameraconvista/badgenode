#!/usr/bin/env node

/**
 * Debug Calcolo Ore - Analisi problema arrotondamento
 */

// Simuliamo i dati dal database
const primaEntrata = {
  data_locale: '2025-10-12',
  ora_locale: '22:33:44'
};

const ultimaUscita = {
  data_locale: '2025-10-13', // Questo è il problema!
  ora_locale: '01:00:00'
};

console.log('🔍 Debug Calcolo Ore - Problema Identificato\n');

console.log('📊 Dati dal database:');
console.log(`Entrata: ${primaEntrata.data_locale}T${primaEntrata.ora_locale}`);
console.log(`Uscita:  ${ultimaUscita.data_locale}T${ultimaUscita.ora_locale}`);

// Logica attuale (SBAGLIATA)
console.log('\n❌ Logica attuale (SBAGLIATA):');
const entrata = new Date(`${primaEntrata.data_locale}T${primaEntrata.ora_locale}`);
const uscita = new Date(`${ultimaUscita.data_locale}T${ultimaUscita.ora_locale}`);

console.log(`Entrata Date: ${entrata.toISOString()}`);
console.log(`Uscita Date:  ${uscita.toISOString()}`);
console.log(`Uscita < Entrata: ${uscita < entrata}`);

if (uscita < entrata) {
  uscita.setDate(uscita.getDate() + 1);
  console.log(`Uscita +1 giorno: ${uscita.toISOString()}`);
}

const oreAttuali = (uscita.getTime() - entrata.getTime()) / (1000 * 60 * 60);
const oreArrotondate = Math.round(oreAttuali * 100) / 100;

console.log(`Ore calcolate: ${oreAttuali}`);
console.log(`Ore arrotondate: ${oreArrotondate}`);

// Logica corretta (usando giorno_logico)
console.log('\n✅ Logica corretta (usando giorno_logico):');

// Con il fix del giorno_logico, entrambi dovrebbero avere data_locale = 2025-10-12
const entrataCorretta = new Date(`2025-10-12T22:33:44`);
const uscitaCorretta = new Date(`2025-10-12T01:00:00`);

console.log(`Entrata: ${entrataCorretta.toISOString()}`);
console.log(`Uscita:  ${uscitaCorretta.toISOString()}`);

// Uscita è il giorno dopo (attraversa mezzanotte)
uscitaCorretta.setDate(uscitaCorretta.getDate() + 1);
console.log(`Uscita +1 giorno: ${uscitaCorretta.toISOString()}`);

const oreCorrette = (uscitaCorretta.getTime() - entrataCorretta.getTime()) / (1000 * 60 * 60);
const oreCorretteArrotondate = Math.round(oreCorrette * 100) / 100;

console.log(`Ore corrette: ${oreCorrette}`);
console.log(`Ore corrette arrotondate: ${oreCorretteArrotondate}`);

// Calcolo manuale per verifica
console.log('\n🧮 Calcolo manuale:');
console.log('22:33 → 01:00 = 2 ore e 27 minuti');
console.log('27 minuti = 27/60 = 0.45 ore');
console.log('Totale = 2 + 0.45 = 2.45 ore');

console.log('\n🎯 PROBLEMA IDENTIFICATO:');
console.log('Il fix del giorno_logico ha corretto giorno_logico ma NON data_locale');
console.log('data_locale dell\'uscita è ancora 2025-10-13 invece di 2025-10-12');
console.log('Questo causa un calcolo errato: 01:00 del 13/10 + 1 giorno = 01:00 del 14/10');
