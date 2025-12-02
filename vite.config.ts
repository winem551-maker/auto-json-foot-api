import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    // Cette configuration est essentielle. Elle dit à Vite de construire une librairie,
    // ce qui est parfait pour une API headless (sans interface HTML).
    lib: {
      entry: 'server/index.ts', // Pointez vers ton fichier de démarrage corrigé.
      fileName: 'server.js', // Le nom du fichier de sortie compilé.
      formats: ['es'],
    },
    // Le code compilé ira dans le dossier 'dist'
    outDir: 'dist',
    emptyOutDir: true,
    // Cette ligne résout l'erreur "isevents" et les autres modules internes.
    rollupOptions: {
      external: ['events', 'fs', 'path'],
    },
  },
});
