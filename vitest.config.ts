import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    /**
     * 5 s (el defecto) no alcanza. Los tests de plantilla montan arboles de
     * React grandes y la suite corre 21 archivos jsdom en paralelo: en una
     * maquina cargada, tests que solos tardan menos de 1 s pasaban del limite
     * y la suite salia roja sin que nada estuviera mal.
     */
    testTimeout: 20000,
    environment: 'jsdom',
    environmentOptions: {
      jsdom: { url: 'http://localhost:3000/' },
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
