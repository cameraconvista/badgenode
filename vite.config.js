import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    hmr: {
      port: 5000,
      host: '0.0.0.0'
    }
  },
  server: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true,
    cors: true,
    open: false,
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