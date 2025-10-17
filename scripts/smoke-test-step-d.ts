#!/usr/bin/env node

// STEP D Smoke Test - Osservabilità e Read-Only Mode
// Testa nuovi endpoint e paracadute manutenzione

async function testEndpoint(name: string, url: string, method: string = 'GET', body?: any): Promise<boolean> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': `test-${Date.now()}` // Test request ID
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`http://localhost:3001${url}`, options);
    const data = await response.json();

    if (response.ok) {
      console.log(`✅ ${name}: OK`);
      
      // Verifica presenza request ID in response
      const requestId = response.headers.get('x-request-id');
      if (requestId) {
        console.log(`   📋 Request ID: ${requestId}`);
      }
      
      return true;
    } else {
      console.log(`❌ ${name}: FAIL - ${data.error || 'Unknown error'} (${data.code || 'NO_CODE'})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error instanceof Error ? error.message : 'Unknown'}`);
    return false;
  }
}

async function testReadOnlyMode(): Promise<boolean> {
  console.log('\n🔒 Testing Read-Only Mode...');
  
  try {
    // Temporaneamente attiva Read-Only Mode
    process.env.READ_ONLY_MODE = '1';
    console.log('   📝 Set READ_ONLY_MODE=1');
    
    // Test POST che dovrebbe essere bloccato
    const response = await fetch('http://localhost:3001/api/timbrature/manual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': 'readonly-test'
      },
      body: JSON.stringify({
        pin: 99,
        tipo: 'entrata',
        giorno: '2025-10-17',
        ora: '13:50'
      })
    });
    
    const data = await response.json();
    
    if (response.status === 503 && data.code === 'READ_ONLY_MODE_ACTIVE') {
      console.log('   ✅ POST blocked correctly in Read-Only Mode');
      console.log(`   📋 Request ID: ${data.requestId}`);
      return true;
    } else {
      console.log('   ❌ POST should be blocked in Read-Only Mode');
      console.log(`   📊 Status: ${response.status}, Code: ${data.code}`);
      return false;
    }
    
  } catch (error) {
    console.log(`   ❌ Read-Only test error: ${error}`);
    return false;
  } finally {
    // Ripristina Read-Only Mode
    process.env.READ_ONLY_MODE = '0';
    console.log('   📝 Reset READ_ONLY_MODE=0');
  }
}

async function runSmokeTest(): Promise<void> {
  console.log('🚀 STEP D Smoke Test - Osservabilità e Read-Only Mode');
  console.log('=' .repeat(60));

  const tests = [
    { name: 'Health Check', url: '/api/health' },
    { name: 'Version Info', url: '/api/version' },
    { name: 'Readiness Check', url: '/api/ready' },
    { name: 'Health Admin', url: '/api/health/admin' },
    { name: 'Utenti API', url: '/api/utenti' },
  ];

  let passed = 0;
  let total = tests.length;

  // Test endpoint normali
  for (const test of tests) {
    const success = await testEndpoint(test.name, test.url);
    if (success) passed++;
  }

  // Test Read-Only Mode
  const readOnlySuccess = await testReadOnlyMode();
  total++;
  if (readOnlySuccess) passed++;

  console.log('\n' + '=' .repeat(60));
  console.log(`📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 STEP D Smoke Test: PASSED');
    process.exit(0);
  } else {
    console.log('💥 STEP D Smoke Test: FAILED');
    process.exit(1);
  }
}

// Verifica che il server sia attivo
async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:3001/api/health');
    return response.ok;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const isServerUp = await checkServerHealth();
  if (!isServerUp) {
    console.error('❌ Server non raggiungibile su http://localhost:3001');
    console.error('   Assicurati che il server sia avviato con: npm run dev');
    process.exit(1);
  }

  await runSmokeTest();
}

main();
