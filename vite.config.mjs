import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['packages/**/*.{test,spec}.{js,ts}'],
  },
});
