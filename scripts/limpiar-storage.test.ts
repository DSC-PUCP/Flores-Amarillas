import { describe, expect, it } from 'vitest';
import { type Archivo, decidir, type Pagina } from './limpiar-storage';

/**
 * Las reglas de quien se borra y quien no.
 *
 * Es lo unico del script que puede hacer dano de verdad: un fallo aqui no da
 * un error, borra las fotos de un regalo que alguien pago. Por eso se prueba
 * regla por regla, incluidos los casos en que la respuesta correcta es "no
 * tocar".
 */

const AHORA = new Date('2026-09-16T12:00:00Z');
/** Gracia de 24 h: se perdona todo lo posterior a este instante. */
const LIMITE = new Date('2026-09-15T12:00:00Z');

const archivo = (creado: string | null): Archivo[] => [
  { nombre: 'foto.webp', creado, bytes: 1024 },
];

const pagina = (extra: Partial<Pagina> = {}): Pagina => ({
  id: 'p1',
  is_paid: false,
  expires_at: '2026-09-10T12:00:00Z',
  ...extra,
});

const sinPagos = new Set<string>();

describe('a quien se le borran las fotos', () => {
  it('borra una pagina expirada hace mas de la gracia', () => {
    const v = decidir('p1', archivo('2026-09-10T12:00:00Z'), pagina(), sinPagos, LIMITE);
    expect(v).toEqual({ borrar: true, motivo: 'expirada' });
  });

  it('no toca una pagina pagada, aunque su fecha ya pasara', () => {
    const v = decidir(
      'p1',
      archivo('2026-09-01T12:00:00Z'),
      pagina({ is_paid: true }),
      sinPagos,
      LIMITE
    );
    expect(v.borrar).toBe(false);
  });

  it('no toca una gratuita, que no expira nunca', () => {
    const v = decidir(
      'p1',
      archivo('2026-01-01T12:00:00Z'),
      pagina({ expires_at: null }),
      sinPagos,
      LIMITE
    );
    expect(v.borrar).toBe(false);
  });

  it('no toca una vista previa todavia viva', () => {
    const v = decidir(
      'p1',
      archivo('2026-09-16T11:50:00Z'),
      pagina({ expires_at: '2026-09-16T12:30:00Z' }),
      sinPagos,
      LIMITE
    );
    expect(v.borrar).toBe(false);
  });

  it('respeta la gracia: expirada hace un rato se queda', () => {
    const v = decidir(
      'p1',
      archivo('2026-09-16T10:00:00Z'),
      // Expiro hace dos horas, dentro de las 24 de gracia.
      pagina({ expires_at: '2026-09-16T10:00:00Z' }),
      sinPagos,
      LIMITE
    );
    expect(v.borrar).toBe(false);
  });

  /**
   * El caso que mas importa: alguien pago por Yape, su vista previa expiro
   * mientras esperaba, y el pago aun no se ha confirmado a mano. Si el script
   * le borra las fotos, al activarlo recibe un regalo roto.
   */
  it('no toca una pagina expirada que tiene un aviso de pago esperando', () => {
    const v = decidir(
      'p1',
      archivo('2026-09-10T12:00:00Z'),
      pagina(),
      new Set(['p1']),
      LIMITE
    );
    expect(v).toEqual({ borrar: false, motivo: 'tiene aviso de pago' });
  });

  describe('carpetas sin fila en la base', () => {
    it('borra la huerfana vieja: formulario abandonado', () => {
      const v = decidir('p9', archivo('2026-09-01T12:00:00Z'), undefined, sinPagos, LIMITE);
      expect(v).toEqual({ borrar: true, motivo: 'huerfana' });
    });

    /**
     * Las fotos se suben ANTES de crear la fila, asi que una subida en curso
     * es indistinguible de una huerfana. La gracia es lo que evita borrarle
     * las fotos a quien esta llenando el formulario ahora mismo.
     */
    it('no toca la huerfana reciente: puede estar subiendose', () => {
      const v = decidir('p9', archivo('2026-09-16T11:59:00Z'), undefined, sinPagos, LIMITE);
      expect(v.borrar).toBe(false);
    });

    it('no toca una huerfana sin fecha, porque no puede saber su edad', () => {
      const v = decidir('p9', archivo(null), undefined, sinPagos, LIMITE);
      expect(v.borrar).toBe(false);
    });

    it('mira el archivo mas nuevo y no el mas viejo', () => {
      // Una carpeta con una foto vieja y otra de hace un minuto es una subida
      // en marcha, no un descarte.
      const mezcla: Archivo[] = [
        { nombre: 'vieja.webp', creado: '2026-09-01T12:00:00Z', bytes: 10 },
        { nombre: 'nueva.webp', creado: '2026-09-16T11:59:00Z', bytes: 10 },
      ];
      expect(decidir('p9', mezcla, undefined, sinPagos, LIMITE).borrar).toBe(false);
    });

    it('no intenta borrar una carpeta vacia', () => {
      expect(decidir('p9', [], undefined, sinPagos, LIMITE).borrar).toBe(false);
    });
  });

  it('AHORA es posterior al limite, como asume el script', () => {
    // Guarda de cordura: si alguien cambia las constantes de arriba y el
    // limite queda en el futuro, las pruebas dejarian de decir nada.
    expect(AHORA.getTime()).toBeGreaterThan(LIMITE.getTime());
  });
});
