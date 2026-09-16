import type { TemplateData } from '@/core/models/template';

export interface CameraMemory {
  id: number;
  image: string;
  detail: string;
}

/**
 * Texto que acompana a cada foto en su tarjeta ampliada.
 *
 * Es fijo a proposito. Antes el formulario pedia una frase por foto —cuatro
 * casillas mas— y el cliente decidio quitarlas. La tarjeta sigue existiendo,
 * asi que necesita algo que decir; esto es lo que dice.
 */
const DETALLE_FIJO = 'Un momento nuestro que no quiero que se nos olvide.';

/**
 * Las cuatro fotos de la pantalla de recuerdos.
 *
 * Acepta tres formas de guardarlas, de la mas nueva a la mas vieja, para que
 * las paginas ya publicadas se sigan viendo igual:
 *   1. `memoryPhotos`: una sola lista (lo que pide hoy el formulario).
 *   2. `memoryPhoto1..4`: un campo por foto (el formulario anterior).
 *   3. `timelinePhotos`: la lista que usaba la plantilla de la que salio esta.
 */
export function getCameraMemories(data: TemplateData): CameraMemory[] {
  const lista = Array.isArray(data.memoryPhotos) ? data.memoryPhotos : [];
  const previousPhotos = Array.isArray(data.timelinePhotos)
    ? data.timelinePhotos
    : [];
  return Array.from({ length: 4 }, (_, index) => {
    const image =
      lista[index] ?? data[`memoryPhoto${index + 1}`] ?? previousPhotos[index];
    return {
      id: index + 1,
      image: typeof image === 'string' ? image : '',
      detail: DETALLE_FIJO,
    };
  });
}
