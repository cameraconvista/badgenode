import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'tests/validation/**/*.test.ts',
      'client/src/services/__tests__/utenti.service.test.ts',
      'server/routes/modules/__tests__/utenti.test.ts',
    ],
    exclude: [
      'e2e/**',
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'legacy/**',
      'scripts/_archive/**',
      '**/*.backup',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'client/src/services/utenti.service.ts',
        'server/routes/modules/utenti.ts',
        'client/src/utils/validation/pin.ts',
        'server/utils/validation/pin.ts',
      ],
      exclude: [
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.d.ts',
        '**/node_modules/**',
        '**/dist/**',
        '**/docs/**',
        '**/DNA/**',
        '**/coverage/**',
      ],
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src')
    }
  }
});
