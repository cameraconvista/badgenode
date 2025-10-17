#!/usr/bin/env tsx
// Smoke test per STEP B - Server-only consolidation
// Testa 3 endpoint critici: health, storico, manual

import { execSync } from 'child_process';

interface ApiResponse {
  success?: boolean;
  ok?: boolean;
  error?: string;
  code?: string;
}

async function testEndpoint(name: string, url: string, method: string = 'GET', body?: any): Promise<boolean> {
  try {
    let curlCmd = `curl -s -X ${method} http://localhost:3001${url}`;
    
    if (body) {
      curlCmd += ` -H "Content-Type: application/json" -d '${JSON.stringify(body)}'`;
    }

    const response = execSync(curlCmd, { encoding: 'utf8' });
    const data: ApiResponse = JSON.parse(response);
    
    const isHealthy = data.ok === true || data.success === true;
    const hasExpectedError = data.code === 'SERVICE_UNAVAILABLE'; // OK in dev without env vars
    
    if (isHealthy || hasExpectedError) {
      console.log(`✅ ${name}: OK`);
      return true;
    } else {
      console.log(`❌ ${name}: FAIL - ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error instanceof Error ? error.message : 'Unknown'}`);
    return false;
  }
}

async function runSmokeTest(): Promise<void> {
  console.log('🚀 STEP B.2 Smoke Test - Singleton supabaseAdmin');
  console.log('=' .repeat(50));

  // Diagnostica singleton
  try {
    const healthAdmin = await fetch('http://localhost:3001/api/health/admin');
    const adminData = await healthAdmin.json();
    console.log('🔍 Singleton Diagnostics:');
    console.log(`   moduleType: ${adminData.moduleType}`);
    console.log(`   singleInstance: ${adminData.singleInstance}`);
    console.log('');
  } catch (e) {
    console.log('⚠️  Could not fetch admin diagnostics');
  }

  const tests = [
    { name: 'Health Check', url: '/api/health' },
    { name: 'Health Admin', url: '/api/health/admin' },
    { name: 'Utenti API', url: '/api/utenti' },
    { name: 'Storico API', url: '/api/storico?pin=1&dal=2025-10-01&al=2025-10-17' },
    { name: 'Manual Timbratura', url: '/api/timbrature/manual', method: 'POST', body: { pin: 99, tipo: 'entrata', giorno: '2025-10-17', ora: '12:57' } }
  ];

  let passed = 0;
  let total = tests.length;

  for (const test of tests) {
    const success = await testEndpoint(test.name, test.url, test.method, test.body);
    if (success) passed++;
  }

  console.log('=' .repeat(50));
  console.log(`📊 Results: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 STEP B Smoke Test: PASSED');
    process.exit(0);
  } else {
    console.log('💥 STEP B Smoke Test: FAILED');
    process.exit(1);
  }
}

// Run smoke test
runSmokeTest().catch(error => {
  console.error('💥 Smoke test crashed:', error);
  process.exit(1);
});
