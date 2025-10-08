#!/usr/bin/env tsx

/**
 * Auto-start development server
 * Assicura che l'app sia sempre attiva in locale durante lo sviluppo
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const DEV_PORT = 3001;
const DEV_URL = `http://localhost:${DEV_PORT}`;

/**
 * Verifica se il server è attivo
 */
async function isServerRunning(): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" ${DEV_URL}`);
    return stdout.trim() === '200';
  } catch {
    return false;
  }
}

/**
 * Trova e termina processi esistenti sulla porta
 */
async function killExistingProcesses(): Promise<void> {
  try {
    const { stdout } = await execAsync(`lsof -ti:${DEV_PORT}`);
    if (stdout.trim()) {
      console.log(`🔄 Terminando processi esistenti sulla porta ${DEV_PORT}...`);
      await execAsync(`kill -9 ${stdout.trim()}`);
      // Aspetta un momento per la pulizia
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch {
    // Nessun processo da terminare
  }
}

/**
 * Avvia il server di sviluppo
 */
function startDevServer(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Avviando server di sviluppo su porta ${DEV_PORT}...`);
    
    const devProcess = spawn('npm', ['run', 'dev'], {
      env: { ...process.env, PORT: DEV_PORT.toString() },
      stdio: 'inherit',
      detached: true
    });

    // Timeout per verificare l'avvio
    const timeout = setTimeout(async () => {
      const running = await isServerRunning();
      if (running) {
        console.log(`✅ Server attivo su ${DEV_URL}`);
        resolve();
      } else {
        reject(new Error('Server non si è avviato nel tempo previsto'));
      }
    }, 8000);

    devProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });

    // Mantieni il processo in background
    devProcess.unref();
  });
}

/**
 * Funzione principale di auto-avvio
 */
export async function ensureDevServerRunning(): Promise<void> {
  console.log('🔍 Verificando stato server di sviluppo...');
  
  const isRunning = await isServerRunning();
  
  if (isRunning) {
    console.log(`✅ Server già attivo su ${DEV_URL}`);
    return;
  }

  console.log('⚠️  Server non attivo, avvio automatico...');
  
  // Pulisci eventuali processi zombie
  await killExistingProcesses();
  
  // Avvia il server
  await startDevServer();
}

/**
 * Esecuzione diretta dello script
 */
// Esegui se chiamato direttamente
ensureDevServerRunning()
  .then(() => {
    console.log('🎉 Auto-avvio completato con successo!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Errore durante auto-avvio:', error.message);
    process.exit(1);
  });
