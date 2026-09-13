/**
 * Identificador unico que funciona en cualquier contexto.
 *
 * `crypto.randomUUID()` solo existe en contextos seguros: https, localhost o
 * 127.0.0.1. Abrir el sitio por la IP de red —lo que hace `vite dev --host`
 * para probar en el celular— deja la funcion sin definir, y tambien falta en
 * Safari anterior a 15.4.
 *
 * Eso hacia reventar el boton de Finalizar del formulario con
 * «crypto.randomUUID is not a function» y dejaba la dedicatoria sin crear:
 * el identificador se usa para la ruta de las imagenes en el almacenamiento.
 *
 * `crypto.getRandomValues` si esta disponible fuera de contexto seguro y en
 * navegadores mucho mas antiguos, asi que sirve para armar el UUID a mano.
 */
export function uuid(): string {
  const c = globalThis.crypto;

  if (typeof c?.randomUUID === 'function') {
    return c.randomUUID();
  }

  if (typeof c?.getRandomValues === 'function') {
    const bytes = c.getRandomValues(new Uint8Array(16));
    // Version 4 y variante RFC 4122, que es lo que distingue a un UUID v4.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
    return (
      `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-` +
      `${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-` +
      `${hex.slice(10, 16).join('')}`
    );
  }

  // Ultimo recurso. `Math.random` no sirve para nada que dependa de que no se
  // pueda adivinar, pero aqui el identificador solo separa carpetas de
  // imagenes, y es preferible a que la compra falle.
  const aleatorio = () =>
    Math.floor(Math.random() * 0x10000)
      .toString(16)
      .padStart(4, '0');
  return (
    `${aleatorio()}${aleatorio()}-${aleatorio()}-4${aleatorio().slice(1)}-` +
    `${((Math.floor(Math.random() * 4) + 8) * 0x1000).toString(16).slice(0, 1)}${aleatorio().slice(1)}-` +
    `${aleatorio()}${aleatorio()}${aleatorio()}`
  );
}
