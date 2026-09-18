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
  song: 1,
  intro: 2,
  photos: 3,
  letter: 4,
  finale: 5,
};

/**
 * El recorrido, en orden.
 *
 * Es la unica lista que hay que tocar para mover una pantalla de sitio: de
 * aqui salen los textos de los dos botones de navegacion y el contador. Antes
 * los rotulos eran una cadena de ternarios y un array suelto que habia que
 * mantener en sincronia a mano.
 */
const PANTALLAS = [
  'la portada',
  'Nuestra música',
  'Nosotros dos',
  'Recuerditos nuestros',
  'Una carta para ti',
  'Una aventura para ti',
  'la despedida',
] as const;

/** Ultima pantalla del recorrido. */
const ULTIMA = PANTALLAS.length - 1;

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
  onComplete,
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
  /** Aviso de ultima pantalla; solo lo escuchan las paginas de ejemplo. */
  onComplete?: () => void;
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

  // Al llegar a la despedida el recorrido se acabo. Solo lo escucha una pagina
  // de ejemplo, para poner delante su cierre; en un regalo nadie lo pasa.
  useEffect(() => {
    if (slide !== ULTIMA) return;
    onComplete?.();
  }, [slide, onComplete]);
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
      {/*
        Reproductor de YouTube: solo pone el sonido, no se muestra. No puede ir
        con display:none porque el navegador no lo cargaria.

        Se monta siempre, tambien sin canciones. Antes colgaba de
        `music.count > 0` y bastaba que la lista llegara vacia un instante
        —mientras el editor reenvia, por ejemplo— para que el div se
        desmontara, el hook destruyera el reproductor y la cancion se cortara.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-[113px] w-[200px] opacity-0"
      >
        <div
          ref={music.hostRef}
          className="h-full w-full [&>iframe]:h-full [&>iframe]:w-full"
        />
      </div>
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
        <SpringMusic music={music} />
      ) : slide === 2 ? (
        <SpringPaperCard message={cardMessage} />
      ) : slide === 3 ? (
        <SpringCamera memories={memories} message={cameraMessage} />
      ) : slide === 4 ? (
        <SpringLetter
          message={letterMessage}
          recipient={recipient}
          sender={sender}
        />
      ) : slide === 5 ? (
        <SpringGame recipient={recipient} />
      ) : (
        <section
          className={styles.slide}
          aria-label="Gracias por esta primavera"
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
            <h2 className={styles.farewell}>
              Gracias por alegrar
              <br />
              mi primavera
              <span className={styles.farewellLove}>{recipient}</span>
            </h2>
            {sender && <p className={styles.farewellSign}>— {sender}</p>}
          </div>
        </section>
      )}
      <nav className={styles.navigation} aria-label="Pantallas del regalo">
        <button
          type="button"
          disabled={slide === 0}
          onClick={() => setSlide((current) => Math.max(0, current - 1))}
          aria-label={
            slide === 0
              ? 'Ir a la primera pantalla'
              : `Volver a ${PANTALLAS[slide - 1]}`
          }
        >
          <ArrowLeft size={18} />
        </button>
        <span aria-live="polite">
          {slide + 1} <span aria-hidden="true">/</span> {ULTIMA + 1}
        </span>
        <button
          type="button"
          disabled={slide === ULTIMA}
          onClick={() => setSlide((current) => Math.min(ULTIMA, current + 1))}
          aria-label={`Ir a ${PANTALLAS[Math.min(ULTIMA, slide + 1)]}`}
        >
          <ArrowRight size={18} />
        </button>
      </nav>
    </main>
  );
}
