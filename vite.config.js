
import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      /\.replit\.dev$/,
      /\.repl\.co$/,
      /\.replit\.app$/,
      'all'
    ],
    hmr: {
      clientPort: 443,
      host: undefined
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
