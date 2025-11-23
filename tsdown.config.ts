import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
    // 'src/cli.ts',
  ],
  shims: true,
  dts: true,
  format: ['esm'],
})
