import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'all',
      'd8a3ae29-6f80-4072-a5bf-3aa3c980cd7e-00-2vlgtxxt0dccv.spock.replit.dev'
    ],
    hmr: {
      port: 5173,
      clientPort: 5173,
      host: '0.0.0.0',
      overlay: false,
      timeout: 60000
    },
    watch: {
      usePolling: false,
      ignored: [
        '**/.backups/**',
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/*.tmp*',
        '**/backup-*/**'
      ]
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    exclude: []
  }
})