import { useReducedMotion } from 'framer-motion';
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useState,
} from 'react';
import styles from '../premium.module.css';
import { Scene } from './Scene';

export type PremiumScene = {
  id: string;
  label: string;
  tone: 'paper' | 'night';
  content: ReactNode;
};

/** El scroll avanza por pantallas; el contenido permanece en un único escenario. */
export function SceneDeck({
  scenes,
  scrollRef,
  onSceneChange,
  targetScene,
  targetRevision,
}: {
  scenes: PremiumScene[];
  scrollRef: RefObject<HTMLElement | null>;
  onSceneChange: (id: string) => void;
  targetScene?: string;
  targetRevision?: number;
}) {
  const [current, setCurrent] = useState(0);
  const reduceMotion = useReducedMotion();
  const active = Math.min(current, scenes.length - 1);
  const sceneIds = scenes.map((scene) => scene.id).join(',');
  useEffect(() => {
    if (!targetScene || targetRevision === undefined) return;
    const index = sceneIds.split(',').indexOf(targetScene);
    if (index < 0) return;
    const deck = scrollRef.current;
    if (!deck) return;
    const position = () => {
      setCurrent(index);
      deck.scrollTo?.({ top: index * deck.clientHeight, behavior: 'instant' });
    };
    position();
    // El iframe puede estar oculto en la pestaña Editar del celular.
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(position);
    observer.observe(deck);
    return () => observer.disconnect();
  }, [targetScene, targetRevision, sceneIds, scrollRef]);
  const go = (index: number) => {
    const deck = scrollRef.current;
    if (!deck) return;
    deck.scrollTo({
      top: Math.max(0, Math.min(index, scenes.length - 1)) * deck.clientHeight,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <main
      ref={scrollRef}
      aria-label="Recorrido del regalo"
      // biome-ignore lint/a11y/noNoninteractiveTabindex: contenedor de scroll que admite navegación con PageUp, PageDown, Home y End
      tabIndex={0}
      className={styles.sceneDeck}
      onScroll={(event) => {
        if (event.target !== event.currentTarget) return;
        const deck = event.currentTarget;
        if (!deck.clientHeight) return;
        const index = Math.max(
          0,
          Math.min(
            Math.round(deck.scrollTop / deck.clientHeight),
            scenes.length - 1
          )
        );
        setCurrent(index);
        onSceneChange(scenes[index].id);
      }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        const steps: Record<string, number> = {
          ArrowDown: active + 1,
          PageDown: active + 1,
          ArrowUp: active - 1,
          PageUp: active - 1,
          Home: 0,
          End: scenes.length - 1,
        };
        const next = steps[event.key];
        if (next === undefined) return;
        event.preventDefault();
        go(next);
      }}
    >
      <div
        className={styles.deckTrack}
        style={{ '--scene-count': scenes.length } as CSSProperties}
      >
        <div
          className={styles.deckStage}
          style={{
            backgroundColor:
              scenes[active].tone === 'night'
                ? 'var(--mood-deep)'
                : 'var(--mood-paper)',
          }}
        >
          {scenes.map((scene, index) => (
            <Scene
              key={scene.id}
              id={scene.id}
              label={scene.label}
              tone={scene.tone}
              active={index === active}
            >
              {scene.content}
            </Scene>
          ))}
        </div>
        <div className={styles.deckStops} aria-hidden="true">
          {scenes.map((scene) => (
            <div key={scene.id} />
          ))}
        </div>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Sección {active + 1} de {scenes.length}: {scenes[active].label}
      </p>
    </main>
  );
}
