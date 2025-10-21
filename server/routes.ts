// Routes modulari (Governance compliant ≤220 righe)
// STEP 2: Refactored per compliance governance
// FIXED: Rimosso listen() per evitare ERR_SERVER_ALREADY_LISTEN
import type { Express } from 'express';
import systemRoutes from './routes/modules/system';
import utentiRoutes from './routes/modules/utenti';
import otherRoutes from './routes/modules/other';
import timbratureRoutes from './routes/timbrature';

export function registerRoutes(app: Express): void {
  // Monta tutti i moduli router mantenendo endpoint originali
  app.use('/', systemRoutes);
  app.use('/', utentiRoutes);
  app.use('/', otherRoutes);
  app.use('/api/timbrature', timbratureRoutes);
}
