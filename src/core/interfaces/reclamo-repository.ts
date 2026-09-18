import type { Result } from '@/lib/utils';

/** Reclamo o queja, como los distingue el Codigo del Consumidor. */
export type TipoReclamo = 'reclamo' | 'queja';

export type RegistrarReclamoInput = {
  tipo: TipoReclamo;
  nombre: string;
  tipoDocumento: 'DNI' | 'CE' | 'pasaporte';
  documento: string;
  domicilio: string;
  correo: string;
  telefono: string;
  /** Solo si quien reclama es menor de edad. */
  apoderado?: string;
  tipoBien: 'producto' | 'servicio';
  descripcion: string;
  /** Lo reclamado en soles, si aplica. */
  monto?: number;
  detalle: string;
  pedido: string;
};

export type ReclamoRepository = {
  /**
   * Deja la hoja y devuelve su codigo correlativo.
   *
   * Devuelve el codigo y nada mas: la tabla esta cerrada al navegador porque
   * guarda nombre, documento y domicilio de gente real, asi que la insercion
   * pasa por una funcion `security definer` que solo contesta eso.
   */
  registrar: (input: RegistrarReclamoInput) => Promise<Result<string>>;
};
