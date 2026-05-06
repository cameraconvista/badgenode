// FIXED: Rimosso doppio listen() - ora usa server/start.ts
// Re-export per compatibilità
export { createApp } from './createApp';

// Per compatibilità con import esistenti, avvia il server
import startServer from './start';

// Avvia solo se questo è il main module (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(console.error);
}
