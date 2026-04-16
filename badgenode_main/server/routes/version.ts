// Version endpoint
// Informazioni su versione, build e commit

import { Router } from 'express';

const router = Router();

/**
 * GET /api/version
 * Informazioni versione applicazione
 * 
 * Usa variabili env per flessibilità:
 * - APP_VERSION: versione app (default: 'dev')
 * - BUILD_TIME: timestamp build (opzionale)
 * - COMMIT_SHA: hash commit (default: 'manual')
 */
router.get('/version', (req, res) => {
  const requestId = req.context?.requestId || 'unknown';
  
  const version = process.env.APP_VERSION || 'dev';
  const buildTime = process.env.BUILD_TIME || new Date().toISOString();
  const commit = process.env.COMMIT_SHA || 'manual';
  
  res.json({
    version,
    buildTime,
    commit,
    timestamp: new Date().toISOString(),
    requestId
  });
});

export { router as versionRouter };
