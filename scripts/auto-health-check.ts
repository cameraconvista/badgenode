#!/usr/bin/env tsx

/**
 * Script di Auto-Health Check per BadgeNode
 * Verifica lo stato dell'app e la riavvia automaticamente se necessario
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface HealthCheckResult {
  isRunning: boolean;
  port: number;
  processId?: number;
  error?: string;
}

class BadgeNodeHealthChecker {
  private readonly TARGET_PORT = 3001;
  private readonly MAX_RETRIES = 3;
  private readonly STARTUP_TIMEOUT = 30000; // 30 secondi
  
  async checkHealth(): Promise<HealthCheckResult> {
    try {
      // Verifica se la porta è in uso
      const { stdout } = await execAsync(`lsof -ti:${this.TARGET_PORT}`);
      const pid = stdout.trim();
      
      if (pid) {
        // Verifica se il processo risponde
        try {
          const response = await fetch(`http://localhost:${this.TARGET_PORT}`, {
            method: 'HEAD',
            signal: AbortSignal.timeout(5000)
          });
          
          return {
            isRunning: true,
            port: this.TARGET_PORT,
            processId: parseInt(pid)
          };
        } catch (fetchError) {
          return {
            isRunning: false,
            port: this.TARGET_PORT,
            processId: parseInt(pid),
            error: 'Process exists but not responding'
          };
        }
      }
      
      return {
        isRunning: false,
        port: this.TARGET_PORT,
        error: 'No process on port'
      };
    } catch (error) {
      return {
        isRunning: false,
        port: this.TARGET_PORT,
        error: `Health check failed: ${error}`
      };
    }
  }
  
  async killExistingProcesses(): Promise<void> {
    try {
      // Kill processi sulla porta target
      await execAsync(`lsof -ti:${this.TARGET_PORT} | xargs kill -9`).catch(() => {});
      
      // Kill tutti i processi node/tsx che potrebbero essere BadgeNode
      await execAsync(`pkill -f "tsx.*server/index.ts"`).catch(() => {});
      await execAsync(`pkill -f "node.*BadgeNode"`).catch(() => {});
      
      // Aspetta che i processi si chiudano
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('🧹 Processi esistenti terminati');
    } catch (error) {
      console.log('⚠️ Errore durante kill processi:', error);
    }
  }
  
  async startApp(): Promise<boolean> {
    console.log('🚀 Avvio BadgeNode...');
    
    return new Promise((resolve) => {
      const process = spawn('npm', ['run', 'dev'], {
        cwd: '/Users/dero/Documents/BadgeNode',
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: true
      });
      
      let isResolved = false;
      
      const resolveOnce = (success: boolean) => {
        if (!isResolved) {
          isResolved = true;
          if (startupTimer) clearTimeout(startupTimer);
          resolve(success);
        }
      };
      
      // Timeout per startup
      const startupTimer = setTimeout(() => {
        console.log('❌ Timeout durante avvio app');
        process.kill();
        resolveOnce(false);
      }, this.STARTUP_TIMEOUT);
      
      // Monitor output per conferma avvio
      process.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log('📡', output.trim());
        
        if (output.includes('serving on port') || output.includes('Local:')) {
          console.log('✅ App avviata con successo!');
          resolveOnce(true);
        }
      });
      
      process.stderr?.on('data', (data) => {
        const error = data.toString();
        console.log('🔴', error.trim());
        
        if (error.includes('EADDRINUSE') || error.includes('Error:')) {
          console.log('❌ Errore durante avvio');
          resolveOnce(false);
        }
      });
      
      process.on('exit', (code) => {
        if (code !== 0 && !isResolved) {
          console.log(`❌ Processo terminato con codice ${code}`);
          resolveOnce(false);
        }
      });
    });
  }
  
  async ensureAppRunning(): Promise<boolean> {
    console.log('🔍 Verifica stato BadgeNode...');
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      console.log(`\n📋 Tentativo ${attempt}/${this.MAX_RETRIES}`);
      
      const health = await this.checkHealth();
      
      if (health.isRunning) {
        console.log('✅ App già in esecuzione e funzionante!');
        console.log(`🌐 Disponibile su: http://localhost:${this.TARGET_PORT}`);
        return true;
      }
      
      console.log('⚠️ App non funzionante:', health.error);
      
      // Kill processi esistenti
      await this.killExistingProcesses();
      
      // Avvia app
      const started = await this.startApp();
      
      if (started) {
        // Verifica finale
        await new Promise(resolve => setTimeout(resolve, 3000));
        const finalHealth = await this.checkHealth();
        
        if (finalHealth.isRunning) {
          console.log('🎉 App avviata e verificata con successo!');
          console.log(`🌐 Disponibile su: http://localhost:${this.TARGET_PORT}`);
          return true;
        }
      }
      
      if (attempt < this.MAX_RETRIES) {
        console.log(`🔄 Tentativo ${attempt} fallito, riprovo...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    
    console.log('❌ Impossibile avviare l\'app dopo tutti i tentativi');
    return false;
  }
}

export { BadgeNodeHealthChecker };
