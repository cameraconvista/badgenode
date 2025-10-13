#!/usr/bin/env node

/**
 * Test formato ore:minuti
 */

// Simula la funzione formatOre aggiornata
function formatOre(n) {
  const v = Number.isFinite(n) ? n : 0;
  
  // Converte ore decimali in formato ore.minuti
  const ore = Math.floor(v);
  const minutiDecimali = (v - ore) * 60;
  const minuti = Math.round(minutiDecimali);
  
  // Formato: ore.minuti (es. 2.27 per 2h27m)
  return `${ore}.${minuti.toString().padStart(2, '0')}`;
}

console.log('🧮 Test Formato Ore:Minuti\n');

// Test con 2.45 ore (2 ore e 27 minuti)
const oreDecimali = 2.45;
const formattatoNuovo = formatOre(oreDecimali);

console.log(`Input: ${oreDecimali} ore decimali`);
console.log(`Output: ${formattatoNuovo}`);
console.log(`Significato: 2 ore e 27 minuti`);

// Altri test
console.log('\n📊 Altri esempi:');
console.log(`8.00 ore → ${formatOre(8.0)} (8 ore esatte)`);
console.log(`8.50 ore → ${formatOre(8.5)} (8 ore e 30 minuti)`);
console.log(`1.75 ore → ${formatOre(1.75)} (1 ora e 45 minuti)`);
console.log(`0.25 ore → ${formatOre(0.25)} (15 minuti)`);

console.log('\n✅ PERFETTO! Ora 22:33→01:00 mostrerà 2.27 (2h27m)');
