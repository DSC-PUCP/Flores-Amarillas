import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Cuántas copias del contenido hacen falta para que una marquesina no corte.
 *
 * El truco de la marquesina es desplazar la pista justo el ancho de una copia
 * y que la siguiente ocupe su lugar. Para que no se vea hueco, lo que queda
 * despues de ese desplazamiento tiene que seguir cubriendo el contenedor: es
 * decir, el total tiene que llegar al doble del ancho visible.
 *
 * Con dos copias fijas fallaba en pantallas anchas. El contenido medía 921 px
 * y el contenedor 1440, así que al desplazar una copia quedaban 519 px vacíos
 * y la cinta parecía terminarse en vez de dar la vuelta.
 *
 * Se mide en lugar de suponer porque el ancho depende de la fuente ya cargada,
 * del idioma y del tamaño de la ventana.
 *
 * Devuelve tambien el ancho de una copia. Es lo que permite animar UNA sola
 * pista con todas las copias dentro, en vez de animar cada copia por su lado:
 * cuando el numero de copias cambiaba —al cargar las fuentes o al
 * redimensionar— las nuevas arrancaban su animacion desde cero mientras las
 * otras iban a media carrera, y el texto se veia duplicado y desfasado.
 */
export function useMarquee<T extends HTMLElement = HTMLDivElement>() {
  const contenedorRef = useRef<T>(null);
  const copiaRef = useRef<HTMLDivElement>(null);
  const [copias, setCopias] = useState(2);
  /** Ancho de una copia; el CSS desplaza exactamente eso en cada vuelta. */
  const [anchoCopia, setAnchoCopia] = useState(0);

  const medir = useCallback(() => {
    const contenedor = contenedorRef.current;
    const copia = copiaRef.current;
    if (!contenedor || !copia) return;

    const anchoVisible = contenedor.getBoundingClientRect().width;
    const anchoCopia = copia.getBoundingClientRect().width;
    if (anchoCopia < 1 || anchoVisible < 1) return;

    // +1 para que siempre sobre un poco y el empalme nunca se quede corto.
    setCopias(Math.max(2, Math.ceil((anchoVisible * 2) / anchoCopia) + 1));
    setAnchoCopia(anchoCopia);
  }, []);

  useEffect(() => {
    medir();
    const contenedor = contenedorRef.current;
    if (!contenedor || typeof ResizeObserver !== 'function') {
      // Sin ResizeObserver al menos se recalcula al girar o redimensionar.
      window.addEventListener('resize', medir);
      return () => window.removeEventListener('resize', medir);
    }
    const observador = new ResizeObserver(medir);
    observador.observe(contenedor);
    if (copiaRef.current) observador.observe(copiaRef.current);
    return () => observador.disconnect();
  }, [medir]);

  /**
   * Las fuentes cambian el ancho del texto al terminar de cargar, así que
   * una medición hecha antes se queda corta.
   */
  useEffect(() => {
    if (!document.fonts?.ready) return;
    document.fonts.ready.then(medir).catch(() => {});
  }, [medir]);

  return { contenedorRef, copiaRef, copias, anchoCopia };
}
