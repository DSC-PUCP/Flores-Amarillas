/**
 * Un aviso de pago por Yape, tal como lo deja el cliente.
 *
 * No es un pago confirmado: es lo que alguien dice haber pagado, con su
 * captura. Quien atiende compara contra la notificacion de Yape y recien
 * entonces activa la pagina.
 */
export type Pago = {
  id: string;
  pageId: string;
  nombre: string;
  correo: string;
  comprobanteUrl: string;
  enlace: string;
  estado: EstadoPago;
  creadoEn: Date;
};

export type EstadoPago = 'pendiente' | 'activado' | 'rechazado';
