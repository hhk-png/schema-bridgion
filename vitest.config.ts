import { coverageConfigDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    pool: 'forks',
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      exclude: [
        '*.config.ts',
        '**/types.ts',
        ...coverageConfigDefaults.exclude,
      ],
    },
    include: ['test/**/*.test.ts'],
  },
})
