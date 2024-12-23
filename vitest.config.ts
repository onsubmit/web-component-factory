import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [],
  test: {
    include: ['src/**/*.test.ts'],
    globals: true,
    environment: 'jsdom',
    mockReset: true,
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*.ts'],
    },
  },
});
