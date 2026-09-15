import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { type CSSProperties, useEffect, useState } from 'react';
import { useSongClips } from '@/modules/music/hooks/useSongClips';
import { assets } from '../assets';
import { SpringCamera } from './spring-camera';
import type { CameraMemory } from './spring-camera-data';
import { SpringGame } from './spring-game';
import { SpringLetter } from './spring-letter';
import { SpringMusic } from './spring-music';
import { SpringPaperCard } from './spring-paper-card';
import styles from './spring-welcome.module.css';

/**
 * Que pantalla abre el editor en vivo para cada paso del formulario. Las
 * escenas son las del protocolo compartido; las que esta plantilla no usa
 * (reasons, coupon) simplemente no aparecen y no mueven nada.
 */
const SCENE_SLIDE: Record<string, number> = {
  cover: 0,
  review: 0,
  intro: 1,
  photos: 2,
  song: 3,
  letter: 4,
  finale: 5,
};

const petals = Array.from({ length: 30 }, (_, index) => ({
  left: `${(index * 37 + 7) % 100}%`,
  size: `${10 + (index % 5) * 3}px`,
  duration: `${8 + (index % 7)}s`,
  delay: `${-(index * 1.7)}s`,
  drift: `${(index % 2 ? 1 : -1) * (35 + (index % 4) * 24)}px`,
  rotation: `${index * 43}deg`,
}));

/** Fixed overlay, shared by every future slide in this template. */
export function YellowPetals() {
  return (
    <div className={styles.petals} aria-hidden="true">
      {petals.map((petal) => (
        <span
          key={petal.rotation}
          className={styles.petalTrack}
          style={
            {
              left: petal.left,
              '--size': petal.size,
              '--duration': petal.duration,
              '--delay': petal.delay,
              '--drift': petal.drift,
              '--rotation': petal.rotation,
            } as CSSProperties
          }
        >
          <i className={styles.petal} />
        </span>
      ))}
    </div>
  );
}

export function SpringWelcome({
  recipient,
  cardMessage = '',
  memories = [],
  cameraMessage = '',
  songs,
  editorScene,
  letterMessage = '',
  sender = '',
}: {
  recipient: string;
  cardMessage?: string;
  memories?: CameraMemory[];
  cameraMessage?: string;
  /** SongClip[] tal como los guarda el campo `music` del formulario. */
  songs?: unknown;
  /** Escena que el cliente esta editando, si viene del editor en vivo. */
  editorScene?: string;
  letterMessage?: string;
  sender?: string;
}) {
  const [replay, setReplay] = useState(0);
  const [slide, setSlide] = useState(0);
  // El reproductor vive aqui, no dentro de SpringMusic: asi la cancion sigue
  // sonando al pasar a la carta o al juego.
  const music = useSongClips(songs);

  // Solo salta cuando cambia la escena: el editor reenvia en cada tecla, y
  // seguir la revision devolveria al cliente a la pantalla de golpe.
  useEffect(() => {
    if (editorScene === undefined) return;
    const target = SCENE_SLIDE[editorScene];
    if (target !== undefined) setSlide(target);
  }, [editorScene]);
  return (
    <main
      className={styles.spring}
      aria-label="Un regalo de primavera"
      style={
        {
          '--frame': `url("${assets.floralFrame}")`,
          '--frame-mobile': `url("${assets.floralFrameMobile}")`,
        } as CSSProperties
      }
    >
      <YellowPetals />
      {music.count > 0 && (
        // Reproductor de YouTube: solo pone el sonido, no se muestra. No puede
        // ir con display:none porque el navegador no lo cargaria.
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 h-[113px] w-[200px] opacity-0"
        >
          <div
            ref={music.hostRef}
            className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full"
          />
        </div>
      )}
      {slide === 0 ? (
        <section
          key={replay}
          className={styles.slide}
          aria-label="Esta primavera florece contigo"
        >
          <div className={styles.frame} aria-hidden="true">
            {[0, 1, 2, 3].map((corner) => (
              <div
                key={corner}
                className={styles.corner}
                data-corner={corner}
              />
            ))}
          </div>
          <div className={styles.message}>
            <p className={styles.date}>21 de septiembre</p>
            <h1 className={styles.title}>
              Esta primavera
              <br />
              florece contigo
            </h1>
            <p className={styles.name}>{recipient}</p>
          </div>
          <button
            type="button"
            className={styles.replay}
            onClick={() => setReplay((value) => value + 1)}
            aria-label="Volver a ver cómo florece"
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>Volver a florecer</span>
          </button>
        </section>
      ) : slide === 1 ? (
        <SpringPaperCard message={cardMessage} />
      ) : slide === 2 ? (
        <SpringCamera memories={memories} message={cameraMessage} />
      ) : slide === 3 ? (
        <SpringMusic music={music} />
      ) : slide === 4 ? (
        <SpringLetter
          message={letterMessage}
          recipient={recipient}
          sender={sender}
        />
      ) : (
        <SpringGame recipient={recipient} />
      )}
      <nav className={styles.navigation} aria-label="Pantallas del regalo">
        <button
          type="button"
          disabled={slide === 0}
          onClick={() => setSlide((current) => Math.max(0, current - 1))}
          aria-label={
            [
              'Ir a la primera pantalla',
              'Ir a la primera pantalla',
              'Volver a Nosotros dos',
              'Volver a Recuerditos nuestros',
              'Volver a Nuestra música',
              'Volver a Una carta para ti',
            ][slide]
          }
        >
          <ArrowLeft size={18} />
        </button>
        <span aria-live="polite">
          {slide + 1} <span aria-hidden="true">/</span> 6
        </span>
        <button
          type="button"
          disabled={slide === 5}
          onClick={() => setSlide((current) => Math.min(5, current + 1))}
          aria-label={
            slide === 0
              ? 'Ir a Nosotros dos'
              : slide === 1
                ? 'Ir a Recuerditos nuestros'
                : slide === 2
                  ? 'Ir a Nuestra música'
                  : slide === 3
                    ? 'Ir a Una carta para ti'
                    : 'Ir a Una aventura para ti'
          }
        >
          <ArrowRight size={18} />
        </button>
      </nav>
    </main>
  );
}
