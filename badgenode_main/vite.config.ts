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
        // Disabilita completamente asset auto-generator del plugin per evitare override di icone/manifest custom
        pwaAssets: false,
        // Manifest PWA esplicito per evitare fallback default del plugin in produzione
        manifest: {
          name: 'BadgeNode',
          short_name: 'BadgeNode',
          description: 'Sistema di timbratura con PIN per la gestione delle presenze',
          id: '/?app=badgenode-v2',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          background_color: '#0b0b10',
          theme_color: '#510357',
          orientation: 'portrait',
          icons: [
            {
              src: '/icons/icon-192x192-v2.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/icon-256x256-v2.png',
              sizes: '256x256',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/icon-384x384-v2.png',
              sizes: '384x384',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/icon-512x512-v2.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/maskable-512x512-v2.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Escludi librerie pesanti di export dal precache
          // Verranno scaricate on-demand solo quando l'utente esporta
          // Riduce precache da ~2.7 MB a ~1.2 MB (-55%)
          globIgnores: [
            '**/exceljs*.js',
            '**/jspdf*.js',
            '**/html2canvas*.js',
            '**/node_modules/**',
          ],
          // Aumenta limite dimensione file per precache (default 2MB)
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        },
        includeAssets: [
          'favicon.ico',
          'robots.txt', 
          'icons/favicon-16x16-v2.png',
          'icons/favicon-32x32-v2.png',
          'icons/apple-touch-icon-152x152-v2.png',
          'icons/apple-touch-icon-167x167-v2.png',
          'icons/apple-touch-icon-180x180-v2.png',
          'icons/icon-192x192-v2.png',
          'icons/icon-256x256-v2.png',
          'icons/icon-384x384-v2.png',
          'icons/icon-512x512-v2.png',
          'icons/maskable-512x512-v2.png'
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
        { find: '@shared', replacement: path.resolve(__dirname, 'server/shared') },
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
              '@radix-ui/react-dialog',
              '@radix-ui/react-label',
              '@radix-ui/react-select',
              '@radix-ui/react-separator',
              '@radix-ui/react-slot',
              '@radix-ui/react-toast',
              '@radix-ui/react-toggle',
              '@radix-ui/react-tooltip',
            ],
            supabase: ['@supabase/supabase-js'],
            query: ['@tanstack/react-query'],
            idb: ['idb'],
          },
        },
      },
    },
    server: {
      fs: {
        strict: true,
        deny: ['**/.*'],
      },
      proxy: {
        '/api': {
          target: 'http://localhost:10000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    define: {
      // Explicitly define env vars for client
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
  };
});
