import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['packages/**/*.{test,spec}.{js,ts}'],
    coverage: {
      include: ['packages/**/*.{js,ts}'],
      exclude: [...configDefaults.coverage.exclude, '**/index.{js,ts}'],
    },
  },
});
