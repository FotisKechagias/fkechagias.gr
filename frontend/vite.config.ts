import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Χτίζει κατευθείαν μέσα στο static/ του Django (git-tracked — ο server
// δεν έχει Node, οπότε το build τρέχει τοπικά και committάρεται το αποτέλεσμα).
// Το manifest.json διαβάζεται από το Django templatetag `vite_asset` ώστε
// να μη χρειάζεται να ενημερώνουμε hashed filenames με το χέρι.
export default defineConfig({
  plugins: [react()],
  base: '/static/landing/',
  build: {
    outDir: '../static/landing',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: 'src/main.tsx',
    },
  },
});
