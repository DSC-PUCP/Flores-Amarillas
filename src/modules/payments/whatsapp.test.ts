import { describe, expect, it, vi } from 'vitest';

const { telefono } = vi.hoisted(() => ({ telefono: { valor: '51951722132' } }));
vi.mock('@/env', () => ({
  env: {
    get VITE_WHATSAPP_PHONE() {
      return telefono.valor;
    },
  },
}));
// No se toca la base en estas pruebas: aqui solo se arma el enlace del chat.
vi.mock('@/repository/pagos', () => ({
  pagoRepository: { registrar: vi.fn() },
}));

const { enlaceDeWhatsapp, mensajeDeCompra } = await import('./whatsapp');

const ENLACE = 'https://flores-amarillas.pe/lovepage/abc-123';

describe('la compra por WhatsApp', () => {
  it('escribe el mensaje con el enlace y el codigo entre comillas', () => {
    expect(mensajeDeCompra(ENLACE, 'Guardian219')).toBe(
      `hola quiero comprar esta plantilla "${ENLACE}" con el código "Guardian219"`
    );
  });

  /**
   * El mensaje lleva una url dentro, con sus `:` y `/`, ademas de comillas y
   * espacios. Sin codificar, `wa.me` lo corta y llega medio mensaje.
   */
  it('codifica el mensaje en el enlace del chat', () => {
    const url = enlaceDeWhatsapp(ENLACE, 'Guardian219');
    expect(url).not.toBeNull();
    const { origin, pathname, searchParams } = new URL(url as string);
    expect(origin).toBe('https://wa.me');
    expect(pathname).toBe('/51951722132');
    // Al leerlo decodificado vuelve a salir el mensaje entero.
    expect(searchParams.get('text')).toBe(
      mensajeDeCompra(ENLACE, 'Guardian219')
    );
  });

  /**
   * Sin numero configurado se devuelve `null` y no se lanza: quien pulsa el
   * boton no tiene culpa de que falte una variable de entorno, y es mejor
   * avisarle con su enlace que mandarlo a un chat vacio.
   */
  it('sin numero configurado no arma enlace', () => {
    telefono.valor = '';
    expect(enlaceDeWhatsapp(ENLACE, 'Guardian219')).toBeNull();
    telefono.valor = '51951722132';
  });
});
