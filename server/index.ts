// STEP B.2: Bootstrap env PRIMA di tutto per evitare problemi di timing
import './bootstrap/env';

import express, { type Request, Response, NextFunction } from 'express';
import { registerRoutes } from './routes';
import path from 'path';
// STEP D: Middleware osservabilità e read-only mode
import { requestIdMiddleware } from './middleware/requestId';
import { readOnlyGuard } from './middleware/readOnlyGuard';
import { healthRouter } from './routes/health';
import { versionRouter } from './routes/version';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// STEP D: Request ID middleware (primo per tracking)
app.use(requestIdMiddleware);

// STEP D: Read-Only Mode guard (prima delle route mutanti)
app.use(readOnlyGuard);

// Middleware diagnosi 502: log tutte le richieste
app.use((req, res, next) => {
  console.log('[REQ]', req.method, req.url);
  next();
});

// Error handler per diagnosi 502
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]', req.method, req.url, err);
  res.status(500).json({ success: false, error: err?.message ?? 'Server error' });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
      }

      console.log(logLine);
    }
  });

  next();
});

  // STEP D: Nuove route osservabilità
  app.use('/api', healthRouter);
  app.use('/api', versionRouter);

  // Ready endpoint - minimal health check without DB
  app.get('/api/ready', (_req, res) => {
    res.json({ ok: true, status: 'ready' });
  });

(async () => {
  const server = await registerRoutes(app);
  
  // Log that API routes are mounted
  console.log('[ROUTES] /api mounted');

  app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
    // Type narrowing for error object
    const errorObj = err as { status?: number; statusCode?: number; message?: string; code?: string };
    const status = errorObj.status || errorObj.statusCode || 500;
    const message = errorObj.message || 'Internal Server Error';
    const code = errorObj.code || 'INTERNAL_ERROR';
    const requestId = req.context?.requestId || 'unknown';

    res.status(status).json({ 
      success: false,
      code,
      error: message,
      requestId
    });
    throw err;
  });

  // In sviluppo attiva Vite come middleware via import dinamico.
  // In produzione serve gli asset statici da dist/public senza importare Vite.
  if (app.get('env') === 'development') {
    const { setupVite } = await import('./vite.ts');
    await setupVite(app, server);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist', 'public');
    app.use(express.static(distPath, { maxAge: '1h' }));
    app.use('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '3001', 10);
  server.listen(port, '0.0.0.0', () => {
    console.log(`serving on port ${port}`);
  });
})();
