import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@plume': resolve(__dirname, 'src/package/core'),
    },
  },
  build: {
    lib: {
      entry: {
        'core/plume-2d-core': resolve(__dirname, 'src/package/core/index.ts'),
      },
      formats: ['es'],
    },
  },
})
