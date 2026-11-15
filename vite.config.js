import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  // index.html lives in src/, so serve and build from there.
  root: fileURLToPath(new URL('./src', import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    open: true,
  },
  test: {
    root: projectRoot,
    include: ['__test__/**/*.test.js'],
    environment: 'node',
  },
});
