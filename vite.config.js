
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: 'all',
    watch: {
      usePolling: true,
      interval: 1000
    },
    hmr: {
      port: 5173,
      host: '0.0.0.0'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true
  }
})
