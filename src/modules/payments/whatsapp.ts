import { env } from '@/env';
import { pagoRepository } from '@/repository/pagos';

/**
 * La compra por WhatsApp, para los codigos con precio.
 *
 * Antes estos codigos abrian el mismo formulario de Yape que el cobro normal:
 * monto, captura y revision a mano. Para un codigo, que ya es un trato
 * hablado, era pedirle a alguien que rellenara un formulario para algo que se
 * arregla en dos mensajes. Ahora el boton lleva al chat con el mensaje escrito.
 *
 * El registro en `pagos` se guarda **antes** de abrir el chat: si se guardara
 * despues, al saltar a WhatsApp la pestana se va y la insercion se queda a
 * medias, y nos llegaria un mensaje de alguien que no aparece en ninguna lista.
 */

/** Marcador de comprobante: en este camino la captura llega por el chat. */
const COMPROBANTE_PENDIENTE = 'whatsapp://pendiente-de-captura';

/*
 * `nombre` y `correo` son `not null` en `pagos` y el correo tiene que tener
 * formato valido (ver 0006). Este camino no los pide —la idea es justo no
 * pedir nada—, asi que van marcadores: la identidad real llega por el chat,
 * donde el numero de quien escribe ya dice quien es.
 *
 * Se dejan reconocibles a proposito para que en la lista de pendientes se vea
 * de un golpe cuales vienen por aqui y cuales por el formulario de Yape.
 */
const NOMBRE_PENDIENTE = 'Pendiente por WhatsApp';
const CORREO_PENDIENTE = 'pendiente@flores-amarillas.pe';

/** El texto que llega al chat. */
export function mensajeDeCompra(enlace: string, codigo: string): string {
  return `hola quiero comprar esta plantilla "${enlace}" con el código "${codigo}"`;
}

/**
 * El enlace del chat con el mensaje puesto, o `null` si no hay numero
 * configurado.
 *
 * `null` y no una excepcion: quien pulsa el boton no tiene culpa de que falte
 * una variable de entorno, y es mejor avisar que mandarlo a un chat vacio.
 */
export function enlaceDeWhatsapp(
  enlace: string,
  codigo: string
): string | null {
  const telefono = env.VITE_WHATSAPP_PHONE;
  if (!telefono) return null;
  // `wa.me` con el texto codificado: el mensaje lleva comillas, espacios y una
  // url dentro, y sin codificar se corta en el primer `&`.
  return `https://wa.me/${telefono}?text=${encodeURIComponent(
    mensajeDeCompra(enlace, codigo)
  )}`;
}

/**
 * Deja el pago como pendiente y devuelve el enlace del chat.
 *
 * Si el registro falla se lanza: sin el, nadie se enteraria de que hay una
 * compra esperando, y es peor mandar a alguien a pagar por un regalo que no
 * vamos a poder encontrar.
 */
export async function registrarCompraPorWhatsapp(datos: {
  pageId: string;
  /** El enlace del regalo, absoluto: es lo que se pega en el chat. */
  enlace: string;
  codigo: string;
}): Promise<string | null> {
  const guardado = await pagoRepository.registrar({
    pageId: datos.pageId,
    nombre: NOMBRE_PENDIENTE,
    correo: CORREO_PENDIENTE,
    comprobanteUrl: COMPROBANTE_PENDIENTE,
    enlace: datos.enlace,
  });

  if (guardado.isFailure()) {
    throw new Error(
      guardado.getError()?.message ?? 'No se pudo registrar tu compra'
    );
  }

  return enlaceDeWhatsapp(datos.enlace, datos.codigo);
}
