
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    hmr: {
      host: 'localhost',
      protocol: 'ws',
      port: 5173,
    },
    allowedHosts: 'all' // Questo permette l'accesso dal dominio .replit.dev
  }
});
