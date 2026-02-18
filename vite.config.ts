import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@plume': resolve(__dirname, 'src/package'),
    },
  },
})
