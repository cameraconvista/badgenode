import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint - SEMPRE disponibile, no DB required
  app.get('/api/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'BadgeNode'
    });
  });

  // Debug endpoint for env vars (DEV only)
  app.get('/api/debug/env', (_req, res) => {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(404).json({ error: 'Not found' });
    }
    
    res.json({
      NODE_ENV: process.env.NODE_ENV,
      hasViteSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
      hasViteSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
      viteUrl: process.env.VITE_SUPABASE_URL?.substring(0, 30) + '...',
      timestamp: new Date().toISOString()
    });
  });

  // Deep health check con ping DB (opzionale)
  app.get('/api/health/deep', async (_req, res) => {
    try {
      // TODO: Ping database when storage is implemented
      // await storage.healthCheck();
      res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'BadgeNode',
        database: 'not_implemented'
      });
    } catch (error) {
      res.status(503).json({ 
        status: 'error', 
        timestamp: new Date().toISOString(),
        service: 'BadgeNode',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // put other application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
