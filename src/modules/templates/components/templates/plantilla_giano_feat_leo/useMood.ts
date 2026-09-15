import { type RefObject, useEffect, useRef, useState } from 'react';
import {
  BRAND_MOOD,
  loadAlbumPalette,
  type MoodPalette,
  moodVar,
} from './mood';

export type MoodLevels = {
  /** 0 en silencio, 1 sonando (con transición suave). */
  playing: number;
  /** Intensidad del momento: respira mientras suena y salta con cada verso. */
  energy: number;
  /** Tiempo acumulado mientras suena, para que las ondas avancen. */
  phase: number;
};

/**
 * Ambiente de la página según la música. YouTube no deja leer el audio del
 * video (es de otro dominio), así que el ritmo se deriva de lo que sí se sabe:
 * si suena y cuándo empieza cada línea de la letra.
 *
 * Los colores (--mood-*, toda la paleta de la página) van en `root`. El pulso (--energy, --playing) se
 * escribe solo en los elementos marcados con `data-mood-energy`: cambiarlo en
 * la raíz obligaría al navegador a recalcular toda la página en cada cuadro.
 * Los canvas leen `levels` directamente. Nada de esto re-renderiza React.
 */
export function useMood({
  root,
  videoId,
  playing,
  lineIndex,
}: {
  root: RefObject<HTMLElement | null>;
  videoId: string | null;
  playing: boolean;
  lineIndex: number;
}) {
  const [palette, setPalette] = useState<MoodPalette>(BRAND_MOOD);
  const levels = useRef<MoodLevels>({ playing: 0, energy: 0, phase: 0 });
  const kick = useRef(0);
  const target = useRef(0);
  const wake = useRef<() => void>(() => {});

  // Colores de la portada de la canción que suena.
  useEffect(() => {
    let cancelled = false;
    if (!videoId) {
      setPalette(BRAND_MOOD);
      return;
    }
    loadAlbumPalette(videoId).then((found) => {
      if (!cancelled) setPalette(found ?? BRAND_MOOD);
    });
    return () => {
      cancelled = true;
    };
  }, [videoId]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    for (const key of Object.keys(palette) as (keyof MoodPalette)[]) {
      element.style.setProperty(moodVar(key), palette[key]);
    }
  }, [root, palette]);

  // Un latido al empezar cada verso y al cambiar de canción.
  // biome-ignore lint/correctness/useExhaustiveDependencies: el latido se dispara por el cambio de verso o de canción
  useEffect(() => {
    if (!playing) return;
    kick.current = 1;
    wake.current();
  }, [lineIndex, videoId]);

  useEffect(() => {
    target.current = playing ? 1 : 0;
    if (playing) kick.current = Math.max(kick.current, 0.7);
    wake.current();
  }, [playing]);

  useEffect(() => {
    const element = root.current;
    if (!element || typeof window.requestAnimationFrame !== 'function') return;
    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let frame = 0;
    let last = 0;
    let running = false;
    let targets: HTMLElement[] = [];
    let framesSinceQuery = Number.POSITIVE_INFINITY;

    const write = (playingLevel: string, energyLevel: string) => {
      // Las secciones aparecen y desaparecen: se vuelven a buscar cada tanto.
      if (framesSinceQuery > 45) {
        targets = [
          ...element.querySelectorAll<HTMLElement>('[data-mood-energy]'),
        ];
        framesSinceQuery = 0;
      }
      framesSinceQuery += 1;
      for (const target of targets) {
        target.style.setProperty('--playing', playingLevel);
        target.style.setProperty('--energy', energyLevel);
      }
    };

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 1 / 60;
      last = now;
      const state = levels.current;

      state.playing += (target.current - state.playing) * Math.min(1, dt * 2.2);
      kick.current *= Math.exp(-dt * 3.2);
      state.phase += dt * (0.25 + state.playing * 0.9);

      const breath =
        0.55 +
        0.25 * Math.sin(state.phase * 2.3) +
        0.2 * Math.sin(state.phase * 5.1 + 1.3);
      state.energy = reduceMotion
        ? state.playing * 0.4
        : Math.min(1, state.playing * (0.32 * breath) + kick.current * 0.68);

      write(state.playing.toFixed(3), state.energy.toFixed(3));

      const settled =
        target.current === 0 && state.playing < 0.002 && kick.current < 0.002;
      if (settled) {
        running = false;
        last = 0;
        framesSinceQuery = Number.POSITIVE_INFINITY;
        write('0', '0');
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };

    wake.current = () => {
      if (running) return;
      running = true;
      frame = window.requestAnimationFrame(tick);
    };
    wake.current();

    return () => {
      running = false;
      window.cancelAnimationFrame(frame);
      wake.current = () => {};
    };
  }, [root]);

  return { palette, levels };
}

export type Mood = ReturnType<typeof useMood>;
