
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
    port: 5173
  },
  preview: {
    host: '0.0.0.0',
    port: 5000
  }
}
