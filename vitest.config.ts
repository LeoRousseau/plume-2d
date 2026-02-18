import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@plume': resolve(__dirname, 'src/package'),
    },
  },
  test: {
    globals: true,
  },
})
