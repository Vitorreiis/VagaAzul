import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,

    coverage: {
      provider: 'v8',

      reporter: [
        'text',
        'html',
        'json-summary',
        'lcov',
      ],

      reportsDirectory: './coverage',

      include: [
        'src/domain/services/**/*.ts',
        'src/data/trechosRepository.ts',
      ],

      exclude: [
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.d.ts',
      ],

      thresholds: {
        statements: 70,
        branches: 70,
        functions: 70,
        lines: 70,
        perFile: true,
      },
    },
  },
});
