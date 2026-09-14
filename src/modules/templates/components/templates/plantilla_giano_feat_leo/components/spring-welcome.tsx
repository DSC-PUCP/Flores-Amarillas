import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { type CSSProperties, useState } from 'react';
import { SpringCamera } from './spring-camera';
import type { CameraMemory } from './spring-camera-data';
import { SpringGame } from './spring-game';
import { SpringLetter } from './spring-letter';
import { SpringMusic } from './spring-music';
import { SpringPaperCard } from './spring-paper-card';
import styles from './spring-welcome.module.css';

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
  songs = [],
  letterMessage = '',
  sender = '',
}: {
  recipient: string;
  cardMessage?: string;
  memories?: CameraMemory[];
  cameraMessage?: string;
  songs?: { url: string; name: string }[];
  letterMessage?: string;
  sender?: string;
}) {
  const [replay, setReplay] = useState(0);
  const [slide, setSlide] = useState(0);
  return (
    <main className={styles.spring} aria-label="Un regalo de primavera">
      <YellowPetals />
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
        <SpringMusic songs={songs} />
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
