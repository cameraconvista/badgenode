
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5000,
    strictPort: false,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
      host: undefined,
      protocol: 'wss',
      overlay: false,
      timeout: 5000
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true
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
