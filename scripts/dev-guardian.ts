#!/usr/bin/env tsx

/**
 * Dev Guardian - Monitora e mantiene attivo il server di sviluppo
 * Questo script può essere chiamato da qualsiasi operazione per assicurare che l'app sia sempre attiva
 */

import { ensureDevServerRunning } from './auto-start-dev.js';

/**
 * Guardian function - da chiamare prima di qualsiasi operazione
 */
export async function guardDevServer(): Promise<void> {
  try {
    await ensureDevServerRunning();
  } catch (error) {
    console.warn('⚠️ Guardian: Impossibile assicurare server attivo:', error);
    // Non bloccare l'operazione, solo avvertire
  }
}

/**
 * Wrapper per comandi che richiedono server attivo
 */
export async function withDevServer<T>(operation: () => Promise<T>): Promise<T> {
  await guardDevServer();
  return operation();
}

// Auto-esecuzione se chiamato direttamente
guardDevServer();
