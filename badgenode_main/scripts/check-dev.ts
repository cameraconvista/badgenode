#!/usr/bin/env tsx
// Health check automatico per verificare che l'app sia avviata correttamente
// Uso: npm run check:dev

const PORT = process.env.PORT || '3001';
const MAX_RETRIES = 30; // 30 tentativi = 60 secondi max
const RETRY_DELAY = 2000; // 2 secondi tra tentativi

interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
}

async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${PORT}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      console.error(`❌ Health check failed: HTTP ${response.status}`);
      return false;
    }

    const data: HealthResponse = await response.json();

    if (data.status !== 'ok') {
      console.error(`❌ Health check failed: status=${data.status}`);
      return false;
    }

    console.log(`✅ Health check passed: ${data.service} @ ${data.timestamp}`);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ Health check error: ${error.message}`);
    } else {
      console.error(`❌ Health check error: ${String(error)}`);
    }
    return false;
  }
}

async function checkApp(): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${PORT}/`, {
      method: 'GET',
      headers: { Accept: 'text/html' },
    });

    if (!response.ok) {
      console.error(`❌ App check failed: HTTP ${response.status}`);
      return false;
    }

    const html = await response.text();
    if (!html.includes('BadgeNode')) {
      console.error(`❌ App check failed: BadgeNode not found in response`);
      return false;
    }

    console.log(`✅ App check passed: BadgeNode app is serving`);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`❌ App check error: ${error.message}`);
    } else {
      console.error(`❌ App check error: ${String(error)}`);
    }
    return false;
  }
}

async function waitForServer(): Promise<void> {
  console.log(`🔍 Checking BadgeNode server on port ${PORT}...`);

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`   Attempt ${attempt}/${MAX_RETRIES}...`);

    const healthOk = await checkHealth();
    const appOk = await checkApp();

    if (healthOk && appOk) {
      console.log(`🎉 Server is ready! (took ${(attempt * RETRY_DELAY) / 1000}s)`);
      return;
    }

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }

  // Se arriviamo qui, tutti i tentativi sono falliti
  console.error(`💥 Server failed to start after ${(MAX_RETRIES * RETRY_DELAY) / 1000}s`);
  console.error(`\n🔧 Possible causes:`);
  console.error(`   • Port ${PORT} is already in use (kill existing process)`);
  console.error(`   • Missing .env.local file (copy from .env.example)`);
  console.error(`   • TypeScript compilation errors (check console)`);
  console.error(`   • Database connection issues (check Supabase config)`);

  process.exit(1);
}

// Esegui il check
waitForServer().catch((error) => {
  console.error(`💥 Unexpected error:`, error);
  process.exit(1);
});
