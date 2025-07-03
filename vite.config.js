
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5000,
    host: '0.0.0.0',
    strictPort: true,
    cors: true,
    open: false
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
