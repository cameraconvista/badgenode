#!/usr/bin/env tsx

/**
 * Wrapper Automatico per Cascade
 * Si assicura che l'app sia sempre funzionante dopo ogni azione
 */

import { BadgeNodeHealthChecker } from './auto-health-check';

class CascadeAutoWrapper {
  private checker: BadgeNodeHealthChecker;
  private isEnabled: boolean = true;
  
  constructor() {
    this.checker = new BadgeNodeHealthChecker();
  }
  
  /**
   * Verifica automatica da chiamare dopo ogni azione di Cascade
   */
  async postActionCheck(actionDescription: string = 'azione'): Promise<void> {
    if (!this.isEnabled) return;
    
    console.log(`\n🔄 Auto-verifica post ${actionDescription}...`);
    
    try {
      const isHealthy = await this.checker.ensureAppRunning();
      
      if (isHealthy) {
        console.log(`✅ App verificata e funzionante dopo ${actionDescription}`);
      } else {
        console.log(`❌ ATTENZIONE: App non funzionante dopo ${actionDescription}`);
        // Tenta un ultimo riavvio di emergenza
        await this.emergencyRestart();
      }
    } catch (error) {
      console.error(`💥 Errore durante verifica post ${actionDescription}:`, error);
      await this.emergencyRestart();
    }
  }
  
  /**
   * Riavvio di emergenza
   */
  private async emergencyRestart(): Promise<void> {
    console.log('🚨 Tentativo riavvio di emergenza...');
    
    try {
      await this.checker.killExistingProcesses();
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const restarted = await this.checker.ensureAppRunning();
      
      if (restarted) {
        console.log('🆘 Riavvio di emergenza riuscito!');
      } else {
        console.log('💀 Riavvio di emergenza fallito - intervento manuale richiesto');
      }
    } catch (error) {
      console.error('💥 Errore durante riavvio di emergenza:', error);
    }
  }
  
  /**
   * Verifica iniziale all'avvio di Cascade
   */
  async initialCheck(): Promise<void> {
    console.log('🎬 Verifica iniziale Cascade...');
    await this.postActionCheck('avvio Cascade');
  }
  
  /**
   * Disabilita temporaneamente le verifiche automatiche
   */
  disable(): void {
    this.isEnabled = false;
    console.log('⏸️ Auto-verifica disabilitata');
  }
  
  /**
   * Riabilita le verifiche automatiche
   */
  enable(): void {
    this.isEnabled = true;
    console.log('▶️ Auto-verifica riabilitata');
  }
}

// Istanza globale
const cascadeWrapper = new CascadeAutoWrapper();

// Funzioni di utilità per Cascade
export const autoCheck = {
  /**
   * Da chiamare dopo modifiche ai file
   */
  afterFileEdit: () => cascadeWrapper.postActionCheck('modifica file'),
  
  /**
   * Da chiamare dopo operazioni git
   */
  afterGitOperation: () => cascadeWrapper.postActionCheck('operazione git'),
  
  /**
   * Da chiamare dopo installazione dipendenze
   */
  afterDependencyInstall: () => cascadeWrapper.postActionCheck('installazione dipendenze'),
  
  /**
   * Da chiamare dopo build/compile
   */
  afterBuild: () => cascadeWrapper.postActionCheck('build'),
  
  /**
   * Verifica generica
   */
  generic: (action: string) => cascadeWrapper.postActionCheck(action),
  
  /**
   * Verifica iniziale
   */
  initial: () => cascadeWrapper.initialCheck(),
  
  /**
   * Controllo manuale
   */
  manual: () => cascadeWrapper.postActionCheck('verifica manuale'),
  
  /**
   * Disabilita/abilita
   */
  disable: () => cascadeWrapper.disable(),
  enable: () => cascadeWrapper.enable()
};

// Auto-esecuzione se chiamato direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  cascadeWrapper.initialCheck();
}

export { CascadeAutoWrapper, cascadeWrapper };
