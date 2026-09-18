import { env } from '@/env';

/**
 * Los enlaces de pago de Culqi.
 *
 * El interruptor esta aqui y no repartido por la interfaz: cuando un plan no
 * tenga enlace configurado, se cobra por WhatsApp. El mapa de enlaces vive en
 * las variables de entorno, configuradas en el panel de Culqi.
 */
export const CULQI_EN_ESPERA = false;

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
    case 650:
      return env.VITE_CULQI_LINK_6_50 ?? null;
    case 900:
      return env.VITE_CULQI_LINK_9 ?? null;
    case 1100:
      return env.VITE_CULQI_LINK_11 ?? null;
    default:
      return null;
  }
}
