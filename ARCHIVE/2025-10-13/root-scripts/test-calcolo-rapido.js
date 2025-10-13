// Test rapido calcolo 22:33 → 01:00

const entrata = new Date('2025-10-12T22:33:00');
const uscita = new Date('2025-10-12T01:00:00');

console.log('Entrata:', entrata.toISOString());
console.log('Uscita:', uscita.toISOString());
console.log('Uscita < Entrata:', uscita < entrata);

if (uscita < entrata) {
  uscita.setDate(uscita.getDate() + 1);
  console.log('Uscita +1 giorno:', uscita.toISOString());
}

const ore = (uscita.getTime() - entrata.getTime()) / (1000 * 60 * 60);
console.log('Ore calcolate:', ore);
console.log('Ore arrotondate:', Math.round(ore * 100) / 100);

// Calcolo manuale
console.log('\nCalcolo manuale:');
console.log('22:33 → 23:00 = 27 minuti');
console.log('23:00 → 01:00 = 2 ore');
console.log('Totale = 2 ore + 27 minuti = 2.45 ore');
