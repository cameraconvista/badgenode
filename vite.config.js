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
    },
    copyPublicDir: true
  },
  publicDir: 'public',
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: false,
    allowedHosts: true,
    hmr: {
      port: 5173
    },
    fs: {
      allow: ['..']
    }
  },
  // Serve assets folder anche in development
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg']
})