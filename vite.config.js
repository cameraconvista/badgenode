import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    allowedHosts: ['.replit.dev'], // supporta tutti i sottodomini
    hmr: {
      host: '0.0.0.0',
      protocol: 'wss',
    },
  },
})