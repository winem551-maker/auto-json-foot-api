import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      // Empêche Rollup d'essayer de charger fsevents (module macOS)
      external: ['fsevents', 'node:fs', 'node:fs/promises']
    }
  },
  resolve: {
    alias: {
      // Évite que le bundle essaye d'inclure des modules Node côté navigateur
      fs: 'empty:',
      path: 'empty:'
    }
  }
})
