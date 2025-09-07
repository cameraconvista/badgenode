import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
    allowedHosts: ['.replit.dev', '.repl.co'], // supporta tutti i sottodomini Replit
    hmr: {
      protocol: 'wss',
      clientPort: 443,
      host: process.env.REPL_SLUG ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'localhost',
      path: '/_vite_hmr'
    },
  },
})