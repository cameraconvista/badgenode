#!/usr/bin/env tsx

/**
 * Runner per Health Check - File separato per rispettare limite 200 righe
 */

import { BadgeNodeHealthChecker } from './auto-health-check';

// Esecuzione diretta
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new BadgeNodeHealthChecker();
  checker.ensureAppRunning()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Errore critico:', error);
      process.exit(1);
    });
}
