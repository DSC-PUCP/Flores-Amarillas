import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Unit tests do not need the Start server, prerenderer or development tools.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    dedupe: ['react', 'react-dom'],
  },
  esbuild: { jsx: 'automatic' },
});
