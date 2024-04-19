import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['packages/**/*.{test,spec}.{js,ts}'],
    coverage: {
      include: ['packages/**/src/**/*.{js,ts}'],
      exclude: ['**/index.{js,ts}'],
    },
  },
});
