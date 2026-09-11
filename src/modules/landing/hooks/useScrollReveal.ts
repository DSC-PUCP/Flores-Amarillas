import { useEffect, useLayoutEffect, useRef } from 'react';

/** En el servidor no hay layout que medir; ahí el efecto simplemente no corre. */
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Revela con un solo observador todos los `[data-reveal]` que haya dentro del
 * contenedor devuelto.
 *
 * Por qué un observador global y no uno por componente: la landing tiene
 * decenas de bloques animados y crear un `IntersectionObserver` por cada uno
 * multiplica el trabajo del hilo principal justo mientras el usuario hace
 * scroll.
 *
 * El orden dentro del efecto importa y es deliberado:
 *
 * 1. Se marcan como reveladas las piezas que ya están en pantalla.
 * 2. Recién entonces se pone `data-motion="on"` en la raíz, que es lo que
 *    activa el estado oculto en CSS.
 *
 * Así el HTML pre-renderizado se ve completo (aunque el JS falle o tarde) y al
 * hidratar nada parpadea: solo se esconde lo que el usuario todavía no puede
 * ver. Si el navegador pide movimiento reducido o no soporta el observador,
 * se revela todo de una vez.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const rootRef = useRef<T>(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const revealAll = () => {
      for (const node of root.querySelectorAll<HTMLElement>('[data-reveal]')) {
        node.dataset.revealed = 'true';
      }
    };

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Se comprueba el tipo, no solo la presencia de la clave: un polyfill a
    // medias puede dejar `window.IntersectionObserver` definido pero inservible,
    // y ahí construirlo lanzaría y dejaría la página en blanco.
    const canObserve = typeof window.IntersectionObserver === 'function';

    if (prefersReducedMotion || !canObserve) {
      revealAll();
      return;
    }

    // 1. Lo que ya está a la vista arranca revelado: sin parpadeo al hidratar.
    const foldLine = window.innerHeight * 0.92;
    const pending: HTMLElement[] = [];
    for (const node of root.querySelectorAll<HTMLElement>('[data-reveal]')) {
      if (node.getBoundingClientRect().top < foldLine) {
        node.dataset.revealed = 'true';
      } else {
        pending.push(node);
      }
    }

    // 2. Con el estado inicial ya resuelto, se arma el CSS de movimiento.
    root.dataset.motion = 'on';

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = 'true';
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );

    for (const node of pending) observer.observe(node);

    /**
     * Hay bloques que aparecen despues del primer render: las tarjetas de
     * plan se montan recien cuando responde el servicio. Sin esto quedarian
     * fuera del escaneo inicial y, con el estado oculto ya activo, invisibles
     * para siempre.
     */
    const watchNewNodes = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const added of mutation.addedNodes) {
          if (!(added instanceof HTMLElement)) continue;
          const candidates = added.matches('[data-reveal]') ? [added] : [];
          for (const node of added.querySelectorAll<HTMLElement>(
            '[data-reveal]'
          )) {
            candidates.push(node);
          }
          for (const node of candidates) {
            if (node.dataset.revealed === 'true') continue;
            observer.observe(node);
          }
        }
      }
    });
    watchNewNodes.observe(root, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      watchNewNodes.disconnect();
    };
  }, []);

  return rootRef;
}
