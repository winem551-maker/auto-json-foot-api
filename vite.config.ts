import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Cette configuration est essentielle. Elle dit à Vite de construire une librairie,
    // ce qui est parfait pour une API headless (sans interface HTML).
    lib: {
      entry: 'server/index.ts', // Pointez vers ton fichier de démarrage dans le dossier server/
      fileName: 'server.js', // Le nom du fichier de sortie compilé
      formats: ['es'],
    },
    // Le code compilé ira dans le dossier 'dist'
    outDir: 'dist',
    emptyOutDir: true,
  },
});
