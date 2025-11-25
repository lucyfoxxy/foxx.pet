import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const resolvePath = (relative: string) =>
  path.resolve(fileURLToPath(new URL('.', import.meta.url)), 'src', relative);

export default defineConfig({
  resolve: {
    alias: {
      '@Content': resolvePath('content'),
      '@Assets': resolvePath('assets'),
      '@Scripts': resolvePath('scripts'),
      '@Templates': resolvePath('components/Templates'),
      '@utils': resolvePath('components/utils'),
      '@Views': resolvePath('components/Views'),
      '@Frontend': resolvePath('components/frontend.ts'),
      'astro:content': resolvePath('test-utils/mocks/astroContent'),
    },
  },
  test: {
    include: ['src/**/*.{test,spec}.ts', 'src/**/__tests__/**/*.{ts,tsx}'],
    environment: 'jsdom',
  },
});
