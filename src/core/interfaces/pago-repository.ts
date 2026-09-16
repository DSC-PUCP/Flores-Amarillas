import type { Result } from '@/lib/utils';

export type RegistrarPagoInput = {
  pageId: string;
  nombre: string;
  correo: string;
  comprobanteUrl: string;
  enlace: string;
};

export type PagoRepository = {
  /**
   * Guarda el aviso y no devuelve nada.
   *
   * El navegador no puede leer `pagos` —la tabla tiene nombre, correo y
   * comprobante de gente real—, asi que ni siquiera recupera el id de lo que
   * acaba de escribir. Se consulta con la clave de servicio, desde el panel.
   */
  registrar: (input: RegistrarPagoInput) => Promise<Result<void>>;
};
