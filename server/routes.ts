// Routes modulari (Governance compliant ≤220 righe)
// STEP 2: Refactored per compliance governance
import type { Express } from 'express';
import { createServer, type Server } from 'http';
import systemRoutes from './routes/modules/system';
import utentiRoutes from './routes/modules/utenti';
import otherRoutes from './routes/modules/other';
import timbratureRoutes from './routes/timbrature';

export async function registerRoutes(app: Express): Promise<Server> {
  // Monta tutti i moduli router mantenendo endpoint originali
  app.use('/', systemRoutes);
  app.use('/', utentiRoutes);
  app.use('/', otherRoutes);
  app.use('/api/timbrature', timbratureRoutes);

  // Avvia server HTTP
  const server = createServer(app);
  const port = process.env.PORT || 3001;
  
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });

  return server;
}
