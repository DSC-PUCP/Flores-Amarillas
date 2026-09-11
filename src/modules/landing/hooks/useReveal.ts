import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Revela un bloque cuando entra en pantalla.
 *
 * Usa un ref de callback a propósito: con `useRef` + `useEffect`, si el
 * componente hace un `return` temprano en su primer render (por ejemplo
 * `PlansSection` mientras carga), el nodo no existe cuando corre el efecto,
 * el observador nunca se crea y la sección se queda invisible para siempre.
 * Con el callback, el observador se engancha en el momento exacto en que el
 * nodo aparece en el DOM.
 *
 * Respeta `prefers-reduced-motion` mostrando el contenido de inmediato.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const [shown, setShown] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      observerRef.current?.disconnect();
      if (!node || shown) return;

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setShown(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );

      observer.observe(node);
      observerRef.current = observer;
    },
    [shown]
  );

  useEffect(() => () => observerRef.current?.disconnect(), []);

  /** Clases a aplicar en el elemento observado. */
  const revealClass = shown
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-8';

  return { ref, shown, revealClass };
}
