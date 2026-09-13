import { useEffect, useState } from 'react';

/**
 * Media query como estado de React.
 *
 * Hace falta porque los marcos de dispositivo reciben su ancho en píxeles
 * (para calcular biseles y radios con proporciones reales), y ese número no
 * se puede resolver solo con clases de Tailwind.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const list = window.matchMedia(query);
    setMatches(list.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
