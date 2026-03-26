import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@plume': resolve(__dirname, 'src/package'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/package/index.ts'),
      formats: ['es'],
      fileName: 'plume-2d',
    },
  },
})
