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
      entry: resolve(__dirname, 'src/package/core/index.ts'),
      formats: ['es'],
      fileName: 'plume-2d',
    },
  },
})
