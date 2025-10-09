import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath, URL } from 'node:url';
import Icons from 'unplugin-icons/vite';
import { VitePWA } from 'vite-plugin-pwa';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
  plugins: [
    react(),
    Icons({
      compiler: 'jsx',
      jsx: 'react',
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'BadgeNode',
        short_name: 'BadgeNode',
        description: 'Sistema di timbratura con PIN per la gestione delle presenze',
        theme_color: '#510357',
        background_color: '#0b0b10',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
      { find: '@shared', replacement: '/shared' },
    ],
  },
  root: path.resolve(__dirname, 'client'),
  build: {
    outDir: path.resolve(__dirname, 'dist', 'public'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          recharts: ['recharts'],
          radix: [
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          supabase: ['@supabase/supabase-js'],
          query: ['@tanstack/react-query']
        }
      }
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ['**/.*'],
    },
  },
  define: {
    // Explicitly define env vars for client
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
  },
  }
});
