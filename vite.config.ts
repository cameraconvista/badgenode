import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [
    react(),
    Icons({
      compiler: 'jsx',
      jsx: 'react',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'client', 'src'),
      '@shared': path.resolve(import.meta.dirname, 'shared'),
      '@assets': path.resolve(
        import.meta.dirname,
        'ARCHIVE',
        'REPLIT_OLD_20251008_0114',
        'attached_assets'
      ),
    },
  },
  root: path.resolve(import.meta.dirname, 'client'),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ['**/.*'],
    },
  },
});
