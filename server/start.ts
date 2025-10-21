// server/start.ts - Punto d'ingresso unico con guardia idempotente
import './env'; // Carica dotenv una sola volta
import http from 'http';
import { createApp, setupStaticFiles } from './createApp';

const PORT = Number(process.env.PORT || 10000);

// Idempotency guard (evita doppio listen in ambienti che rieseguono i moduli)
const GUARD = Symbol.for('__BADGENODE_SERVER__');
const g = globalThis as Record<string | symbol, unknown>;

async function startServer() {
  if (!g[GUARD]) {
    const app = createApp();
    const server = http.createServer(app);
    
    // Setup static files (Vite dev o produzione) - passa server per HMR
    await setupStaticFiles(app, server);
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    
    g[GUARD] = server;
    
    return server;
  } else {
    console.log('ℹ️ Server already started — skipping listen()');
    return g[GUARD] as http.Server;
  }
}

// Avvia server solo se questo file è il main module (ES module compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer().catch(console.error);
}

export default startServer;
