import type { Result } from '@/lib/utils';

export type CanjearPromoInput = {
  codigo: string;
  pageId: string;
};

export type EstadoPromo = 'valido' | 'agotado' | 'inexistente';

export type RevisionPromo = {
  estado: EstadoPromo;
  /**
   * Lo que cuesta un regalo con este codigo, sin importar el plan de la
   * plantilla: 0 es un regalo y cualquier otro numero es el precio fijo de la
   * promocion. `null` cuando el codigo no existe.
   */
  precio: number | null;
};

export type PromoRepository = {
  /**
   * Revisa el codigo sin gastarlo: si sirve, si se agoto y a que precio va.
   *
   * El navegador no puede leer la tabla `promos` —si pudiera, los codigos
   * estarian a la vista de cualquiera en el inspector—, asi que esto pregunta
   * por una funcion de la base que solo responde esas tres cosas.
   */
  revisar: (codigo: string) => Promise<Result<RevisionPromo>>;
  /**
   * Gasta un cupo y devuelve lo que le toca pagar a esa pagina.
   *
   * Con un codigo de regalo devuelve 0 y la pagina queda activa: es la unica
   * forma de poner `is_paid = true` desde el navegador, y aun asi no lo hace
   * el navegador, lo hace una funcion `security definer` que comprueba el
   * codigo primero. Con un codigo de descuento devuelve su precio y la pagina
   * se queda como vista previa, pendiente del pago por Yape.
   *
   * Falla si el codigo no existe, si ya se agoto o si esa pagina ya habia
   * usado un codigo.
   */
  canjear: (input: CanjearPromoInput) => Promise<Result<number>>;
};
