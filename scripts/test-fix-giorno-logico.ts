// Test automatico per fix giorno logico - verifica turni notturni
// Simula i casi critici: ENTRATA serale → USCITA notturna

import { computeGiornoLogico } from '../server/shared/time/computeGiornoLogico';

interface TestCase {
  name: string;
  entrata: { data: string; ora: string };
  uscita: { data: string; ora: string };
  expectedGiornoLogico: string;
}

const testCases: TestCase[] = [
  {
    name: 'Turno serale standard (18:56 → 01:14)',
    entrata: { data: '2025-11-01', ora: '18:56:00' },
    uscita: { data: '2025-11-02', ora: '01:14:00' },
    expectedGiornoLogico: '2025-11-01',
  },
  {
    name: 'Turno notturno (23:30 → 02:00)',
    entrata: { data: '2025-11-01', ora: '23:30:00' },
    uscita: { data: '2025-11-02', ora: '02:00:00' },
    expectedGiornoLogico: '2025-11-01',
  },
  {
    name: 'Turno diurno normale (08:00 → 17:00)',
    entrata: { data: '2025-11-01', ora: '08:00:00' },
    uscita: { data: '2025-11-01', ora: '17:00:00' },
    expectedGiornoLogico: '2025-11-01',
  },
  {
    name: 'Turno lungo notturno (20:00 → 04:30)',
    entrata: { data: '2025-11-01', ora: '20:00:00' },
    uscita: { data: '2025-11-02', ora: '04:30:00' },
    expectedGiornoLogico: '2025-11-01',
  },
];

function runTests() {
  console.log('\n🧪 TEST FIX GIORNO LOGICO - Turni Notturni\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  for (const test of testCases) {
    console.log(`\n📋 Test: ${test.name}`);
    console.log(`   ENTRATA: ${test.entrata.data} ${test.entrata.ora}`);
    console.log(`   USCITA:  ${test.uscita.data} ${test.uscita.ora}`);

    // Calcola giorno logico ENTRATA
    const entrataResult = computeGiornoLogico({
      data: test.entrata.data,
      ora: test.entrata.ora,
      tipo: 'entrata',
    });

    console.log(`   → ENTRATA giorno_logico: ${entrataResult.giorno_logico}`);

    // Calcola giorno logico USCITA con ancoraggio
    const uscitaResult = computeGiornoLogico({
      data: test.uscita.data,
      ora: test.uscita.ora,
      tipo: 'uscita',
      dataEntrata: entrataResult.giorno_logico, // Simula auto-recovery
    });

    console.log(`   → USCITA giorno_logico:  ${uscitaResult.giorno_logico}`);
    console.log(`   → Expected:              ${test.expectedGiornoLogico}`);

    if (uscitaResult.giorno_logico === test.expectedGiornoLogico) {
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
    process.exit(0);
  } else {
    console.log('❌ Alcuni test falliti\n');
    process.exit(1);
  }
}

runTests();
