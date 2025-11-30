import path from 'node:path'
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
  resolve: {
    alias: {
      '~xml': path.resolve(__dirname, 'src/xml'),
    },
  },
})
