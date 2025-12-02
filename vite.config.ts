import { defineConfig } from 'vite';
import fs from 'fs';

// Lit les dépendances de ton package.json
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
const externalModules = Object.keys(pkg.dependencies || {}).concat([
  'events', 'fs', 'path' // Ajoute les modules Node.js de base
]);

export default defineConfig({
  build: {
    lib: {
      entry: 'server/index.ts',
      fileName: 'server.js',
      formats: ['es'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    // ESSENTIEL : Exclure toutes les dépendances
    rollupOptions: {
      external: externalModules,
    },
  },
});
