import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname),
  resolve: {
    alias: {
      '@plume': resolve(__dirname, '../src/package/core'),
    },
  },
})
