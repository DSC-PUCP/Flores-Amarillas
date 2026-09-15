import { useCallback, useRef, useState } from 'react';
import type { GardenApi } from '../../jardin/garden-stage';
import styles from './treasure-chest.module.css';

export type TreasureChestProps = {
  api: GardenApi;
  /** Cuantas pulsaciones hacen falta para abrirlo. */
  taps?: number;
  /** La foto que aparece dentro. */
  photo?: string;
  /** La carta que estaba guardada en el cofre. */
  letter: string;
  recipient: string;
  sender: string;
};

const HINTS = [
  'Toca el cofre… está cerrado con llave 🔒',
  'Algo se mueve ahí dentro…',
  'Sigue, ya casi cede 🔑',
  'Un poquito más…',
  '¡Está a punto de abrirse!',
];

/**
 * El cofre del jardin premium. Se abre a base de insistir: cada pulsacion le da
 * un golpecito, lo sacude un poco y sube el tono del sonido. Al llegar al tope
 * se abre, cambia la cancion y aparece la carta con la foto.
 */
export function TreasureChest({
  api,
  taps = 15,
  photo,
  letter,
  recipient,
  sender,
}: TreasureChestProps) {
  const [hits, setHits] = useState(0);
  const [open, setOpen] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const chestRef = useRef<HTMLButtonElement>(null);

  const progress = Math.min(1, hits / taps);
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  /** El pulso de cada golpe. Se anima aqui y no en CSS para poder reiniciarlo
   *  en cada pulsacion sin trucos de reflow. */
  const pulse = useCallback(
    (strength: number) => {
      const el = chestRef.current;
      // `animate` no existe en jsdom ni en Safari viejo: el cofre tiene que
      // seguir abriendose igual, solo sin el rebote.
      if (!el || reduced || typeof el.animate !== 'function') return;
      el.animate(
        [
          { transform: 'scale(1) rotate(0deg)' },
          {
            transform: `scale(${1 + 0.12 * strength}) rotate(${
              (Math.random() < 0.5 ? -1 : 1) * (2 + 5 * strength)
            }deg)`,
            offset: 0.35,
          },
          { transform: 'scale(0.97) rotate(0deg)', offset: 0.7 },
          { transform: 'scale(1) rotate(0deg)' },
        ],
        {
          duration: 240 + 120 * strength,
          easing: 'cubic-bezier(.34,1.56,.64,1)',
        }
      );
    },
    [reduced]
  );

  const knock = () => {
    if (open) {
      setShowReveal(true);
      return;
    }
    const next = hits + 1;
    setHits(next);
    api.audio.unlock();
    api.audio.knock(next / taps);
    pulse(next / taps);

    if (next >= taps) {
      setOpen(true);
      setShowReveal(true);
      api.audio.switchTo('cofre');
      api.audio.fanfare();
      api.garden?.celebrate(34);
    }
  };

  if (!api.started) return null;

  const hint = open
    ? 'Tu cofre, siempre abierto para ti 💛'
    : HINTS[Math.min(HINTS.length - 1, Math.floor(progress * HINTS.length))];

  return (
    <>
      <div className={styles.dock}>
        <button
          ref={chestRef}
          type="button"
          className={styles.chest}
          data-open={open}
          onPointerDown={(e) => {
            e.preventDefault();
            knock();
          }}
          aria-label={
            open
              ? 'Abrir de nuevo el cofre'
              : `Golpear el cofre. ${hits} de ${taps}`
          }
        >
          <span className={styles.lid} data-open={open} aria-hidden="true">
            <span className={styles.lock} />
          </span>
          <span className={styles.body} aria-hidden="true">
            <span className={styles.band} />
          </span>
          <span className={styles.glow} data-open={open} aria-hidden="true" />
        </button>

        <div className={styles.meter} aria-hidden="true">
          <span
            className={styles.meterFill}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className={styles.hint}>{hint}</p>
      </div>

      {showReveal && (
        <div
          className={styles.reveal}
          role="dialog"
          aria-label="Lo que guardaba el cofre"
        >
          <div className={styles.revealCard}>
            <button
              type="button"
              className={styles.close}
              aria-label="Cerrar"
              onClick={() => setShowReveal(false)}
            >
              ×
            </button>
            {photo ? (
              <img
                className={styles.photo}
                src={photo}
                alt={`Una foto para ${recipient}`}
              />
            ) : null}
            <p className={styles.letter}>{letter}</p>
            <div className={styles.sign}>— {sender} 💛</div>
          </div>
        </div>
      )}
    </>
  );
}
