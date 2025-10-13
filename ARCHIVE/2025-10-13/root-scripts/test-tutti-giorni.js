#!/usr/bin/env node

/**
 * Test visualizzazione tutti i giorni del periodo
 */

// Simula la funzione expandDaysRange
function expandDaysRange(dal, al) {
  const days = [];
  const current = new Date(dal + 'T00:00:00');
  const end = new Date(al + 'T00:00:00');

  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    days.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }

  return days;
}

// Simula la funzione formatOre
function formatOre(n) {
  const v = Number.isFinite(n) ? n : 0;
  const ore = Math.floor(v);
  const minutiDecimali = (v - ore) * 60;
  const minuti = Math.round(minutiDecimali);
  return `${ore}.${minuti.toString().padStart(2, '0')}`;
}

console.log('🗓️  Test Visualizzazione Tutti i Giorni\n');

// Test con range 01/10/2025 - 31/10/2025
const dal = '2025-10-01';
const al = '2025-10-31';
const tuttiIGiorni = expandDaysRange(dal, al);

console.log(`📅 Range: ${dal} → ${al}`);
console.log(`📊 Giorni totali: ${tuttiIGiorni.length}`);

// Simula giorni con timbrature (solo alcuni)
const giorniConTimbrature = new Map([
  ['2025-10-12', { ore: 2.45, entrata: '22:33', uscita: '01:00' }],
  ['2025-10-14', { ore: 8.0, entrata: '09:00', uscita: '17:00' }],
  ['2025-10-15', { ore: 7.5, entrata: '08:30', uscita: '16:00' }],
]);

console.log('\n📋 Esempio visualizzazione (primi 5 giorni):');
console.log('Data       | Entrata | Uscita | Ore   | Stato');
console.log('-----------|---------|--------|-------|----------');

tuttiIGiorni.slice(0, 5).forEach(giorno => {
  const timbratura = giorniConTimbrature.get(giorno);
  
  if (timbratura) {
    // Giorno con timbrature
    console.log(`${giorno} | ${timbratura.entrata}   | ${timbratura.uscita}  | ${formatOre(timbratura.ore)} | Lavorato`);
  } else {
    // Giorno senza timbrature
    console.log(`${giorno} | —       | —      | ${formatOre(0)} | Riposo`);
  }
});

// Calcola totali
const giorniLavorati = Array.from(giorniConTimbrature.values());
const oreTotali = giorniLavorati.reduce((sum, g) => sum + g.ore, 0);

console.log('\n📊 Totali:');
console.log(`Giorni nel periodo: ${tuttiIGiorni.length}`);
console.log(`Giorni lavorati: ${giorniLavorati.length}`);
console.log(`Ore totali: ${formatOre(oreTotali)}`);

console.log('\n✅ RISULTATO ATTESO NELL\'UI:');
console.log('- Tutti i 31 giorni di ottobre visualizzati');
console.log('- Giorni senza timbrature mostrati con "—" e "0.00"');
console.log('- Giorni senza timbrature in grigio (opacity ridotta)');
console.log('- Totali calcolati solo sui giorni lavorati');
console.log('- Formato ore sempre in ore.minuti (es. 2.27 per 2h27m)');
