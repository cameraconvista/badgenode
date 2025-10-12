import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
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
        includeAssets: [
          'favicon.ico', 
          'robots.txt', 
          'icons/apple-touch-icon-180x180.png',
          'icons/icon-192x192.png',
          'icons/icon-256x256.png',
          'icons/icon-384x384.png',
          'icons/icon-512x512.png',
          'icons/maskable-512x512.png'
        ],
        // Usa il manifest.webmanifest esterno invece di configurazione inline
        useCredentials: false,
        devOptions: { enabled: false },
      }),
    ],
    resolve: {
      alias: [
        // alias assoluti su filesystem
        { find: '@', replacement: path.resolve(__dirname, 'client/src') },
        { find: '@shared', replacement: path.resolve(__dirname, 'shared') },
      ],
    },
    root: path.resolve(__dirname, 'client'),
    base: '/',
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
              '@radix-ui/react-tooltip',
            ],
            supabase: ['@supabase/supabase-js'],
            query: ['@tanstack/react-query'],
          },
        },
      },
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
  };
});
