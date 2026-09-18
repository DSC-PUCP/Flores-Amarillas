/**
 * Las paginas de ejemplo del catalogo, y el orden en que se muestran los
 * disenos.
 *
 * Un ejemplo es una pagina real y ya activada: la misma direccion que recibe
 * quien abre un regalo, sin marca de agua ni barra de cobro. Se ensena asi a
 * proposito. Antes solo se podia "ver ejemplo" de dos disenos y lo que salia
 * era una demo con datos de relleno; el cliente miraba el catalogo sin saber
 * que iba a recibir su persona querida, que es justo lo unico que le importa.
 *
 * Que sea una pagina de verdad y no un modo especial tiene una ventaja: lo que
 * se ve es exactamente lo que se entrega, sin un segundo camino de renderizado
 * que se pueda quedar desfasado.
 */

/** Ids de las paginas de ejemplo, por `template_key`. */
export const EJEMPLOS: Record<string, string> = {
  plantilla_carlos_primavera: '3e35c6f3-a828-41a0-8ca3-58d9ce99daf9',
  plantilla_jardin_premium: '843d446e-7127-4ee1-89c2-f23b29af0f91',
  plantilla_jardin_clasico: '32223737-8f8d-43a7-ad14-e2876c5443df',
  plantilla_giano_feat_leo: '443ac48d-c423-4e2f-80d5-4374042d81f6',
  plantilla_luis_arce: '6b16e63c-ffa7-4dbf-800a-fba0024a0261',
  plantilla_gratuita: '7ee4610b-3ba9-442d-b251-294d02fca6d5',
};

/** El id de ejemplo de un diseno, si lo tiene. */
export const ejemploDe = (templateKey: string): string | undefined =>
  EJEMPLOS[templateKey];

/** Si esta pagina es uno de los ejemplos del catalogo. */
export const esEjemplo = (pageId: string): boolean =>
  Object.values(EJEMPLOS).includes(pageId);

/** Cuanto dura un ejemplo que se corta por tiempo. */
export const SEGUNDOS_DE_EJEMPLO = 60;

/**
 * Como se sabe que el ejemplo termino.
 *
 * `recorrido`: la plantilla tiene una ultima pantalla y avisa al llegar
 * (llama a `onComplete`). Es lo natural cuando hay un principio y un fin.
 *
 * `temporizador`: no hay tal pantalla porque no se recorre, se pasea —el
 * jardin en 3D—, o porque todo esta en una sola pantalla —la gratuita—. Ahi el
 * ejemplo se corta al minuto, con la cuenta atras a la vista.
 *
 * El defecto es `temporizador` a proposito: un diseno nuevo que no avise nunca
 * acabaria encerrando al cliente, y es mejor que se corte solo aunque nadie
 * haya cableado nada.
 */
export const MODO_FIN: Record<string, 'recorrido' | 'temporizador'> = {
  plantilla_luis_arce: 'recorrido',
  plantilla_carlos_primavera: 'recorrido',
  plantilla_giano_feat_leo: 'recorrido',
  plantilla_jardin_premium: 'temporizador',
  plantilla_jardin_clasico: 'temporizador',
  plantilla_gratuita: 'temporizador',
};

export const modoFinDe = (templateKey: string): 'recorrido' | 'temporizador' =>
  MODO_FIN[templateKey] ?? 'temporizador';

/**
 * Los disenos que abren el catalogo.
 *
 * El orden del catalogo lo daba la base de datos, que es el orden en que se
 * fueron creando. Estos dos son los que enganchan cuando alguien los ve por
 * primera vez —se juega y se recorre un jardin en 3D— y son los que hacen que
 * el regalo se sienta un regalo, asi que van delante. El resto conserva el
 * orden que traiga la base.
 *
 * Es una lista en el codigo y no una columna `orden` en la tabla para poder
 * reordenar en un commit, sin migracion ni tocar Supabase a mano.
 */
export const ORDEN_DESTACADO = [
  'plantilla_carlos_primavera',
  'plantilla_jardin_premium',
] as const;

/**
 * Comparador para `sort`: primero los destacados en su orden, luego el resto
 * sin moverse entre si.
 */
export const porDestacados = (
  a: { templateKey: string },
  b: { templateKey: string }
): number => {
  const posicion = (key: string) => {
    const indice = ORDEN_DESTACADO.indexOf(
      key as (typeof ORDEN_DESTACADO)[number]
    );
    return indice === -1 ? ORDEN_DESTACADO.length : indice;
  };
  return posicion(a.templateKey) - posicion(b.templateKey);
};
