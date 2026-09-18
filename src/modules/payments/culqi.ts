import { env } from '@/env';

/**
 * Los enlaces de pago de Culqi, en espera.
 *
 * La afiliacion con Culqi todavia se esta tramitando, asi que por ahora TODAS
 * las compras salen por WhatsApp. El interruptor esta aqui y no repartido por
 * la interfaz: cuando la cuenta este lista, se pone en `false` y los planes
 * que tengan enlace vuelven a cobrarse en linea sin tocar nada mas.
 *
 * Se deja el mapa de enlaces escrito, y no borrado, justo por eso: lo que
 * falta es la cuenta, no el codigo.
 */
export const CULQI_EN_ESPERA = true;

/**
 * El enlace de pago que corresponde a un precio, si lo hay.
 *
 * Los enlaces se crean a mano en el panel de Culqi, uno por monto, asi que un
 * plan recien cambiado de precio se queda sin el suyo hasta que alguien lo
 * cree. Devolver `null` no es un error: significa "este monto se cobra por
 * WhatsApp", que es el camino de siempre.
 */
export function enlaceDeCulqi(precio: number): string | null {
  if (CULQI_EN_ESPERA) return null;

  switch (Math.round(precio * 100)) {
    case 900:
      return env.VITE_CULQI_LINK_9 ?? null;
    case 1100:
      return env.VITE_CULQI_LINK_11 ?? null;
    default:
      return null;
  }
}
