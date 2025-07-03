// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: ['685027da-ef1b-43e5-827a-45a9bb2c6563-00-1v68mogrrb878.worf.replit.dev'],
    watch: {
      usePolling: true
    },
    hmr: false // 🚫 disabilita WebSocket HMR
  },
  build: {
    target: 'es2015'
  }
});
