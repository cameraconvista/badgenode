
export default {
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        utenti: 'utenti.html',
        storico: 'storico.html',
        exdipendenti: 'ex-dipendenti.html',
        offline: 'offline.html'
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: {
      port: 5173,
      host: '0.0.0.0'
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Opener-Policy': 'unsafe-none'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    cors: true
  }
}
