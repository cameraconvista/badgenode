import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        utenti: resolve(__dirname, 'utenti.html'),
        storico: resolve(__dirname, 'storico.html'),
        exdipendenti: resolve(__dirname, 'ex-dipendenti.html')
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: ['.replit.dev', '.repl.co'], // supporta tutti i sottodomini Replit
    hmr: {
      protocol: 'wss',
      clientPort: 443,
      path: '/_vite_hmr'
    },
  },
})