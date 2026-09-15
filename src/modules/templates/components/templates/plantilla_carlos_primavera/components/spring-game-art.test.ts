// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

/**
 * Los sprites viven en Supabase Storage, o sea en otro origen. frame() los
 * dibuja en un canvas y lee sus pixeles con getImageData para recortar a los
 * personajes; si la imagen no se pide en modo CORS el navegador marca el canvas
 * como "manchado" y esa lectura tira SecurityError, con lo que el juego entero
 * se queda en la pantalla de error. No se ve en los tests de UI porque jsdom no
 * implementa canvas, asi que se comprueba aca.
 */
it('pide los sprites en modo CORS antes de fijar el src', async () => {
  const pedidos: { crossOrigin: string | null; src: string }[] = [];

  class FakeImage {
    crossOrigin: string | null = null;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(value: string) {
      pedidos.push({ crossOrigin: this.crossOrigin, src: value });
      queueMicrotask(() => this.onload?.());
    }
  }

  vi.stubGlobal('Image', FakeImage);
  vi.resetModules();
  const { loadGardenArt } = await import('./spring-game-art');
  // El recorte falla porque jsdom no trae canvas 2d; aca solo importa como se
  // pidieron las imagenes.
  await loadGardenArt().catch(() => {});

  expect(pedidos).toHaveLength(3);
  for (const pedido of pedidos) {
    expect(pedido.crossOrigin).toBe('anonymous');
    expect(pedido.src).toContain('/storage/v1/object/public/');
  }
});
