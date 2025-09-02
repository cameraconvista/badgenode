
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      '.replit.dev',
      '.spock.replit.dev',
      'localhost',
      '127.0.0.1'
    ],
    watch: {
      usePolling: true,
      interval: 1000
    },
    hmr: {
      port: 5173,
      host: '0.0.0.0',
      clientPort: 5173
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  }
})
