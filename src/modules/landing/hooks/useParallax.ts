import { useEffect, useRef } from 'react';

/**
 * Parallax del arte del hero.
 *
 * Escribe tres variables CSS en el elemento observado y deja que el CSS
 * decida cuánto se mueve cada capa:
 *
 * - `--px`, `--py`: posición del puntero dentro del bloque, de -1 a 1.
 * - `--scroll`: cuánto se ha alejado el hero de la parte superior, de 0 a 1.
 *
 * Se hace con variables y no con estado de React porque un `setState` por
 * cada `pointermove` provocaría cientos de renders por segundo. Las escrituras
 * se agrupan en un `requestAnimationFrame` para tocar el DOM una vez por
 * cuadro.
 *
 * No se activa con movimiento reducido ni en punteros gruesos (táctiles),
 * donde el efecto no aporta y solo gasta batería.
 */
export function useParallax<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const motionOk = window.matchMedia(
      '(prefers-reduced-motion: no-preference)'
    ).matches;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!motionOk) return;

    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let scroll = 0;

    const paint = () => {
      frame = 0;
      node.style.setProperty('--px', pointerX.toFixed(3));
      node.style.setProperty('--py', pointerY.toFixed(3));
      node.style.setProperty('--scroll', scroll.toFixed(3));
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(paint);
    };

    const onPointerMove = (event: PointerEvent) => {
      const box = node.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      pointerX = (event.clientX - box.left) / box.width - 0.5;
      pointerY = (event.clientY - box.top) / box.height - 0.5;
      schedule();
    };

    const onPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
      schedule();
    };

    const onScroll = () => {
      const box = node.getBoundingClientRect();
      // 0 mientras el hero está arriba del todo, 1 cuando ya salió de pantalla.
      const travelled = Math.min(
        1,
        Math.max(0, -box.top / Math.max(1, box.height))
      );
      scroll = travelled;
      schedule();
    };

    if (finePointer) {
      node.addEventListener('pointermove', onPointerMove);
      node.addEventListener('pointerleave', onPointerLeave);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      node.removeEventListener('pointermove', onPointerMove);
      node.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return ref;
}
