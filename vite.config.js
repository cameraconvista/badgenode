import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
    cors: true,
    allowedHosts: true, // consente la preview replit.dev
    hmr: {
      protocol: 'wss',
      clientPort: 443,
      host: process.env.REPL_SLUG && process.env.REPL_OWNER
        ? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
        : undefined
    }
  },
  preview: {
    host: true,
    port: Number(process.env.PORT) || 5000,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})
