#!/usr/bin/env tsx

/**
 * Sistema di Integrazione Automatica per Cascade
 * Garantisce che l'app sia sempre funzionante dopo ogni operazione
 */

import { autoCheck } from './cascade-auto-wrapper';

/**
 * Classe per integrare verifiche automatiche nelle operazioni Cascade
 */
class CascadeIntegration {
  private static instance: CascadeIntegration;
  private isAutoCheckEnabled = true;

  static getInstance(): CascadeIntegration {
    if (!CascadeIntegration.instance) {
      CascadeIntegration.instance = new CascadeIntegration();
    }
    return CascadeIntegration.instance;
  }

  /**
   * Wrapper per operazioni che modificano file
   */
  async withFileOperation<T>(
    operation: () => Promise<T> | T,
    description: string = 'modifica file'
  ): Promise<T> {
    try {
      const result = await operation();

      if (this.isAutoCheckEnabled) {
        console.log(`\n🔄 Auto-verifica dopo ${description}...`);
        await autoCheck.afterFileEdit();
      }

      return result;
    } catch (error) {
      console.error(`❌ Errore durante ${description}:`, error);

      if (this.isAutoCheckEnabled) {
        console.log('🚨 Verifica di emergenza dopo errore...');
        await autoCheck.manual();
      }

      throw error;
    }
  }

  /**
   * Wrapper per operazioni Git
   */
  async withGitOperation<T>(
    operation: () => Promise<T> | T,
    description: string = 'operazione git'
  ): Promise<T> {
    try {
      const result = await operation();

      if (this.isAutoCheckEnabled) {
        console.log(`\n🔄 Auto-verifica dopo ${description}...`);
        await autoCheck.afterGitOperation();
      }

      return result;
    } catch (error) {
      console.error(`❌ Errore durante ${description}:`, error);
      throw error;
    }
  }

  /**
   * Wrapper per operazioni di build/compile
   */
  async withBuildOperation<T>(
    operation: () => Promise<T> | T,
    description: string = 'build'
  ): Promise<T> {
    try {
      const result = await operation();

      if (this.isAutoCheckEnabled) {
        console.log(`\n🔄 Auto-verifica dopo ${description}...`);
        await autoCheck.afterBuild();
      }

      return result;
    } catch (error) {
      console.error(`❌ Errore durante ${description}:`, error);

      if (this.isAutoCheckEnabled) {
        console.log('🚨 Verifica di emergenza dopo errore build...');
        await autoCheck.manual();
      }

      throw error;
    }
  }

  /**
   * Verifica finale obbligatoria
   */
  async finalCheck(): Promise<void> {
    console.log('\n🎯 Verifica finale obbligatoria...');
    await autoCheck.manual();
  }

  /**
   * Disabilita temporaneamente le verifiche automatiche
   */
  disableAutoCheck(): void {
    this.isAutoCheckEnabled = false;
    console.log('⏸️ Auto-verifica disabilitata temporaneamente');
  }

  /**
   * Riabilita le verifiche automatiche
   */
  enableAutoCheck(): void {
    this.isAutoCheckEnabled = true;
    console.log('▶️ Auto-verifica riabilitata');
  }
}

// Funzioni di utilità per Cascade
export const cascadeOps = {
  /**
   * Esegue operazione con auto-verifica file
   */
  withFileOp: <T>(op: () => Promise<T> | T, desc?: string) =>
    CascadeIntegration.getInstance().withFileOperation(op, desc),

  /**
   * Esegue operazione Git con auto-verifica
   */
  withGitOp: <T>(op: () => Promise<T> | T, desc?: string) =>
    CascadeIntegration.getInstance().withGitOperation(op, desc),

  /**
   * Esegue operazione build con auto-verifica
   */
  withBuildOp: <T>(op: () => Promise<T> | T, desc?: string) =>
    CascadeIntegration.getInstance().withBuildOperation(op, desc),

  /**
   * Verifica finale
   */
  finalCheck: () => CascadeIntegration.getInstance().finalCheck(),

  /**
   * Controlli manuali
   */
  disable: () => CascadeIntegration.getInstance().disableAutoCheck(),
  enable: () => CascadeIntegration.getInstance().enableAutoCheck(),

  /**
   * Verifica immediata
   */
  checkNow: () => autoCheck.manual(),
};

// Inizializzazione automatica
console.log('🎬 Sistema Cascade Integration attivato');

export { CascadeIntegration };
