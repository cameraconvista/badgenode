
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: false,
    // consente qualsiasi host (utile su Replit)
    allowedHosts: true,
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true,
    // consente qualsiasi host (utile su Replit)
    allowedHosts: true,
  },
});
