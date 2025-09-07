import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: ['.replit.dev', '.repl.co'], // supporta tutti i sottodomini Replit
    hmr: {
      clientPort: 443,
      protocol: 'wss'
      // host sarà automaticamente il pubblico hostname Replit
    },
  },
})