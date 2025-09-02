
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: [
      '.replit.dev',
      '.spock.replit.dev',
      'd8a3ae29-6f80-4072-a5bf-3aa3c980cd7e-00-2vlgtxxt0dccv.spock.replit.dev'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true
  }
})
