
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true,
    cors: true,
    open: false,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '685027da-ef1b-43e5-827a-45a9bb2c6563-00-1v68mogrrb878.worf.replit.dev'
    ],
    hmr: false,
    ws: false
  },
  build: {
    rollupOptions: {
      external: ['/@vite/client']
    }
  },
  define: {
    'import.meta.hot': 'undefined'
  }
});
