import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    include: ['@supabase/supabase-js']
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        utenti: 'utenti.html',
        storico: 'storico.html',
        exdipendenti: 'ex-dipendenti.html',
        offline: 'offline.html'
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    cors: {
      origin: true,
      credentials: true
    },
    hmr: {
      port: 5173,
      host: '0.0.0.0'
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: true,
    cors: {
      origin: true,
      credentials: true
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none'
    }
  }
})