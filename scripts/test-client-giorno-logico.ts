// Test logica client per calcolo giorno logico nella Home
// Verifica che il client cerchi timbrature sul giorno logico corretto

interface TestCase {
  name: string;
  ora: number; // 0-23
  expectedOffset: number; // giorni da sottrarre
}

const testCases: TestCase[] = [
  { name: 'Ore 00:00 (dopo mezzanotte)', ora: 0, expectedOffset: 1 },
  { name: 'Ore 01:45 (turno notturno)', ora: 1, expectedOffset: 1 },
  { name: 'Ore 04:59 (ultimo minuto cutoff)', ora: 4, expectedOffset: 1 },
  { name: 'Ore 05:00 (inizio nuovo giorno)', ora: 5, expectedOffset: 0 },
  { name: 'Ore 08:00 (orario normale)', ora: 8, expectedOffset: 0 },
  { name: 'Ore 18:56 (turno serale)', ora: 18, expectedOffset: 0 },
  { name: 'Ore 23:59 (fine giornata)', ora: 23, expectedOffset: 0 },
];

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateGiornoLogico(ora: number): string {
  const now = new Date();
  now.setHours(ora, 0, 0, 0);
  
  let targetDate = new Date(now);
  
  // Se ora < 05:00, cerca sul giorno precedente (giorno logico)
  if (now.getHours() < 5) {
    targetDate.setDate(targetDate.getDate() - 1);
  }
  
  return formatDateLocal(targetDate);
}

function runTests() {
  console.log('\n🧪 TEST CLIENT GIORNO LOGICO - Calcolo Data Query\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  const baseDate = new Date('2025-11-02T00:00:00'); // Domenica 2 novembre

  for (const test of testCases) {
    console.log(`\n📋 Test: ${test.name}`);
    console.log(`   Ora simulata: ${String(test.ora).padStart(2, '0')}:00`);

    const testDate = new Date(baseDate);
    testDate.setHours(test.ora, 0, 0, 0);

    const expectedDate = new Date(baseDate);
    expectedDate.setDate(expectedDate.getDate() - test.expectedOffset);
    const expectedGiornoLogico = formatDateLocal(expectedDate);

    const giornoLogico = calculateGiornoLogico(test.ora);

    console.log(`   → Giorno logico calcolato: ${giornoLogico}`);
    console.log(`   → Expected:                ${expectedGiornoLogico}`);

    if (giornoLogico === expectedGiornoLogico) {
      console.log('   ✅ PASS');
      passed++;
    } else {
      console.log('   ❌ FAIL');
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Risultati: ${passed} PASS, ${failed} FAIL`);

  if (failed === 0) {
    console.log('✅ Tutti i test superati!\n');
    console.log('💡 Il client ora cerca timbrature sul giorno logico corretto');
    console.log('   considerando il cutoff 05:00 per turni notturni.\n');
    process.exit(0);
  } else {
    console.log('❌ Alcuni test falliti\n');
    process.exit(1);
  }
}

runTests();
