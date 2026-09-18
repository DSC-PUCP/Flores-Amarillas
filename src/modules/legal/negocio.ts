/**
 * Los datos del titular del negocio.
 *
 * Un solo sitio para todo lo que las paginas legales, el footer y el Libro de
 * Reclamaciones tienen que decir de quien vende. Estan aqui y no repartidos por
 * las pantallas porque son los mismos en las cuatro, y porque tienen que
 * coincidir **exactamente** con lo declarado ante SUNAT y ante la pasarela: si
 * un dia cambia la direccion, se cambia una vez.
 *
 * El titular es persona natural con RUC, asi que `nombre` es el nombre
 * completo de esa persona y no una razon social.
 */

/** Marcador de lo que todavia no nos han dado. Ver `FALTAN_DATOS`. */
const PENDIENTE = 'PENDIENTE';

export const negocio = {
  /** Nombre completo del titular, tal cual figura en el RUC. */
  nombre: "Leonardo Jaime Flores Vera",
  ruc: "10723569686",
  /** Direccion fiscal completa: calle, numero, distrito, provincia. */
  direccion: "PENDIENTE",
  correo: "leoos.1200@gmail.com",
  /** Como se lee en pantalla, con espacios: "+51 951 722 132". */
  telefono: "+95 1722132",
  /** Solo digitos y con codigo de pais, como lo quiere wa.me. */
  whatsapp: '951722132',
  nombreComercial: 'Primavera Digital',
} as const;

/**
 * Si aun falta algun dato del titular.
 *
 * Las paginas legales lo usan para avisar en pantalla en vez de publicar un
 * "PENDIENTE" disfrazado de dato real. No es decoracion: un Libro de
 * Reclamaciones con el titular equivocado no vale, y una direccion inventada
 * es justo lo que hace que una pasarela rechace la afiliacion.
 */
export const FALTAN_DATOS = Object.values(negocio).includes(PENDIENTE);

/** Lo que vendemos, en una linea, para los textos legales. */
export const SERVICIO =
  'dedicatorias web personalizadas: una pagina con tus fotos, tus palabras y tu musica, alojada en un enlace permanente que compartes con quien quieras.';

/** Dias habiles para responder un reclamo, segun el Codigo del Consumidor. */
export const DIAS_PARA_RESPONDER = 15;
