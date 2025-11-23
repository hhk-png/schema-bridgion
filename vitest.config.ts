import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    pool: 'forks',
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      exclude: ['ui', ...coverageConfigDefaults.exclude],
    },
    include: ['./**/test/*.test.ts'],
  },
})
