import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    cors: true,
    open: false,
    allowedHosts: [
      '685027da-ef1b-43e5-827a-45a9bb2c6563-00-1v68mogrrb878.worf.replit.dev'
    ],
    hmr: {
      port: 5000,
      host: '0.0.0.0'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
