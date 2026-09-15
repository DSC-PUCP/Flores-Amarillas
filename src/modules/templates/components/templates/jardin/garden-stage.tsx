import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './garden.module.css';
import type { SkyState } from './garden-art';
import { createGardenAudio, type GardenAudio } from './garden-audio';
import type { GardenConfig } from './garden-config';
import type { GardenController } from './garden-scene';

/** Lo que una plantilla puede usar para engancharse al jardin ya montado. */
export type GardenApi = {
  audio: GardenAudio;
  garden: GardenController | null;
  started: boolean;
};

export type GardenStageProps = {
  config: GardenConfig;
  /** A quien va dirigido el regalo. */
  recipient: string;
  /** Quien lo manda. */
  sender: string;
  /** La carta que se escribe sola al abrir. */
  message: string;
  kicker?: string;
  title?: string;
  /** Capas extra encima del jardin, como el cofre del premium. */
  renderExtras?: (api: GardenApi) => ReactNode;
  /** Botones extra en la barra de abajo. */
  renderActions?: (api: GardenApi) => ReactNode;
};

const STARS = 80;
const INTRO_PETALS = 16;

export function GardenStage({
  config,
  recipient,
  sender,
  message,
  kicker = 'Feliz día de las',
  title = 'Flores Amarillas',
  renderExtras,
  renderActions,
}: GardenStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gardenRef = useRef<GardenController | null>(null);
  const audioRef = useRef<GardenAudio | null>(null);
  if (!audioRef.current) audioRef.current = createGardenAudio();
  const audio = audioRef.current;

  const [ready, setReady] = useState(false);
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(0);
  const [toast, setToast] = useState<{ text: string; at: number } | null>(null);
  const [hintOff, setHintOff] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [musicOn, setMusicOn] = useState(true);
  const [sky, setSky] = useState<{ gradient: string; stars: number } | null>(
    null
  );

  const toastTimer = useRef<number | null>(null);
  const showToast = useCallback((text: string) => {
    setToast({ text, at: Date.now() });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  /* El jardin 3D se monta solo en el navegador: three pesa y aqui hay SSR. */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    let controller: GardenController | null = null;

    void import('./garden-scene').then(({ createGarden }) => {
      if (cancelled || !canvasRef.current) return;
      controller = createGarden(canvasRef.current, config, audio, {
        onToast: showToast,
        onCount: setCount,
        onSky: (s: SkyState) =>
          setSky({ gradient: s.gradient, stars: s.stars }),
      });
      gardenRef.current = controller;
      setReady(true);
    });

    return () => {
      cancelled = true;
      controller?.dispose();
      gardenRef.current = null;
    };
  }, [config, audio, showToast]);

  /* La escena ocupa la pantalla entera: el scroll del documento estorbaria. */
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) audio.suspend();
      else audio.resume();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      audio.dispose();
    };
  }, [audio]);

  /* La carta se escribe sola, letra a letra. */
  useEffect(() => {
    if (!cardOpen) return;
    setTyped('');
    const chars = [...message];
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setTyped(chars.slice(0, i).join(''));
      if (i >= chars.length) clearInterval(id);
    }, 32);
    return () => clearInterval(id);
  }, [cardOpen, message]);

  const open = () => {
    audio.unlock();
    audio.play('jardin');
    setMusicOn(true);
    setStarted(true);
    gardenRef.current?.start();
    window.setTimeout(() => gardenRef.current?.celebrate(16), 3200);
    window.setTimeout(() => setCardOpen(true), 3800);
    window.setTimeout(() => setHintOff(true), 16000);
  };

  const api: GardenApi = { audio, garden: gardenRef.current, started };
  const typingDone = typed.length >= [...message].length;

  return (
    <div className={styles.stage}>
      <div
        className={styles.sky}
        style={sky ? { background: sky.gradient } : undefined}
      />
      <div
        className={styles.stars}
        style={{ opacity: sky ? sky.stars : 1 }}
        aria-hidden="true"
      >
        {Array.from({ length: STARS }, (_, i) => {
          const z = 1 + ((i * 37) % 16) / 10;
          return (
            <span
              key={`star-${i + 1}`}
              className={styles.star}
              style={{
                left: `${(i * 41) % 100}%`,
                top: `${(i * 17) % 55}%`,
                width: `${z}px`,
                height: `${z}px`,
                animationDelay: `${((i * 13) % 30) / 10}s`,
                animationDuration: `${2 + ((i * 7) % 30) / 10}s`,
              }}
            />
          );
        })}
      </div>

      {/* Los eventos de puntero los engancha la escena 3D sobre este canvas,
          no React: girar el jardin necesita pointer capture y pinch. */}
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label={`Un jardín de flores amarillas para ${recipient}`}
      />

      <header className={styles.header} data-show={started}>
        <div className={styles.kicker}>{kicker}</div>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.sub}>
          para {recipient}, con cariño de {sender}
        </div>
        <div className={styles.hint} data-off={hintOff}>
          Arrastra para girar el jardín. Toca las flores, los animalitos o el
          pasto 🌱
        </div>
      </header>

      <output className={styles.toast} data-show={toast !== null}>
        {toast?.text ?? ''}
      </output>

      <div className={styles.card} data-hidden={!cardOpen}>
        <button
          type="button"
          className={styles.closeCard}
          aria-label="Cerrar carta"
          onClick={() => setCardOpen(false)}
        >
          ×
        </button>
        <p className={`${styles.typed} ${typingDone ? '' : styles.caret}`}>
          {typed}
        </p>
        <div className={styles.firma} data-show={typingDone}>
          — {sender} 💛
        </div>
      </div>

      <nav className={styles.bar} data-show={started} aria-label="Tu jardín">
        <button
          type="button"
          className={styles.plant}
          aria-label="Plantar una flor"
          onClick={() => {
            setHintOff(true);
            gardenRef.current?.plantRandom();
          }}
        >
          🌻 Plantar
        </button>
        <div className={styles.count}>
          🌼 {count}
          <span aria-hidden="true"> / {config.maxFlowers}</span>
        </div>
        <button
          type="button"
          aria-label="Leer la carta"
          onClick={() => setCardOpen((v) => !v)}
        >
          💌
        </button>
        <button
          type="button"
          aria-label={musicOn ? 'Silenciar la música' : 'Activar la música'}
          onClick={() => {
            audio.unlock();
            audio.toggle();
            setMusicOn(audio.playing);
          }}
        >
          {musicOn ? '🎵' : '🔇'}
        </button>
        {renderActions?.(api)}
      </nav>

      {renderExtras?.(api)}

      <div className={styles.intro} data-gone={started}>
        <div className={styles.introFlower}>
          {Array.from({ length: INTRO_PETALS }, (_, i) => (
            <i
              key={`petal-${i + 1}`}
              className={styles.petal}
              style={
                {
                  '--r': `${i * (360 / INTRO_PETALS)}deg`,
                  animationDelay: `${0.2 + i * 0.06}s`,
                } as CSSProperties
              }
            />
          ))}
          <div className={styles.introCenter} />
        </div>
        <h2>Tengo algo para ti…</h2>
        <button
          type="button"
          className={styles.open}
          onClick={open}
          disabled={!ready}
        >
          {ready ? 'Abrir mi regalo 💛' : 'Preparando el jardín…'}
        </button>
        <p>Sube el volumen 🔊</p>
        <div className={styles.walker} aria-hidden="true">
          🐈
        </div>
      </div>
    </div>
  );
}
