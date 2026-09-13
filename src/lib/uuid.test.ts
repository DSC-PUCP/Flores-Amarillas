import { afterEach, describe, expect, it, vi } from 'vitest';
import { uuid } from './uuid';

/**
 * Lo que hay que probar aqui no es el camino feliz —ese lo cubre el navegador—
 * sino los de respaldo: son los que se usan justo cuando `crypto.randomUUID`
 * falta, que es el caso que rompia el boton de Finalizar.
 */

const FORMATO_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('uuid', () => {
  it('usa crypto.randomUUID cuando existe', () => {
    const nativo = vi.fn(() => '11111111-2222-4333-8444-555555555555');
    vi.stubGlobal('crypto', { randomUUID: nativo });

    expect(uuid()).toBe('11111111-2222-4333-8444-555555555555');
    expect(nativo).toHaveBeenCalledTimes(1);
  });

  it('arma un UUID v4 valido sin randomUUID, solo con getRandomValues', () => {
    // Es lo que pasa al abrir el sitio por la IP de red o en Safari viejo.
    vi.stubGlobal('crypto', {
      getRandomValues: (a: Uint8Array) => {
        for (let i = 0; i < a.length; i++) a[i] = (i * 37 + 11) % 256;
        return a;
      },
    });

    const v = uuid();
    expect(v).toMatch(FORMATO_V4);
    // La version y la variante son lo que distingue a un v4 de una cadena
    // cualquiera con guiones.
    expect(v[14]).toBe('4');
    expect('89ab').toContain(v[19]);
  });

  it('no revienta aunque no haya crypto en absoluto', () => {
    vi.stubGlobal('crypto', undefined);
    expect(uuid()).toMatch(FORMATO_V4);
  });

  it('no repite identificadores', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (a: Uint8Array) => {
        for (let i = 0; i < a.length; i++)
          a[i] = Math.floor(Math.random() * 256);
        return a;
      },
    });

    const vistos = new Set(Array.from({ length: 500 }, () => uuid()));
    expect(vistos.size).toBe(500);
  });
});
