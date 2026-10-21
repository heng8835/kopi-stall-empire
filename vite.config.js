import { defineConfig } from 'vite';

// base './' so the dist/ build works from an itch.io zip (relative asset paths).
export default defineConfig({
  base: './',
  server: { host: true, port: 5173 },
  build: { outDir: 'dist', assetsInlineLimit: 0, chunkSizeWarningLimit: 2000 }, // Phaser alone is ~1.2 MB
});
