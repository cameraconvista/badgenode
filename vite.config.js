
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: false,
    hmr: {
      port: 5001,
      host: '0.0.0.0'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  },
  esbuild: {
    target: 'es2020'
  }
})
